// Cytoscape CSS style file
// intended for inverted view
var colorschemeday =
  [
    {
      "selector": "node",
      "css":
      {
        "border-color": "rgb(255,255,255)",
        "background-color": "rgb(254,196,79)",
        'color': 'white'
      }
    },
    {
      "selector": "node[source='ciox']",
      "css":
      {
        "background-color": "rgb(175,0,5)",
      }
    },
    {
      "selector": "node[source='meta']",
      "css":
      {
        "background-color": "rgb(0,170,170)",
      }
    },
    {
      "selector": "node[source='ob']",
      "css":
      {
        "background-color": "rgb(0,82,225)",
      }
    },
    {
      "selector": "node[src = 'bb']",
      "css":
      {
        "background-color": "rgb(225,103,0)",
      }
    },
    {
      "selector": "node[source='he']",
      "css":
      {
        "background-color": "rgb(105,0,130)",
      }
    },
    {
      "selector": "node:selected",
      "css":
      {
        "background-color": "rgb(255,255,0)"
      }
    },
    {
      "selector": "node.source",
      "css":
      {
        "border-color": "rgb(128,255,128)"
      }
    },
    {
      "selector": "node.target",
      "css":
      {
        "border-color": "rgb(255,90,90)",
      }
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
      }
    },
    {
      "selector": "edge.selected",
      "css":
      {
        "color": "rgb(255,255,128)",
        "line-color": "rgb(255,255,128)",
      }
    },
    {
      "selector": "edge.highlighted",
      "css":
      {
        'color': 'rgb(128,255,128)',
        'line-color': 'rgb(128,255,128)',
      }
    },
  ];

export {colorschemeday};
