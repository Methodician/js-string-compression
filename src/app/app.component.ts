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
  compressedItem: string;
  naturalItem: string;
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
        this.compressedItem = val;
      });
    this.db.object<string>(`natural/${name}`)
      .valueChanges().subscribe(val => {
        this.naturalItem = val;
      });
  }

  compress() {
    if (!this.name) {
      alert('We can\'t set an item without a title');
      return;
    }
    if (!this.naturalItem || this.naturalItem.length < 40) {
      alert('this is kind of pointless. Compress something longer.');
      return;
    }
    this.db.object(`natural/${this.name}`).set(this.naturalItem);
    this.db.object(`keys/${this.name}`).set(this.serverTimestamp);
  }

  decompress() {
    if (!this.name) {
      alert('We can\'t set an item without a title');
      return;
    }
    if (!this.compressedItem || this.compressedItem.length < 8) {
      alert('That\'s pretty short. I doubt it\'s even compressed.');
      return;
    }
    this.db.object(`compressed/${this.name}`).set(this.compressedItem);
    this.db.object(`keys/${this.name}`).set(this.serverTimestamp);
  }

}

