import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  signedIn: boolean;
  ICannotThinkOfAGoodName: boolean = false;
  errorMessage: string = '';

  constructor(
    public authService : AuthService,
    private auth : AngularFireAuth
    ) {}

  ngOnInit(): void {

    //Determine whether the user is currently signed in
    if(this.authService.getUID() == 'Not Logged In;'){
      this.signedIn = false;
    } else {
      this.signedIn = true;
    }
    console.log(this.signedIn)
  }

  //Sign in the user 
  signIn(){
    //If they are signed in they must sign out to switch account
    if(this.signedIn){
      //Display error message
      this.errorMessage = "You are already signed in.";
      return;
    }
    //This needs to be false here
    this.ICannotThinkOfAGoodName = false;
    //Sign them in
    this.auth.signInWithEmailAndPassword(this.email,this.password)
    .catch((error) => {
      //We dont want to navigate home if we failed to sign in
      this.ICannotThinkOfAGoodName = true;
      //Display the error
      this.errorMessage = error.message;
    })
    .then(() => {
      //If we had an error go no further
      if(this.ICannotThinkOfAGoodName)return;
      //Otherwise we navigate home, this worked better than router as it reloads the user info (bottom left on page)
      window.location.replace('/');
    })
  }
  //Sign out the user (This is disabled if they are not currently signed in)
  signOut(){
    //Sign them out
    this.auth.signOut().then(() => {
      //Reload the page
      window.location.reload();
    });
  }
}
