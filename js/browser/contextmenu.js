/**
Creates the circular context menu that can be opened on top of a node/edge.
Needs to be initialized before it can be used via the default export function.
@module */
import nodeMenus from "./contextmenuNodes.js";
import edgeMenus from "./contextmenuEdges.js";
import * as graph from "./graph.js";
import config from "../config.js";

const cxtmenus = []; // to destroy them later

/** Add a logging wrapper to a context menu command. */
export function logWrap(cmd,messageFunction)
{
  if(cmd.select.wrapped) {return;}
  const tmp = cmd.select;
  cmd.select = ele =>
  {
    log.debug("Context Menu: Operation "+cmd.content+" on "+messageFunction(ele));
    tmp(ele);
  };
  cmd.select.wrapped = true;
}

/** Define as a function to prevent circular dependency problems. */
export function menuDefaults()
{
  return {
    fillColor: 'rgba(200, 200, 200, 0.95)', // the background colour of the menu
    activeFillColor: 'rgba(150, 0, 0, 1)', // the colour used to indicate the selected command
    openMenuEvents: config.openMenuEvents, // cytoscape events that will open the menu (space separated)
    itemColor: 'rgba(80,0,0)', // the colour of text in the command's content
    itemTextShadowColor: 'gray', // the text shadow colour of the command's content
    zIndex: 9999, // the z-index of the ui div
  };
}

/** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
The extension itself is already registered through the plain HTML/JS import in index.html,
which makes available cy.cxtmenu().
@param {boolean} dev whether developer mode menu entries are shown
@param {boolean} ext whether extended mode menu entries are shown
*/
export function registerContextMenu(dev, ext)
{
  log.debug(`Register Context Menu. Developer Entries: ${dev}, Extended Entries: ${ext}`);
  cxtmenus.forEach(menu=>menu.destroy());
  cxtmenus.length=0;
  [...nodeMenus(dev,ext),...edgeMenus(dev)].forEach(menu=>{cxtmenus.push(graph.cy.cxtmenu(menu));});
}
