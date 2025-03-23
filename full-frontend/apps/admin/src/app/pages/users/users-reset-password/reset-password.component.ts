// reset-password.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../libs/users/src/lib/services/auth.service';
import { MessageService } from 'primeng/api'; // Assuming you're using PrimeNG for messages

@Component({
  selector: 'admin-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, @Inject(AuthService) private auth: AuthService, private messageService: MessageService) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid) return;

    this.isLoading = true;
    this.auth.resetPassword(
      this.resetPasswordForm.value.email,
      this.resetPasswordForm.value.code,
      this.resetPasswordForm.value.newPassword
    ).subscribe(
      () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password has been reset successfully',
        });
        // Navigate to login page or another appropriate page
      },
      (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to reset password',
        });
      }
    );
  }
}