import * as sparql from "../sparql";
import * as fuse from "../fuse";
import { activeState } from "./view";
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

function debouncePromise(fn, time) {
	let timerId = null;
	let resolveFns = [];
	let busy = false;

	return function debounced(...args) {
		//if (timerId !== null) console.log("clearing", timerId);
		clearTimeout(timerId);

		timerId = setTimeout(() => {
			if (busy) return;
			busy = true;
			resolveFns.forEach((resolve) => resolve(fn(...args)));
			resolveFns = [];
			busy = false;
		}, time);

		return new Promise((resolve) => resolveFns.push(resolve));
	};
}

const debounced = debouncePromise((items) => Promise.resolve(items), 300);

function uriType(uri) {
	const node = activeState().cy.getElementById(uri)[0];
	if (!node) return 3;
	if (node.hasClass("hidden") && !node.hasClass("filtered")) return 1;
	if (node.hasClass("filtered")) return 2;
	return 0;
}

function fuseSource(query) {
	return {
		sourceId: "fuse",
		templates: {
			item({ item, components }) {
				const i = item.item;
				const uri = i.uri;
				const type = uriType(uri);
				//console.log(i);
				const graphLink = `<a class="search-class${type}" href="javascript:window.presentUri('${uri}');void(0)">${uri.replace(sparql.SNIK_PREFIX, "")}</a>`;
				const lodViewLink = `<a class="search-class${type}" href="${uri}" target="_blank">Description</a>`;
				return graphLink + " " + lodViewLink;
				//return JSON.stringify(item.item);
				//return item.name + " " + item.description + " " + item.foo;
			},
			noResults() {
				return "No results.";
			},
		},
		getItems() {
			console.log("getting fuse results for query " + query);
			return fuse.search(query); // async
			//return items;
			/*return [
            { name: "john", description: "the john of johns", foo: "bar" },
            { name: "jill", description: "the jill of jills", foo: "mak" },
        ];*/
		},
	};
}

autocomplete({
	container: "#autocomplete",
	placeholder: "Search for products",
	getSources({ query }) {
		return debounced([fuseSource(query)]);
	},
});
