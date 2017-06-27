import * as sparql from "./sparql.js";
import * as graph from "./graph.js";

var consoleEnabled = true;
var consoleFunctions = [];

function disableConsole()
{
  /* eslint-disable no-console */
  consoleFunctions = [console.log,console.trace,console.error];
  if(consoleEnabled)
  {
    console.log = function() {};
    console.trace = function() {};
    console.error = function() {};
  }
  consoleEnabled=false;
  /* eslint-enable no-console */
}

function enableConsole()
{
  /* eslint-disable no-console */
  if(!consoleEnabled)
  {
    console.log = consoleFunctions[0];
    console.trace = consoleFunctions[1];
    console.error = consoleFunctions[2];
  }
  consoleEnabled=true;
  /* eslint-enable no-console */
}

function roleUse(role)
{
  graph.resetStyle();
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
    //console.log(roles);
    const classes = new Set([...roles, ...functions,...entitytypes]);
    const selectedNodes = [];
    const selectedEdges = [];
    for(const c of classes)
    {
      const cNodes = graph.cy.nodes(`node[name='${c}']`);
      selectedNodes.push(cNodes);
      selectedEdges.push(cNodes.connectedEdges());
    }
    graph.remove(graph.cy.nodes());
    for (let i = 0; i < selectedNodes.length; i++)	{selectedNodes[i].restore();}
    for (let i = 0; i < selectedEdges.length; i++)
    {
      // ignore cytoscape warnings for edges with only one endpointin the active nodes
      disableConsole();
      selectedEdges[i].restore();
      enableConsole();
    }
    graph.cy.layout(
      {
        name: 'concentric',
        fit: true,
        levelWidth: function(nodes) {return 1;},
        minNodeSpacing: 2,
        concentric: function(node)
        {
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

    const roleNode = graph.cy.nodes(`node[name='${role}']`);
    graph.cy.center(roleNode);
    graph.cy.fit();
  }
);
}

export {roleUse};
