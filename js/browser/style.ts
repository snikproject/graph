/* eslint-disable camelcase */
/**
Cytoscape style file, excluding color information, which is contained in the color schemes.
@see colorSchemeDay
@see colorSchemeNight
*/
import { NODE } from "../node";
import { EDGE } from "../edge";
import * as language from "../lang/language";
import { config } from "../config/config";
import { stringToColor } from "./util";
// see https://docs.google.com/spreadsheets/d/1ZrWs4IPrTU--pcyNkKm-YAUHdGMOKjcMZuVKeB_t6wg/edit?usp=sharing

export const style = {
	format_version: "1.0",
	generated_by: "cytoscape-3.4.0",
	target_cytoscapejs_version: "~2.1",
	title: "MyStyle1",
	style: [
		{
			selector: "node",
			css: {
				"min-zoomed-font-size": 5,
				width: config.nodeSize,
				height: config.nodeSize,
				"font-size": 11,
				"text-valign": "center",
				"text-halign": "center",
				"border-opacity": 1.0,
				"border-width": function (node) {
					return node.data(NODE.HAS_INSTANCE) ? 1.0 : 0.0;
				},
				"font-family": "sans-serif",
				"font-weight": "normal",
				"background-opacity": 0.5882352941176471,
				"text-opacity": 1.0,
				shape: config.ontology?.style?.shape ? config.ontology.style.shape : "hexagon",
				label: function (node) {
					const SHOW_QUALITY = false;
					let label = node.data(NODE.LABEL); // object with language code as keys and arrays of string as values
					if (!label) {
						return node.data(NODE.ID);
					}
					// Use the user-prefered language if available.
					let it;
					if ((it = label[language.getLanguage()]) && (it = it[0])) {
						label = it;
					}
					// Try other languages
					else {
						let found = false;
						for (const lang of [NODE.LABEL_ENGLISH, NODE.LABEL_GERMAN, NODE.LABEL_PERSIAN]) {
							if ((it = label[lang]) && it[0]) {
								label = it[0];
								found = true;
								break;
							}
						}
						if (!found) {
							const keys = Object.keys(label);
							if (keys.length > 0) {
								label = label[keys[0]];
							} else {
								label = node.data(NODE.ID);
							}
						}
					}
					if (SHOW_QUALITY) {
						label += "\n\u25CB\u25CF\u25CB\u25CB\u25CF";
					}
					if (node.data(NODE.HAS_INSTANCE)) {
						label += "*";
					}
					return label;
				},
			},
		},
		{
			selector: "node.source",
			css: {
				"border-width": 5.0,
			},
		},
		{
			selector: "node.target",
			css: {
				"border-width": 5.0,
			},
		},
		{
			selector: "node.highlighted",
			css: {
				"border-width": 5.0,
			},
		},
		{
			selector: "node:selected",
			css: {
				"border-width": 8.0,
			},
		},
		{
			selector: "edge",
			css: {
				"z-compound-depth": "bottom",
				width: 2.0,
				opacity: 0.22,
				"edge-text-rotation": "autorotate",
				"text-margin-y": "-1em",
				"min-zoomed-font-size": 5,
				"font-size": 11,
			},
		},
		{
			selector: "edge.highlighted,edge:selected,edge.starmode",
			css: {
				"text-opacity": 1.0,
				"mid-target-arrow-shape": function (edge) {
					// no arrow for properties edges
					switch (edge.data(EDGE.PROPERTY)) {
						case "http://www.snik.eu/ontology/meta/isAssociatedWith":
						case "http://www.w3.org/2004/02/skos/core#closeMatch":
						case "http://www.w3.org/2004/02/skos/core#relatedMatch":
						case "http://www.w3.org/2004/02/skos/core#related":
						case "http://www.w3.org/2004/02/skos/core#exactMatch":
							return "none";
					}
					return "triangle";
				},
				label: function (edge) {
					let label = edge.data(EDGE.PROPERTY_LABEL);
					const SHOW_QUALITY = true;
					if (SHOW_QUALITY && edge.data(EDGE.GRAPH) === "http://www.snik.eu/ontology/limes-exact") {
						label += " \u26A0";
					}
					return label;
				},
			},
		},
		{
			selector: "edge.highlighted,edge:selected",
			css: {
				width: 4.0,
				opacity: 1.0,
			},
		},
		{
			selector: ".filtered",
			css: {
				display: "none",
			},
		},
		{
			selector: ".hidden",
			css: {
				visibility: "hidden",
			},
		},
		{
			selector: "$node > node", // compound nodes
			css: {
				shape: "rectangle",
				"border-width": 10.0,
				"text-valign": "top",
				"text-margin-y": "-0.7em", // above border
				"min-zoomed-font-size": 7.5,
				"font-size": 16,
				"background-opacity": "0", // colorless
			},
		},
		{
			selector: "node[i]",
			css: {
				shape: "star",
			},
		},
		{
			selector: "node",
			css: {
				"background-color": (node) => {
					let color = config.ontology?.style?.color(node);
					if (!color) {
						color = "rgb(254,196,79)";
					}
					return color;
				},
				color: "white",
			},
		},
	],
};

function edgeColor(edge) {
	const edgeType = edge.data(EDGE.PROPERTY);
	const color = stringToColor(edgeType); // maybe adjust the v of the hsv color for day mode
	return color;
}

export const coloredEdgeStyle = [
	{
		selector: "edge",
		css: {
			color: edgeColor,
		},
	},
	{
		selector: "edge:unselected",
		css: {
			"line-color": edgeColor,
		},
	},
];

export const showPropertyStyle = [
	{
		selector: "edge",
		css: {
			label: function (edge) {
				let label = edge.data(EDGE.PROPERTY_LABEL);
				const SHOW_QUALITY = true;
				if (SHOW_QUALITY && edge.data(EDGE.GRAPH) === "http://www.snik.eu/ontology/limes-exact") {
					label += " \u26A0";
				}
				return label;
			},
		},
	},
];
