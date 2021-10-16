#!/usr/bin/env node

import PDFDocument from "pdfkit";
import { MazeMaker } from "./common.js";

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

export function makePdf(paperSizeKey, pipe) {

	const { width: paperWidth, height: paperHeight, paper: paperSize } = CONFIGURATIONS[paperSizeKey];
	
	// Create a document
	const doc = new PDFDocument({size: paperSize});

	// Pipe its output somewhere, like to a file or HTTP response
	// See below for browser usage
	doc.pipe(pipe);

	// Embed a font, set the font size, and render some text
	// doc
	// 	.font("fonts/Roboto-Regular.ttf")
	// 	.fontSize(25)
	// 	.text("Some text with an embedded font!", 100, 100);

	// Not sure what this call is for?
	doc.save();

	// doc is similar to canvas 2D graphic context, but it misses the 'beginPath()' function.
	doc.beginPath = () => {};

	let first = true;
	const sizes = [8, 12, 16, 24];

	for (let i = 0; i < 4; ++i) {
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

	// Apply some transforms and render an SVG path with the "even-odd" fill rule
	// doc
	// 	.scale(0.6)
	// 	.translate(470, -380)
	// 	.path("M 250,75 L 323,301 131,161 369,161 177,301 z")
	// 	.fill("red", "even-odd")
	// 	.restore();

	// Add some text with annotations
	// doc
	// 	.addPage()
	// 	.fillColor("blue")
	// 	.text("Here is a link!", 100, 100)
	// 	.underline(100, 100, 160, 27, { color: "#0000FF" })
	// 	.link(100, 100, 160, 27, "http://google.com/");

	// Finalize PDF file
	doc.end();
}
