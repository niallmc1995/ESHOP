import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AccordionModule } from 'primeng/accordion';
import { NavComponent } from './shared/nav/nav.component';
import { ProductsModule } from '@redmane/products';
import { UiModule } from '@redmane/ui';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OrdersModule } from '@redmane/orders';
import { ToastModule } from 'primeng/toast';
import { MessagesComponent } from './shared/messages/messages.component';
import { MessageService } from 'primeng/api';
import { JwtInterceptor, UsersModule } from '@redmane/users';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgxStripeModule } from 'ngx-stripe';

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    }
];

@NgModule({
    declarations: [AppComponent, NxWelcomeComponent, HomePageComponent, HeaderComponent, FooterComponent, NavComponent, MessagesComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        ProductsModule,
        AccordionModule,
        UiModule,
        HttpClientModule,
        OrdersModule,
        ToastModule,
        UsersModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        NgxStripeModule.forRoot('pk_test_51MjhpEFi9sINfyoBrd9bzg3KpstbwWMX8HuyqkKY9dlj9BbGqutErtxY7T25cvgovhf8T7WvJgtT4fGu9dz6LbAE00oWBLgsbs')
    ],

    providers: [MessageService, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
    bootstrap: [AppComponent],
    exports: [MessagesComponent]
})
export class AppModule {}
