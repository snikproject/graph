/**
Cytoscape style file, excluding color information, which is contained in the color schemes.
@see colorSchemeDay
@see colorSchemeNight
@module */

import * as NODE from "./node.js";
import * as EDGE from "./edge.js";

const style =
  {
    'format_version': '1.0',
    'generated_by': 'cytoscape-3.4.0',
    'target_cytoscapejs_version': '~2.1',
    'title': 'MyStyle1',
    'style': [
      {
        'selector': 'node',
        'css':
        {
          'min-zoomed-font-size': 5,
          'width': 'mapData(degree,0,39,51,250)',
          'height': 'mapData(degree,0,39,51,250)',
          //"height" : 88.5,
          'text-valign': 'center',
          'text-halign': 'center',
          'border-opacity': 1.0,
          'border-width': function(node)
          {
            return node.data(NODE.INSTANCE)?1.0:0.0;
          },
          'font-family': 'sans-serif',
          'font-weight': 'normal',
          'background-opacity': 0.5882352941176471,
          'text-opacity': 1.0,
          'shape': function(node)
          {
            switch(node.data(NODE.SUBTOP))
            {
            case NODE.SUBTOP_ENTITY_TYPE: {return 'rectangle';}//EntityType
            case NODE.SUBTOP_ROLE: {return 'ellipse';}//Role
            case NODE.SUBTOP_FUNCTION: {return 'triangle';}//Function
            }
            // the subtops don't have themselves as a subtop but should be shaped as such
            switch(node.data(NODE.ID))
            {
            case 'http://www.snik.eu/ontology/meta/EntityType': {return 'rectangle';}
            case 'http://www.snik.eu/ontology/meta/Role': {return 'ellipse';}
            case 'http://www.snik.eu/ontology/meta/Function': {return 'triangle';}
            default: {return 'hexagon';}
            }
          },
          'label': function(node)
          {
            const SHOW_QUALITY=false;
            let label;
            let it;
            if((it=node.data(NODE.LABEL_ENGLISH))&&it[0])     {label = it[0];}
            else if((it=node.data(NODE.LABEL_GERMAN))&&it[0]) {label = it[0];}
            else if((it=node.data(NODE.LABEL_OTHER))&&it[0])  {label = it[0];}
            else {label = node.data(NODE.ID);}
            if(SHOW_QUALITY) {label+="\n\u25CB\u25CF\u25CB\u25CB\u25CF";}
            if(node.data(NODE.INSTANCE)) {label+="*";}
            return label;
          },
        },
      },
      {
        'selector': 'node.source',
        'css':
        {
          'border-width': 5.0,
        },
      },
      {
        'selector': 'node.target',
        'css':
        {
          'border-width': 5.0,
        },
      },
      // limit node scaling to prevent huge nodes
      {
        'selector': 'node[degree >= 39]',
        'css':
        {
          'font-size': 51,
        },
      },
      {
        'selector': 'node[degree > 0][degree < 39]',
        'css':
        {
          'font-size': 'mapData(degree,0,39,11,51)',
        },
      },
      {
        'selector': 'node[degree = 0]',
        'css':
        {
          'font-size': 11,
        },
      },
      // degree should always be at least 0, so <0 will only occurr erroneously
      {
        'selector': 'node[degree < 0]',
        'css':
        {
          'font-size': 1,
        },
      },
      {
        'selector': 'node.highlighted',
        'css':
        {
          'border-width': 5.0,
        },
      },
      {
        'selector': 'node:selected',
        'css':
              {
                'border-width': 8.0,
              },
      },
      {
        "selector" : "edge",
        "css" : {
          'min-zoomed-font-size': 9,
          'label': function(edge)
          {
            let label = edge.data(EDGE.PROPERTY_LABEL);
            const SHOW_QUALITY=true;
            if(SHOW_QUALITY&&edge.data(EDGE.GRAPH)==="http://www.snik.eu/ontology/limes-exact")
            {label+=" \u26A0";}
            return label;
          },
        },
      },
      {
        'selector': 'edge[!selected]',
        'css':
        {
          'opacity': 0.5,
          'width': 2.0,
          'edge-text-rotation': 'autorotate',
          'text-margin-y': '-1em',
          'text-opacity': 0,
        },
      },
      {
        'selector': 'edge.selected',
        'css':
        {
          'text-opacity': 1,
          'opacity': 1.0,
          'width': 4.0,
          'edge-text-rotation': 'autorotate',
          'text-margin-y': '-1em',
        },
      },
      {
        'selector': 'edge.highlighted',
        'css':
        {
          'opacity': 1.0,
          'text-opacity': 1,
          'mid-target-arrow-color': 'rgb(128,255,128)',
          'mid-target-arrow-shape': 'triangle',
          'width': 4.0,
          'edge-text-rotation': 'autorotate',
          'text-margin-y': '-1em',
        },
      },
    ],
  };

export {style};
