/** Various utility methods. */

import * as packageInfo from "../../package.json";
export const VERSION = packageInfo.version;
const LOG_LIMIT = 500;

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

export const REPO_APPLICATION = "https://github.com/snikproject/snik-graph";
export const REPO_ONTOLOGY = "https://github.com/snikproject/ontology";

/** Open a new issue on the GitHub repository.
@param repo - GIT repository URL
@param title - issue title
@param body - issue body text
@param logs - optional array of github markdown formatted log strings
*/
export function createGitHubIssue(repo: string, title: string, body: string, logs?: Array<string>): void {
	//shorten the front end to avoid 414 Error URI too large
	// let encodedBody = encodeURIComponent(body);
	// if (encodedBody.length > LOG_LIMIT)
	// {
	//   encodedBody = encodedBody.slice(-7500, -1);
	//
	let encodedBody = encodeURIComponent(body);
	if (logs) {
		const encodedLogs = logs.map((l) => encodeURIComponent(l.trim()));
		let encodedLog = encodedLogs.reduce((a, b) => a + "%0A" + b);

		while (encodedLog.length > LOG_LIMIT) {
			//remove log elements from the front until the length of the log is under the limit to avoid 414 Error URI too large
			encodedLogs.shift();
			encodedLog = encodedLogs.reduce((a, b) => a + "%0A" + b, "");
		}
		encodedBody += "%0A%0A%23%23%20Log%0A" + "%60%60%60" + encodedLog + "%0A%60%60%60";
	}
	window.open(`${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodedBody}`);
}

export const checkboxKeydownListener = (box) => (e) => {
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


export function stringToColor(str: string) : string
{
    let hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}
