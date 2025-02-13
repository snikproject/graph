import * as save from "../browser/save";
import * as layout from "../layout";
import { NODE } from "../utils/constants";
import { loadGraphFromSparql } from "../loadGraphFromSparql";
import { createGitHubBugReportIssue } from "../utils/gitHubIssues";
import { config } from "../config/config";
import { progress } from "../animation/progress";
import { showChapterSearch } from "../search/chaptersearch";
import { View } from "../browser/view";
import { Menu, type MenuElement } from "../browser/menu";
import { subOntologyConnectivity } from "../transformations/subontologyConnectivity";

/**
  Creates and returns the menus for the top menu bar.
  The format is an array of menu elements.
  Each menu element is an object with a "label", unique "id" and an "entries" array.
  entries is an array of arrays of size two.
  entries[i][0] is either a link as a string (will be opened on another tab) or a function that will be executed.
  entries[i][1] is a label as a string.
  entries[i][2] is an i18 id.
  entries[i][3] is an optional hotkey.
  * @returns the array of menu elements.
  */
export function menuData(): Array<MenuElement> {
	return [
		{
			i18n: "file",
			id: "file",
			entries: [
				{
					action: async () => {
						await loadGraphFromSparql(View.activeState().graph.cy, []);
						progress(
							async () => await layout.runCached(View.activeState().graph.cy, layout.euler, config.ontology?.snik?.defaultSubOntologies, this.separateColours())
						);
					},
					i18n: "load-sparql",
				},

				{ action: () => save.saveSession(this.optionsToJSON()), i18n: "save-session" },
				{ action: () => save.saveGraph(View.activeState().graph), i18n: "save-snik-graph" },
				{ action: () => save.saveView(View.activeState()), i18n: "save-view" },
				{ action: () => save.saveLayout(View.activeState()), i18n: "save-layout" },
				{
					action: () => {
						progress(() => layout.run(View.activeState().cy, layout.euler, config.ontology?.snik?.defaultSubOntologies, this.separateColours(), true));
					},
					i18n: "recalculate-layout-replace",
				},
				{
					action: () => save.savePng(View.activeState().graph, this.dayMode(), false, false),
					i18n: "save-image-png-visible-region",
				},
				{
					action: () => save.savePng(View.activeState().graph, this.dayMode(), true, false),
					i18n: "save-image-png-complete-partial-graph",
				},
				{
					action: () => save.savePng(View.activeState().graph, this.dayMode(), false, true),
					i18n: "save-image-png-visible-region-high-res",
				},
				{
					action: () => save.savePng(View.activeState().graph, this.dayMode(), true, true),
					i18n: "save-image-png-complete-partial-graph-high-res",
				},
				{
					action: () => save.saveSvg(View.activeState().graph, this.dayMode(), false),
					i18n: "save-image-svg-visible-region",
				},
				{
					action: () => save.saveSvg(View.activeState().graph, this.dayMode(), true),
					i18n: "save-image-svg-complete-partial-graph",
				},
				{ action: () => new View(), i18n: "new-view" },
			],
		},
		{
			i18n: "filter",
			id: "filter",
			entries: [], // filled by addFilterEntries() from filter.js
		},
		{
			i18n: "options",
			id: "options",
			entries: [], // filled by addOptions()
		},
		{
			i18n: "layout",
			entries: [
				{ action: this.showCloseMatches, i18n: "show-close-matches" },
				{
					action: () => {
						layout.run(
							View.activeState().graph.cy,
							layout.euler,
							config.ontology?.snik?.defaultSubOntologies,
							this.separateColours() && !View.activeState().graph.starMode,
							true
						);
					},
					i18n: "recalculate-layout",
					hotkey: "ctrl+alt+l",
				},
				{
					action: () => {
						layout.run(
							View.activeState().graph.cy,
							layout.eulerTight,
							config.ontology?.snik?.defaultSubOntologies,
							this.separateColours() && !View.activeState().graph.starMode,
							false
						);
					},
					i18n: "tight-layout",
					hotkey: "ctrl+alt+t",
				},
				{
					action: () => {
						layout.run(
							View.activeState().graph.cy,
							layout.cose,
							config.ontology?.snik?.defaultSubOntologies,
							this.separateColours() && !View.activeState().graph.starMode,
							false
						);
					},
					i18n: "compound-layout",
					hotkey: "ctrl+alt+c",
				},
				{ action: () => View.activeState().graph.moveAllMatches(0), i18n: "move-match-on-top" },
				{ action: () => View.activeState().graph.moveAllMatches(100), i18n: "move-match-nearby" },
				{
					action: () => {
						showChapterSearch(View.activeState().graph, "bb");
					},
					i18n: "bb-chapter-search",
					only: "snik",
				},
				{
					action: () => {
						showChapterSearch(View.activeState().graph, "ob");
					},
					i18n: "ob-chapter-search",
					only: "snik",
				},
				{ action: subOntologyConnectivity, i18n: "subontology-connectivity", only: "snik" },
				{ action: View.mainView.state.graph.resetStyle, i18n: "reset-view", hotkey: "ctrl+alt+r" },
				{
					action: () => {
						View.activeView().setTitle(prompt("Rename: " + View.activeView().config.title) || View.activeView().config.title);
						View.activeState().title = View.activeView().config.title;
					},
					i18n: "change-title",
					only: "snik",
				},
			],
		},
		{
			i18n: "services",
			entries: [
				config.ontology.links.sparqlEndpoint ? { action: config.ontology.links.sparqlEndpoint, i18n: "sparql-endpoint" } : null,
				config.ontology.links.rdfBrowser ? { action: config.ontology.links.rdfBrowser, i18n: "rdf-browser" } : null,
				//["http://snik.eu/evaluation","Data Quality Evaluation","data-quality-evaluation"],
			],
		},
		{
			i18n: "language",
			entries: [
				{ action: () => this.setLanguage(NODE.LABEL_ENGLISH), i18n: "english" },
				{ action: () => this.setLanguage(NODE.LABEL_GERMAN), i18n: "german" },
				{ action: () => this.setLanguage(NODE.LABEL_PERSIAN), i18n: "persian" },
			],
		},
		{
			i18n: "help",
			entries: [
				{ action: "html/manual.html", i18n: "manual" },
				//{action: "https://www.snik.eu/sites/www.snik.eu/files/files/uploads/Einfuehrung/snik-tutorial.pdf", i18n: "tutorial"}, // todo: fix link and uncomment
				{ action: "html/layoutHelp.html", i18n: "layout-help" },
				{ action: "doc/index.html", i18n: "developer-doc" },
				config.ontology.links.youtube ? { action: config.ontology.links.youtube, i18n: "youtube-channel" } : null,
				{ action: "html/troubleshooting.html", i18n: "troubleshooting" },
				{ action: "html/contribute.html", i18n: "contribute" },
				config.ontology.links.homepage ? { action: config.ontology.links.homepage, i18n: "project-homepage" } : null,
				config.ontology.links.metamodel ? { action: config.ontology.links.metamodel, i18n: "meta-model" } : null,
				{ action: Menu.about, i18n: "about" },
				config.ontology.links.feedbackOntology ? { action: config.ontology.links.feedbackOntology, i18n: "feedback-ontology" } : null,
				config.ontology.links.featureRequest ? { action: config.ontology.links.featureRequest, i18n: "feature-request" } : null,
				{ action: createGitHubBugReportIssue, i18n: "bug-report" },
			],
		},
	];
}
