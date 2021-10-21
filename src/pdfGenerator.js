#!/usr/bin/env node

import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { MazeMaker } from "./mazeMaker.js";

// coordinate unit is points (See: https://stackoverflow.com/questions/51540144/pdfkit-node-js-measurement-unit)
const CONFIGURATIONS = {
	A4: {
		paper: "A4",
		width: 595, // in points
		height: 842 // in points
	},
	LETTER: {
		paper: "LETTER",
		width: 612,
		height: 792
	}
};

export function makePdf(paperSizeKey, pipe, progressCallback = () => {}) {

	const { width: paperWidth, height: paperHeight, paper: paperSize } = CONFIGURATIONS[paperSizeKey];
	
	// Create a document
	const doc = new PDFDocument({size: paperSize});

	// Pipe its output somewhere, like to a file or HTTP response
	const stream = doc.pipe(pipe);

	// Not sure what this call is for?
	doc.save();

	// doc is similar to canvas 2D graphic context, but it misses the 'beginPath()' function.
	doc.beginPath = () => {};

	let first = true;
	const sizes = [8, 12, 16, 24];

	const NUM_PAGES = 4;
	for (let i = 0; i < NUM_PAGES; ++i) {
		progressCallback(i, NUM_PAGES);
		if (first) {
			first = false;
		}
		else {
			doc.addPage();
		}

		const margin = 50;
		const size = sizes.pop();
		const maker = new MazeMaker(size, paperWidth - (2 * margin), paperHeight - (2 * margin), margin, margin);
		maker.run();
		maker.openCorners();
		maker.render(doc);
	}
	progressCallback(NUM_PAGES, NUM_PAGES);

	// Finalize PDF file
	doc.end();

	return stream;
}
