/** Various utility methods. */
import { config } from "../config/config";
import type { NodeSingular, EdgeSingular } from "cytoscape";
import log from "loglevel";
import { EDGE } from "../edge";
import { NODE } from "../node";
import * as sparql from "../sparql";
import * as rdf from "../rdf";
import * as language from "../lang/language";
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
 * @param fields - form field keys and string values
 */
export function createGitHubTemplateIssue(repo: string, title: string, template: string, fields: [string, string][]): void {
	const encodedFields = fields.map(([key, value]) => `&${key}=${encodeURIComponent(value)}`).reduce((a, b) => a + b);
	window.open(`${repo}/issues/new?template=${template}.yml&assignees=${config.git.defaultIssueAssignee}&title=${encodeURIComponent(title)}${encodedFields}`);
}

/**
 * Prompts creation of an issue on GitHub with the label specified in `config.git.issueLabels.deleteNode` and the default assignee to remove the given node.
 * @param node The node which is to be removed
 */
export function createGitHubNodeDeletionIssue(node: NodeSingular) {
	const clazzShort = rdf.short(node.data(NODE.ID));

	sparql.describe(node.data(NODE.ID)).then((bindings) => {
		const body = `Please permanently delete the class ${clazzShort}:
\`\`\`sparql
# WARNING: THIS WILL DELETE ALL TRIPLES THAT CONTAIN THE CLASS ${clazzShort} FROM THE GRAPH AS EITHER SUBJECT OR OBJECT
# ALWAYS CREATE A BACKUP BEFORE THIS OPERATION AS A MISTAKE MAY DELETE THE WHOLE GRAPH.
# THERE MAY BE DATA LEFT OVER IN OTHER GRAPHS, SUCH AS <http://www.snik.eu/ontology/limes-exact> or <http://www.snik.eu/ontology/match>.
# THERE MAY BE LEFTOVER DATA IN AXIOMS OR ANNOTATIONS, CHECK THE UNDO DATA FOR SUCH THINGS.
DELETE DATA FROM <${rdf.longPrefix(node.data(NODE.ID))}>
{
{<${node.data(NODE.ID)}> ?p ?y.} UNION {?x ?p <${node.data(NODE.ID)}>.}
}
\`\`\`\n
**Warning: Restoring a class with the following triples is not guaranteed to work and may have unintended consequences if other edits occur between the deletion and restoration.
This only contains the triples from graph ${rdf.longPrefix(node.data(NODE.ID))}.**
Undo based on these triples:
\`\`\`
${bindings}
\n\`\`\`
${language.CONSTANTS.SPARUL_WARNING}`;
		createGitHubIssue(config.git.repo.ontology, "Remove class " + clazzShort, body, undefined, config.git.issueLabels.deleteNode);
	});
}

/**
 * Prompts creation of an issue on GitHub with the label specified in `config.git.issueLabels.deleteEdge` and the default assignee to remove the given edge (triple).
 * @param edge The edge (standing for a triple) which is to be removed
 */
export function createGitHubEdgeDeletionIssue(edge: EdgeSingular) {
	const body = `Please permanently delete the edge ${edgeLabel(edge)}:
\`\`\`sparql
DELETE DATA FROM <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`\n
Undo with
\`\`\`sparql
INSERT DATA INTO <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`\n
${language.CONSTANTS.SPARUL_WARNING}`;
	createGitHubIssue(config.git.repo.ontology, edgeLabel(edge), body, undefined, config.git.issueLabels.deleteEdge);
}

/**
 * Prompts creation of an issue on GitHub to confirm the given LIMES link.
 * @param link The edge of the link which is to be confirmed
 */
export function createGitHubConfirmLinkIssue(link: EdgeSingular) {
	link.data(EDGE.GRAPH, "http://www.snik.eu/ontology/match");
	const source = link.data(EDGE.SOURCE);
	const target = link.data(EDGE.TARGET);
	const property = link.data(EDGE.PROPERTY);
	const triple = `{<${source}> <${property}> <${target}>.}`;
	const sparql = `Confirm on the SPARQL endpoint via:
\`\`\`sparql
DELETE DATA FROM <http://www.snik.eu/ontology/limes-exact> ${triple}
INSERT DATA INTO <http://www.snik.eu/ontology/match> ${triple}
\`\`\`\n
Undo with
\`\`\`sparql
DELETE DATA FROM <http://www.snik.eu/ontology/match> ${triple}
INSERT DATA INTO <http://www.snik.eu/ontology/limes-exact> ${triple}
\n\`\`\`\n
${language.CONSTANTS.SPARUL_WARNING}`;
	createGitHubTemplateIssue(config.git.repo.application, "Confirm " + edgeLabel(link), "link", Object.entries({ source, target, sparql }));
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
	createGitHubTemplateIssue(config.git.repo.application, "", "bugreport", Object.entries({ version, logs }));
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
