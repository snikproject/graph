/** Textual node search.*/
import * as sparql from "../sparql";
import * as util from "./util";
import * as fuse from "../fuseSearch";
import { progress } from "./progress";
import { View } from "./view";
import MicroModal from "micromodal";

import log from "loglevel";
// disable bif:contains search because it does not even accept all non-space strings and the performance hit is negliglible
// BIF contains also breaks space insensitiveness, which we require and also check in the unit test
// const USE_BIF_CONTAINS = false;
const SEARCH_LIMIT = 100;

export class Search {
	/** Add search functionality to the form.
	 *  @param form - a form with a search field named "query" */
	constructor(form: HTMLFormElement) {
		const input = form.querySelector<HTMLInputElement>("[name=query]")!;
		// Capture Ctrl+K before the browser can turn it into an address-bar search.
		window.addEventListener(
			"keydown",
			(event) => {
				if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "k") {
					event.preventDefault();
					event.stopImmediatePropagation();
					input.focus();
					input.select();
				}
			},
			true
		);
		form.addEventListener("submit", (event: Event) => {
			event.preventDefault();
			// @ts-expect-error event target is the form itself
			progress(() => this.showSearch(event.target.children.query.value));
		});
		log.debug("search initialized");
	}
	/**
	 * @param query - The user query.
	 * @param uris - An array of OWL class URIs
	 * @returns whether the search results are nonempty.
	 */
	showSearchResults(query: string, uris: Array<string>): boolean {
		const table = util.getElementById("tab:search-results") as HTMLTableElement;
		// clear leftovers from last time
		while (table.rows.length > 0) {
			table.deleteRow(0);
		}
		if (uris.length === 0) {
			util.getElementById("h2:search-results").innerHTML = `No Search Results for "${query}"`;
			return false;
		}
		if (uris.length === 1) {
			MicroModal.close("search-results");
			View.activeState().graph.presentUri(uris[0]);
			return true;
		}
		if (uris.length >= SEARCH_LIMIT) {
			util.getElementById("h2:search-results").innerHTML = `First ${SEARCH_LIMIT} Search Results for "${query}"`;
		} else {
			util.getElementById("h2:search-results").innerHTML = `${uris.length} Search Results for "${query}"`;
		}
		// Preprocessing: Classify URIs as (0) in graph and visible, (1) in graph and hidden but not filtered, (2) in graph and filtered and (3) not in the graph.
		const uriType = {};
		uris.forEach((uri) => {
			const node = View.activeState().cy.getElementById(uri)[0];
			if (node) {
				uriType[uri] = 0;
				if (node.hasClass("hidden") && !node.hasClass("filtered")) {
					uriType[uri] = 1;
				} else if (node.hasClass("filtered")) {
					uriType[uri] = 2;
				}
			} else {
				uriType[uri] = 3;
			}
		});
		const selected: Set<string> = new Set();
		// JavaScript search implementation is up to the browser but most should have a stable array search, which means that URIs within a URI type should keep their relative ranking
		uris.sort((a, b) => uriType[a] - uriType[b]);
		uris.forEach((uri) => {
			const row = table.insertRow();
			const checkCell = row.insertCell();
			const checkBox = document.createElement("input");
			checkBox.type = "checkbox";
			checkCell.appendChild(checkBox);
			checkCell.addEventListener("change", (e) => {
				selected[(e.target as HTMLInputElement).checked ? "add" : "remove"](uri);
			});
			const locateCell = row.insertCell();
			const lodLiveCell = row.insertCell();
			(window as any).presentUri = View.activeState().graph.presentUri;
			// todo: listener to add to selected uris
			locateCell.innerHTML = `<a class="search-class${uriType[uri]}" href="javascript:MicroModal.close('search-results');window.presentUri('${uri}');void(0)">
          ${uri.replace(sparql.SNIK.PREFIX, "")}</a>`;
			const html = `<a class="search-class${uriType[uri]}" href="${uri}" target="_blank">Description</a>`;
			lodLiveCell.innerHTML = html;
		});
		const row = table.insertRow(0);
		row.insertCell();
		{
			const cell = row.insertCell();
			cell.innerHTML = "<a href='#'>Highlight All</a>";
			cell.addEventListener("click", (e) => {
				MicroModal.close("search-results");
				View.activeState().graph.presentUris(uris);
				e.preventDefault();
			});
		}
		{
			const cell = row.insertCell();
			cell.innerHTML = "<a href='#'>Highlight Selected</a>";
			cell.addEventListener("click", (e) => {
				MicroModal.close("search-results");
				View.activeState().graph.presentUris([...selected]);
				e.preventDefault();
			});
		}
		return true;
	}
	/** Search the class labels and display the result to the user.
	 *  @param userQuery - the search query as given by the user
	 *  @returns false to prevent page reload triggered by submit.*/
	async showSearch(userQuery): Promise<false> {
		// ignore empty queries, they would only open the dialog with a "No Search Results" header
		if (!userQuery.trim()) {
			MicroModal.close("search-results");
			return false;
		}
		MicroModal.show("search-results");
		// fuse returns results ordered by increasing score, where a low score is a better match than a high score
		const items = await fuse.search(userQuery);
		// fuse.search is unbounded by default, limit the number of rendered rows and tell the user when the list is truncated
		const uris = items.slice(0, SEARCH_LIMIT).map((x) => x.item.uri);
		this.showSearchResults(userQuery, uris);
		return false; // prevent page reload triggered by submit
	}
}
