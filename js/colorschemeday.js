/** Daytime color scheme (dark on white).
All colors are inverted because an inversion filter will be applied to the canvas when this scheme is active so that elements are effected that cannot be changed via a Cytoscape color scheme.
@module
*/

var colorschemeday =
  [
    {
      "selector": "node",
      "css":
      {
        "border-color": "rgb(255,255,255)",
        "background-color": "rgb(254,196,79)",
        'color': 'white',
      },
    },
    {
      "selector": "node[prefix='ciox']",
      "css":
      {
        "background-color": "rgb(175,0,5)",
      },
    },
    {
      "selector": "node[prefix='meta']",
      "css":
      {
        "background-color": "rgb(0,170,170)",
      },
    },
    {
      "selector": "node[prefix='ob']",
      "css":
      {
        "background-color": "rgb(0,82,225)",
      },
    },
    {
      "selector": "node[prefix = 'bb']",
      "css":
      {
        "background-color": "rgb(225,103,0)",
      },
    },
    {
      "selector": "node[prefix='he']",
      "css":
      {
        "background-color": "rgb(105,0,130)",
      },
    },
    {
      "selector": "node[prefix='it']",
      "css": {"background-color": "rgb(51, 255, 51)"},
    },
    {
      "selector": "node[prefix='it4it']",
      "css": {"background-color": "rgb(0, 0, 255)"},
    },
    {
      "selector": "node:selected",
      "css":
      {
        "background-color": "rgb(255,255,0)",
      },
    },
    {
      "selector": "node.source",
      "css":
      {
        "border-color": "rgb(128,255,128)",
      },
    },
    {
      "selector": "node.target",
      "css":
      {
        "border-color": "rgb(255,90,90)",
      },
    },
    {
      "selector": "edge[!selected]",
      "css":
      {
        "opacity": 0.5,
        'line-color': function(edge)
        {
        // highlight skos interlinks
          if((String(edge.data('interaction')).substring(0,36))==='http://www.w3.org/2004/02/skos/core#')
          {
            return "rgb(255,128,128)";
          }
          return "rgb(128,128,128)";
        },
      },
    },
    {
      "selector": "edge.selected",
      "css":
      {
        "color": "rgb(255,255,128)",
        "line-color": "rgb(255,255,128)",
      },
    },
    {
      "selector": "edge.highlighted",
      "css":
      {
        'color': 'rgb(128,255,128)',
        'line-color': 'rgb(128,255,128)',
      },
    },
  ];

export {colorschemeday};
