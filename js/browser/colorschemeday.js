/** Standard dark mode Cytoscape color scheme.
@module
*/
import * as EDGE from "../edge.js";

const colorschemeday =
  [
    {
      "selector": "node",
      "css":
      {
        "border-color": "rgb(0,0,0)",
        "background-color": "rgb(254,196,79)",
        'color': 'black',
      },
    },
    {
      "selector": "node[prefix='ciox']",
      "css": {"background-color": "rgb(80,255,250)"},
    },
    {
      "selector": "node[prefix='meta']",
      "css": {"background-color": "rgb(255,80,80)"},
    },
    {
      "selector": "node[prefix='ob']",
      "css": {"background-color": "rgb(255,173,30)"},
    },
    {
      "selector": "node[prefix = 'bb']",
      "css": {"background-color": "rgb(30,152,255)"},
    },
    {
      "selector": "node[prefix='he']",
      "css": {"background-color": "rgb(150,255,120)"},
    },
    {
      "selector": "node[prefix='it']",
      "css": {"background-color": "rgb(204, 0, 204)"},
    },
    {
      "selector": "node[prefix='it4it']",
      "css": {"background-color": "rgb(255, 255, 0)"},
    },
    {
      "selector": "node:selected",
      "css":
      {
        "background-color": "rgb(0,0,255)",
      },
    },
    {
      "selector": "node.source",
      "css":
      {
        "border-color": "rgb(128,0,128)",
      },
    },
    {
      "selector": "node.target",
      "css":
      {
        "border-color": "rgb(0,165,165)",
      },
    },
    {
      "selector": "edge[!selected]",
      "css":
      {
        "opacity": 0.4,
        'line-color': function(edge)
        {
        // highlight skos interlinks
          if((String(edge.data(EDGE.PROPERTY)).substring(0,36))==='http://www.w3.org/2004/02/skos/core#')
          {
            return "rgb(160,150,10)";
          }
          return "rgb(89,89,89)";
        },
      },
    },
    {
      "selector": "edge.starmode",
      "css":
      {
        'color': 'rgb(3,3,3)', // label color
        'mid-target-arrow-color': 'rgb(89,89,89)',
      },
    },
    {
      "selector": "edge:selected,edge.highlighted",
      "css":
      {
        "color": "rgb(0,0,128)", // label color
        "line-color": "rgb(0,0,128)",
        'mid-target-arrow-color': 'rgb(0,0,128)',
      },
    },
  ];

export {colorschemeday};
