import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order';
import { environment } from '@env/environment';
import { map, switchMap } from 'rxjs/operators';
import { OrderItem } from '../models/order-item';
import { StripeService } from 'ngx-stripe';
import {StripeError} from '@stripe/stripe-js';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    apiURLOrders = environment.apiUrl + 'orders';
    apiURLProducts = environment.apiUrl + 'products';

    constructor(private http: HttpClient, private stripeService: StripeService) {}

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiURLOrders);
    }

    getOrder(orderId: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiURLOrders}/${orderId}`);
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.apiURLOrders, order);
    }

    updateOrder(orderStatus: { status: string }, orderId: string): Observable<Order> {
        return this.http.put<Order>(`${this.apiURLOrders}/${orderId}`, orderStatus);
    }

    deleteOrder(orderId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiURLOrders}/${orderId}`);
    }

    getOrdersCount(): Observable<number> {
        return this.http.get<number>(`${this.apiURLOrders}/get/count`).pipe(map((objectValue: any) => objectValue.orderCount));
    }

    getTotalSales(): Observable<number> {
        return this.http.get<number>(`${this.apiURLOrders}/get/totalsales`).pipe(map((objectValue: any) => objectValue.totalsales));
    }

    getProduct(productId: string): Observable<any> {
        return this.http.get<any>(`${this.apiURLProducts}/${productId}`);
    }

    createCheckoutSession(orderItem: OrderItem[]): Observable<{ error: StripeError }> {
        return this.http.post<{ id: string }>(`${this.apiURLOrders}/create-checkout-session`, orderItem).pipe(
            switchMap((session) => {
                return this.stripeService.redirectToCheckout({ sessionId: session.id });
            })
        );
    }
    
    cacheOrderData(order: Order) {
        localStorage.setItem('orderData', JSON.stringify(order));
    }
    getCacheOrderData(): Order {
        const data = localStorage.getItem('orderData') || '{}';
        return JSON.parse(data) as Order;
    }
    

    removeCachedOrderData() {
        {
            localStorage.removeItem('orderData');
        }
    }
}
