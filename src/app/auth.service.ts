//REFERENCES: This service was implemented with the help of the "Firebase Auth" guide found in the README file.
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<firebase.User>;
  err: String;
  yeet: firebase.User;
  

  constructor(
    private firebaseAuth: AngularFireAuth,
    public  afAuth:  AngularFireAuth,
    public db: AngularFirestore
    
    ) { 
    this.afAuth.authState.subscribe(yeet => {
      if (yeet){
        this.yeet = yeet;
        localStorage.setItem('user', JSON.stringify(this.yeet));
      } else {
        localStorage.setItem('user', null);
      }
    })
  }

  // Sign Up Method
  signup(emailAddress: string, password: string) {
    this.firebaseAuth.createUserWithEmailAndPassword(emailAddress, password)
    .catch(error => { this.err = error.message; console.log('Something went wrong:', error);  });
  }

  // Login Method
  login(emailAddress: string, password: string) {
    this.firebaseAuth.signInWithEmailAndPassword(emailAddress, password)
    .catch(error => { this.err = error.message; console.log('Something went wrong:', error);  });
  }
  
  // Logout Method
  logout() {
    this.firebaseAuth.signOut();
  }

  resetPassword(emailAddress: string){
    return this.firebaseAuth.sendPasswordResetEmail(emailAddress, null).then(() => {
      console.log('User successfully reset password!');
      alert(`Password reset email sent to ${emailAddress}`);
    }).catch(error => { 
        this.err = error.message;
        console.log('Something went wrong:', error);
        alert(error.message);
      });
  }

  isLoggedIn(): any {
    const  user  =  JSON.parse(localStorage.getItem('user'));

    if(user !== null){
      return user['email'];
    }
    else{
      return false;
    };
  }

  getUID(): string {
    const  user  =  JSON.parse(localStorage.getItem('user'));

    if(user !== null){
      return String(user['uid']);
    }
    else{
      return "Not Logged In;"
    };
  }

}
