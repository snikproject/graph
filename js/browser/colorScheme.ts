/** Some Cytoscape color schemes. */
import { EDGE } from "../utils/constants";

/** Standard light mode Cytoscape color scheme.*/
export const colorSchemeDay = [
	{
		selector: "node",
		css: {
			color: "black",
			"border-color": "black",
		},
	},
	{
		selector: "node:selected",
		css: {
			"background-color": "rgb(0,0,255)",
		},
	},
	{
		selector: "node.source",
		css: {
			"border-color": "rgb(128,0,128)",
		},
	},
	{
		selector: "node.target",
		css: {
			"border-color": "rgb(0,165,165)",
		},
	},
	{
		selector: "edge",
		css: {
			color: "black", // label color
		},
	},
	{
		selector: "edge[!selected]",
		css: {
			"line-color": function (edge) {
				// highlight skos interlinks
				if (String(edge.data(EDGE.PROPERTY)).substring(0, 36) === "http://www.w3.org/2004/02/skos/core#") {
					return "rgb(140,130,10)";
				}
				return "rgb(110,110,110)";
			},
		},
	},
	{
		selector: "edge.starmode",
		css: {
			opacity: 1,
			"mid-target-arrow-color": "rgb(128,128,128)",
			color: "rgb(20,20,20)", // label color
		},
	},
	{
		selector: "edge:selected,edge.highlighted",
		css: {
			color: "rgb(0,0,128)", // label color
			"line-color": "rgb(0,0,128)",
			"mid-target-arrow-color": "rgb(0,0,128)",
		},
	},
];

/** Standard dark mode Cytoscape color scheme.*/
export const colorSchemeNight = [
	{
		selector: "node",
		css: {
			color: "white",
			"border-color": "white",
		},
	},
	{
		selector: "node:selected",
		css: { "background-color": "rgb(255,255,0)" },
	},
	{
		selector: "node.source",
		css: { "border-color": "rgb(128,255,128)" },
	},
	{
		selector: "node.target",
		css: { "border-color": "rgb(255,90,90)" },
	},
	{
		selector: "edge",
		css: {
			color: "white", // label color
		},
	},
	{
		selector: "edge:unselected",
		css: {
			"line-color": function (edge) {
				// highlight skos interlinks
				if (String(edge.data(EDGE.PROPERTY)).substring(0, 36) === "http://www.w3.org/2004/02/skos/core#") {
					return "rgb(255,255,190)";
				}
				return "rgb(252,252,252)";
			},
		},
	},
	{
		selector: "edge.starmode",
		css: {
			color: "rgb(128,128,128)", // label color
			"mid-target-arrow-color": "rgb(128,128,128)",
		},
	},
	{
		selector: "edge:selected,edge.highlighted",
		css: {
			color: "rgb(255,255,128)", // label color
			"line-color": "rgb(255,255,128)",
			"mid-target-arrow-color": "rgb(255,255,128)",
		},
	},
];
