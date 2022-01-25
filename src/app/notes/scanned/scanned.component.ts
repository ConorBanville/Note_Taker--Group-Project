import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { worker } from 'cluster';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/auth.service';
import { createWorker } from 'tesseract.js';

@Component({
    selector: 'scannedNotes',
    templateUrl: './scanned.component.html',
    styleUrls: ['./scanned.component.scss']
  })

  export class ScannedNotes implements OnInit {
    //Used for Getting File Data
    storageRef: any;
    location: any;
    name: String; 

    //Used for Scanning Text Documents
    worker = createWorker();

    //Stores all Files for User
    storageUploads: any[] = [];

    //Variables Used for Modal Display
    title: string;
    text: string;
    img: string;
    
    constructor(private db: AngularFirestore, private AuthService: AuthService) { }
    
    ngOnInit(): void {
      //Sets up Firebase Connection, Default Upload Image and Searches for Cloud Files
      this.storageRef = firebase.storage().ref();
      this.location = "https://uxwing.com/wp-content/themes/uxwing/download/01-user_interface/upload-image.svg";
      this.getUserFiles(this.storageUploads);

      //Default Data to Blank for Modal
      this.title = '';
      this.text = '';
      this.img = '';
    }
    
    //Takes in Location of Uploaded Local File
    getLocation($event){
      this.location = $event.target.files[0];
    }

    //When Modal opens, sets the current note data
    setData(title, text, img){
      this.title = title;
      this.text = text;
      this.img = img;
    }
    
    async uploadFile(){
      var user = await this.AuthService.getUID();
    
      //If the File is an Image, Store it in the Users Image Bucket
      if(String(this.location.type).includes("image")){
        firebase.storage().ref().child(user + "/images/" + this.name).put(this.location).then(function(snapshot) {
          this.db.collection("users/" + this.auth.getUID() + "/Notes").doc(this.name).set({text: this.work(this.location), title: this.name});
          user = "";
          console.log('Uploaded file successfully!');
        });
      }
    
      //If the File is a PDF, Store it in the Users Documents Bucket
      else if(String(this.location.type).includes("pdf")){
      firebase.storage().ref().child(user + "documents/" + this.name).put(this.location).then(function(snapshot) {
        user = "";
        //Reset the Default Upload Image
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
        });
      }).catch(function(error) {
        //If Notes can't be found, throw error
        console.log("Error: " + error);
      });
    
      //Resets the User to Blank
      user = "";
    }

    //Passes an Image in, uses OCR to get Text
    async work(imgTesseract){
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      const { data: { text } } = await this.worker.recognize(imgTesseract);
      await this.worker.terminate();
      return text;
    }
  }