import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { AuthService } from '../auth.service';
import { createWorker } from 'tesseract.js';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  storageRef: any;
  location: any;
  name: String; 
  storageUploads: any[] = [];
  worker = createWorker();

  constructor(private db: AngularFirestore, private AuthService: AuthService) { }

  ngOnInit(): void {
    this.storageRef = firebase.storage().ref();
    this.location = "https://uxwing.com/wp-content/themes/uxwing/download/01-user_interface/upload-image.svg";
    this.getUserFiles(this.storageUploads);
  }

  getLocation($event){
    this.work($event.target.files[0])

  }

  async work(img){
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    const { data: { text } } = await this.worker.recognize(img);
    console.log(text);
    await this.worker.terminate();;
  }

  async uploadFile(){
    var user = await this.AuthService.getUID();

    if(String(this.location.type).includes("image")){
      firebase.storage().ref().child(user + "/images/" + this.name).put(this.location).then(function(snapshot) {
        user = "";
        console.log('Uploaded file successfully!');
      });
    }

    else if(String(this.location.type).includes("pdf")){
      firebase.storage().ref().child(user + "documents/" + this.name).put(this.location).then(function(snapshot) {
        user = "";
        this.location = "https://uxwing.com/wp-content/themes/uxwing/download/01-user_interface/upload-image.svg";
        console.log('Uploaded file successfully!');
      });
    }
  }

  async getUserFiles(storageUploads){
    var user = await this.AuthService.getUID();
    var files = firebase.storage().ref().child(user + "/images/");

    // Find all the prefixes and items.
    files.listAll().then(function(res) {
      res.items.forEach(function(itemRef) {
        storageUploads.push(itemRef.getDownloadURL());
        console.log(itemRef.getDownloadURL());
      });
    }).catch(function(error) {
      // Uh-oh, an error occurred!
      console.log("Error displaying previous notes. Details: " + error);
    });

    user = "";
  }

}
