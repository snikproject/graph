/**
Filters let the user toggle groups of graph elements, for example all nodes from the meta subontology.
@module 
*/
const filters = [
  ["node[prefix='meta']","meta"],
  ["node[prefix='bb']","BB"],
  ["node[prefix='ob']","OB"],
  ["node[prefix='ciox']","CioX"],
  ["node[prefix='he']","HE"],
  ["node[prefix='it']","IT"],
  ["node[prefix='it4it']","IT4IT"],
  ["node[st='EntityType']","EntityType"],
  ["node[st='Role']","Role"],
  ["node[st='Function']","Function"],
  ["edge[p='http://www.w3.org/2000/01/rdf-schema#subClassOf']","subClassOf"],
  ["edge[p^='http://www.w3.org/2004/02/skos/core#']","inter-ontology-relations"],
  ["edge[p!^='http://www.w3.org/2004/02/skos/core#']","non-inter-ontology-relations"],
  //["edge[p='http://www.snik.eu/ontology/meta/subTopClass']","subTopClass"],
  //["node[consolidated<=0]","unverified"]
];

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
    this.a = document.createElement("a");
    this.a.classList.add("dropdown-entry");
    this.a.appendChild(input);
    this.a.appendChild(document.createTextNode(label));
    input.addEventListener("input",()=>this.setVisibility(input.checked));
  }

  /**
  Set the visibility of the nodes selected by the filter.
  @param {boolean} visibility
  */
  setVisibility(visibility)
  {
    if(!this.filtered)
    {
      this.filtered = this.cy.elements(this.selector);
      this.filtered = this.filtered.union(this.filtered.connectedEdges());
    }
    if(visibility) {this.filtered.show();}
    else
    {
      this.filtered.hide();
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
  for(const filter of filters)
  {
    parent.appendChild(new Filter(cy,filter[0],filter[1]).a);
  }
}

export default addFilterEntries;
