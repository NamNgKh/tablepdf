import { Component } from '@angular/core';

declare var jsPDF: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  columns = [];
  data = [];

  constructor() {
    this.initTable();
    var doc = new jsPDF('p', 'pt');
    doc.autoTable(this.columns, this.data);
    doc.save("table.pdf");
  }

  initTable() {
    for (var i = 0; i < 30; i++) {
      this.columns.push("Column " + (i + 1));
    }

    for(var i = 0; i < 10; i++){
      let row = [];
      for (var j = 0; j < 30; j++) {
        row.push("Column " + j + " row " + i);
      }
      this.data.push(row);
    }
  }
}
