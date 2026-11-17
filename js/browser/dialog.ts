/** Non-blocking alternatives to the browser's blocking alert() and confirm() dialogs, using the native dialog element. */
const dialog = document.createElement("dialog");
dialog.innerHTML = `<h2></h2><p></p><div class="dialog-buttons"><button id="dialog-confirm" type="button">OK</button><button id="dialog-cancel" type="button" hidden>Cancel</button></div>`;
document.body.append(dialog);
const [title, message] = dialog.querySelectorAll("h2, p") as unknown as [HTMLElement, HTMLElement];
const confirmButton = dialog.querySelector<HTMLButtonElement>("#dialog-confirm")!;
const cancelButton = dialog.querySelector<HTMLButtonElement>("#dialog-cancel")!;
/** Resolver of the currently open confirmation, if any. */
let resolve: ((confirmed: boolean) => void) | null = null;

/** Close the dialog and answer the pending confirmation, if any. */
function close(confirmed: boolean): void {
	const pending = resolve;
	resolve = null;
	if (dialog.open) {
		dialog.close();
	}
	pending?.(confirmed);
}

confirmButton.addEventListener("click", () => close(true));
cancelButton.addEventListener("click", () => close(false));
dialog.addEventListener("cancel", () => close(false)); // Escape
dialog.addEventListener("click", (event) => {
	// clicks on the backdrop target the dialog itself, but outside its bounding box
	const { left, top, right, bottom } = dialog.getBoundingClientRect();
	if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
		close(false);
	}
});

/** Show the dialog, cancelling a confirmation that is still open.
 * @param text - the message or question
 * @param heading - the dialog title
 * @param onConfirm - resolver of a confirmation, absent for a message dialog */
function show(text: string, heading: string, onConfirm?: (confirmed: boolean) => void): void {
	close(false);
	title.textContent = heading;
	message.textContent = text;
	cancelButton.hidden = !onConfirm;
	confirmButton.textContent = onConfirm ? "Continue" : "OK";
	resolve = onConfirm ?? null;
	dialog.showModal();
}

/** Show a non-blocking message dialog, the equivalent of alert().
 * @param text - the message to show, line breaks are preserved
 * @param heading - the title of the dialog */
export function showMessage(text: string, heading = "SNIK Graph"): void {
	show(text, heading);
}

/** Show a non-blocking confirmation dialog, the equivalent of confirm().
 * @param text - the question to ask
 * @param heading - the title of the dialog
 * @returns a promise that resolves to true if the user confirmed and to false otherwise */
export function showConfirm(text: string, heading = "SNIK Graph"): Promise<boolean> {
	return new Promise((onConfirm) => show(text, heading, onConfirm));
}
