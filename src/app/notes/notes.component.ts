import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../auth.service";

@Component({
	selector: "app-notes",
	templateUrl: "./notes.component.html",
	styleUrls: ["./notes.component.scss"],
})
export class NotesComponent implements OnInit {
	notes: any[] = [];
	sharedNotes: any[] = [];
	sharingUser: string;

	constructor(private db: AngularFirestore, private auth: AuthService) {}

	ngOnInit(): void {
		//Gets all Notes in the Users Account
		this.db.collection("users/" + this.auth.getUID() + "/Notes").get().subscribe((ss) => {
			ss.docs.forEach((doc) => {
				this.notes.push(doc.data());
			});
		});
	}

	findSharedNotes() {
		//Checks the Notes database for documents a user shared with you
		try {
			this.db.collection("note").doc(this.auth.getUID()).collection(this.sharingUser).get().subscribe((ss) => {
				ss.docs.forEach((doc) => {
					this.sharedNotes.push(doc.data());
				});
			});
		} catch (error) {
			console.log("Error: " + error);
		}
	}

	async onClickMe() {
		var userid = await prompt(
			"Please the userid of the person you would like to share files with"
		);
		var data = { name: "test", info: "test2" };

		try {
			//Get User ID and add note data
			this.db.collection("note/" + this.auth.getUID() + "/" + userid).doc("TestTestTest").set(data);
			alert("Thank you " + userid + " successfully added");
		} catch (error) {
			console.log("Error: " + error);
		}
	}

	async createNotesOrder() {
		//Enter Data
		var titlee = await prompt("Enter title");
		var notess = await prompt("Enter notes");
		alert("thank you");

		//Creates the Document
		this.db.collection("users/" + this.auth.getUID() + "/Notes").doc(titlee).set({text: notess, title: titlee});

		//Wipe the List
		this.notes = [];

		//Refresh the List
		await this.db.collection("users/" + this.auth.getUID() + "/Notes").get().subscribe((ss) => {
			ss.docs.forEach((doc) => {
				this.notes.push(doc.data());
			});
		});
	}

	async deleteNotesOrder() {
		//Enter Data
		var deletedoc = await prompt("Enter doc name to be deleted");

		//Delete the Document
		this.db.collection("users/" + this.auth.getUID() + "/Notes").doc(deletedoc).delete();
		alert("thank you");

		//Wipe the List
		this.notes = await [];

		//Refresh the List
		await this.db.collection("users/" + this.auth.getUID() + "/Notes").get().subscribe((ss) => {
			ss.docs.forEach((doc) => {
				this.notes.push(doc.data());
			});
		});
	}

	async updateNotesOrder() {
		//Enter Data
		var docofnote = await prompt("Enter doc of note to be updated");
		var updatedtitle = await prompt("Enter updated title");
		var updatedtext = await prompt("Enter updated text");

		//Update Data
		this.db.collection("users/" + this.auth.getUID() + "/Notes").doc(docofnote).update({ title: updatedtitle, text: updatedtext });
		alert("Thank you");

		//Wipe the List
		this.notes = await [];

		//Refresh the List
		await this.db.collection("users/" + this.auth.getUID() + "/Notes").get().subscribe((ss) => {
			ss.docs.forEach((doc) => {
				this.notes.push(doc.data());
			});
		});
	}
}