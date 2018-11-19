import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import * as fb from 'firebase/app';
@Component({
  selector: 'txc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  compressed: string;
  natural: string;
  name: string;
  keyList: Observable<any[]>;
  serverTimestamp = fb.database.ServerValue.TIMESTAMP;

  constructor(private db: AngularFireDatabase) {
    this.watchList();
  }

  watchList() {
    this.keyList = this.db.list('keys').snapshotChanges();
  }

  selectItem(name: string) {
    this.name = name;
    this.db.object<string>(`compressed/${name}`)
      .valueChanges()
      .subscribe(val => {
        console.log('compressed', val);
        this.compressed = val;
      });
    this.db.object<string>(`natural/${name}`)
      .valueChanges()
      .subscribe(val => {
        console.log('natural', val);
        this.natural = val;
      });
  }

  compress() {
    if (!this.name) {
      alert('We can\'t set an item without a title');
      return;
    }
    if (!this.natural || this.natural.length < 40) {
      alert('this is kind of pointless. Compress something longer.');
      return;
    }
    this.compressText();
    // this.db.object(`compressed/${this.name}`).set(compressedItem);
    // this.selectItem(this.name);
    // this.db.object(`natural/${this.name}`).set(this.naturalItem);
    // this.db.object(`keys/${this.name}`).set(this.serverTimestamp);
  }


  compressText = () => {
    let matchString = '';
    let bookmark = 14;
    let text = this.natural;
    for (let matchLength = 35; matchLength > 8; matchLength--)
      for (let increment = 0; increment < text.length - 1; increment++) {
        if (increment > text.length - matchLength) {
          // Avoid checking the last few characters
          continue;
        }
        matchString = text.slice(increment, increment + matchLength);
        bookmark = text.indexOf(matchString, bookmark);
        if (bookmark === -1) {
          // No match found, increment forward with new index.
          bookmark = increment + matchLength;
          continue
        } else {
          // Match found at bookmark index.
          // console.log(`FOUND "${matchString}" at index ${bookmark}`);
          const pointer = `<${increment},${matchLength}>`;
          // console.log('pointer: ' + pointer);
          const regExp = new RegExp(matchString, 'g');
          const head = text.slice(0, bookmark);
          const tail = text.slice(bookmark, text.length + 1).replace(regExp, pointer);
          // text = text.replace(regExp, pointer);
          text = head + tail;
          // console.log('TEXT:', text);
        }
      }
    this.compressed = text;
  }

  decompress() {
    if (!this.name) {
      alert('We can\'t set an item without a title');
      return;
    }
    if (!this.compressed || this.compressed.length < 8) {
      alert('That\'s pretty short. I doubt it\'s even compressed.');
      return;
    }
    this.selectItem(this.name);
    this.db.object(`compressed/${this.name}`).set(this.compressed);
    this.db.object(`keys/${this.name}`).set(this.serverTimestamp);
  }
}

