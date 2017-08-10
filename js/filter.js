/**
Filters let the user toggle groups of graph elements, for example all nodes from the meta subontology.
*/

const filters = [
  ["node[prefix='meta']","meta"],
  ["node[prefix='bb']","BB"],
  ["node[prefix='ob']","OB"],
  ["node[prefix='ciox']","CioX"],
  ["node[prefix='he']","HE"],
  ["node[prefix='it4it']","IT4IT"],
  ["node[st='EntityType']","EntityType"],
  ["node[st='Role']","Role"],
  ["node[st='Function']","Function"],
  ["edge[p='http://www.w3.org/2000/01/rdf-schema#subClassOf']","subClassOf"],
  ["edge[p^='http://www.w3.org/2004/02/skos/core#']","inter-ontology-relations"],
  ["edge[p!^='http://www.w3.org/2004/02/skos/core#']","non-inter-ontology-relations"],
  ["edge[p='http://www.snik.eu/ontology/meta/subTopClass']","subTopClass"],
  //["node[consolidated<=0]","unverified"]
];

class Filter
{
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
    input.addEventListener("input",()=>this.setVisible(input.checked));
  }

  setVisible(visible)
  {
    if(!this.filtered)
    {
      this.filtered = this.cy.elements(this.selector);
      this.filtered = this.filtered.union(this.filtered.connectedEdges());
    }
    if(visible) {this.filtered.show();}
    else
    {
      this.filtered.hide();
    }
  }
}

function addFilterEntries(cy, parent)
{
  for(const filter of filters)
  {
    parent.appendChild(new Filter(cy,filter[0],filter[1]).a);
  }
  // TODO: add custom filter
  //'http://www.snik.eu/ontology/meta/Top']" id="customfilter"
  //<input type="checkbox" class="filterbox" onclick="this.value=document.getElementById('customfilter').value;graph.filter(this);"/>custom filter</span>
}

export default addFilterEntries;
