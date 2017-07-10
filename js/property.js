import * as rdf from "./rdf.js";
import * as log from "./log.js";

const propertyData = [
  ["meta:isAssociatedWith","is associated with",null,null,false,true],
  ["meta:isBasedOn","is based on","EntityType","EntityType",false,true],
  ["meta:homonym","sounds similar but is different",null,null,false,false],
  ["meta:functionComponent","function component","Function","Function",false,true],
  ["meta:entityTypeComponent","entity type component","EntityType","EntityType",false,true],
  ["meta:roleComponent","role component","Role","Role",false,true],
  ["meta:updates","updates","Function","EntityType",false,true],
  ["meta:increases","increases","EntityType","EntityType",false,true],
  ["meta:decreases","decreases","EntityType","EntityType",false,true],
  //["meta:communicatesWith","communicates with","ApplicationComponent","ApplicationComponent",false,true], // only works with subtop domain and range
  ["meta:uses","uses","Function","EntityType",false,true],
  ["meta:approvesFunction","approves function","Role","Function",false,true],
  ["meta:approvesEntityType","approves entity type","Role","EntityType",false,true],
  ["meta:isInvolvedIn","is involved in","Role","Function",false,true],
  ["meta:supports","supports","ApplicationComponent","Function",false,true],
  //["meta:represents","represents","RepresentationType","EntityType",false,true],
  ["meta:responsibleForFunction","responsible for","Role","Function",false,true],
  ["meta:responsibleForEntityType","responsible for","Role","EntityType",false,true],
  ["rdfs:subClassOf","subclass of",null,null,false,true],
  //  ["","","","",false,true],
  ["skos:closeMatch","close",null,null,true,false],
  ["skos:boardMatch","boarder",null,null,true,false],
  ["skos:narrowMatch","narrower",null,null,true,false],
  ["skos:relatedMatch","related",null,null,true,false],
];

const properties = [];

/** RDF Property class for use in SNIK. */
export class Property
{
  constructor(array)
  {
    this.uri=rdf.long(array[0]);
    this.label=array[1];
    this.domain=array[2];
    this.range=array[3];
    this.interontology=array[4];
    this.restriction=array[5];
  }
}

for(const a of propertyData)
{
  properties.push(new Property(a));
}

/** Possible properties between two nodes in the graph.*/
export function possible(subjectNode,objectNode)
{
  const possible = properties.filter((element,index,array)=>
  {
    return ((!element.domain)||element.domain===subjectNode.data().st) // domain
  &&((!element.range)||element.range===objectNode.data().st) // range
  &&((subjectNode.data().prefix===objectNode.data().prefix)!==(element.interontology)) // interontology
    &&((element.uri!=="http://www.w3.org/2000/01/rdf-schema#subClassOf")||(subjectNode.data().st===objectNode.data().st)) // rdfs:subClassOf only with the same subtop
    ;
  }
  );
  log.debug(possible);
  return possible;
}
