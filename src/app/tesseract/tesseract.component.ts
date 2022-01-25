import { Component, OnInit } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from 'firebase';
//import createWorker from "tesseract.js";
import * as Tesseract from 'tesseract.js'
//import * as ngocr from 'ng-ocr';




@Component({
  selector: 'app-tesseract',
  templateUrl: './tesseract.component.html',
  styleUrls: ['./tesseract.component.scss']
})
export class TesseractComponent {
  title = 'tesseract.js-angular-app';
  ocrResult = 'Recognizing...';
  constructor() {

  }
  async doOCR() {
    var img = new Image;
var canvas = await document.createElement("canvas");
var ctx = await canvas.getContext("2d");
var src = await "https://i.imgur.com/FkLGnxH.png";

img.crossOrigin = await "Anonymous";

img.onload = await async function() {
  canvas.width = await img.width;
  canvas.height = await img.height;
  await ctx.drawImage(img, 0, 0);
  
  const worker = createWorker({
    logger: m => console.log(m),
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(ctx);
  //ocrResult = text;
  console.log(text);
  await worker.terminate();
  
}
img.src = await src;
  }

   
  
   

  ngOnInit() {
    this.doOCR();
  }

}

