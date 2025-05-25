import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UsersService } from '@redmane/users';
import { Subject, take, takeUntil } from 'rxjs';
import { LocalstorageService } from '../../services/localstorage.service';

@Component({
    selector: 'user-profile',
    templateUrl: './profile.component.html',
    styles: []
})
export class ProfileComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private usersService: UsersService,
        private formBuilder: FormBuilder,
        private localStorageService: LocalstorageService
    ) {}

    checkoutFormGroup: FormGroup;
    isSubmitted = false;
    userId: string;
    countries = [];
    unsubscribe$: Subject<void> = new Subject();

    ngOnInit(): void {
        this._initCheckoutForm();
        this._getCountries();
        this.userId = this.localStorageService.getUserIdFromToken();

        if (this.userId) {
            this.usersService
                .getUser(this.userId)
                .pipe(take(1))
                .subscribe({
                    next: (user) => {
                        this.checkoutFormGroup.patchValue({
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            city: user.city,
                            country: user.country,
                            zip: user.zip,
                            apartment: user.apartment,
                            street: user.street
                        });
                    },
                    error: (err) => {
                        console.error('Error loading user data', err);
                    }
                });
        }
    }
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private _initCheckoutForm() {
        this.checkoutFormGroup = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.email, Validators.required]],
            phone: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            zip: ['', Validators.required],
            apartment: ['', Validators.required],
            street: ['', Validators.required]
        });
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }

    backToCart() {
        this.router.navigate(['/']);
    }

    onSubmit() {
        this.isSubmitted = true;

        if (this.checkoutFormGroup.invalid) {
            return;
        }

        const updatedUser = {
            name: this.checkoutForm['name'].value,
            email: this.checkoutForm['email'].value,
            phone: this.checkoutForm['phone'].value,
            city: this.checkoutForm['city'].value,
            country: this.checkoutForm['country'].value,
            zip: this.checkoutForm['zip'].value,
            apartment: this.checkoutForm['apartment'].value,
            street: this.checkoutForm['street'].value
        };

        this.usersService
            .updateUser(this.userId, updatedUser)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    console.log('Profile updated successfully');
                },
                error: (err) => {
                    console.error('Error updating profile:', err);
                }
            });
    }

    get checkoutForm() {
        return this.checkoutFormGroup.controls;
    }
}
