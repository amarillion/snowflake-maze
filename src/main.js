import { saveAs } from 'file-saver';
import { MazeMaker } from './mazeMaker.js';

function refreshBg() {	
	const bodyWidth = document.body.clientWidth;
	const bodyHeight = document.body.clientHeight;

	const canvas = document.getElementById("myCanvas");
	canvas.setAttribute("width", bodyWidth);
	canvas.setAttribute("height", bodyHeight);

	const maker = new MazeMaker(24, bodyWidth - 20, bodyHeight - 20, 10, 10);
	maker.run();		
	const ctx = canvas.getContext("2d");
	maker.render(ctx, "white");
}

function main() {
	const button = document.getElementById("btnPdf");
	const worker = new Worker("worker.js");
	const progess = document.getElementById("progress");
	const overlay = document.getElementById("overlay");

	const ofst = new Date().getTimezoneOffset();
	if (ofst > 180) {
		// americas
		document.querySelector('input[value="LETTER"]').checked = true;
	}

	let guiUnlocked = true;
	let paperSize;

	button.onclick = () => {
		if (!guiUnlocked) { return; }
		paperSize = document.querySelector('input[name="paperGroup"]:checked').value || 'A4';
		overlay.removeAttribute("hidden");
		guiUnlocked = false;
		worker.postMessage({ createPdf: { paperSize }});
	};

	worker.addEventListener("message", function(event) {
		if ('result' in event.data) {
			saveAs(event.data.result, `snowflake-maze-${paperSize}.pdf`)
			setTimeout(() => {
				overlay.setAttribute("hidden", "true");
				guiUnlocked = true;
			}, 100);
		}
		else {
			const { count, total } = event.data.progress;
			progress.setAttribute('max', total);
			progress.setAttribute('value', count);
		}
	});

	refreshBg();
	window.onresize = () => refreshBg();
};

if (!("Worker" in window)) {
	document.body.innerHTML = (`
	<div class="parent"><div class="center">
	<h1>Browser not supported</h1>
	<p>
	Please open this page in a more recent browser,
	such as the latest version of chrome or firefox.
	</p>
	</div></div>
`);
}
else {
	window.onload = main;
}
