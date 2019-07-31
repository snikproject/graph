/**
Creates the circular context menu that can be opened on top of an edge.
@module */
import * as graph from "./graph.js";
import * as rdf from "../rdf.js";
import * as util from "./util.js";
import * as EDGE from "../edge.js";
import * as language from "../lang/language.js";
import {logWrap,menuDefaults} from "./contextmenuUtil.js";

/** Creates a human readable string of the triple an edge represents. */
function edgeLabel(edge) {return rdf.short(edge.data(EDGE.SOURCE)) +" "+ rdf.short(edge.data(EDGE.PROPERTY)) +" "+ rdf.short(edge.data(EDGE.TARGET));}

//collection of common edge commands to use in baseMenu and defaultsLimesRelations
const baseCommands = [
  {
    content: 'edit / report',
    select: (edge)=>util.createGitHubIssue(util.REPO_ONTOLOGY,edgeLabel(edge),'The edge "'+edgeLabel(edge)+'" is incorrect.\n\n**Details**\n'),
  },
  {
    content: 'hide',
    select: (edge)=>graph.hide(edge),
  },
  {
    content: 'description (if it exists)',
    select: node=>
    {
      if(node.data(EDGE.AXIOM)) {window.open(node.data(EDGE.AXIOM));}
      else {log.warn("There is no description for this edge.");}
    },
  },
];
//collection of expert edge commands to use in devMenu and baseLimesMenu
const devCommands = [
  {
    content: 'remove permanently',
    select: function(edge)
    {
      graph.cy.remove(edge);
      const body = `Please permanently delete the edge ${edgeLabel(edge)}:
\`\`\`
sparql
DELETE DATA FROM <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`
Undo with
\`\`\`
sparql
INSERT DATA INTO <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`
${language.CONSTANTS.SPARUL_WARNING}`;
      util.createGitHubIssue(util.REPO_ONTOLOGY,edgeLabel(edge),body);
    },
  },
  {
    // Open the source class of the triple in OntoWiki because you can edit the triple there.
    content: 'OntoWiki',
    select: function(edge)
    {
      window.open('https://www.snik.eu/ontowiki/view/?r='+edge.data(EDGE.SOURCE)+"&m="+rdf.sub(edge.data(EDGE.SOURCE)));
    },
  },
  {
    content: 'debug',
    select: function(edge)
    {
      alert(JSON.stringify(edge.data(),null,2));
    },
  },
];

const limesCommands =
[
  {
    content: 'confirm limes link',
    select: function(edge)
    {
      edge.data(EDGE.GRAPH,"http://www.snik.eu/ontology/match");
      const body = `Please confirm the automatic interlink ${edgeLabel(edge)}:
\`\`\`
sparql
DELETE DATA FROM <http://www.snik.eu/ontology/limes-exact>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
INSERT DATA INTO <http://www.snik.eu/ontology/match>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`
Undo with
\`\`\`
sparql
DELETE DATA FROM <http://www.snik.eu/ontology/match>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
INSERT DATA INTO <http://www.snik.eu/ontology/limes-exact>
{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
\`\`\`
${language.CONSTANTS.SPARUL_WARNING}`;
      util.createGitHubIssue(util.REPO_ONTOLOGY,edgeLabel(edge),body);
    },
  },
];

/** Context menu for edges in base mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta relations, such as meta:updates.
Offers base commands.*/
const baseMenu = Object.assign(menuDefaults(),
  {
    menuRadius: 100, // the radius of the circular menu in pixels
    selector: `edge[${EDGE.GRAPH} != "http://www.snik.eu/ontology/limes-exact"]`, // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands: baseCommands,
  });

/** Context menu for edges in base mode that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph.
Offers base and confirm commands.*/
const baseLimesMenu = Object.assign(menuDefaults(),
  {
    menuRadius: 150,
    selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`,
    commands: baseCommands.concat(limesCommands),
  });

/** Context menu for edges in development mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta relations, such as meta:updates.
    Offers base and development commands.*/
const devMenu = Object.assign(menuDefaults(),
  {
    menuRadius: 150,
    selector: `edge[${EDGE.GRAPH} != "http://www.snik.eu/ontology/limes-exact"]`,
    commands: baseCommands.concat(devCommands),
  });

/** Context menu for edges in development mode that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph.
  Offers base, development and confirm commands.*/
const devLimesMenu = Object.assign(menuDefaults(),
  {
    menuRadius: 150,
    selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`,
    commands: baseCommands.concat(devCommands,limesCommands),
  });

/** Register modular edge context menu. Does have additional functionality in development mode but not in extended mode.
@param {boolean} dev whether development mode is activated.
*/
export default function edgeMenus(dev)
{
  if(dev) {return [devMenu,devLimesMenu];}
  return [baseMenu,baseLimesMenu];
}

[...baseCommands,...limesCommands,...devCommands].forEach((cmd)=>
  logWrap(cmd,(edge)=>`edge with property ${edge.data(EDGE.PROPERTY)} between ${edge.data(EDGE.SOURCE)} ${edge.data(EDGE.TARGET)}`));
