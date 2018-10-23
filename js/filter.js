/**
Filters let the user toggle groups of graph elements, for example all nodes from the meta subontology.
Filters use the Cytoscape.js "display" attribute, while star operations (see graph.js) and reset style use the visibility attribute.
This ensures that filters and star operations interact properly, for example that resetting the style does not show filtered nodes.
See http://js.cytoscape.org/#style/visibility.

@module
*/
import timer from "./timer.js";
import * as log from "./log.js";
import * as NODE from "./node.js";

const filterData = [
  [`node[${NODE.PREFIX}='meta']`,`meta`],
  [`node[${NODE.PREFIX}='bb']`,`BB`],
  [`node[${NODE.PREFIX}='ob']`,`OB`],
  [`node[${NODE.PREFIX}='ciox']`,`CioX`],
  [`node[${NODE.PREFIX}='he']`,`HE`],
  [`node[${NODE.PREFIX}='it']`,`IT`],
  [`node[${NODE.PREFIX}='it4it']`,`IT4IT`],
  [`node[${NODE.SUBTOP}='${NODE.SUBTOP_ENTITY_TYPE}']`,`EntityType`],
  [`node[${NODE.SUBTOP}='${NODE.SUBTOP_ROLE}']`,`Role`],
  [`node[${NODE.SUBTOP}='${NODE.SUBTOP_FUNCTION}']`,`Function`],
  [`edge[p='http://www.w3.org/2000/01/rdf-schema#subClassOf']`,`subClassOf`],
  [`edge[p^='http://www.w3.org/2004/02/skos/core#']`,`inter-ontology-relations`],
  [`edge[p!^='http://www.w3.org/2004/02/skos/core#']`,`non-inter-ontology-relations`],
  //["edge[p='http://www.snik.eu/ontology/meta/subTopClass']","subTopClass"],
  //["node[consolidated<=0]","unverified"]
];

const filters = [];

/**
Toggles the visibility of a set of nodes defined by a selector.
*/
class Filter
{
  /**
  Creates filter with HTML elements, filter functionality and listeners.
  @param {cytoscape} cy the cytoscape graph
  @param {string} selector a Cytoscape.js selector, see {@link http://js.cytoscape.org/#selectors}
  @param {string} label the menu entry label
  */
  constructor(cy,selector,label)
  {
    this.cy=cy;
    this.selector=selector;
    //let input = document.createRange().createContextualFragment('<input type="checkbox" class="filterbox" autocomplete="off" checked="true">'); // can't attach events to fragments
    const input = document.createElement("input");
    input.type="checkbox";
    input.class="filterbox";
    input.autocomplete="off";
    input.checked="true";
    this.visible=true;
    this.elements=null;
    this.label=label;
    this.a = document.createElement("a");
    this.a.classList.add("dropdown-entry");
    this.a.appendChild(input);
    this.a.appendChild(document.createTextNode(label));
    input.addEventListener("input",()=>this.setVisible(input.checked));
    // don't add this filter to filters yet because it is not active anyways
  }

  /** label */
  toString() {return this.label;}

  /**
  Set the visibility of the nodes selected by the filter.
  @param {boolean} visible
  */
  setVisible(visible)
  {
    if(this.visible===visible) {return;} // no change
    this.visible=visible;

    if(this.elements===null) // first time, lazy init
    {
      filters.push(this); // the others need to know about this one now
      const initTimer = timer("Initializing filter "+this.label);
      this.elements = this.cy.elements(this.selector);
      this.elements = this.elements.union(this.elements.connectedEdges());
      initTimer.stop();
    }
    if(visible)
    {
      // this.elements.show(); alone could break other filters
      // only show elements that aren't hidden by another filter
      const visibleTimer = timer("Set visible filter "+this.label);
      let visibleElements = this.cy.collection(this.elements);
      for(const filter of filters)
      {
        if(filter.visible) {continue;}
        if(!filter.elements) {throw new Error("filter does not have elements "+filter);}
        // we don't have to check if it's different from this filter because this one is active and those aren't
        visibleElements=visibleElements.difference(filter.elements);
      }
      //visibleElements.show();
      visibleElements.style("display","element");
      visibleTimer.stop();
      log.trace(`filter ${this.label} ${visibleElements.size()} shown, (${visibleElements.nodes().size()} nodes) `+
                  `of ${this.elements.size()} filter elements, `+
                   `${this.elements.size()-visibleElements.size()} prevented by other filters.`);
    }
    else
    {
      const hiddenTimer = timer("Set hidden filter "+this.label);
      // not analogously to the other case, one filter is enough to hide
      // would be nice to know however, how many of them were already hidden for debug
      //this.elements.hide();
      this.elements.style("display","none"); // hides its connecting edges, see https://github.com/cytoscape/cytoscape.js/issues/1544.
      hiddenTimer.stop();
      log.trace("filter "+this.label+" "+this.elements.size()+" hidden");
    }
  }
}

/**
Add filter entries to the filter menu.
@param {cytoscape} cy the cytoscape graph
@param {Element} parent the parent element to attach the entries to
*/
function addFilterEntries(cy, parent)
{
  for(const filter of filterData)
  {
    parent.appendChild(new Filter(cy,filter[0],filter[1]).a);
  }
}

export default addFilterEntries;
