import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'orders-order-summary',
    templateUrl: './order-summary.component.html',
    styles: []
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
    endSubs$: Subject<void> = new Subject();
    totalPrice = 0;
    isCheckout = false;

    constructor(private router: Router, private cartService: CartService, private ordersService: OrdersService) {
        this.isCheckout = this.router.url.includes('checkout');
    }

    ngOnInit(): void {
        this._getOrderSummary();
    }

    ngOnDestroy(): void {
        this.endSubs$.next();
        this.endSubs$.complete();
    }

    private _getOrderSummary() {
        this.cartService.cart$
            .pipe(
                takeUntil(this.endSubs$),
                switchMap((cart) => {
                    if (!cart?.items || cart.items.length === 0) {
                        return of([]);
                    }

                    const itemObservables = cart.items
                        .filter((item) => !!item.productId) // Only include items with a defined productId
                        .map((item) =>
                            this.ordersService.getProduct(item.productId!).pipe(
                                // Non-null assertion safe now
                                map((product) => product.price * item.quantity!)
                            )
                        );

                    return forkJoin(itemObservables);
                })
            )
            .subscribe({
                next: (prices: number[]) => {
                    this.totalPrice = prices.reduce((acc, curr) => acc + curr, 0);
                },
                error: (err) => {
                    console.error('❌ Error calculating order summary:', err);
                    this.totalPrice = 0;
                }
            });
    }

    navigateToCheckout() {
        this.router.navigate(['/checkout']);
    }
}
