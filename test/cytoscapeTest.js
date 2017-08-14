import * as rdf from '../js/rdf.js';
import loadGraphFromSparql from "../js/loadGraphFromSparql.js";
import assert from 'assert';
import cytoscape from 'cytoscape';

describe('cytoscape', function()
{
  var cy;
  it('create empty graph', function()
  {
    cy = cytoscape({});
  });
  it('loadGraphFromSparql', function()
  {
    loadGraphFromSparql(cy, new Set(["meta","it"])).then(()=>
      console.log(cy.nodes().size()));
  });
  it('preset layout from cache', function()
  {

  });
});
