/**
Creates the circular context menu that can be opened on top of a node/edge.
Needs to be initialized before it can be used via the default export function.
@module */
import nodeMenus from "./contextmenuNodes.js";
import edgeMenus from "./contextmenuEdges.js";
import * as graph from "./graph.js";
import {flatHelp} from "./help.js";

const cxtmenus = []; // to destroy them later

/** Add tooltips to all menu entries.*/
function addTippy(menu)
{
  console.log("Adding tippy to menu "+menu);
  menu.commands.forEach(c=>
  {
    if(c.tippy) {return;}
    c.tippy=true; // some commands are shared by multiple menus
    const tooltip = flatHelp[c.id];
    if(!tooltip) {return;}
    {c.contentStyle = {"pointer-events": "all"};}
    c.content=`<img src onerror="tippy('span')"><span data-tippy-content="${tooltip}" style="padding:3em;">${c.content}</span>`;
  });
  return menu;
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
  [...nodeMenus(dev,ext),...edgeMenus(dev)].forEach(menu=>{cxtmenus.push(graph.cy.cxtmenu(addTippy(menu)));});
}
