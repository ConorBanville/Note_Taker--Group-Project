import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { firestore } from "firebase";
import { AuthService } from "src/app/auth.service";
import Speech from "speak-tts";

@Component({
	selector: "sharedNotes",
	templateUrl: "./shared.component.html",
	styleUrls: ["./shared.component.scss"],
})
export class SharedNotes implements OnInit {
    notesSharedWithMe: any[] = [];
    text : string;
	  title : string;
  
    constructor(private db: AngularFirestore, private auth: AuthService) {
      document.body.style.background = '#FDF7FA';
    }
  
    ngOnInit(): void {
      //Get the notes that have been shared with me 
      this.getNotesSharedWithMe();
      this.text = '';
	    this.title = '';
    }

    getNotesSharedWithMe(){
      //Clear the array that stores my shared notes
      this.notesSharedWithMe = [];

      //Get all Notes that have been shared with me 
      this.db.collection("SuggestedNotes",ref => ref.where('Access','array-contains',this.auth.getUID())).get().subscribe((ss) => {
        ss.docs.forEach((doc) => {
          this.notesSharedWithMe.push({
            title : doc.data().Title,
					  text : doc.data().Text,
					  noteID : doc.data().noteID
          });
        });
      });
    }

    //Share a note with another user
    async shareNote(noteID){
      //Get the name of the user that we are going to share this note with
      var give_note_to : string = await prompt("Share with?");
      //Store that users id
      var that_users_id : string = '';

      //Get the uid of the user with the name that was given 
      this.db.collection('users', ref => ref.where("Name","==",give_note_to)).get().toPromise()
      .then(doc =>{
        doc.forEach(doc =>{
          //Save that uid
          that_users_id = doc.data().uid;
        })
      })
      //Add that user's uid to this notes Access array
      .then(() => {
        //If we found a user with the given name
        if(that_users_id != ''){
          this.db.collection("SuggestedNotes").doc(noteID).update({
            //Add that user's uid to the Access array of this note
            Access : firestore.FieldValue.arrayUnion(that_users_id)
          })
        } else {
          //Log an error msg if we couldn't find a user 
          console.log("Couldn't find user by the name of " + give_note_to);
        }        
      })
    }
    //Remove this note from my shared notes (does not delete the note just denies this user access)
    removeNote(noteID){
      this.db.collection("SuggestedNotes").doc(noteID).update({
        //Remove this user's uid from the Access array of this note
        Access : firestore.FieldValue.arrayRemove(this.auth.getUID())
      })
      //Then reload the notes on the page
      .then(() =>{
        this.getNotesSharedWithMe();
      })
    }

    async speak(){
      const speech = new Speech();
      speech.init();
    
      //Try use TTS, otherwise throw an error
      try { 
        speech.speak({text: this.text}); 
      } catch (error) {
        console.log("Speech error: " + error);
      }
    }
  
    //When Modal opens, sets the current note data
    setData(title, text){
      this.title = title;
      this.text = text;
    }

    	//Edit a note
    async editNote(noteID){
      //The new title of this note
      var title : string = await prompt("New Title?");
      //The new text of this note
      var text : string = await prompt("New Text?");
      //Update the Title and Text fields of this note with the new ones
      this.db.collection("SuggestedNotes").doc(noteID).update({
        Title : title,
        Text : text
      })
      //Then ...
      .then(() =>{
        //Reload the notes
        this.getNotesSharedWithMe();
      })
    }
}