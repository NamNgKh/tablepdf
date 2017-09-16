declare var jsPDF: any;

export interface ColumnDef {
	title: string;
	width: number;
}

export interface Cursor {
	x: number;
	y: number;
}

export class TablePDF {
	pdf;
	columns: ColumnDef[] = [];
	rows: any[] = [];
	cursor: Cursor;
	width: number;

	PADDING = 20;
	ROW_HEADER_HEIGHT = 30;
	HEADER_FONT_SIZE = 10;
	FONT_ROW_RATIO = 1.45;
	ROW_HEIGHT = 20;
	FONT_SIZE = 8;

	protected subRows: number;
	protected _actualHeaderRowHeight: number;
	protected _actualRowHeight: number;
	protected even = true;

	constructor(pdf?: any) {
		if (pdf) {
			this.pdf = pdf;
		}
		else {
			this.pdf = new jsPDF("p", "pt");
		}
		this.initTable();
		this.width = this.pdf.internal.pageSize.width - this.PADDING * 2;
	}

	initTable() {
		for (var i = 0; i < 30; i++) {
			this.columns.push({ title: "Column abcse asd as dsd  " + (i + 1), width: 70 });
		}

		for (var i = 0; i < 1; i++) {
			let row = [];
			for (var j = 0; j < 30; j++) {
				row.push("Column " + j + " row " + i);
			}
			this.rows.push(row);
		}
	}

	draw(cursor: Cursor) {
		this.cursor = cursor;
		this.PADDING = this.cursor.x;
		let that = this;
		let cellIndex = 0;
		this.pdf.autoTable(this.columns, this.rows, {
			startY: cursor.y,
			theme: "grid",
			pageBreak: "auto",
			styles: { overflow: 'linebreak', columnWidth: 'wrap' },
			tableWidth: this.pdf.internal.pageSize.width - this.PADDING * 2,
			drawHeaderRow: (row, data) => {
				return that.drawHeaderRow();
			},
			drawRow: (row, data) => {
				return that.drawRow(row.index);
			}
		});
		this.pdf.save("test.pdf");
	}

	drawHeaderCell(col: ColumnDef, index: number) {
		if (index == 0) {
			this.cursor.x = this.PADDING;

		}

		if (this.cursor.x >= this.width + this.PADDING) {
			this.cursor.x = this.PADDING + this.columns[0].width;
			this.cursor.y += this.ROW_HEADER_HEIGHT;
			this.even = !this.even;
		}
		else if (index < this.columns.length - 2 &&
			this.cursor.x + this.columns[index].width + this.columns[index + 1].width > this.width) {
			this.columns[index].width = this.width - this.cursor.x + this.PADDING;
		}

		this.fillHeaderCell(this.columns[index].width, index == 0 ? this.actualHeaderRowHeight : this.ROW_HEADER_HEIGHT);

		this.pdf.setTextColor(0, 0, 0);
		
		this.drawText(this.columns[index].title, this.cursor.x + 5, this.cursor.y + this.ROW_HEADER_HEIGHT / 2, this.columns[index].width - 10, {
			halign: "left",
			valign: "middle"
		});
		this.cursor.x += this.columns[index].width;
	}

	drawHeaderRow() {
		this.pdf.setFontSize(this.HEADER_FONT_SIZE);
		this.cursor.x = this.PADDING;
		this.columns.forEach((c, i) => {
			this.drawHeaderCell(c, i);
		});
		if (this.cursor.x < this.width + this.PADDING) {
			this.setHeaderColor(this.even);
			this.pdf.setDrawColor(0, 0, 0);
			this.pdf.rect(this.cursor.x, this.cursor.y, this.width - this.cursor.x + this.PADDING, this.ROW_HEADER_HEIGHT, "DF");
		}
		this.cursor.y += this.ROW_HEADER_HEIGHT;
		return false;
	}

	drawText(text: string, x: number, y: number, width: number, styles: any) {
		let k = this.pdf.internal.scaleFactor;
		let fontSize = this.pdf.internal.getFontSize() / k;

		let splitRegex = /\r\n|\r|\n/g;
		let splitText = null;
		let lineCount = 1;
		if (styles.valign === 'middle' || styles.valign === 'bottom' || styles.halign === 'center' || styles.halign === 'right') {
			splitText = typeof text === 'string' ? text.split(splitRegex) : text;
			lineCount = splitText.length || 1;
		}
		if (lineCount == 1) {
			splitText = this.pdf.splitTextToSize(text, width);
		}
		// Align the top
		y += fontSize * (2 - this.FONT_ROW_RATIO);

		if (styles.valign === 'middle')
			y -= (lineCount / 2) * fontSize * this.FONT_ROW_RATIO;
		else if (styles.valign === 'bottom')
			y -= lineCount * fontSize * this.FONT_ROW_RATIO;

		if (styles.halign === 'center' || styles.halign === 'right') {
			let alignSize = fontSize;
			if (styles.halign === 'center')
				alignSize *= 0.5;

			if (lineCount >= 1) {
				for (let iLine = 0; iLine < splitText.length; iLine++) {
					this.pdf.text(splitText[iLine], x - this.pdf.getStringUnitWidth(splitText[iLine]) * alignSize, y);
					y += fontSize;
				}
				return this;
			}
			x -= this.pdf.getStringUnitWidth(text) * alignSize;
		}

		this.pdf.text(splitText, x, y);
	}

	fillHeaderCell(width: number, height: number) {
		this.setHeaderColor(this.even);
		this.pdf.setDrawColor(0, 0, 0);
		this.pdf.rect(this.cursor.x, this.cursor.y, width, height, "DF");
	}

	fillCell(width: number, height: number){
		this.setRowColor(this.even);
		this.pdf.setDrawColor(0, 0, 0);
		this.pdf.rect(this.cursor.x, this.cursor.y, width, height, "DF");
	}

	setHeaderColor(even: boolean) {
		if (even)
			this.pdf.setFillColor(0.145, 0.245, 0, 0.451);
		else
			this.pdf.setFillColor(0, 0, 0, 0);
	}

	setRowColor(even: boolean) {
		if (!even)
			this.pdf.setFillColor(0.145, 0.145, 0.145, 0.451);
		else
			this.pdf.setFillColor(0, 0, 0, 0);
	}

	drawRow(index: number) {
		this.pdf.setFontSize(this.FONT_SIZE);
		this.cursor.x = this.PADDING;
		this.columns.forEach((c, i) => {
			this.drawCell(this.rows[index],i);
		});
		if (this.cursor.x < this.width + this.PADDING) {
			this.setRowColor(this.even);
			this.pdf.setDrawColor(0, 0, 0);
			this.pdf.rect(this.cursor.x, this.cursor.y, this.width - this.cursor.x + this.PADDING, this.ROW_HEIGHT, "DF");
		}
		this.cursor.y += this.ROW_HEIGHT;
		return false;
	}

	drawCell(row:any[], index: number) {
		if (index == 0) {
			this.cursor.x = this.PADDING;
		}

		if (this.cursor.x >= this.width + this.PADDING) {
			this.cursor.x = this.PADDING + this.columns[0].width;
			this.cursor.y += this.ROW_HEIGHT;
			this.even = !this.even;
		}

		this.fillCell(this.columns[index].width, index == 0 ? this.actualRowHeight : this.ROW_HEIGHT);

		this.pdf.setTextColor(0, 0, 0);
		
		this.drawText(row[index], this.cursor.x + 5, this.cursor.y + this.ROW_HEIGHT / 2, this.columns[index].width - 10, {
			halign: "left",
			valign: "middle"
		});
		this.cursor.x += this.columns[index].width;
	}

	get actualHeaderRowHeight() {
		if (this._actualHeaderRowHeight) {
			return this._actualHeaderRowHeight;
		}

		this._actualHeaderRowHeight = this.ROW_HEADER_HEIGHT;
		let width = 0;
		this.columns.forEach((c, i) => {
			width += c.width;
			if (width > this.width) {
				this._actualHeaderRowHeight += this.ROW_HEADER_HEIGHT;
				width = c.width;
			}
		});
		return this._actualHeaderRowHeight;
	}

	get actualRowHeight() {
		if (this._actualRowHeight) {
			return this._actualRowHeight;
		}

		this._actualRowHeight = this.ROW_HEIGHT;
		let width = 0;
		this.columns.forEach((c, i) => {
			width += c.width;
			if (width > this.width) {
				this._actualRowHeight += this.ROW_HEIGHT;
				width = c.width;
			}
		});
		return this._actualRowHeight;
	}
}