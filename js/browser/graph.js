/**
Provides graph operations such as initialization, wayfinding and highlighting.

@module graph*/
/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import {style} from "./style.js";
import {colorschemenight} from "./colorschemenight.js";
import {colorschemeday} from "./colorschemeday.js";
import timer from "../timer.js";
import * as NODE from "../node.js";
import * as util from "./util.js";

export const Direction = Object.freeze({
  IN:   Symbol("in"),
  OUT:  Symbol("out"),
  BOTH: Symbol("both"),
});

/** Cytoscape.js Graph Class with path operations and styling. */
export class Graph
{
  /** Creates a new cytoscape graph, assigns it to the #cy container and sets up basic event listeners. */
  constructor(container)
  {
    // Handles the cytoscape.js canvas. Call initGraph(container) to start.
    /*this.path = null;
    this.pathSource = null;
    this.pathTarget = null;
    this.starMode = false;*/

    const initTimer = timer("graph-init");

    // remove nodes or edges from the graph (not the SPARQL endpoint) with the delete key
    container.addEventListener('keydown',function(e)
    {
      if(e.keyCode === 8 || e.keyCode === 46) // backspace (for mac) or delete key
      {
        this.cy.remove(':selected');
      }
    });

    this.cy = cytoscape(
      {
        container: container,
        style: style.style.concat(colorschemenight),
        wheelSensitivity: 0.3,
        minZoom: 0.02,
        maxZoom: 7,
      });
    this.cy.panzoom(); // Google Maps like zoom UI element
    this.selectedNode = null;
    this.cy.on('select', 'node', function(event)
    {
      this.selectedNode = event.target;
    });

    initTimer.stop();
  }

  /** @returns whether cumulative search is activated. */
  static cumulativeSearch() {return util.getElementById('cumulative-search-checkbox').checked;}

  /** Hides elements using visibility: hidden.
    Do not use this for filters as they use other classes to interact properly with shown and hidden elements.
    @param {cytoscape.Collection} eles the elements to hide */
  static hide(eles)
  {
    eles.addClass('hidden');
    eles.removeClass('highlighted');
  }

  /** Show (unhide) the given elements.
    Do not use this for filters as they use other classes to interact properly with shown and hidden elements.
    @param {cytoscape.Collection} eles the elements to show  */
  static show(eles)
  {
    eles.removeClass('hidden');
  }

  /** Highlight the given elements using the 'highlighted' css class from the color scheme stylesheet and show them.
    @param {cytoscape.Collection} eles the elements to highlight
    */
  static highlight(eles)
  {
    eles.removeClass('hidden');
    eles.addClass('highlighted');
  }

  /**
    @param {cytoscape.Collection} eles the elements to assign the star mode css class to
    */
  static starStyle(eles)
  {
    eles.removeClass('hidden');
    eles.addClass('starmode');
  }

  /** Removes all highlighting (except selection) and shows all hidden nodes. */
  resetStyle()
  {
    this.starMode=false;
    this.cy.startBatch();
    this.cy.elements().removeClass("highlighted");
    this.cy.elements().removeClass("starmode");
    this.cy.elements().removeClass("hidden");
    if(this.pathSource) {this.pathSource.removeClass('source');}
    this.cy.endBatch();
  }

  /** Highlight all nodes and edges on a shortest path between "from" and "to".
    Hide all other nodes except when in star mode.
    @param {cytoscape.NodeSingular} from path start node
    @param {cytoscape.NodeSingular} to path target node
    @param {Boolean} [starPath] whether to show the star around all nodes on the path
    @returns whether a path could be found
    */
  showPath(from, to, starPath)
  {
    const elements = this.cy.elements(".unfiltered");

    const aStar = elements.aStar(
      {
        root: from,
        goal: to,
      });
    const path = aStar.path;
    if (path)
    {
      this.cy.startBatch();
      this.cy.add(path);
      if(starPath)
      {
        const edges = path.connectedEdges(".unfiltered");
        path.merge(edges);
        path.merge(edges.connectedNodes(".unfiltered"));
      }
      Graph.starStyle(path);
      if(!this.starMode)
      {
        this.starMode=true;
        Graph.hide(elements.not(path));
      }
      this.cy.endBatch();
    }
    else
    {
      if(!this.starMode) {this.resetStyle();} // keep it as it was before the path operation
      log.warn("No path found!");
      return false;
    }
    return true;
  }

  /** Highlight the give node and all its directly connected nodes (in both directions).
      Hide all other nodes except when in star mode.
      @param {cytoscape.NodeSingular} node center of the star
      @param {Boolean} [changeLayout=false] arrange the given node and it's close matches in the center and the connected nodes in a circle around them.
      @param {Boolean} [directed=false] only show edges that originate from node, not those that end in it. Optional and defaults to false.  */
  showStar(node, changeLayout, direction)
  {
    this.cy.startBatch();
    // open 2 levels deep on closeMatch
    let inner = node; // if you don't want to include close match, define inner like this
    let closeMatchEdges;
    for(let innerSize = 0; innerSize<inner.size();) // repeat until the close match chain ends
    {
      innerSize=inner.size();
      closeMatchEdges = inner.connectedEdges(".unfiltered").filter('[pl="closeMatch"]');
      inner = inner.union(closeMatchEdges.connectedNodes(".unfiltered")); // in case there is no close match edge
    }
    let edges;
    switch(direction)
    {
      case Direction.IN:
        edges = this.cy.elements(".unfiltered").edgesTo(inner);
        break;
      case Direction.OUT:
        edges = inner.edgesTo('.unfiltered');
        break;
      default:
        edges = inner.connectedEdges(".unfiltered");
    }

    const nodes  = edges.connectedNodes(".unfiltered");
    const star = inner.union(nodes).union(edges);
    // show edges between outer nodes to visible nodes
    const outerNodes = nodes.difference(inner);
    // connect new nodes with all existing unfiltered visible ones
    //show(outerNodes.edgesWith(cy.nodes(".unfiltered").not(".hidden")));

    if(!this.starMode)
    {
      this.starMode=true;
      Graph.hide(this.cy.elements().not(star));
    }

    Graph.starStyle(star);
    const visible = this.cy.nodes(".unfiltered").not(".hidden");
    Graph.starStyle(visible.edgesWith(visible));

    if(changeLayout)
    {
      const sorted = nodes
        .sort((a,b)=>
        {
          const pa = Math.min(a.edgesTo(inner).map(n=>n.data("pl").split('').reduce((na,nb)=>na+nb.charCodeAt(0),0)));
          const pb = Math.min(b.edgesTo(inner).map(n=>n.data("pl").split('').reduce((na,nb)=>na+nb.charCodeAt(0),0)));
          return pa-pb;
        });

      sorted.layout(
        {
          name: 'concentric',
          fit: true,
          levelWidth: function() {return 1;},
          minNodeSpacing: 175,
          concentric: function(layoutNode)
          {
            if(inner.contains(layoutNode)) {return 2;}
            if(outerNodes.contains(layoutNode)) {return 1;}
            throw new Error("unexpected node in star");
          },
        }
      ).run();
    }

    this.cy.endBatch();
  }

  /** Show a "spider worm" between two nodes, which combines a star around "from" with a shortest path to "to".
      Hide all other nodes except when in star mode.
      @param {cytoscape.NodeSingular} from path start node
      @param {cytoscape.NodeSingular} to path target node, gets a "star" around it as well
      @returns whether a path could be found
      */
  showWorm(from, to)
  {
    if(this.showPath(from, to))
    {
      this.showStar(to);
      return true;
    }
    return false;
  }

  /** Highlight the given two nodes, directly connected nodes (in both directions) of both of them and a shortest path between the two.
      Hide all other nodes except when in star mode.
      @param {cytoscape.NodeSingular} from path start node
      @param {cytoscape.NodeSingular} to path target node
      @returns whether a path could be found
      */
  showDoubleStar(from, to)
  {
    if(this.showPath(from, to))
    {
      this.showStar(to);
      this.showStar(from);
      return true;
    }
    return false;
  }

  /** Returns the start node for all path operations
      @returns the start node for all path operations, or null if none exists. */
  getSource()
  {
    if(this.pathSource) {return this.pathSource;}
    if(this.selectedNode) {return this.selectedNode;}
    return null;
  }

  /** Set the given node as source for all path operations.
      @param {cytoscape.NodeSingular} node the new source
      @returns whether node is not null
      */
  setSource(node)
  {
    if(!node) {return false;}
    if(this.pathTarget)
    {
      this.cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
    }
    if(this.pathSource) {this.pathSource.removeClass('source');}
    this.pathSource = node;
    this.pathSource.addClass('source');
    return true;
  }

  /** Inverts the screen colors in the canvas for day mode. Uses an inverted node js style file to keep node colors.
      @param {boolean} enabled whether the canvas colors should be inverted
      */
  invert(enabled)
  {
    if (enabled)
    {
      this.cy.style.backgroundColor = "white";
      this.cy.style().fromJson(style.style.concat(colorschemeday)).update();
    }
    else
    {
      this.cy.style.backgroundColor = "black";
      this.cy.style().fromJson(style.style.concat(colorschemenight)).update();
    }
  }

  /**Centered and highlighted the given URI.
      * @param {String} uri The URI of a class in the graph. */
  presentUri(uri)
  {
    this.cy.zoom(0.6);
    const nodes = this.cy.elements().nodes().filter(`node[id= "${uri}"]`);
    if(nodes.length<1)
    {
      log.warn(`Class not in graph. ${uri} may be available on the SPARQL endpoint but not in the graph.`);
      return false;
    }
    const node = nodes[0];
    if(!nodes.visible())
    {
      log.warn(`Class not visible. ${uri} is not visible. Please adjust filters. `);
      return false;
    }
    if(!this.cumulativeSearch()) {this.resetStyle();}

    Graph.highlight(nodes);
    this.cy.center(node);
  }

  /** @return {Set<string>} Classes to show. */
  presentUris(classes, hideOthers)
  {
    if(classes.length<1)
    {
      log.warn("All search results are only available on the SPARQL endpoint but not in the graph.");
      return;
    }
    if(!this.cumulativeSearch()) {this.resetStyle();}

    const resultNodes = this.cy.elements().nodes().filter((node)=>
    {
      return classes.has(node.data(NODE.ID));
    });
    if(hideOthers)
    {
      Graph.hide(this.cy.elements());
      Graph.show(resultNodes.edgesWith(resultNodes));
      this.setStarMode(true);
    }
    Graph.highlight(resultNodes);
    this.cy.fit(this.cy.elements(".highlighted"));
  }
}
