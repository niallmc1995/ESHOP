import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
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
        // Invalid token format
        console.error('Token parsing failed:', error);
      }
    }

    this.router.navigate(['/login']);
    return false;
  }

  private _tokenExpired(expiration: number): boolean {
    return Math.floor(new Date().getTime() / 1000) >= expiration;
  }
}
