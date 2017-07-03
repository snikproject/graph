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
  ["node[name='http://www.snik.eu/ontology/meta/EntityType']","EntityType"],
  ["node[name='http://www.snik.eu/ontology/meta/Role']","Role"],
  ["node[name='http://www.snik.eu/ontology/meta/Function']","Function"],
  ["edge[interaction='http://www.w3.org/2000/01/rdf-schema#subClassOf']","subClassOf"],
  ["edge[interaction^='http://www.w3.org/2004/02/skos/core#']","inter-ontology-relations"],
  ["edge[interaction!^='http://www.w3.org/2004/02/skos/core#']","non-inter-ontology-relations"],
  ["edge[interaction='http://www.snik.eu/ontology/meta/subTopClass']","subTopClass"],
  ["node[consolidated<=0]","unverified"]
];

class Filter
{
  constructor(cy,selector,label)
  {
    this.cy=cy;
    this.selector=selector;
    //let input = document.createRange().createContextualFragment('<input type="checkbox" class="filterbox" autocomplete="off" checked="true">'); // can't attach events to fragments
    const input = document.createElement("input");
    input.setAttribute("type","checkbox");
    input.setAttribute("class","filterbox");
    input.setAttribute("autocomplete","off");
    input.setAttribute("checked","true");
    this.span = document.createElement("span");
    this.span.appendChild(input);
    this.span.appendChild(document.createTextNode(label));
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

export default function addFilterEntries(cy, parent)
{
  for(const filter of filters)
  {
    parent.appendChild(new Filter(cy,filter[0],filter[1]).span);
  }
  // TODO: add custom filter
  //'http://www.snik.eu/ontology/meta/Top']" id="customfilter"
  //<input type="checkbox" class="filterbox" onclick="this.value=document.getElementById('customfilter').value;graph.filter(this);"/>custom filter</span>
}
