import * as layout from "../js/layout.js";
import loadGraphFromSparql from "../js/loadGraphFromSparql.js";
import cytoscape from 'cytoscape';
import euler from 'cytoscape-euler';
cytoscape.use(euler);
var LocalStorage = require('node-localstorage').LocalStorage;
global.localStorage = new LocalStorage('./scratch');
var assert = require('chai').assert;


describe('cytoscape', function()
{
  var cy;
  const subs = new Set(["meta","it"]);

  it('create empty graph', function()
  {
    cy = cytoscape({});
    assert(cy);
    assert(cy._private.layout===null);
  });
  it('loadGraphFromSparql', function()
  {
    return loadGraphFromSparql(cy, subs).then(()=>
      assert.closeTo(cy.nodes().size(),1600,200)
    );
  });
  it('apply euler layout', function()
  {
    // Causes "TypeError: Cannot read property 'pos' of undefined"
    // see https://github.com/cytoscape/cytoscape.js-euler/issues/14
    //layout.run(cy,layout.euler,subs);
    // use cose for now
    assert(layout.run(cy,layout.cose,subs));
  });
});
