import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrdersService } from '@redmane/orders';
import { ProductsService } from '@redmane/products';
import { UsersService } from '@redmane/users';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnDestroy, OnInit {
    statistics = [];
    endsubs$: Subject<void> = new Subject();

    constructor(
      private userService: UsersService,
      private productService: ProductsService,
      private ordersService: OrdersService
      ) {}



    ngOnInit(): void {
      combineLatest([
        this.ordersService.getOrdersCount(),
        this.productService.getProductsCount(),
        this.userService.getUsersCount(),
        this.ordersService.getTotalSales()
      ]).pipe(takeUntil(this.endsubs$)).subscribe((values) => {
        this.statistics = values;
    this.endsubs$.complete();
      });
    }

    ngOnDestroy() {
      this.endsubs$.next();
      this.endsubs$.complete();
    }


}
