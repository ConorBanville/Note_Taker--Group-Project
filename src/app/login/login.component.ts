import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  displayName: string;

  constructor(public authService : AuthService, private router: Router) {}

  ngOnInit(): void {}

  signup() { 
    this.authService.signup(this.email, this.password);
    this.email = this.password = '';
  }

  login() {      
    this.authService.login(this.email, this.password)
    this.email = this.password = '';
    this.router.navigate(["/"]);
  }

  logout() { 
    this.authService.logout();
   }
}
