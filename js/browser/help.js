export const help =
{
  contextMenu:
  {
    baseMode:
    {
      description: "Opens the node in an RDF browser, which shows all its properties and values.",
      star: "Highlights the node and all its directly connected nodes.",
      "incoming-star": "Highlights the node and all neighbours directly connected via incoming edges.",
      "outgoing-star": "Highlights the node and all neighbours directly connected via outgoing edges.",
      path: "Shortest Path between a selected source and this node. ",
      spiderworm: "The Spider Worm consists of the shortest path between a selected source and this node plus all direct neighbours. Displaying a spiderworm hides all other nodes and edges.",
      edit: "If you are a domain expert and notice incorrectly modelled facts or connections of a node, feel free to send us an issue.",
      "combine-close-matches": "Merge equivalent classes from different subontologies.",
      "class-use": "Visualize the interplay of role, function and entity type (related to the Meta model).",
      hide: "Hide the selected item until the view is resetted.",
      "set-path-source": "Set the starting point for path operations.",
    },
    devMode:
    {
      "remove-permanently": "Send us an issue to delete the selected item permanently. Also removes it until graph is reloaded.",
      "ontowiki": "Access restricted ontology editing tool. ",
      "debug": "Get debug information to the edge/node from the JSON File ",
    },
    extMode:
    {
      doublestar:"The double star is like the spiderworm but shows connected nodes for both source and target, not just the target.",
      starpath: "Creates a path and star every node along it.",
      circlestar: "A star using a circular layout.",
      lodlive: "Third party data visualization exploration tool.",
    },
  },
};
