import * as sparql from "./sparql.js";
import * as graph from "./graph.js";

function roleUse(role)
{
  // TODO dirkekt von
  const query =
  `select distinct ?role ?function ?entitytype
  {
    <${role}> (rdfs:subClassOf|skos:closeMatch)* ?role.
    ?role meta:subTopClass meta:Role.
    #bind (<${role}> as ?role)

    ?role ?p ?function.
    ?function meta:subTopClass meta:Function.
    #?role ?p ?f.
    #?f meta:subTopClass meta:Function.
    #?f (skos:closeMatch|^rdfs:subClassOf)* ?function.

    ?function ?q ?entitytype.
    ?entitytype meta:subTopClass meta:EntityType.
    #?function ?q ?et.
    #?et meta:subTopClass meta:EntityType.
    #?et (skos:closeMatch|^rdfs:subClassOf)* ?entitytype.
  }`;
  sparql.sparql(query,"http://www.snik.eu/ontology").then((json)=>
  {
    const roles = new Set();
    const functions = new Set();
    const entitytypes = new Set();
    for(let i=0;i<json.length;i++)
    {
      roles.add(json[i].role.value);
      functions.add(json[i].function.value);
      entitytypes.add(json[i].entitytype.value);
    }
    console.log(roles);
    const classes = new Set([...roles, ...functions,...entitytypes]);
    const selectedNodes = [];
    const selectedEdges = [];
    for(const c of classes)
    {
      const cNodes = graph.cy.nodes(`node[name='${c}']`);
      selectedNodes.push(cNodes);
      selectedEdges.push(cNodes.connectedEdges());
    }
    graph.cy.remove(graph.cy.nodes());
    for (let i = 0; i < selectedNodes.length; i++)	{selectedNodes[i].restore();}
    for (let i = 0; i < selectedEdges.length; i++)	{selectedEdges[i].restore();}
    graph.cy.layout(
      {
        name: 'concentric',
        fit: true,
        levelWidth: function(nodes) {return 1;},
        minNodeSpacing: 2,
        concentric: function(node)
        {
          //console.log(node.data().st);
          switch(node.data().st)
          {
          case "EntityType": return 1;
          case "Function": return 2;
          case "Role": return 3;
          default: return 3; // temporary workaround for roles without subtop
          }
        },
      }
    ).run();
  }
);
}

export {roleUse};
