import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { firestore } from "firebase";
import { AuthService } from 'src/app/auth.service';
import Speech from "speak-tts";

@Component({
	selector: "personalNotes",
	templateUrl: "./personal.component.html",
	styleUrls: ["./personal.component.scss"],
})
export class PersonalNotes implements OnInit {
	//Store the notes belonging to this user
	myNotes: any[] = [];
	focusTitle: string;
	focusText: string;
	text : string;
	title : string;
	noteID : string;

	constructor(private db: AngularFirestore, private auth: AuthService) {}

	ngOnInit(): void {
		//Get the notes that this user has created
		this.getMyNotes();
		this.text = '';
		this.title = '';
		this.noteID = '';
	}

	getMyNotes(){
		//Clear the array (we don't want duplicates)
		this.myNotes = [];
		//Get all the notes that this users created
		this.db.collection("SuggestedNotes",ref => ref.where('OwnerID','==',this.auth.getUID())).get().subscribe((ss) => {
			ss.docs.forEach((doc) => {
				//Store the data of those notes
				this.myNotes.push({
					title : doc.data().Title,
					text : doc.data().Text,
					noteID : doc.data().noteID
				});
			});
		});
	}
	//Create a new Note
	async createNote(){
		//The title of the note 
		var title = await prompt("Note Title?");
		//The content of the note
		var text = await prompt("Note Text?");
		//The ID of the note
		var noteID = '';

		//Add the new note to the collection
		this.db.collection("SuggestedNotes").add({
			Title : title,
			Text : text,
			OwnerID : this.auth.getUID(),
			noteID : '',
			Access : []
		})
		//Then go back to firestore an find out what ID was given to this note (we want to use firestore's ID system as it is garenteed unique)
		.then(() => {
			this.db.collection("SuggestedNotes", ref => ref.where('noteID','==','')).get().toPromise()
			.then((doc) =>{
				doc.forEach(doc => {
					//Store the ID of the note
					noteID = doc.ref.id;
					console.log("NoteID: "+noteID);
				})
			})
			//Then go back again and store the ID of the note in a field of the note itself
			.then(() =>{
				this.db.collection("SuggestedNotes").doc(noteID).update({
					//Set the ID of the note
					noteID : noteID
				})
				//Finally ...
				.finally(() =>{
					//Reload the notes
					this.getMyNotes();
				})
			})
		})
	}
	//Share this note with another user
	async shareNote(noteID){
		//The name of the user we are sharing with
		var give_note_to : string = await prompt("Share with?");
		if(give_note_to == ''){
			return;
		}
		//The uid of that user
		var that_users_id : string = '';
		//Query the users collection for the uid of a user with the same name as the one given
		this.db.collection('users', ref => ref.where("Name","==",give_note_to)).get().toPromise()
		.then(doc =>{
			doc.forEach(doc =>{
				//Store that users uid
				that_users_id = doc.data().uid;
			})
		})
		//Then add that users uid to the Access array of this note
		.then(() => {
			//If we found a user with the given name
			if(that_users_id != ''){
				this.db.collection("SuggestedNotes").doc(noteID).update({
					//Store the uid
					Access : firestore.FieldValue.arrayUnion(that_users_id)
				})
			} else {
				//Log an error msg
				console.log("Couldn't find user by the name of " + give_note_to);
			}		
		})
	}
	//Delete a note
	deleteNote(noteID){
		//Remove this note
		console.log(noteID);
		this.db.collection("SuggestedNotes").doc(noteID).delete()
		.then(() =>{
			this.getMyNotes();
		})
		
	}
	//Edit a note
	async editNote(){
		// //The new title of this note
		// var title : string = await prompt("New Title?");
		// //The new text of this note
		// var text : string = await prompt("New Text?");
		//Update the Title and Text fields of this note with the new ones
		this.db.collection("SuggestedNotes").doc(this.noteID).update({
			Title : this.title,
			Text : this.text
		})
		//Then ...
		.then(() =>{
			//Reload the notes
			this.getMyNotes();
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
	setData(title, text, noteID){
		this.title = title;
		this.text = text;
		this.noteID = noteID;
	}
}