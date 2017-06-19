import {progress} from "./progress.js";
progress(0);
import {initGraph,remove} from "./graph.js";

$(document).bind('keydown',function(e)
{
  if(e.keyCode === 46) {remove();}
});
$.ajaxSetup({beforeSend:function(xhr)
	{
  if (xhr.overrideMimeType)
		{xhr.overrideMimeType("application/json");}
}});

const headers = new Headers();
const init = { method: 'GET',
  headers: headers,
  mode: 'cors',
  cache: 'default',
  credentials: 'include'};

/*
fetch("data/snik-ciox.cyjs",init)
	.then(response => {return response.json();})
	.then(json =>
		{
  initGraph(document.getElementById('cy'),json);
  cy.zoom(0.1);
  cy.center(cy.elements().nodes().filter(`node[name= "http://www.snik.eu/ontology/meta/EntityType"]`)[0]);
  progress(100);
})
		.catch(err =>
			{
  console.log('snik-ciox.cyjs not found, loading snik.cyjs. Details: '+err);
	*/
fetch("data/snik.cyjs",init)
				.then(response => {return response.json();})
				.then(json =>
					{
  initGraph(document.getElementById('cy'),json);
  //cy.zoom(0.1);
  //cy.center(cy.elements().nodes().filter(`node[name= "http://www.snik.eu/ontology/meta/EntityType"]`)[0]);
  progress(100);
})
					.catch(err2 =>
						{
  alert('Did not find graph file snik.cyjs, failed to load graph. Details: '+err2);
  progress(100);
});
//});
