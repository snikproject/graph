/**
Creates the circular context menu that can be opened on top of an edge.
@module */
import * as rdf from "../rdf.js";
import * as util from "./util.js";
import * as EDGE from "../edge.js";
import * as language from "../lang/language.js";
import {Graph} from "./graph.js";
import {logWrap,menuDefaults,ontoWikiUrl} from "./contextmenuUtil.js";

export default class ContextMenuEdges
{
  /** Register modular edge context menu. Does have additional functionality in development mode but not in extended mode.
  @param {Graph} graph the graph that the context menu operates on
  @param {boolean} dev whether development mode is activated.
  */
  constructor(graph,dev)
  {
    const commands = {baseCommands: this.baseCommands(), limesCommands: this.limesCommands(), devCommands: this.devCommands()};

    Object.values(commands).flat().forEach((cmd)=>
      logWrap(cmd,(edge)=>`edge with property ${edge.data(EDGE.PROPERTY)} between ${edge.data(EDGE.SOURCE)} ${edge.data(EDGE.TARGET)}`));

    if(dev) {this.menus = [ContextMenuEdges.devMenu(commands),ContextMenuEdges.devLimesMenu(commands)];}
    else {this.menus= [ContextMenuEdges.baseMenu(commands),ContextMenuEdges.baseLimesMenu(commands)];}
  }

  /** Context menu for edges in base mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta properties, such as meta:updates.
  Offers base commands.
  @param {object} commands the commands object containing all command types
  @return {object} the base menu */
  static baseMenu(commands)
  {
    return Object.assign(menuDefaults(),
      {
        menuRadius: 120, // the radius of the circular menu in pixels
        selector: `edge[${EDGE.GRAPH} != "http://www.snik.eu/ontology/limes-exact"]`, // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: commands.baseCommands,
      });
  }

  /** Context menu for edges in base mode that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph.
  Offers base and confirm commands.
    @param {object} commands the commands object containing all command types
  @return {object} the base and limes menu */
  static baseLimesMenu(commands)
  {
    return Object.assign(menuDefaults(),
      {
        menuRadius: 170,
        selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`,
        commands: commands.baseCommands.concat(commands.limesCommands),
      });
  }

  /** Context menu for edges in development mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta relations, such as meta:updates.
  Offers base and development commands.
  @param {object} commands the commands object containing all command types
  @return {object} the base and dev menu */
  static devMenu(commands)
  {
    return Object.assign(menuDefaults(),
      {
        menuRadius: 170,
        selector: `edge[${EDGE.GRAPH} != "http://www.snik.eu/ontology/limes-exact"]`,
        commands: commands.baseCommands.concat(commands.devCommands),
      });
  }

  /** Context menu for edges in development mode that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph.
  Offers base, development and confirm commands.
  @param {object} commands the commands object containing all command types
  @return {object} the base, dev and limes menu */
  static devLimesMenu(commands)
  {
    return Object.assign(menuDefaults(),
      {
        menuRadius: 170,
        selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`,
        commands: commands.baseCommands.concat(commands.devCommands,commands.limesCommands),
      });
  }

  /** Creates a human readable string of the triple that an edge represents.
   *  @param {cytoscape.EdgeSingular} edge the edge, whose label is determined
   *  @return {string} a human readable string of the triple that an edge represents. */
  edgeLabel(edge) {return rdf.short(edge.data(EDGE.SOURCE)) +" "+ rdf.short(edge.data(EDGE.PROPERTY)) +" "+ rdf.short(edge.data(EDGE.TARGET));}

  /** collection of common edge commands to use in baseMenu and defaultsLimesRelations
   *  @return {Array} the base commands*/
  baseCommands()
  {
    return [
      {
        content: 'edit / report',
        id: "edit",
        select: (edge)=>
        {
          const body = `Problem with the edge [${this.edgeLabel(edge)}](${edge.data(EDGE.SOURCE)}) ([OntoWiki URL](${ontoWikiUrl(edge.data(EDGE.SOURCE))})):\n\n`;
          util.createGitHubIssue(util.REPO_ONTOLOGY,this.edgeLabel(edge),body);
        },
      },
      {
        content: 'hide',
        id: "hide",
        select: (edge)=>Graph.setVisible(edge,false),
      },
      {
        content: 'description (if it exists)',
        id: "description",
        select: node=>
        {
          if(node.data(EDGE.AXIOM)) {window.open(node.data(EDGE.AXIOM));}
          else {log.warn("There is no description for this edge.");}
        },
      },
    ];
  }

  /** collection of expert edge commands to use in devMenu and baseLimesMenu
   *  @return {Array} the dev commands*/
  devCommands()
  {
    return [
      {
        content: 'remove permanently',
        id: "remove-permanently",
        select: function(edge)
        {
          this.graph.cy.remove(edge);
          const body = `Please permanently delete the edge ${this.edgeLabel(edge)}:
          \`\`\`\n
          sparql
          DELETE DATA FROM <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          \n\`\`\`
          Undo with
          \`\`\`\n
          sparql
          INSERT DATA INTO <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          \n\`\`\`
          ${language.CONSTANTS.SPARUL_WARNING}`;
          util.createGitHubIssue(util.REPO_ONTOLOGY,this.edgeLabel(edge),body);
        },
      },
      {
        // Open the source class of the triple in OntoWiki because you can edit the triple there.
        content: 'OntoWiki',
        id: "ontowiki",
        select: function(edge)
        {
          window.open(ontoWikiUrl(edge.data(EDGE.SOURCE)));
        },
      },
      {
        content: 'debug',
        id: "debug",
        select: function(edge)
        {
          alert(JSON.stringify(edge.data(),null,2));
        },
      },
    ];
  }

  /**  @return {Array} the limes commands*/
  limesCommands()
  {
    return [
      {
        content: 'confirm link',
        id: "confirm-link",
        select: function(edge)
        {
          edge.data(EDGE.GRAPH,"http://www.snik.eu/ontology/match");
          const body = `Please confirm the automatic interlink ${this.edgeLabel(edge)}:
          \`\`\`\n
          sparql
          DELETE DATA FROM <http://www.snik.eu/ontology/limes-exact>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          INSERT DATA INTO <http://www.snik.eu/ontology/match>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          \n\`\`\`
          Undo with
          \`\`\`\n
          sparql
          DELETE DATA FROM <http://www.snik.eu/ontology/match>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          INSERT DATA INTO <http://www.snik.eu/ontology/limes-exact>
          {<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
          \n\`\`\`
          ${language.CONSTANTS.SPARUL_WARNING}`;
          util.createGitHubIssue(util.REPO_ONTOLOGY,this.edgeLabel(edge),body);
        },
      },
    ];
  }
}
