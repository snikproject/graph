/**
Creates the circular context menu that can be opened on top of a node/edge.
Needs to be initialized before it can be used via the default export function.
@module */
import nodeMenus from "./contextmenuNodes.js";
import ContextMenuEdges from "./contextmenuEdges.js";
import {flatHelp} from "../help.js";

/** context menu for nodes and edges */
export default class ContextMenu
{
  /** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
  The extension itself is already registered through the plain HTML/JS import in index.html,
  which makes available cy.cxtmenu().
  @param {boolean} dev whether developer mode menu entries are shown
  @param {boolean} ext whether extended mode menu entries are shown
  */
  constructor(graph,menu)
  {
    this.graph = graph;
    log.debug(`Register Context Menu. Developer Entries: ${menu.devModeBox.checked}, Extended Entries: ${menu.extModeBox.checked}`);
    this.cxtmenus = [];
    this.populate(menu.devModeBox.checked, menu.extModeBox.checked);
    menu.devModeBox.addEventListener("change",()=>{log.debug("Set devMode to "+menu.devModeBox.checked);this.populate(menu.devModeBox.checked,menu.extModeBox.checked);});
    menu.extModeBox.addEventListener("change",()=>{log.debug("Set extMode to "+menu.extModeBox.checked);this.populate(menu.devModeBox.checked,menu.extModeBox.checked);});
  }

  /** Clears existing context menus of this menu and create anew the different context menus depending on whether dev and ext mode are active. */
  populate(dev,ext)
  {
    /** Unregister and destroy all created menus of this context menu. */
    this.cxtmenus.forEach(c=>c.destroy());
    this.cxtmenus = [];
    [...nodeMenus(this.graph,dev,ext),...new ContextMenuEdges(this.graph,dev).menus].forEach(menu=>{this.cxtmenus.push(this.graph.cy.cxtmenu(ContextMenu.addTippy(menu)));});
  }

  /** Add tooltips to all menu entries.*/
  static addTippy(cxtMenu)
  {
    cxtMenu.commands.forEach(c=>
    {
      if(c.tippy) {return;}
      c.tippy=true; // some commands are shared by multiple menus
      const tooltip = flatHelp[c.id];
      if(!tooltip) {return;}
      {c.contentStyle = {"pointer-events": "all"};}
      c.content=`<img src onerror="tippy('span')"><span data-tippy-content="${tooltip}" style="padding:3em;">${c.content}</span>`;
    });
    return cxtMenu;
  }
}
