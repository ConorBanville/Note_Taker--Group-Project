import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../../auth.service';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  emailAddress: string;
  password: string;
  displayName: string;
  errorMessage: string;
  profiler: Blob;
  EmailTaken: boolean = false;

  constructor(public authService : AuthService, private db:AngularFirestore, private firebaseAuth: AngularFireAuth, private router: Router) { }

  ngOnInit(): void {
  }

  async signup() {
    //Check if User is Signed Up
    this.db.collection('users',ref => ref.where('email','==', this.emailAddress)).get().toPromise().then((docs) => {
      if(!docs.empty){
        this.errorMessage = 'The email address '+this.emailAddress+' is already in use by another user';
        this.EmailTaken = true;
      }  
    }).then(() => {
      if(!this.EmailTaken){
      //Create a user
      this.firebaseAuth.createUserWithEmailAndPassword(this.emailAddress, this.password).then(() => {

        //Sign the user in
        this.firebaseAuth.signInWithEmailAndPassword(this.emailAddress, this.password).then(async () => {

          //Get a default profiler
          this.profiler =  await fetch("assets/images/profiles/default-3.png").then(R => 
            R.blob()
          );

          //Store the default profiler in the storage
          firebase.storage().ref().child(this.authService.getUID() + "/images/" + this.authService.getUID()).put(this.profiler);

          //Put the user in the 'users' collection
          this.db.collection('users').doc(this.authService.getUID()).set({
            Name: this.displayName,
            email: this.emailAddress,
            LastChat: 'FirstChat',
            uid: this.authService.getUID()
          });
          
          //Put an inital note in the 'Notes' collection
          this.db.collection('users').doc(this.authService.getUID()).collection('Notes').doc("Your First Note").set({
            title: "Your First Note", 
            text: "Go write some notes!"
          });
          
        }).then(() => { 
          //Reset variables
          this.emailAddress, this.password, this.displayName = '';     
        }).then(() => { 
          //Route the browser back to homepage
          this.router.navigate(['/']);
        })
      })} else {
        //Display the error message for 10 seconds
        $('.error').css('opacity', '1');
        setTimeout(() =>{
          $('.error').css('opacity','0')
        }, 10000);
        this.EmailTaken = false;
      }
    })
  }
}
