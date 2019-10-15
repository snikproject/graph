export const help =
{
  contextMenu:
  {
    baseMode:
    {
      description:"Opens the node in an RDF browser, which shows all its properties and values.",
      star:"Highlights the node and all its directly connected nodes.",
      "incoming-star":"Highlights the node and all neighbours directly connected via incoming edges.",
      "outgoing-star":"Highlights the node and all neighbours directly connected via outgoing edges.",
      path:"Shortest Path between a selected source and this node.",
      spiderworm:"The Spider Worm consists of the shortest path between a selected source and this node plus all direct neighbours. Displaying a spiderworm hides all other nodes and edges.",
      edit:"If you are a domain expert and notice incorrectly modelled facts or connections of a node, feel free to send us an issue.",
      "combine-close-matches":"Merge equivalent classes from different subontologies.",
      "class-use":"Visualize the interplay of role, function and entity type (related to the Meta model).",
      hide:"Hide the selected item until the view is resetted.",
      "set-path-source":"Set the starting point for path operations.",
    },
    devMode:
    {
      "remove-permanently":"Send us an issue to delete the selected item permanently. Also removes it until graph is reloaded.",
      "ontowiki":"Access restricted ontology editing tool.",
      "debug":"Get debug information to the edge/node from the JSON File",
    },
    extMode:
    {
      doublestar:"The double star is like the spiderworm but shows connected nodes for both source and target, not just the target.",
      starpath:"Creates a path and star every node along it.",
      circlestar:"A star using a circular layout.",
      lodlive:"Third party data visualization exploration tool.",
    },
  },
  menu:
  {
    file:"Holds different File Options like loading and saving the graph in different ways.",
    filter:"A collection of filters to display relevant subgraphs.",
    options:"Here you can find different checkboxes that toggle the behaviour of SNIK Graph",
    "separate-subontologies":"Spread the SNIK Graph into subgraphs of the subontologies.",
    "cumulative-search":"Keep previous search results visible when searching again.",
    "day-mode":"White background. Saves ink when printing.",
    "dev-mode":"Display additional context menu entries for developers.",
    "ext-mode":"Display less often used context menu entries.",
    layout:"This part of the menu holds the layout features.",
    "show-close-match":"Shows all nodes that are connected via close matches to visible nodes.",
    "recalculate-layout":"Hotkey: Ctrl+Alt+L. Recalculates the position of all selected nodes, or all visible nodes if there are not at least two selected nodes. Can take a while if there are many visible nodes.",
    "tight-layout":"Hotkey: Ctrl+Alt+T. You can use this for a more narrow view.",
    "compound-layout":"Hotkey: Ctrl+Alt+C. Layout that tries to places combined matches next to each other.",
    "reset-view":"Resets all the layout operations to get you back to the starting point of the visualization.",
    services:"Other ways to access SNIK .",
    language:"Language switch, you can choose between English, German and Persian. Ontologies may not or not fully support all available languages.",
    help:"Common Help Menu, holds e.g. this manual",
  },
  "search-field":"Search for classes by entering a full or partial name.",
};

/** Add event listenerers for popups.*/
export function init(o = help)
{
  for(const key in o)
  {
    const value = o[key];
    if(typeof value !=="string")
    {
      init(value);
      continue;
    }
    const ele = document.getElementById(key);
    if(ele)
    {
      tippy("#"+key, {content: value});
    }
    else
    {
      const selector = `[data-i18n="${key}"]`;
      const eles = document.querySelectorAll(selector);
      if(eles.length>0) {tippy(selector, {content: value});}
      else {log.info(`tooltip init: found none of #${key} and [data-i18n="${key}"]`);}
    }
  }
}
