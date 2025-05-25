import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@redmane/users';
import { Subject, take, takeUntil } from 'rxjs';


@Component({
    selector: 'user-profile',
    templateUrl: './profile.component.html',
    styles: []
})
export class ProfileComponent implements OnInit, OnDestroy {
    constructor(
      private router:Router,
      private usersService: UsersService,
      private formBuilder: FormBuilder,

    ) {}

    checkoutFormGroup: FormGroup;
    isSubmitted = false;
    userId : string;
    countries = [];
    unsubscribe$ : Subject<void> = new Subject();

    ngOnInit(): void {
      this._initCheckoutForm();
    this._autoFillUserData();
    this._getCountries();
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

  private _autoFillUserData() {
    this.usersService
    .observeCurrentUser()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(user => {
      if(user){
        this.userId = user.id || '';
        this.checkoutForm['name'].setValue(user.name || '');
        this.checkoutForm['email'].setValue(user.email || '');
        this.checkoutForm['phone'].setValue(user.phone || '');
        this.checkoutForm['city'].setValue(user.city);
        this.checkoutForm['country'].setValue(user.country);
        this.checkoutForm['zip'].setValue(user.zip);
        this.checkoutForm['apartment'].setValue(user.apartment);
        this.checkoutForm['street'].setValue(user.street);

      }
    })
  }

  private _getCountries() {
    this.countries = this.usersService.getCountries();
  }

  backToCart() {
    this.router.navigate(['/']);
  }

  get checkoutForm() {
    return this.checkoutFormGroup.controls;
  }
}
