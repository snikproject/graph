/** Various utility methods. */
import { config } from "../config/config";
import type { NodeSingular, EdgeSingular } from "cytoscape";
import log from "loglevel";
import { NODE, EDGE } from "./constants";
import * as rdf from "../rdf";
import { gitInfo } from "./info";
import { edgeLabel } from "./string";
// GitHub allows for 8201 characters, but some browser limit around 2000 chars:
// https://stackoverflow.com/a/64565317 and https://stackoverflow.com/a/417184
// update from 2024: most modern browsers should support more and we don't care about search engines, so increase to 6000 for now
// otherwise, the log doesn't help much
const LOG_LIMIT = 6000;

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
export function deleteClass(node: NodeSingular): void {
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
export function deleteTriple(edge: EdgeSingular): void {
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
export function confirmLink(link: EdgeSingular): void {
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
