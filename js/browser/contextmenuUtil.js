import config from "../config.js";

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
