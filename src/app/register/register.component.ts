import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../auth.service';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  emailAddress: string;
  password: string;

  constructor(public authService : AuthService, private db:AngularFirestore) { }

  ngOnInit(): void {
  }

  signup() {
    this.authService.signup(this.emailAddress, this.password);
    this.emailAddress = this.password = '';
  }
}
