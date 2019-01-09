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
  [`edge[p!='http://www.w3.org/2000/01/rdf-schema#subClassOf']`,`non-subClassOf`],
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
    input.classList.add("filterbox");
    input.autocomplete="off";
    input.checked="true";
    this.label=label;
    this.a = document.createElement("a");
    this.a.classList.add("dropdown-entry");
    this.a.appendChild(input);
    this.a.appendChild(document.createTextNode(label));
    this.cssClass = `filter-${label}`;
    this.visible = true;
    //this.cssVar = `${this.cssClass}-display`;
    cy.elements(selector).addClass(this.cssClass);
    input.addEventListener("input",()=>this.setVisible(input.checked));
    filters.push(this);
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
    if(this.visible===visible) {return;}
    this.visible=visible;

    this.cy.style().selector("*").style("display","element");

    const hiddenSelectors = filters.filter(f => !f.visible).map(f => f.selector);
    if(hiddenSelectors.length===0)
    {
      this.cy.style().update();
      return;
    }
    const hiddenSelector = hiddenSelectors.reduce((a,b)=>a+ ',' +b);

    this.cy.style().selector(hiddenSelector).style("display","none").update();
  }
}

/**
Add filter entries to the filter menu.
@param {cytoscape} cy the cytoscape graph
@param {Element} parent the parent element to attach the entries to
*/
function addFilterEntries(cy, parent)
{
  for(const datum of filterData)
  {
    const filter = new Filter(cy,datum[0],datum[1]);
    parent.appendChild(filter.a);
  }
}

export default addFilterEntries;
