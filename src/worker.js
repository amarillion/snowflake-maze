/* global self */
import BlobStream from 'blob-stream';
import { makePdf } from './pdfGenerator.js';

console.log('Loading worker...');

self.addEventListener("message", (e) => {
	console.log("Worker event: ", e);
	if (e.data.createPdf) {
		const { paperSize } = e.data.createPdf;
		console.log("Worker started...");
		const stream = makePdf(paperSize, BlobStream(), (count, total) => self.postMessage({ progress: { count, total }}));
		stream.on('finish', function() {
			const blob = stream.toBlob('application/pdf');
			self.postMessage({ result: blob });
		});
	}
});