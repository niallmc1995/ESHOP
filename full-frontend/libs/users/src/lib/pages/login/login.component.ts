import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { LocalstorageService } from '../../services/localstorage.service';

@Component({
    selector: 'users-login',
    templateUrl: './login.component.html',
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    loginFormGroup!: FormGroup;
    resetPasswordForm!: FormGroup;
    verificationForm!: FormGroup;
    newPasswordForm!: FormGroup;
    isSubmitted = false;
    authError = false;
    authMessage = 'Email or password are wrong';
    isLoading = false;
    
    showResetPassword = false;
    showVerificationCode = false;
    showNewPassword = false;

    constructor(
        private formBuilder: FormBuilder,
        private auth: AuthService,
        private localStorageService: LocalstorageService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._initForms();
    }

    private _initForms() {
        this.loginFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        this.resetPasswordForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.verificationForm = this.formBuilder.group({
            code: ['', Validators.required]
        });

        this.newPasswordForm = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password')?.value;
        const confirmPassword = g.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.loginFormGroup.invalid) return;

        this.isLoading = true;
        this.auth.login(this.loginFormGroup.get('email')?.value, this.loginFormGroup.get('password')?.value).subscribe(
            (user) => {
                this.isLoading = false;
                this.authError = false;
                this.localStorageService.setToken(user.token);
                this.router.navigate(['/']);
            },
            (error: HttpErrorResponse) => {
                this.isLoading = false;
                this.authError = true;
                if (error.status !== 400) {
                    this.authMessage = "Error in the server, please try again later";
                }
            }
        );
    }

    showForgotPassword() {
        this.showResetPassword = true;
        this.resetPasswordForm.patchValue({ email: this.loginForm['email'].value });
    }

    backToLogin() {
        this.showResetPassword = false;
        this.showVerificationCode = false;
        this.showNewPassword = false;
        this.isSubmitted = false;
        this.authError = false;
    }

    sendResetCode() {
        if (this.resetPasswordForm.invalid) return;

        this.isLoading = true;
        this.auth.sendResetPasswordCode(this.resetPasswordForm.controls['email'].value).subscribe(
            () => {
                this.isLoading = false;
                this.showVerificationCode = true;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Verification code has been sent to your email'
                });
            },
            (error) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to send verification code'
                });
            }
        );
    }

    verifyCode() {
        if (this.verificationForm.invalid) return;

        this.isLoading = true;
        this.auth.verifyResetCode(
            this.resetPasswordForm.get('email')?.value,
            this.verificationForm.get('code')?.value
        ).subscribe(
            () => {
                this.isLoading = false;
                this.showNewPassword = true;
                this.showVerificationCode = false;
            },
            (error) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to update password'
                });
            }
        );
    }

    updatePassword() {
        if (this.newPasswordForm.invalid) return;

        this.isLoading = true;
        this.auth.resetPassword(
            this.resetPasswordForm.get('email')?.value,
            this.verificationForm.get('code')?.value,
            this.newPasswordForm.get('password')?.value
        ).subscribe(
            () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Password has been updated successfully'
                });
                this.backToLogin();
            },
            (error) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to update password'
                });
            }
        );
    }

    get loginForm() {
        return this.loginFormGroup.controls;
    }
}
