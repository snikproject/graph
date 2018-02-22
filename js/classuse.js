/**
Show the environment of a single node using a special layout.
@module */
import * as sparql from "./sparql.js";
import * as graph from "./graph.js";

/**
Centers a role and shows directly and indirectly connected roles, functions and entity types in a concentric layout.
Hides all other nodes. Resetting the view unhides the other nodes but keeps the layout of those shown before.
Recalculate the layout to place those nodes in relation to the whole graph again.
@param {string} The URI of the role.
*/
function roleUse(role)
{
  graph.resetStyle();
  graph.setStarMode(true);
  // TODO direkt von
  const query =
  `select distinct ?role ?function ?et ?etx
  {
    <${role}> (rdfs:subClassOf|skos:closeMatch|^skos:closeMatch)* ?role.
    ?role meta:subTopClass meta:Role.
    #bind (<${role}> as ?role)

    OPTIONAL
    {
      ?role ?p ?function.
      ?function meta:subTopClass meta:Function.
      #?role ?p ?f.
      #?f meta:subTopClass meta:Function.
      #?f (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)* ?function.

      OPTIONAL
      {
        #?function ?q ?et
        #?et meta:subTopClass meta:EntityType.
        ?function ?q ?et.
        ?et meta:subTopClass meta:EntityType.
        OPTIONAL {?et (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)+ ?etx.}
      }
    }
  }`;
  sparql.sparql(query,"http://www.snik.eu/ontology").then((json)=>
  {
    const roles = new Set();
    const functions = new Set();
    const ets = new Set();
    const etxs = new Set();

    for(let i=0;i<json.length;i++)
    {
      roles.add(json[i].role.value);
      if(json[i].function) {functions.add(json[i].function.value);}
      if(json[i].et) {ets.add(json[i].et.value);}
      if(json[i].etx) {etxs.add(json[i].etx.value);}
    }
    //console.log(roles);
    const classes = new Set([...roles, ...functions,...ets,...etxs]);
    let selectedNodes = graph.cy.nodes("node[noth='ing']");
    //let selectedEdges = graph.cy.nodes("node[noth='ing']");
    for(const c of classes)
    {
      const cNodes = graph.cy.nodes(`node[name='${c}']`);
      selectedNodes = selectedNodes.union(cNodes);
      //selectedEdges = selectedEdges.union(cNodes.connectedEdges());
    }
    graph.hideNodes(graph.cy.nodes());
    for (let i = 0; i < selectedNodes.length; i++)	{graph.showNodes(selectedNodes[i]);/*selectedNodes[i].restore();*/}
    /*
    for (let i = 0; i < selectedEdges.length; i++)
    {
      // ignore cytoscape warnings for edges with only one endpointin the active nodes
      disableConsole();
      selectedEdges[i].restore();
      enableConsole();
    }
    */
    selectedNodes.layout(
      {
        name: 'concentric',
        fit: true,
        levelWidth: function() {return 1;},
        minNodeSpacing: 20,
        concentric: function(node)
        {
          const uri = node.data().name;
          if(uri===role) {return 10;}
          if(roles.has(uri)) {return 9;}
          if(functions.has(uri)) {return 8;}
          if(ets.has(uri)) {return 7;}
          if(etxs.has(uri)) {return 6;}
          return 10; // temporary workaround for roles without subtop
          /*
          // faster but can't discern expanded entity types from directly connected ones
          switch(node.data().st)
          {
          case "EntityType": return 1;
          case "Function": return 2;
          case "Role": return 3;
          default: return 3; // temporary workaround for roles without subtop
          }
          */
        },
      }
    ).run();

    const roleNode = graph.cy.nodes(`node[name='${role}']`);
    graph.cy.center(roleNode);
    graph.cy.fit(selectedNodes);
  }
  );
}

export {roleUse};
