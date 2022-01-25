import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})

export class ChatService {

    constructor(
        public auth: AuthService,
        public db: AngularFirestore
    ){}

    getName(uid){
        var name = 'Bannans';
        var docRef = this.db.collection("users").doc(uid);

        docRef.get().toPromise().then(function(doc){
            if(doc.exists){
                name = doc.data().Name;
                console.log(name);
                return name;
            } else {
                console.log("Couldn't find document!");
            }
        });
    }
}