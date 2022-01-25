import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { firestore } from 'firebase';
import * as firebase from 'firebase';
import  'src/vendor/jitsi/external_api.js';
import * as $ from 'jquery';
import { saveAs } from 'file-saver';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit {
  //Jitsi Meeting Options
  domain: String;
  options: any;
  api: any;

  thisUser = '';            //This users display name
  members: any [] = [];     //Holds this grous members UIDs
  memberNames: any [] = []; //Holds this groups members names
  messages: any[] = [];     //Holds this groups messages
  myGroups: any[] = [];     //Holds this users groups
  groupFiles: any[] = [];   //Holds this groups stored files
  new_message = '';         //Store a new message text
  new_member_name = '';     //Store a new member name
  new_member_id = '';       //Store a new member uid
  new_group_name = '';      //Store a new group name
  this_group_id = '';       //Store a the current group id
  this_group_name = '';     //Store the current group name
  error_msg = '';           //Store an error message to be displayed on the webpage
  canReload = true;         //Prevent too many group reloads

  constructor(private db: AngularFirestore, private auth: AuthService,) {}

  ngOnInit(): void { 
    //Get this users name and the last chat room they were in
    this.db.collection('users').doc(this.auth.getUID()).get().toPromise().then((doc)=>{
      this.this_group_id = doc.data().LastChat; //Last Group Chat is set as the current chat
      this.thisUser = doc.data().Name;          //Store the users name 
    }).then(()=>{
      this.getMembers();        //Load the members names of the current group chat
      this.getGroups();         //Get a list of groups for this user
      this.listStorageFiles();  //Get a list of files for this chat room
      this.addListener();       //Add a listener for the messages
    })    
  }

  //Display the meeting window and intialise Jitsi
  startMeeting(){
    //Cannot use call feture in the FirstChat room group
    if(this.this_group_id == "M6rgPn4g1CI7iInUWqDn"){
      $('#meeting').html("<p>Voice and video chat is disabled in this room. To avail of this feature create your own room or get a friend to add you to theirs.</p>");
      $('#meet').css('z-index', '1');
      return;
    }
    //If a meeting is active end it
    this.meetEnd();
    $('#meet').css('z-index', '1');

    this.domain = 'meet.jit.si';
    this.options = {
        roomName: 'PickAnAppropriateMeetingNameHere',
        width: 700,
        height: 700,
        parentNode: document.querySelector('#meeting')
    };

    this.api = new JitsiMeetExternalAPI(this.domain, this.options);
  }

  //Hide the window and remove Jitsi 
  meetEnd(){
    $('#meet').css('z-index', '0');
    $('#meeting').empty();
  }

  //Get all the members in the current group
  getMembers() {
    if(!this.canReload){
      return;                 //canReload prevents overload of reload calls
    }
    
    this.canReload = false;   //Can't reload until this is set to true in a 1/2 second
    this.memberNames = [];    //Array holds the Display Names of the member
    this.members = [];        //Array holds the UID's of the members

    this.members = [];        //Members in Current Group

    //Retreive the array of UID's for this group
    this.db.collection("Messages",ref=> ref.orderBy('created','desc')).doc(this.this_group_id).get().toPromise().then((doc) => {
      if(!doc.exists){
        console.log("ERROR: No users in this group");
        return;
      }
      this.this_group_name = doc.data().Name;
      doc.data().members.forEach((memberID) => {
        this.members.push(memberID);
      })
    }).then(()=>{
      //When we have gotten all the UID's, we go and get the corresponding Display Names and store them
      this.members.forEach((elm) =>{
        this.db.collection("users").doc(elm).get().toPromise().then((doc)=>{
          this.memberNames.push(doc.data().Name); 
        })
      })
    });

    //Prevents Overload of Reload Calls
    setTimeout(() =>{ this.canReload = true},500);
  }

  //Get all the groups this user is a member of
  getGroups(){
    this.myGroups =[];  //Array holds the list of groups

    //Get the group name and id of all the groups
    this.db.collection('Messages', ref => ref.where('members','array-contains',this.auth.getUID())).get().toPromise().then((doc)=>{
      doc.forEach((doc)=>{
        this.myGroups.push({
          name: doc.data().Name,
          id: doc.data().docID
        });
      })
    })
  }

  //Upload files to the Group Chats Bucket
  uploadFiles($event){
    //Cannot upload files to the FirstChat room group
    if(this.this_group_id == "M6rgPn4g1CI7iInUWqDn"){
      return;
    }

    //If we don't have a file 
    if($event.target.files[0]===undefined){
      console.log("Error: no file selected!");
      return;
    }

    //Get the file selected and store it in the Firebase Storage
    let file = $event.target.files[0];
    firebase.storage().ref().child(this.this_group_id+"/"+file.name).put(file).then( () => this.listStorageFiles());
  }

  //List the contents of the storage bucket
  listStorageFiles(){
    //Clear Previous Files, Get Bucket and Declare Index
    this.groupFiles = [];
    var ref = firebase.storage().ref().child(this.this_group_id);
    let i = 0;

    //List all the files and push their MetaData into an array
    ref.listAll().then((res) => {
      //If there are no files return
      if(res.items.length > 0){
        res.items.forEach((itemRef) => {
          let ext = itemRef.name.substring(itemRef.name.indexOf('.'),itemRef.name.length); //Select the icon based on file's extension
          let icon_path = 'assets/images/icons';

          //Choose the icon used for each file
          if(ext == '.svg' || ext == '.jpg' || ext == '.png'){  icon_path += '/image.svg';  } 
          else if(ext == '.docx'){ icon_path += '/microsoft-word.svg'; }
          else if(ext == '.pdf'){ icon_path += '/PDFIcon.svg'; } 
          else if(ext == '.txt'){ icon_path += '/txt.svg'; }
          else if(ext == '.xlsx' || ext == '.xlsm' ||ext == '.xlsb' ||ext == '.xltx'){ icon_path += '/excel.svg'; }
          i++;

          //Push all the data into an array to be diplayed on the page
          this.groupFiles.push({
            file_name : itemRef.name.substring(0,itemRef.name.indexOf('.')),
            file_ext : ext,
            icon : icon_path,
            index : i,
            full_path : itemRef.fullPath
          })
        });
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  //Send a new message to the group
  submit(){
    //Cannot send messages to the FirstChat room group
    if(this.this_group_id == "M6rgPn4g1CI7iInUWqDn"){
      return;
    }

    //If the there is no user logged in return
    if(this.auth.getUID() == null){
      console.log('Error: No User Logged In');
      return;
    }

    //If there is no input return
    else if(this.new_message === ''){
      console.log('Error: Message text null');
      return;
    }

    //Add a new document to the group's document
    this.db.collection("Messages/"+this.this_group_id+"/messages").add({
      DatePublished: new Date().getDate() +'/'+ (new Date().getMonth()+1)+'/'+new Date().getFullYear(),
      OwnerID :  this.auth.getUID(),
      OwnerName : this.thisUser,
      Text : this.new_message,
      created : Math.round((new Date()).getTime() / 1000)
    }).then(() => {
      //reset the form box
      this.new_message = '';  
    }).catch(err => {
      console.log(err);
    })
  }

  //Add a new member to the group 
  addMember(){
    //Cannot add members to the FirstChat room group
    if(this.this_group_id == "M6rgPn4g1CI7iInUWqDn"){
      return;
    }
    //Will be true if no user was foun with the input given
    var isEmpty = false;

    //Return if no text was entered
    if(this.new_member_name === ''){
      console.log('Error: Text Null!');
      this.error_msg = "Whoops input text can't be null!";
      $('#error-no-user').css('font-size','1rem');
      $('#error-no-user').css('opacity','1');
      setTimeout(() => {
        $('#error-no-user').css('opacity','0');
      },2000);
      return;
    } 

    //Otherwise we get the UID of the corresponding User
    else {
      this.db.collection('users', ref => ref.where('Name','==',this.new_member_name)).get().toPromise()
      .then((doc)=>{
        //If we couldn't find a user with that name
        if(doc.empty){
          //If it doesn't exist, throw error
          console.log("ERROR: No user found.");
          isEmpty = true;
          this.error_msg = "Sorry couldn't find a user named "+this.new_member_name+'.';
          $('#error-no-user').css('font-size','.8rem');
          $('#error-no-user').css('opacity','1');
          setTimeout(() => {
            $('#error-no-user').css('opacity','0');
          },2500);
        } 
        //Other wise we store the new uid
        else {
          doc.forEach((doc)=>{
            this.new_member_id = doc.data().uid;
          })
        }
      })

      //Then we add the new UID to the document's array
      .then(()=>{
        if(isEmpty) return; 
        //Go to messages and add their ID to the group chat
        this.db.collection('Messages').doc(this.this_group_id).update({
          members: firestore.FieldValue.arrayUnion(this.new_member_id)
        })
      })

      //Then we reload the members  <--------- Maybe we do this with snapshot listener ?? Then we would get no 'flash' when members reload
      .then(()=>{
        this.getMembers();
      }).finally(() => {
        //Reset the values
        this.new_member_name = '';
        isEmpty = false;
      })  
    }
  }

  //Create a new group
  createGroup(){
    //If it input was null: error, return
    if(this.new_group_name==''){console.log("ERROR: Group name null!");return;}  
    //The Messages collection
    var collection = this.db.collection('Messages');

    /* 
        Note,when creating a group document we first create it with it's docID field empty
        then we go back and query the collection for all the documents with an empty
        docID field (there should only be one). Then we get the id of that document 
        and insert it into itself in the docID field. 
        this could cause an issue if two groups are created at
        the same time.
    */

    //Store the docID, we don't know it yet
    var docID = '';

    //Add the new document
    collection.add({ Name: this.new_group_name, owner: this.auth.getUID(), docID : docID, members: [this.auth.getUID()]}).then(()=>{
    //Then we go and find out what firestore used as the docID
      this.db.collection('Messages',ref => ref.where('docID','==','')).get().toPromise().then((doc)=>{
        doc.forEach((doc)=>{
          docID = doc.ref.id;
        })
      }).then(()=>{
        //Then we put it in the document
        collection.doc(docID).update({
          docID: docID
        }).finally(()=>{
          //Reload the groups
          this.getGroups(); 
          this.new_group_name = '';
        });
      });
    })
  }

  //Remove a group
  removeGroup(groupID){
    var failed = false;
    //If you are not the owener of the group you cannot remove the group
    this.db.collection('Messages').doc(groupID).get().toPromise()
    .then((doc)=>{
      if(doc.data().owner !== this.auth.getUID()){
        console.log("Error: Cannot delete this account does not have permission");
        failed = true;
      }
    }).then(()=>{
      if(!failed){
        //  If you delete a document, firestore dosent actually
        //  delete it's subcollections. So In order to delete 
        //  the group chat we fisrt new to delete the subcollection 
        //  in the group chat document. However there is no method to
        //  delete a collection. Instead we need to delete the contents 
        //  of that collection one by one. When this has been done the 
        //  subcollection is removed.
        var docDeleteArray: any[] = []  //Store the doc id's of the subcollection
        var collection = this.db.collection('Messages');
        collection.doc(groupID).collection('messages').get().toPromise()
        .then((doc) =>{
          doc.forEach((doc)=>{
            docDeleteArray.push(doc.ref.id);  //Push the doc id's of the subcollection
          })
        }).then(()=>{
          docDeleteArray.forEach((doc)=>{ //For all the doc id's we just got ...
            collection.doc(groupID).collection('messages').doc(doc).delete(); // ... delete that document
          })
        }).finally(()=>{  //Once that has been done ...
          collection.doc(groupID).delete().then(()=>{ //... we can delete the group chat document
            this.getGroups(); //Reload the groups section 
          }).then(()=>{this.getMembers()})
        })
      }
    })
  }

  //Remove Member
  removeMember(memName){
    //Could remove a query here if I bind the uid to html when adding members!!
    var memID = '';
    this.db.collection('users', ref => ref.where('Name','==',memName)).get().toPromise().then((doc)=>{
      doc.forEach((doc)=>{
        memID = doc.data().uid;
      })
    }).then(()=>{
      this.db.collection('Messages').doc(this.this_group_id).update({
        members: firestore.FieldValue.arrayRemove(memID)
      })
    }).finally(()=>{
      this.getMembers();
    })
  }

  //Remove a file from the group's bucket
  removeFile(index){
    //Go through all the files in the group
    this.groupFiles.forEach((file) => {
      //If we get a index match
      if(index == file.index){
        //Delete the file from the storage
        firebase.storage().ref().child(file.full_path).delete().then(() =>{
          //When the file is removed we reload the files section
          this.listStorageFiles();
        });    
      }
    })
  }

  //This toggles the active group
  switchGroup(newID){
    if(newID == this.this_group_id) return; //If we're already in this group return
    this.meetEnd();                         //If we we're in a meeting end it
    this.this_group_id = newID;             //Switch the active group ID

    //Update this users last chat in the forestore
    this.db.collection('users').doc(this.auth.getUID()).update({
      LastChat: newID
    })
    
    this.getMembers();        //Reload the members
    this.listStorageFiles();  //Reload the files
    this.addListener();       //Change the listener
  }

  //Add a listener for the messages 
  addListener(){
    this.db.collection('Messages').doc(this.this_group_id).collection('messages',ref => ref.orderBy('created','desc')).valueChanges().subscribe(ss =>{
      this.messages = [];
      var owner = '';
      ss.forEach(doc =>{
        if(doc.OwnerID == this.auth.getUID()){
          owner = 'you-message';
        } else {
          owner = 'other-message';
        }
        this.messages.push({
          style: owner,
          text: doc.Text,
          date: doc.DatePublished,
          name: doc.OwnerName
        });
      })
    })
  }

  //Download a file
  downloadFile(index){
    //Go through all the files
    this.groupFiles.forEach((file) => {
      //If we get a match
      if(index == file.index){
        //Download the file
        firebase.storage().ref().child(file.full_path).getDownloadURL().then((url) => {
          //Send request to get the file as a blob
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = function(event) {
            //Use Filesaver.js to download the blob as a file
            saveAs(xhr.response, file.file_name);
          };
          xhr.open('GET', url);
          xhr.send();
        })
      }
    });
  }
}