// verify-code.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../libs/users/src/lib/services/auth.service';
import { MessageService } from 'primeng/api'; // Assuming you're using PrimeNG for messages

@Component({
  selector: 'admin-verify-code',
  templateUrl: './verify-code.component.html',
})
export class VerifyCodeComponent {
  verifyCodeForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, @Inject(AuthService) private auth: AuthService, private messageService: MessageService) {
    this.verifyCodeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
    });
  }

  verifyCode() {
    if (this.verifyCodeForm.invalid) return;

    this.isLoading = true;
    this.auth.verifyResetCode(this.verifyCodeForm.value.email, this.verifyCodeForm.value.code).subscribe(
      () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Code is valid, you can now reset your password',
        });
        // Navigate to the reset password page
      },
      (error: any) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Invalid or expired code',
        });
      }
    );
  }
}