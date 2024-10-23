/** Various utility methods. */
import { config } from "../config/config";
import type { NodeSingular, EdgeSingular } from "cytoscape";
import log from "loglevel";
import { EDGE } from "../edge";
import { NODE } from "../node";
import * as rdf from "../rdf";
import * as packageInfo from "../../package.json";
export const VERSION = packageInfo.version;
// GitHub allows for 8201 characters, but some browser limit around 2000 chars:
// https://stackoverflow.com/a/64565317 and https://stackoverflow.com/a/417184
// update from 2024: most modern browsers should support more and we don't care about search engines, so increase to 6000 for now
// otherwise, the log doesn't help much
const LOG_LIMIT = 6000;

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

/** Open a new issue on the GitHub repository.
 * @param repo - GIT repository URL
 * @param title - issue title
 * @param body - issue body text
 * @param assignee - default assignee for the issue (GitHub handle)
 * @param label - default label for the issue
 * @param logs - optional array of github markdown formatted log strings
 */
export function createGitHubIssue(repo: string, title: string, body: string, assignee?: string, label?: string, logs?: Array<string>): void {
	let encodedBody = encodeURIComponent(body);
	if (logs) {
		const encodedLogs = logs.map((l) => encodeURIComponent(l.trim()));
		let encodedLog = encodedLogs.reduce((a, b) => a + "%0A" + b);

		while (encodedLog.length > LOG_LIMIT) {
			// remove log elements from the front until the length of the log is under the limit to avoid 414 Error URI too large
			encodedLogs.shift();
			encodedLog = encodedLogs.reduce((a, b) => a + "%0A" + b, "");
		}
		encodedBody += "%0A%0A%23%23%20Log%0A" + "%60%60%60" + encodedLog + "%0A%60%60%60";
	}
	if (!assignee) {
		assignee = config.git.defaultIssueAssignee;
	}
	if (!label) {
		label = "";
	}
	console.log(label);
	window.open(`${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodedBody}&assignees=${assignee}&labels=${label}`);
}

/**
/** Open a new issue on the GitHub repository using the given template.
 * @param repo - GIT repository URL
 * @param title - issue title
 * @param template - template filename without the .yml extension
 * @param label - GitHub issue label
 * @param fields - form field keys and string values
 */
export function createGitHubTemplateIssue(repo: string, title: string, template: string, label: string, fields: [string, string][]): void {
	const encodedFields = fields.map(([key, value]) => `&${key}=${encodeURIComponent(value)}`).reduce((a, b) => a + b);
	window.open(
		`${repo}/issues/new?template=${template}.yml&assignees=${config.git.defaultIssueAssignee}&labels=${label}&title=${encodeURIComponent(title)}${encodedFields}`
	);
}

/**
 * Prompts creation of an issue on GitHub to remove the given class.
 * @param node The cytoscape node representing the class to be removed
 */
export function deleteClass(node: NodeSingular) {
	const clazz = rdf.short(node.data(NODE.ID));
	createGitHubTemplateIssue(
		config.git.repo.ontology,
		"Remove class " + clazz,
		"deleteclass",
		config.git.issueLabels.deleteClass,
		Object.entries({ class: clazz })
	);
}

/**
 * Prompts creation of an issue on GitHub with the default assignee to remove the given edge (triple).
 * @param edge The cytoscape edge representing the triple to be removed
 */
export function deleteTriple(edge: EdgeSingular) {
	const subject = rdf.short(edge.data(EDGE.SOURCE));
	const predicate = rdf.short(edge.data(EDGE.PROPERTY));
	const object = rdf.short(edge.data(EDGE.TARGET));
	createGitHubTemplateIssue(
		config.git.repo.ontology,
		`Delete triple ${subject} ${predicate} ${object}`,
		"deletetriple",
		config.git.issueLabels.deleteTriple,
		Object.entries({ subject, predicate, object })
	);
}

/**
 * Prompts creation of an issue on GitHub to confirm the given LIMES link.
 * @param link The edge of the link which is to be confirmed
 */
export function confirmLink(link: EdgeSingular) {
	link.data(EDGE.GRAPH, "http://www.snik.eu/ontology/match");
	const source = rdf.short(link.data(EDGE.SOURCE));
	const target = rdf.short(link.data(EDGE.TARGET));
	createGitHubTemplateIssue(
		config.git.repo.ontology,
		"Confirm " + edgeLabel(link),
		"link",
		config.git.issueLabels.confirmLink,
		Object.entries({ source, target })
	);
}

export function gitInfo(): string {
	return `SNIK Graph version ${VERSION}
commit date ${import.meta.env.VITE_GIT_COMMIT_DATE}
${import.meta.env.VITE_GIT_LAST_COMMIT_MESSAGE}
${import.meta.env.VITE_GIT_BRANCH_NAME}/${import.meta.env.VITE_GIT_COMMIT_HASH}`;
}

/** Prompts creation of an issue on GitHub to report a bug. */
export function createGitHubBugReportIssue() {
	const version = gitInfo();
	// cannot reuse the equivalent code from createGitHubIssue because this is pre-encoding, handling should be unified in the future
	// filter out already encoded parts which are SPARQL queries that take too much space
	// encoding increases size slightly, 3/4 should be enough, reduce if it causes errors
	const logs = log["logs"]
		.filter((x) => !x.includes("%20"))
		.reduce((a, b) => a + "\n" + b)
		.substr((-LOG_LIMIT * 3) / 4);
	createGitHubTemplateIssue(config.git.repo.application, "", "bugreport", config.git.issueLabels.bug, Object.entries({ version, logs }));
}

/** Creates a human readable string of the triple that an link represents.
 *  @param edge - the edge, whose label is determined
 *  @returns a human readable string of the triple that an edge represents. */
export function edgeLabel(edge: EdgeSingular): string {
	return rdf.short(edge.data(EDGE.SOURCE)) + " " + rdf.short(edge.data(EDGE.PROPERTY)) + " " + rdf.short(edge.data(EDGE.TARGET));
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

/**
 * Converts a color from hsv to a hex rgb value.
 * @param hue - The hue in the range of 0 to 1.
 * @param saturation - The saturation in the range 0 to 1.
 * @param value - The value int the range 0 to 1.
 * @returns an rgb hex color prefixed with '#'.
 */
export function hsvToHexColor(hue: number, saturation: number, value: number): string {
	const hDash = Math.floor(hue * 6);
	const f = hue * 6 - hDash;
	const p = value * (1 - saturation);
	const q = value * (1 - f * saturation);
	const t = value * (1 - (1 - f) * saturation);
	let r: number, g: number, b: number;
	switch (hDash % 6) {
		case 0:
			(r = value), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = value), (b = p);
			break;
		case 2:
			(r = p), (g = value), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = value);
			break;
		case 4:
			(r = t), (g = p), (b = value);
			break;
		case 5:
			(r = value), (g = p), (b = q);
			break;
	}
	return (
		"#" +
		("00" + Math.floor(r * 255).toString(16)).slice(-2) + // .substr() is deprecated on some browser
		("00" + Math.floor(g * 255).toString(16)).slice(-2) +
		("00" + Math.floor(b * 255).toString(16)).slice(-2)
	);
}

/**
 * Converts a string to a color depending on the hash value of the string.
 * So we get pseudo-randomized colors for different strings.
 * @param str - The string to get a color for.
 * @returns A # leaded rgb hex color depending on the input string.
 */
export function stringToColor(str: string): string {
	let hash = 0;
	// generate hash
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	// normalize
	hash = (hash % 180) / 360.0; // keep resolution
	hash += 0.5; // note % resolves also to negative values, so we use one half from negative and the other from the positive
	return hsvToHexColor(hash, 1, 1);
}
