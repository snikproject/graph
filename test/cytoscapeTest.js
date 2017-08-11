import * as rdf from '../js/rdf.js';
import loadGraphFromSparql from "../js/loadGraphFromSparql.js";
import assert from 'assert';
import cytoscape from 'cytoscape';

describe('cytoscape', function()
{
  describe('initialization', function()
  {
    it('initializes', function()
    {
      var cy = cytoscape({});
      loadGraphFromSparql(cy).then(()=>
        assert(cy.nodes().size()>3000));
    });
  });
});
