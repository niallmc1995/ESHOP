import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private localStorageService: LocalstorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.localStorageService.getToken();

    if (token) {
      try {
        const tokenDecode = JSON.parse(atob(token.split('.')[1]));
        if (!this._tokenExpired(tokenDecode.exp)) {
          return true;
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    this.router.navigate(['/login']);
    return false;
  }

  private _tokenExpired(exp: number): boolean {
    return Math.floor(Date.now() / 1000) >= exp;
  }
}
