import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocalstorageService } from '../../services/localstorage.service';

@Component({
    selector: 'users-login',
    templateUrl: './login.component.html',
    styles: []
})
export class LoginComponent implements OnInit {
  loginFormGroup: FormGroup;
  isSubmitted = false;
  authError = false;
  authMessage = 'Email or password are wrong';


    constructor(
      private formBuilder: FormBuilder,
      private auth: AuthService,
      private localStorageService: LocalstorageService,
      private router : Router
      ) {}

    ngOnInit(): void {
      this._initLoginForm();
    }

    private _initLoginForm() {
      this.loginFormGroup = this.formBuilder.group({
        email:['', [Validators.required, Validators.email]],
        password:['', Validators.required]
      })
    }

    onSubmit() {
      this.isSubmitted = true;

      if(this.loginFormGroup.invalid) return;


      this.auth.login(this.loginForm.email.value, this.loginForm.password.value).subscribe(
        (user) => {
        this.authError = false;
        this.localStorageService.setToken(user.token);
        this.router.navigate(['/']);

      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.authError = true;
        if(error.status !== 400) {
          this.authMessage = "Error in the  server, please try again later";
        }
      });
    }

    get loginForm() {
      return this.loginFormGroup.controls;
    }
}
