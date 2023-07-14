import { Component, OnInit } from '@angular/core';
import { UsersService } from '@redmane/users';


@Component({
  selector: 'ngshop-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private userService: UsersService){

  }
  title = 'ngshop';

  ngOnInit(): void {
      this.userService.initAppSession();
  }

}
