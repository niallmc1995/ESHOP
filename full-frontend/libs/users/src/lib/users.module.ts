import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromUsers from './state/users.reducer';
import { UsersEffects } from './state/users.effects';
import { UsersFacade } from './state/users.facade';
import { ProfileComponent } from './pages/profile/profile.component';
import { CustomerAuthGuard} from '../lib/services/auth-guard-customer.service'


const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent

    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [CustomerAuthGuard] 

    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        InputTextModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputNumberModule,
        InputMaskModule,
        StoreModule.forFeature(fromUsers.USERS_FEATURE_KEY, fromUsers.reducer),
        EffectsModule.forFeature([UsersEffects])
    ],
    declarations: [LoginComponent, ProfileComponent],
    providers: [UsersFacade],
    exports: [ProfileComponent]
})
export class UsersModule {}
