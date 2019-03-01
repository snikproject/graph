/**
Creates the circular context menu that can be opened on top of a node/edge.
@module */
import * as graph from "./graph.js";
import * as nodes from "./contextmenuNodes.js";
import * as edges from "./contextmenuEdges.js";
import * as NODE from "../node.js";
import * as EDGE from "../edge.js";

const cxtmenus = [];

/** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
The extension itself is already registered through the plain HTML/JS import in index.html,
which makes available cy.cxtmenu().
@param {boolean} enabled check if devMode is active or not */
export default function(enabled)
{
  cxtmenus.forEach(menu=>menu.destroy());
  cxtmenus.length=0;
  if(enabled)
  {
    log.trace("Enabled DevMode. Register Context Menu");
    for(const cmd of nodes.devNodes.commands.filter(c=>!c.select.wrapped))
    {
      const tmp = cmd.select;
      cmd.select = node =>
      {
        log.info("Context Menu: DevMode Operation "+cmd.content+" on node "+node.data(NODE.ID));
        tmp(node);
      };
      cmd.select.wrapped = true;
    }
    cxtmenus.push(graph.cy.cxtmenu(nodes.devNodes));

    for(const cmd of edges.devLimesRelations.commands.filter(c=>!c.select.wrapped))
    {
      const tmp = cmd.select;
      cmd.select = edge =>
      {
        log.info("Context Menu: Operation "+cmd.content+" on edge between "+edge.data(EDGE.SOURCE)+" and "+edge.data(EDGE.TARGET));
        tmp(edge);
      };
      cmd.select.wrapped = true;
    }
    cxtmenus.push(graph.cy.cxtmenu(edges.devRelations));
    cxtmenus.push(graph.cy.cxtmenu(edges.devLimesRelations));
  }

  else
  {
    log.trace("Disabled DevMode. Register Context Menu");
    for(const cmd of nodes.defaultsNodes.commands.filter(c=>!c.select.wrapped))
    {
      const tmp = cmd.select;
      cmd.select = node =>
      {
        log.info("Context Menu: Operation "+cmd.content+" on node "+node.data(NODE.ID));
        tmp(node);
      };
      cmd.select.wrapped = true;
    }
    cxtmenus.push(graph.cy.cxtmenu(nodes.defaultsNodes));

    for(const cmd of edges.defaultsRelations.commands.filter(c=>!c.select.wrapped))
    {
      const tmp = cmd.select;
      cmd.select = edge =>
      {
        log.info("Context Menu: Operation "+cmd.content+" on edge between "+edge.data(EDGE.SOURCE)+" and "+edge.data(EDGE.TARGET));
        tmp(edge);
      };
      cmd.select.wrapped = true;
    }
    cxtmenus.push(graph.cy.cxtmenu(edges.defaultsRelations));
  }
}
