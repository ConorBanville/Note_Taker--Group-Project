import { Component, OnInit } from '@angular/core';
import { createWorker } from 'tesseract.js';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss']
})
export class ConferenceComponent implements OnInit {

  worker = createWorker();
  //img = 'assets/images/tesseract/testPNG.png';//PNG
  //img = 'assets/images/tesseract/testJPEG.jpg';//JPEG
  //img = 'https://i.redd.it/r6esi3yqr5b11.jpg'; //URL
  img ='assets/images/tesseract/HarryJPEG.jpg';
  

  constructor() { 
    
  }

  ngOnInit(): void {   
    this.work(this.img);
  }

  async work(img){
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    const { data: { text } } = await this.worker.recognize(img);
    console.log(text);
    await this.worker.terminate();;
  }
}
