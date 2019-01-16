/**
Creates the circular context menu that can be opened on top of a node.
@module */
import * as graph from "./graph.js";
import * as nodes from "./contextmenuNodes.js";
import * as edges from "./contextmenuEdges.js";


/** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
The extension itself is already registered through the plain HTML/JS import in index.html,
which makes available cy.cxtmenu().*/
export function registerMenu()
{
  graph.cy.cxtmenu(nodes.defaultsNodes);
  graph.cy.cxtmenu(edges.defaultsRelations);
  graph.cy.cxtmenu(edges.defaultsLimesRelations);
}
