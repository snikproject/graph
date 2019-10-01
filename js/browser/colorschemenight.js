/** Standard dark mode Cytoscape color scheme.
@module
*/
import * as EDGE from "../edge.js";

const colorschemenight =
  [
    {
      "selector": "node",
      "css":
      {
        'color': 'white',
      },
    },
    {
      "selector": "node:selected",
      "css": {"background-color": "rgb(255,255,0)"},
    },
    {
      "selector": "node.source",
      "css": {"border-color": "rgb(128,255,128)"},
    },
    {
      "selector": "node.target",
      "css": {"border-color": "rgb(255,90,90)"},
    },
    {
      "selector": "edge:unselected",
      "css":
      {
        'line-color': function(edge)
        {
          // highlight skos interlinks
          if((String(edge.data(EDGE.PROPERTY)).substring(0,36))==='http://www.w3.org/2004/02/skos/core#')
          {
            return "rgb(165,165,128)";
          }
          return "rgb(128,128,128)";
        },
      },
    },
    {
      "selector": "edge.starmode",
      "css":
      {
        'color': 'rgb(128,128,128)', // label color
        'mid-target-arrow-color': 'rgb(128,128,128)',
      },
    },
    {
      "selector": "edge:selected,edge.highlighted",
      "css":
      {
        "color": "rgb(255,255,128)", // label color
        "line-color": "rgb(255,255,128)",
        'mid-target-arrow-color': 'rgb(255,255,128)',
      },
    },
  ];

export {colorschemenight};
