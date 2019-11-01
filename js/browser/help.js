export const help =
{
  "SNIK Graph Manual":
  {
    "img": "graph.png",
    "context-menu":
    {
      "": "Right click on a node/edge to open the context menu and choose among:",
      "base-mode":
      {
        description:"Opens the node in an RDF browser, which shows all its properties and values.",
        star:
        {
          "":"Highlights the node and all its directly connected nodes.",
          "img": "star.png",
        },
        "incoming-star":"Highlights the node and all neighbours directly connected via incoming edges.",
        "outgoing-star":"Highlights the node and all neighbours directly connected via outgoing edges.",
        path:
        {
          "":"Shortest Path between a selected source and this node.",
          "img": "star.png",
        },
        spiderworm:
        {
          "":"The Spider Worm consists of the shortest path between a selected source and this node plus all direct neighbours. Displaying a spiderworm hides all other nodes and edges.",
          "img": "spiderworm.png",
        },
        edit:"If you are a domain expert and notice incorrectly modelled facts or connections of a node, feel free to send us an issue.",
        "combine-close-matches":"Merge equivalent classes from different subontologies.",
        "class-use":"Visualize the interplay of role, function and entity type (related to the Meta model).",
        hide:"Hide the selected item until the view is resetted.",
        "set-path-source":"Set the starting point for path operations.",
        "confirm-link": "Confirm that the automatically generated interlink is correct.",
      },
      "dev-mode":
      {
        "remove-permanently":"Send us an issue to delete the selected item permanently. Also removes it until graph is reloaded.",
        "ontowiki":"Access restricted ontology editing tool.",
        "debug":"Get debug information to the edge/node from the JSON File",
      },
      "ext-mode":
      {
        doublestar:
        {
          "":"The double star is like the spiderworm but shows connected nodes for both source and target, not just the target.",
          "img": "doublestar.png",
        },
        starpath:
        {
          "":"Creates a path and star every node along it.",
          "img": "starpath.png",
        },
        circlestar:
        {
          "":"A star using a circular layout. Hides all other nodes.",
          "img": "circlestar.png",
        },
        lodlive:"Third party data visualization exploration tool.",
      },
    },
    menu:
    {
      file:
      {
        "":"Holds different file options like loading and saving the graph in different ways.",
        "load-graph-with-layout": "Discard the currently loaded graph and load a new one from a Cytoscape file.",
        "load-layout": "Keep the currently loaded graph but load the position from those nodes from a layout file. Only works for nodes whose identifiers are contained in the file.",
        "load-sparql": "Discard the currently loaded graph and load all ontologies of SNIK.",
        "save-cytoscape-full": "Save the complete graph (visible and hidden) to a Cytoscape file.",
        "save-cytoscape-visible": "Save the currently visible subgraph to a Cytoscape file.",
        "save-layout": "Save the positions all nodes in the graph to a layout file.",
        "recalculate-layout-replace":"Recalculate the position of all visible nodes. May take a while when a large number of nodes are visible.",
        "save-image-current-view": "Save a screenshot of the current view.",
        "save-image-whole-graph": "Save an image of the whole graph with the same pixel density as the current view.",
        "save-image-current-view-high-res": "Save an image of the current view with a high resolution, for example for printing.",
        "save-image-whole-graph-high-res": "Save an image of the whole graph with a high resolution, for example for printing.",
      },
      filter:
      {
        "":"A collection of filters to display relevant subgraphs.",
        "meta": "The Meta Ontology provides common superclasses and relations for the subontologies of SNIK.",
        "bb":"Based on the book \"Health Information Systems Ontology–Architectures and Strategies\".",
        "ob": "Based on the book\"IT-Projektmanagement im Gesundheitswesen - Lehrbuch und Projektleitfaden.",
        "he": "Based on the book \"Informationsmanagement: Grundlagen, Aufgaben, Methoden\".",
        "ciox": "Based on interviews about the Health Information System with Department B1, the Department for Information Management, of the Uniklinikum Leipzig.",
        "role": "Who...",
        "function": "...does what...",
        "entitytype": "...and which information is therefore needed.",
      },
      options:
      {
        "": "Here you can find different checkboxes that toggle the behaviour of SNIK Graph",
        "separate-subs":"Spread the SNIK Graph into subgraphs of the subontologies.",
        "cumulative-search":"Keep previous search results visible when searching again.",
        "day-mode":"White background. Saves ink when printing.",
        "dev-mode":"Additional context menu entries for developers.",
        "ext-mode":"Additional context menu entries for power users.",
        "combine-match": "Highlights groups of classes representing the same concept from different subontologies (matches) by placing them in boxes. Use \"move matches on top of each other\" or  \"move matches nearby\" to shrink those boxes.",
      },
      layout:
      {
        "":"This part of the menu holds the layout features.",
        "show-close-matches":"Shows (unhides) all nodes that are connected via close matches to visible nodes.",
        "recalculate-layout":"Hotkey: Ctrl+Alt+L. Recalculates the position of all selected nodes, or all visible nodes if there are not at least two selected nodes. Can take a while if there are many visible nodes.",
        "tight-layout":"Hotkey: Ctrl+Alt+T. You can use this for a more narrow view.",
        "compound-layout":"Hotkey: Ctrl+Alt+C. Layout that tries to places combined matches next to each other.",
        "reset-view":"Resets all the layout operations to get you back to the starting point of the visualization.",
        "move-match-on-top": "Requires enabled \"Combine Matching\" option. Places all matching nodes in the center of their group.",
        "move-match-nearby": "Requires enabled \"Combine Matching\" option. Places all matching nodes in a small circle in their group.",
        "bb-chapter-search":"Presents you all chapters of the \"blue book\" and lets you build a subgraph out of selected chapters .",
        "ob-chapter-search":"Presents you all chapters of the \"orange book\" and lets you build a subgraph out of selected chapters .",
      },
      services:
      {
        "":"Other ways to access SNIK.",
        "sparql-endpoint": "Expert interface for the SPARQL Protocol and RDF Query Language endpoint.",
        "rdf-browser": "Browse complete descriptions of classes in the RDF browser.",
      },
      language:"Language switch, you can choose between English, German and Persian. Ontologies may not or not fully support all available languages.",
      help:"Common Help Menu, holds e.g. this manual",
    },
    "search-field":"Search for classes by entering a full or partial name.",
  },
};

/** Transforms key-string pairs of arbitrary depth to a flat object. Empty keys are descriptions of their parents.*/
function flatten(o)
{
  const flat = {};
  for(const key in o)
  {
    if(key==="img") {continue;}
    const value = o[key];
    if(typeof value ==="string") {flat[key] = value;continue;}
    if(value[""]) {flat[key]=value[""];}
    if(key==="") {continue;}
    Object.assign(flat,flatten(value));
  }
  return flat;
}

export const flatHelp = flatten(help);

/** Add event listenerers for popups.*/
export function init()
{
  for(const key in flatHelp)
  {
    const value = flatHelp[key];
    if(typeof value !=="string") {console.error("value "+value+" for key "+key+" not a string");}
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
      else {log.trace(`tooltip init: found none of #${key} and [data-i18n="${key}"]`);}
    }
  }
}
