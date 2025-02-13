/** Helper functions for HTML. */

/** getElementById with exception handling.
 * @param id - an HTML DOM id
 * @returns the element with the given id */

export function getElementById(id: string): HTMLElement {
	const el = document.getElementById(id);
	if (!el) {
		throw new Error(`Element with id ${id} does not exist.`);
	}
	return el;
}

export const checkboxKeydownListener = (box: HTMLInputElement) => (e: KeyboardEvent) => {
	switch (e.key) {
		case " ":
		case "Enter":
			box.click();
		//      box.checked = !box.checked;
	}
};
/** Creates a new div element with the given text that triggers the given check box.
@param box - the checkbox that should be triggered when the div is clicked
@param text - the text of the div
@param i18n - optional internationalization key
@returns the created div element
*/

export function checkboxClickableDiv(box: HTMLInputElement, text: string, i18n: string): HTMLElement {
	const div = document.createElement("div");
	div.classList.add("dropdown-entry-checkboxtext"); // extend clickable area beyond short texts
	div.innerText = text;
	if (i18n) {
		div.setAttribute("data-i18n", i18n);
	}
	div.addEventListener("click", () => {
		box.click();
	});
	return div;
}
