import * as save from "./save";
import * as layout from "../layout";
import { NODE } from "../utils/constants";
import { loadGraphFromSparql } from "../loadGraphFromSparql";
import * as language from "../lang/language";
import * as util from "./util";
import MicroModal from "micromodal";
import { config } from "../config/config";
import { progress } from "./progress";
import { showChapterSearch } from "./chaptersearch";
import { Filter } from "./filter";
import * as load from "./load";
import { Graph } from "./graph";
import { View } from "./view";
import log from "loglevel";
import hotkeys from "hotkeys-js";

/** Shows how any two subontologies are interconnected. The user chooses two subontologies and gets shown all pairs between them. */
function subOntologyConnectivity(): void {
	MicroModal.show("subontology-connectivity");
	const form = document.getElementById("subontology-connectivity-form") as HTMLFormElement;
	if (form.listener) {
		return;
	}
	form.listener = async (e: Event) => {
		e.preventDefault();
		MicroModal.close("subontology-connectivity");
		const connect = new View();
		await connect.initialized;
		const subs: Array<string> = [(form[0] as any).value, (form[1] as any).value];
		log.debug(`Showing connectivity between the subontologies ${subs[0]} and ${subs[1]}.`);
		const subGraphs = subs.map((s) => connect.state.cy.nodes(`[source="${s}"]`));
		const connections = subGraphs[0].edgesWith(subGraphs[1]);
		const nodes = connections.connectedNodes();
		Graph.setVisible(connect.state.cy.elements(), false);
		Graph.setVisible(nodes, true);
		Graph.setVisible(nodes.edgesWith(nodes), true);
		nodes
			.layout({
				name: "concentric",
				fit: true,
				levelWidth: function () {
					return 1;
				},

				minNodeSpacing: 60,
				concentric: function (layoutNode: any) {
					if (subGraphs[0].contains(layoutNode)) {
						return 2;
					}
					return 1;
				},
			})
			.run();
	};
	form.addEventListener("submit", form.listener);
}

export let menu: Menu | null = null;

export interface MenuElement {
	i18n: string;
	id?: string;
	entries: Array<MenuEntry>;
}

export interface MenuEntry {
	/** Action is either a link as a string (will be opened on another tab) or a function that will be executed. */
	action: string | (() => void);
	i18n: string;
	hotkey?: string;
	/** config.ontology.id for which this entry is shown */
	only?: string;
}

/** Populates the menu bar on the top and initializes the context menu.*/
export class Menu {
	separateColoursBox: HTMLInputElement;
	dayModeBox: HTMLInputElement;
	coloredEdgesBox: HTMLInputElement;
	showPropertyBox: HTMLInputElement;
	/** Construct the main menu bar. */
	constructor() {
		if (menu) {
			throw Error("Menu already exists.");
		}
		document.body.addEventListener("click", Menu.closeListener);
		// bind this to the class instance instead of the event source
		this.showCloseMatches = this.showCloseMatches.bind(this);
		this.addMenu();
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		menu = this;
	}

	/** @returns whether subontologies are to be displayed separately. */
	separateColours(): boolean {
		return this.separateColoursBox?.checked; // prevent undefined property access, box only exists for SNIK
	}

	/**
	 * @returns whether day mode is active.
	 */
	dayMode(): boolean {
		return this.dayModeBox.checked;
	}

	/**
	 * @returns if edges should get different colors by type.
	 */
	coloredEdges(): boolean {
		return this.coloredEdgesBox.checked;
	}

	/**
	 * @returns if edge labels with the property names should always be shown.
	 */
	showProperty(): boolean {
		return this.showPropertyBox.checked;
	}

	///** @returns {boolean} whether star operations should be shown in a new view. */
	// starNewView() {return this.starNewViewBox.checked;}

	/** Sets the preferred node label language attribute. Use the values from node.js.
	 * @param lang - the language to set */
	setLanguage(lang: string): void {
		if (!language.setLanguage(lang)) {
			return;
		}
		language.updateHtml();
		// this.graph.cy.style(style); // does not display the style correctly and doesn't update the labels
		// this.graph.cy.forceRender(); // does not update the labels either
		// the nuclear option works
		for (const view of View.views()) {
			const elements = view.state.graph.cy.elements();
			view.state.graph.cy.remove(elements);
			elements.restore();
			view.recreateContextMenus();
		}
	}

	/** Notifies the user of the program version so that errors can be properly reported. */
	static about(): void {
		const cy = View?.activeState()?.graph?.cy;
		const s = `\n${cy?.nodes()?.size()} nodes, ${cy?.edges()?.size()} edges loaded.`;
		window.alert(util.gitInfo() + s);
	}

	/** Show all nodes that are connected via close matches to visible nodes. */
	showCloseMatches(): void {
		log.debug("show close matches start");
		const visible = View.activeState().graph.cy.elements(".unfiltered").not(".hidden");
		//const closeMatchEdges = this.graph.cy.edges('[pl="closeMatch"]');
		const newEdges = visible.connectedEdges(".unfiltered").filter('[pl="closeMatch"]');
		Graph.setVisible(newEdges, true);
		Graph.setVisible(newEdges.connectedNodes(".unfiltered"), true);
		log.debug("show close matches end");
		//closeMatchEdges.connectedNodes();
		//".unfiltered";
	}

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
	menuData(): Array<MenuElement> {
		return [
			{
				i18n: "file",
				id: "file",
				entries: [
					{
						action: async () => {
							await loadGraphFromSparql(View.activeState().graph.cy, []);
							progress(
								async () =>
									await layout.runCached(View.activeState().graph.cy, layout.euler, config.ontology?.snik?.defaultSubOntologies, this.separateColours())
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
					{ action: util.createGitHubBugReportIssue, i18n: "bug-report" },
				],
			},
		];
	}

	/**
	 * Add the menu entries of the options menu. Cannot be done with an entries array because they need an event listener so they have its own function.
	 * @param as - an empty array that will be filled with the anchor elements */
	addOptions(as: Array<HTMLAnchorElement>): void {
		const optionsContent = util.getElementById("options-menu-content");

		// names of options to be added
		const names = ["separateColours", "cumulativeSearch", "grid", "combineMatchMode", "dayMode", "coloredEdges", "showProperty"]; // ,"starNewView"

		(this as any).optionBoxes = {};
		for (const name of names) {
			log.trace("Add option " + name);

			// <a> link
			const a = document.createElement("a");
			a.setAttribute("tabindex", "-1");
			a.classList.add("dropdown-entry");

			// add <a> link to returned links and HTML container
			as.push(a);
			optionsContent.appendChild(a);

			// <input> checkbox
			const box = document.createElement("input");
			(this as any).optionBoxes[name] = box;
			box.type = "checkbox";
			box.autocomplete = "off";
			box.id = name + "Box";
			// add <input> checkbox to <a> link
			a.appendChild(box);
			this[name + "Box"] = box;

			// click on container to click on checkbox
			a.addEventListener("keydown", util.checkboxKeydownListener(box));
			a.appendChild(util.checkboxClickableDiv(box, language.getString(name), name));
		}

		this.separateColoursBox.addEventListener("change", () => {
			log.debug("Set separate colours to " + this.separateColours());
		});
		this.dayModeBox.addEventListener("change", () => {
			for (const view of View.views()) {
				view.state.graph.applyStyle(this.dayMode(), this.coloredEdges(), this.showProperty());
			}
			log.debug("Set dayMode to " + this.dayMode());
		});
		this.showPropertyBox.addEventListener("change", () => {
			for (const view of View.views()) {
				view.state.graph.applyStyle(this.dayMode(), this.coloredEdges(), this.showProperty());
			}
			log.debug("Set showProperty to " + this.showProperty());
		});
		(this as any).gridBox.addEventListener("change", () => {
			document.body.classList[(this as any).gridBox.checked ? "add" : "remove"]("grid");
			log.debug("set gridBox to " + (this as any).gridBox.checked);
		});
		if (config.activeOptions.includes("day")) {
			this.dayModeBox.click();
		}
		if (config.activeOptions.includes("showproperty")) {
			this.showPropertyBox.click();
		}
		// is only used by the main tab
		(this as any).cumulativeSearchBox.addEventListener("change", () => {
			log.debug("Set cumulative search to " + (this as any).cumulativeSearchBox.checked);
		});

		(this as any).combineMatchModeBox.addEventListener("change", () => {
			// Combine matches is *not* active in a new tab if the user first copies, then turns combine matches on and finally pastes.
			// In this case, "combine matches" needs to be deactivated and activated again to take effect on the paste result.
			log.debug("Set combine match mode to " + (this as any).combineMatchModeBox.checked);
			// give the browser time to update the checkbox, see https://stackoverflow.com/questions/64442639/how-to-give-instant-user-feedback-on-slow-checkbox-listeners-in-javascript?noredirect=1#comment113950377_64442639
			setTimeout(() => {
				this.combineMatches();
			}, 10);
		});

		// colorize edges dependent on type
		this.coloredEdgesBox.addEventListener("change", () => {
			const colorize = this.coloredEdges();
			log.debug("Set coloredEdges to " + colorize);
			(config as any).edgesColorized = colorize;
			// redraw all canvas
			for (const view of View.views()) {
				view.state.graph.applyStyle(this.dayMode(), this.coloredEdges(), this.showProperty());
			}
		});
		if (config.activeOptions.includes("edgecolor")) {
			setTimeout(() => this.coloredEdgesBox.click(), 100); // checks box but does not apply without delay
		}
	}
	/** Adds the menu to the graph parent DOM element and sets up the event listeners. */
	addMenu() {
		console.groupCollapsed("Add menu");
		//const frag = new DocumentFragment();
		const ul = document.createElement("ul");
		//this.graph.parent.prepend(ul); // for multiple graphs at the same time with a menu each
		util.getElementById("top").prepend(ul); // a single menu for a single graph
		ul.classList.add("dropdown-bar");
		// see https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
		ul.setAttribute("tabindex", "0");
		const data = this.menuData();
		const spans: Array<HTMLSpanElement> = [];
		const aas: Array<Array<HTMLAnchorElement>> = []; // 2-dimensional array of anchors
		for (let i = 0; i < data.length; i++) {
			const menuElement: MenuElement = data[i];
			const li = document.createElement("li");
			li.setAttribute("tabindex", "-1");
			ul.appendChild(li);
			const span = document.createElement("span");
			spans.push(span);
			li.appendChild(span);
			span.classList.add("dropdown-menu");
			// no need to set label here, they are recalculated later anyways
			span.setAttribute("data-i18n", menuElement.i18n);
			span.setAttribute("tabindex", "-1");
			const div = document.createElement("div");
			li.appendChild(div);
			div.classList.add("dropdown-content");
			div.setAttribute("tabindex", "-1");
			if (menuElement.id) {
				div.id = menuElement.id + "-menu-content";
			}
			span.addEventListener("click", () => {
				for (const otherDiv of document.getElementsByClassName("dropdown-content")) {
					if (div !== otherDiv) {
						otherDiv.classList.remove("show");
					}
				}
				div.classList.toggle("show");
			});
			const as: Array<HTMLAnchorElement> = [];
			aas.push(as);
			for (const entry of menuElement.entries) {
				if (entry === null || (entry.only && entry.only !== config.ontology.id)) {
					continue;
				}
				const a = document.createElement("a");
				as.push(a);
				a.classList.add("dropdown-entry");
				a.setAttribute("data-i18n", entry.i18n);
				if (entry.hotkey) {
					a.setAttribute("hotkey", entry.hotkey);
				}
				a.setAttribute("tabindex", "-1");
				div.appendChild(a);
				a.innerHTML = language.getString(entry.i18n);
				switch (typeof entry.action) {
					case "string": {
						a.href = entry.action;
						a.target = "_blank";
						break;
					}
					case "function": {
						a.addEventListener("click", entry.action);
						// we only use hotkeys for functions
						const hotkey = entry.hotkey;
						if (hotkey) {
							hotkeys(hotkey, entry.action);
							a.innerHTML = a.innerHTML + ` (${hotkey.toUpperCase()})`;
						}
						break;
					}
					default:
						log.error("unknown menu entry action type: " + typeof entry.action);
				}
			}
			span.addEventListener("keydown", (event) => {
				switch (event.key) {
					case "ArrowLeft":
						spans[(i - 1 + spans.length) % spans.length].focus(); // positive modulo
						spans[(i - 1 + spans.length) % spans.length].click();
						break;
					case "ArrowRight":
						spans[(i + 1) % spans.length].focus();
						spans[(i + 1) % spans.length].click();
						break;
					case "ArrowDown":
						as[0].focus();
						break;
				}
			});
		}

		load.addFileLoadEntries(View.activeState().graph, util.getElementById("file-menu-content"), aas[0] /*, this.optionsFromJSON*/); // update index when "File" position changes in the menu
		log.debug("fileLoadEntries added");
		Filter.addFilterEntries(util.getElementById("filter-menu-content"), aas[1]); // update index when "Filter" position changes in the menu
		log.debug("filter entries added");
		this.addOptions(aas[2]); // update index when "Options" position changes in the menu
		for (let i = 0; i < aas.length; i++) {
			const as = aas[i];
			for (let j = 0; j < as.length; j++) {
				as[j].addEventListener("keydown", (event) => {
					switch (event.key) {
						case "ArrowLeft":
							spans[(i - 1 + spans.length) % spans.length].focus(); // positive modulo
							spans[(i - 1 + spans.length) % spans.length].click();
							break;
						case "ArrowRight":
							spans[(i + 1) % spans.length].focus();
							spans[(i + 1) % spans.length].click();
							break;
						case "ArrowUp":
							as[(j - 1 + as.length) % as.length].focus();
							break;
						case "ArrowDown":
							as[(j + 1) % as.length].focus();
							break;
					}
				});
			}
		}
		// fix mouse position after container change, see https://stackoverflow.com/questions/23461322/cytoscape-js-wrong-mouse-pointer-position-after-container-change
		//this.graph.cy.resize();
		log.debug("Menu added");
		console.groupEnd();
		// set labels
		language.updateHtml();
	}

	/** Close the dropdown if the user clicks outside of the menu.
	 *  @param e - a click event */
	static closeListener(e: any): void {
		if (
			e &&
			e.target &&
			e.target.matches &&
			!e.target.matches(".dropdown-entry") &&
			!e.target.matches(".dropdown-menu") &&
			!e.target.matches("input.filterbox")
		) {
			// don't close while user edits the text field of the custom filter
			const dropdowns = document.getElementsByClassName("dropdown-content");
			Array.from(dropdowns).forEach((d) => d.classList.remove("show"));
		}
	}
	/** Save session-based options (not user preferences) to JSON. */
	optionsToJSON(): object {
		const sessionOptions = ["separateColours", "cumulativeSearch", "grid", "combineMatchMode", "dayMode", "coloredEdges"];
		const options = {};

		for (const option of sessionOptions) {
			options[option] = (this as any).optionBoxes[option].checked;
		}
		return options;
	}
	/** Restore session-based options from the output of toJSON().
	 *  @param json - an option object */
	optionsFromJSON(json): void {
		const currentOptions = this.optionsToJSON();
		for (const [name, checked] of Object.entries(json)) {
			if (currentOptions[name] !== checked) {
				(this as any).optionBoxes[name].click();
			}
		}
	}

	/**
	 * Applies the options selected in the menu tab "Options", for example Combine Match Mode.
	 */
	applyOptions() {
		if ((this as any).combineMatchModeBox.checked) {
			this.combineMatches();
		}
	}

	/**
	 * Applies combine match mode for all tabs.
	 */
	private combineMatches() {
		View.views()
			.map((v) => v.state.graph)
			.forEach((graph) => graph.combineMatch((this as any).combineMatchModeBox.checked));
	}
}
