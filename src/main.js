import { makePdf } from "./pdfGenerator.js";

window.onload = () => {
	const button = document.getElementById("btnPdf");
	button.onclick = () => {

		// const downloadableStream;
		makePdf("A4", null);
	};
};
