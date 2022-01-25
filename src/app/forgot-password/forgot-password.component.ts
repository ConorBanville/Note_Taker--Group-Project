import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})


export class ForgotPasswordComponent implements OnInit {

  constructor(private authService: AuthService) { }

  resetPassword(email: string){
    if(!email){
      alert('Please enter your email');
      return;
    }
    this.authService.resetPassword(email);
  }

    ngOnInit(): void {}
}
