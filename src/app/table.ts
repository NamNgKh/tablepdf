import { jsPDF, AutoTableRow, AutoTableData, AutoTableCell } from './jsPDF';

export interface ColumnDef{
	title: string;
	width: number;
}

export interface Cursor{
	x: number;
	y: number;
}

export class TablePDF{
	pdf: jsPDF;
	columns: ColumnDef[];
	rows: any[];
	cursor: Cursor;

	PADDING = 20;
	ROW_HEIGHT= 20;
	
	protected subRows: number;
	protected _actualRowHeight: number;

	constructor(pdf?: any){
		if(pdf){
			this.pdf = pdf;
		}
		else{
			this.pdf = new jsPDF("p", "pt");
		}
	}

	draw(cursor: Cursor){
		let that = this;
		let cellIndex = 0;
		this.pdf.autoTable(this.columns, this.rows, {
			startY: cursor.y,
			theme: "grid",
			pageBreak: "auto",
			drawHeaderRow: (row: AutoTableRow, data: AutoTableData) => {
				cellIndex = 0;
				data.doc.setFillColor(0,0.5,0);
				data.doc.rect(data.cursor.x, data.cursor.y, data.table.width, that.actualRowHeight, "F");
				data.cursor.y += that.actualRowHeight;
			},
			drawHeaderCell: (cell: AutoTableCell, data: AutoTableData) => {
				if(cellIndex == 0){
					data.doc.setFillColor(0,0,0);
					data.doc.rect(cell.x, cell.y, that.columns[cellIndex].width, this.actualRowHeight);
					data.doc.setTextColor(0,0,0);
					data.doc.autoTableText(cell.text, cell.textPos.x, cell.textPos.y, {
						valign: "top",
						halign: "left"
					});
				}
				else{
					data.doc.setFillColor(0,0,0);
					cell.x += that.columns[0].width;
					data.doc.rect(cell.x, cell.y, that.columns[cellIndex].width, this.actualRowHeight);
				}
				cellIndex++;
			}
		})
	}

	drawHeaderRow(){
		
	}

	drawHeaderCell(){

	}

	drawRow(index: number){

	}

	drawCell(index: number){

	}

	get actualRowHeight(){
		if(this._actualRowHeight){
			return this._actualRowHeight;
		}
			
		this._actualRowHeight = this.ROW_HEIGHT;
		let width = this.columns.reduce((result, col) => result + col.width, 0);
		let tableWidth = this.pdf.internal.pageSize.width - this.PADDING*2;
		while (width > tableWidth) {
			width -= tableWidth;
			this._actualRowHeight += this.ROW_HEIGHT;
		}
		return this._actualRowHeight;
	}
}