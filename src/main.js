import { saveAs } from 'file-saver';

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
		console.log(event.data);
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
