/**
Creates the circular context menu that can be opened on top of a node.
@module */
import * as language from "../lang/language.js";
import classUse from "./classuse.js";
import * as rdf from "../rdf.js";
import * as NODE from "../node.js";
import * as util from "./util.js";
import {Direction} from "./graph.js";
import {menuDefaults} from "./contextmenuUtil.js";

const menu = Object.assign(menuDefaults(),
  {
    menuRadius: 220, // the radius of the circular menu in pixels
    selector: 'node:childless', // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands: [],
  });

const compoundMenu = graph => Object.assign(menuDefaults(),
  {
    menuRadius: 180, // the radius of the circular menu in pixels
    selector: 'node:compound', // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands:
  [
    {
      content: 'open',
      id: 'open',
      select: node=>
      {
        node.children().move({parent:null});
        graph.cy.remove(node);
      },
    },
    {
      content: 'move matches on top of each other',
      id: 'move-match-on-top',
      select: parent => graph.moveNodes(parent.children(),0),
    },
    {
      content: 'move matches nearby',
      id: 'move-match-nearby',
      select: parent => graph.moveNodes(parent.children(),100),
    },
    {
      content: 'star',
      id: 'compound-star',
      select: parent => graph.multiplex(graph.showStar,parent.children())(),
    },
  ],
  });

/** Default Entries that are always shown ***********************************************************************************/
const baseCommands = graph =>
  [
    {
    //content: '<img src onerror="tippy(\'span\')"><span data-tippy-content="Tooltip">edit/report</span>',
      content: 'edit/report',
      id: "edit",
      select: node=>
      {
        if(confirm(language.getString("ontology-issue-warning")))
        {
          const body = `The class ${node.data(NODE.ID)} has [incorrect/missing attribute values | incorrect/missing relations to other classes, other (please specify and remove not applicable ones).]\n\n**Details**\n`;
          util.createGitHubIssue(util.REPO_ONTOLOGY,node.data(NODE.ID),body);
        }
      },
    },
    {
      content: 'class use',
      id: "class-use",
      select: node=> {classUse(graph,node.data(NODE.ID),node.data(NODE.SUBTOP));},
    },
    {
      content: 'hide',
      id: 'hide',
      select: graph.multiplex(graph.hide),
    },
    {
      content: 'set as path source',
      id: 'set-path-source',
      select: node=> {graph.setSource(node);},
    },
    {
      content: 'description',
      id: 'description',
      select: node=> {window.open(node.data(NODE.ID));},
    },
    {
      content: 'star',
      id: 'star',
      select: graph.showStarMultiplexed(false),
    },
    {
      content: 'incoming star',
      id: 'incoming-star',
      select: graph.showStarMultiplexed(false,Direction.IN),
    },
    {
      content: 'outgoing star',
      id: 'outgoing-star',
      select: graph.showStarMultiplexed(false,Direction.OUT),
    },
    {
      content: 'path',
      id: 'path',
      select: graph.multiplex(graph.showPath),
    },
    {
      content: 'spiderworm',
      id: 'spiderworm',
      select: graph.multiplex(graph.showWorm),
    },
  // {
  //   content: 'find neighbours',
  //   id: 'find-neighbours',
  //   select: node=>
  //   {
  //     log.warn("'find neighbours' not implemented yet!", node);
  //   },
  // },
  // {
  //   content: 'combine close matches',
  //   id: 'combine-close-matches',
  //   select: node=>
  //   {
  //     log.warn("'combine close matches' not implemented yet!", node);
  //   },
  // },
  ];

/** Commands that are only useful for Developers ***********************************************************************************/
const devCommands = graph =>
  [
    {
      content: 'remove permanently',
      id: 'remove-permanently',
      select: graph.createRemoveIssue,
    },
    {
      content: 'OntoWiki',
      id: 'ontowiki',
      select: node=>
      {
        window.open('https://www.snik.eu/ontowiki/view/?r='+node.data(NODE.ID)+"&m="+rdf.sub(node.data(NODE.ID)));
      },
    },
    {
      content: 'debug',
      id: 'debug',
      select: function(node)
      {
        alert(JSON.stringify(node.data(),null,2));
      },
    },
  ];

/** Extended Base Entries that are used less often **********************************************************************************/
const extCommands = graph =>
  [
    {
      content: 'doublestar',
      id: 'doublestar',
      select: graph.multiplex(graph.showDoubleStar),
    },
    {
      content: 'starpath',
      id: 'starpath',
      select: graph.multiplex(node=>graph.showPath(node,true)),
    },
    {
      content: 'circle star',
      id: 'circlestar',
      select: node=> {graph.showStar(node,true);},
    },
    {
      content: 'LodLive',
      id: 'lodlive',
      select: node=> {window.open('http://en.lodlive.it/?'+node.data(NODE.ID));},
    },
    {
      content: 'move all selected here',
      id: 'move-selected',
      select: node=>
      {
        graph.cy.nodes(":selected").positions(()=>node.position());
      },
    },
    {
      content: 'close matches',
      id: 'close-match',
      select: graph.multiplex(graph.showCloseMatch,null,true),
    },

  ];

/** Register modular node context menu. */
export default function nodeMenus(graph,dev,ext)
{
  menu.commands = [...baseCommands(graph),...dev?devCommands(graph):[],...ext?extCommands(graph):[]];
  menu.menuRadius = 240 + (dev?15:0) + (ext?25:0);
  return [menu,compoundMenu(graph)];
}
