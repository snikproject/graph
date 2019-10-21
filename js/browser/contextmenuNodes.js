/**
Creates the circular context menu that can be opened on top of a node.
@module */
import * as language from "../lang/language.js";
import classUse from "./classuse.js";
import * as rdf from "../rdf.js";
import * as NODE from "../node.js";
import * as sparql from "../sparql.js";
import * as util from "./util.js";
import {logWrap,menuDefaults} from "./contextmenuUtil.js";

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
      select: node=> {graph.hide(node);graph.hide(node.connectedEdges());},
    },
    {
      content: 'set as path source',
      id: 'set-path-source',
      select: node=> {graph.setSource(node);},
    },
    {
      content: 'description',
      id: 'description',
      select: node=>  {window.open(node.data(NODE.ID));},
    },
    {
      content: 'star',
      id: 'star',
      select: node=> {graph.showStar(node,false);},
    },
    {
      content: 'incoming star',
      id: 'incoming-star',
      select: node=> {graph.showStar(node,false,graph.Direction.IN);},
    },
    {
      content: 'outgoing star',
      id: 'outgoing-star',
      select: node=> {graph.showStar(node,false,graph.Direction.OUT);},
    },
    {
      content: 'path',
      id: 'path',
      select: node=>
      {
        if(node&&graph.getSource()&&graph.getSource()!==node)
        {
          graph.showPath(graph.getSource(), node);
        }
        else
        {
          log.warn("Path not possible.");
        }
      },
    },
    {
      content: 'spiderworm',
      id: 'spiderworm',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showWorm(graph.getSource(), node);
        }
      },
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
      select: node=>
      {
        graph.cy.remove(node);
        const clazzShort  = rdf.short(node.data(NODE.ID));
        sparql.describe(node.data(NODE.ID))
          .then(bindings=>
          {
            const body = `Please permanently delete the class ${clazzShort}:
          \`\`\`\n
          sparql
          # WARNING: THIS WILL DELETE ALL TRIPLES THAT CONTAIN THE CLASS ${clazzShort} FROM THE GRAPH AS EITHER SUBJECT OR OBJECT
          # ALWAYS CREATE A BACKUP BEFORE THIS OPERATION AS A MISTAKE MAY DELETE THE WHOLE GRAPH.
          # THERE MAY BE DATA LEFT OVER IN OTHER GRAPHS, SUCH AS <http://www.snik.eu/ontology/limes-exact> or <http://www.snik.eu/ontology/match>.
          # THERE MAY BE LEFTOVER DATA IN AXIOMS OR ANNOTATIONS, CHECK THE UNDO DATA FOR SUCH THINGS.

          DELETE DATA FROM <${rdf.longPrefix(node.data(NODE.ID))}>
          {
            {<${node.data(NODE.ID)}> ?p ?y.} UNION {?x ?p <${node.data(NODE.ID)}>.}
          }
          \n\`\`\`
          **Warning: Restoring a class with the following triples is not guaranteed to work and may have unintended consequences if other edits occur between the deletion and restoration.
          This only contains the triples from graph ${rdf.longPrefix(node.data(NODE.ID))}.**

          Undo based on these triples:
          \`\`\`\n
          ${bindings}
          \n\`\`\`
          ${language.CONSTANTS.SPARUL_WARNING}`;
            window.open
            (
              'https://github.com/IMISE/snik-ontology/issues/new?title='+
            encodeURIComponent('Remove class '+clazzShort)+
            '&body='+
            encodeURIComponent(body)
            );
          });
      },
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
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showDoubleStar(graph.getSource(), node);
        }
      },
    },
    {
      content: 'starpath',
      id: 'starpath',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showPath(graph.getSource(), node,true);
        }
      },
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
  ];

/** Register modular node context menu. */
export default function nodeMenus(graph,dev,ext)
{
  menu.commands = [...baseCommands(graph),...dev?devCommands(graph):[],...ext?extCommands(graph):[]];
  menu.menuRadius = 240 + (dev?15:0) + (ext?25:0);
  return [menu,compoundMenu(graph)];
}


//[...baseCommands,...devCommands].forEach((cmd)=>logWrap(cmd,(node)=>`node ${node.data(NODE.ID)}`));
