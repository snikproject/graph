/**
Filters let the user toggle groups of graph elements, for example all nodes from the meta subontology.
Filters use the Cytoscape.js "display" attribute, while star operations (see graph.js) and reset style use the visibility attribute.
This ensures that filters and star operations interact properly, for example that resetting the style does not show filtered nodes.
See http://js.cytoscape.org/#style/visibility.
*/
import { config } from "../config/config";
import { NODE } from "../node";
import { checkboxKeydownListener, checkboxClickableDiv } from "./util";
import { View } from "./view";
import log from "loglevel";

const filterData = [
	[`node[?${NODE.HAS_INSTANCE}]`, "show-classes-with-instances"],
	[`node[!${NODE.HAS_INSTANCE}]`, "show-classes-without-instances"],
	[`edge[p='http://www.w3.org/2000/01/rdf-schema#subClassOf']`, "subclassof"],
	[`edge[p!='http://www.w3.org/2000/01/rdf-schema#subClassOf']`, "non-subclassof"],
	...config.ontology.filter,
];

const filters: Array<Filter> = [];
const GRAPH_GETS_ADDITIONS = true;

// apply a function to all cytoscape cores in all tabs
const multicy = (f: (cy: cytoscape.Core) => void) =>
	View.views()
		.map((v: View) => v.state.cy)
		.forEach((cy) => f(cy));

/**
Toggles the visibility of a set of nodes defined by a selector.
*/
export class Filter {
	readonly selector: string;
	readonly label: string;
	readonly checkbox: HTMLInputElement;
	readonly a: HTMLAnchorElement;
	readonly cssClass: string;
	visible: boolean;

	/**
  Creates filter with HTML elements, filter functionality and listeners.
  @param selector - a Cytoscape.js selector, see {@link http://js.cytoscape.org/#selectors}
  @param i18n - internationalization key
  */
	constructor(selector: string, i18n: string) {
		this.selector = selector;
		this.label = i18n;
		//let input = document.createRange().createContextualFragment('<input type="checkbox" class="filterbox" autocomplete="off" checked="true">'); // can't attach events to fragments
		const input = document.createElement("input");
		input.type = "checkbox";
		this.checkbox = input;
		input.classList.add("filterbox");
		input.autocomplete = "off";
		input.checked = true;
		this.a = document.createElement("a");
		this.a.classList.add("dropdown-entry");
		this.a.appendChild(input);
		this.a.setAttribute("tabindex", "-1");
		this.a.addEventListener("keydown", checkboxKeydownListener(input));
		this.a.appendChild(checkboxClickableDiv(input, "", i18n));
		// each filter has its own associated CSS class, such as "filter-BB"
		this.cssClass = `filter-${i18n}`;
		this.visible = true;
		// Does not apply to elements that get added later, so only use if you don't add elements to the graph. Alternative if you want to use this update this after adding something.
		// Assigns the CSS class of the filter to the nodes that match the filter selector.
		multicy((cy) => cy.elements(this.selector).addClass(this.cssClass));
		input.addEventListener("input", () => this.setVisible(input.checked));
		filters.push(this);
	}

	/** label
	 * @returns the label*/
	toString(): string {
		return this.label;
	}

	/**
  Set the visibility of the nodes selected by the filter.
  visible whether the nodes should be visible */
	setVisible(visible: boolean): void {
		if (this.visible === visible) {
			return;
		}
		this.visible = visible;

		const hiddenSelectors = filters.filter((f) => !f.visible).map((f) => (GRAPH_GETS_ADDITIONS ? f.selector : "." + f.cssClass)); // class selector may be faster

		if (hiddenSelectors.length === 0) {
			multicy((cy) => cy.elements().removeClass("filtered"));
			// cytoscape.js does not have a class negation selector so we need to add a negation class ourselves
			// see https://stackoverflow.com/questions/54108410/how-to-negate-class-selector-in-cytoscape-js
			multicy((cy) => cy.elements().addClass("unfiltered"));
			log.debug("All filters checked");
		} else {
			// "or" all selectors together to obtain a combined one
			const hiddenSelector = hiddenSelectors.reduce((a, b) => a + "," + b);
			multicy((cy) => {
				const filtered = cy.elements(hiddenSelector);
				filtered.addClass("filtered");
				filtered.removeClass("unfiltered");
				const unfiltered = cy.elements().not(filtered);
				unfiltered.removeClass("filtered");
				unfiltered.addClass("unfiltered");
			});
			log.debug("filter " + hiddenSelector + " triggered");
		}
	}

	/** Show or hide the elements of all filters at once.
	@param visible - whether all filterable elements should be visible */
	static setAll(visible: boolean): void {
		for (const filter of filters) {
			filter.checkbox.checked = visible;
			filter.setVisible(visible);
		}
	}

	/**
	Add a filter menu entry without a checkbox that sets all filters to the same visibility.
	@param parent - the parent element to attach the entry to
	@param as - an array of HTML anchors that gets the new entry appended
	@param i18n - internationalization key for the entry text
	@param visible - the visibility that all filters will be set to */
	private static addSetAllFilterEntry(parent: HTMLElement, as: Array<HTMLAnchorElement>, i18n: string, visible: boolean): void {
		const a = document.createElement("a");
		a.classList.add("dropdown-entry");
		a.setAttribute("tabindex", "-1");
		const div = document.createElement("div");
		div.classList.add("dropdown-entry-checkboxtext"); // extend clickable area beyond short texts, like the checkbox labels
		div.setAttribute("data-i18n", i18n);
		div.addEventListener("click", () => Filter.setAll(visible));
		a.appendChild(div);
		a.addEventListener("keydown", (e) => {
			if (e.key === " " || e.key === "Enter") {
				Filter.setAll(visible);
			}
		});
		parent.appendChild(a);
		as.push(a);
	}

	/**
Add filter entries to the filter menu.
@param parent - the parent element to attach the entries to
@param as - an empty array of HTML anchors to be filled */
	static addFilterEntries(parent: HTMLElement, as: Array<HTMLAnchorElement>): void {
		Filter.addSetAllFilterEntry(parent, as, "show-all-filters", true);
		Filter.addSetAllFilterEntry(parent, as, "hide-all-filters", false);
		for (const datum of filterData) {
			const filter = new Filter(datum[0], datum[1]);
			parent.appendChild(filter.a);
			as.push(filter.a);
		}
	}

	/** Saves the visibility values of all filters.
@returns JSON representation of all filters */
	static toJSON(): object {
		const json = {};
		for (const filter of filters) {
			json[filter.label] = filter.visible;
		}
		return json;
	}

	/** Loads the visibility values and applies it to all filters.
	The graph itself is restored from the saved Cytoscape JSON which already contains the filter classes,
	this only synchronizes the checkboxes. Missing values default to visible for compatibility with older save files.
	@param json - JSON representation of all filters */
	static fromJSON(json: object): void {
		for (const filter of filters) {
			const visible = (json as Record<string, boolean>)[filter.label] ?? true;
			filter.checkbox.checked = visible;
			filter.visible = visible;
		}
	}
}
