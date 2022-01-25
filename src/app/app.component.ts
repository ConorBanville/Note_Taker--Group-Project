import { Component, HostBinding } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { RouterOutlet } from '@angular/router';
import * as firebase from "firebase";
import { AuthService } from './auth.service';
import { fader } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ fader ]
})
export class AppComponent {
  title = 'Note-Taking-Project';
  displayName: String;
  profilerLocation;
  
  @HostBinding('style.font-family') font = "Roboto, \"Helvetica Neue\", sans-serif"; 

  constructor(public authService : AuthService, private db:AngularFirestore) {}

  ngOnInit() {
    if(this.authService.isLoggedIn()){
      this.db.collection('users').doc(this.authService.getUID()).get().toPromise().then((doc) => {
        this.displayName = doc.data().Name;
      });
      firebase.storage().ref().child(this.authService.getUID() + "/images/" + this.authService.getUID()).getDownloadURL().then( res => this.profilerLocation = res);
    }
    else{
      this.displayName = "Not Logged In";
      this.profilerLocation = '/assets/images/profiles/default-1.png'
    }
  }
  changeFontNormal(){
    this.font = "Roboto, \"Helvetica Neue\", sans-serif"; 
  }

  changeFontDyslexic(){
    this.font = "OpenDyslexic";
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
