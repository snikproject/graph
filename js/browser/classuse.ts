/** Show the environment of a single node using a special layout.*/
import * as sparql from "../sparql";
import { NODE } from "../utils/constants";
import { Graph } from "./graph";
import { View } from "./view";
import { short } from "../rdf";
import log from "loglevel";

let count = 0;

/** Centers a class and shows directly and indirectly connected roles, functions and entity types in a concentric layout.
Hides all other nodes. Resetting the view unhides the other nodes but keeps the layout of those shown before.
Recalculate the layout to place those nodes in relation to the whole graph again.
@param clazz - The URI of the class.
@param subTop - The sub top letter of the class (R,F or E) */
export async function classUse(clazz: string, subTop: string): Promise<void> {
	// preparation and check

	const types = {
		R: ["meta:Role", "meta:Function", "meta:EntityType"],
		F: ["meta:Function", "meta:Role", "meta:EntityType"],
		E: ["meta:EntityType", "meta:Function", "meta:Role"],
	};

	if (!(subTop in types)) {
		log.error("Unknown subtop '" + subTop + "'. Cannot display class use.");
		return;
	}

	const [innerType, middleType, outerType] = types[subTop];

	const query =
		`select distinct ?inner ?middle ?outer ?outerx
    {
      <${clazz}> (rdfs:subClassOf|skos:closeMatch|^skos:closeMatch)* ?inner.
      ?inner rdf:type ${innerType}.
      OPTIONAL
      {
        ?inner ?p ?middle.
        ?middle rdf:type ${middleType}.` +
		//    ?role ?p ?f.
		//    ?f rdf:type meta:Function.
		//    ?f (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)* ?function.
		`
        OPTIONAL
        {` +
		//        #?function ?q ?et
		//        #?et rdf:type meta:EntityType.
		`
          ?middle ?q ?outer.
          ?outer rdf:type ${outerType}.
          OPTIONAL {?outer (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)+ ?outerx.}
        }
      }
    }`;

	interface ClassUseBinding {
		inner: { value: string };
		middle: { value: string };
		outer: { value: string };
		outerx: { value: string };
	}
	const bindings = (await sparql.select(query)) as Array<ClassUseBinding>;

	const [inner, middle, outer, outerx] = [new Set(), new Set(), new Set(), new Set()];

	for (let i = 0; i < bindings.length; i++) {
		inner.add(bindings[i].inner.value);
		if (bindings[i].middle) {
			middle.add(bindings[i].middle.value);
		}
		if (bindings[i].outer) {
			outer.add(bindings[i].outer.value);
		}
		if (bindings[i].outerx) {
			outerx.add(bindings[i].outerx.value);
		}
	}
	if (middle.size === 0) {
		log.warn("Class " + clazz + " is not used.");
		return;
	}
	// check passed ***************************************************************************************+

	// Class Use does not work with Combine Matches enabled, disable it temporarily.
	// Enable again after finishing Class Use.
	// See https://github.com/IMISE/snik-cytoscape.js/issues/341
	const box = document.getElementById("combineMatchModeBox") as HTMLInputElement;
	const combineMatch = box.checked;
	if (combineMatch) {
		View.mainView.state.graph.combineMatch(false);
	}

	// Create new tab. See https://github.com/IMISE/snik-cytoscape.js/issues/341
	const view = new View(true, "Class Use " + ++count + " " + short(clazz));
	await view.initialized;
	const graph = view.state.graph;

	// show it ****************************************************************
	graph.cy.startBatch();
	graph.resetStyle();
	Graph.setVisible(graph.cy.elements(), false);
	graph.starMode = true;

	const classes = new Set([...inner, ...middle, ...outer, ...outerx]);
	const selectedNodes = graph.cy.collection(`node[id='${clazz}']`);

	for (const c of classes) {
		const cNodes = graph.cy.nodes(`node[id='${c}']`);
		selectedNodes.merge(cNodes);
		//selectedEdges = selectedEdges.union(cNodes.connectedEdges());
	}

	const selectedElements = selectedNodes.merge(selectedNodes.edgesWith(selectedNodes));

	selectedNodes
		.layout({
			name: "concentric",
			fit: true,
			levelWidth: function () {
				return 1;
			},

			minNodeSpacing: 20,

			concentric: function (node: cytoscape.NodeSingular & { degree(): number }) {
				const uri = node.data(NODE.ID);
				if (uri === clazz) {
					return 10;
				}
				if (inner.has(uri)) {
					return 9;
				}
				if (middle.has(uri)) {
					return 8;
				}
				if (outer.has(uri)) {
					return 7;
				}
				if (outerx.has(uri)) {
					return 6;
				}
				return 10; // temporary workaround for inner without subtop
				/*
            // faster but can't discern expanded entity types from directly connected ones
            switch(node.data(NODE.SUBTOP))
            {
            case "EntityType": return 1;
            case "Function": return 2;
            case "Role": return 3;
            default: return 3; // temporary workaround for inner without subtop
          }
          */
			},
		})
		.run();

	Graph.setVisible(selectedElements, true);
	if (combineMatch) {
		[View.mainView, view].forEach((v) => v.state.graph.combineMatch(true));
	} // enable combine match for the main view again and for the new view

	const centerNode = graph.cy.nodes(`node[id='${clazz}']`);
	graph.cy.center(centerNode);
	graph.cy.fit(selectedNodes);

	graph.cy.endBatch();
}
