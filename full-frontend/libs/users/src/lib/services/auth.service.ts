import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { LocalstorageService } from './localstorage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiURLUsers = environment.apiUrl + 'users';


  constructor(
    private http: HttpClient,
    private token: LocalstorageService,
    private router: Router) { }

  login(email: string, password: string) : Observable<User>{
    return this.http.post<User>(`${this.apiURLUsers}/login`, { email, password});
  }
  logout() {
    this.token.removeToken();
    this.router.navigate(['/login']);
  }

  sendResetPasswordCode(email: string): Observable<any> {
    return this.http.post(`${this.apiURLUsers}/reset-password-code`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiURLUsers}/verify-reset-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiURLUsers}/reset-password`, {
      email,
      code,
      newPassword
    });
  }
}
