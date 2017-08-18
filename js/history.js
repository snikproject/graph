import * as log from "./log.js";
import * as sparql from "./sparql.js";

const GRAPH = "http://www.snik.eu/ontology/history";

export function hideHistory()
{
  const overlay = document.getElementById("overlay-history");
  overlay.style.width = "0%";
  overlay.style.display= "none";
}

export function initHistory()
{
  document.getElementById('history-closelink').addEventListener("click", hideHistory);
}

export function showHistory()
{
  const overlay = document.getElementById("overlay-history");
  overlay.style.width = "100%";
  overlay.style.display= "block";
  const query = `PREFIX cs: <http://purl.org/vocab/changeset/schema#>
  SELECT ?cs ?creator ?reason
  replace(replace(str(?subject),"^([^/]*/){4}",""),"/",":") as ?subject
  substr(str(?date),1,19) as ?date FROM <http://www.snik.eu/ontology/history>
  {
    ?cs a cs:ChangeSet;
    cs:creatorName ?creator;
    cs:changeReason ?reason;
    cs:subjectOfChange ?subject;
    cs:createdDate ?date.
  } ORDER BY DESC(?date) LIMIT 20`;
  sparql.sparql(query,GRAPH).then(bindings=>
  {
    const table = document.getElementById("history-table");
    for(const binding of bindings)
    {
      const tr = document.createElement("tr");
      table.appendChild(tr);
      const addTd = function(ids)
      {
        for(const id of ids)
        {
          const td = document.createElement("td");
          tr.appendChild(td);
          td.innerText=binding[id].value;
        }
      };
      addTd(["creator","reason","date","subject"]);
      const td = document.createElement("td");
      tr.appendChild(td);
      const a = document.createElement("a");
      td.appendChild(a);
      a.innerText="Undo";
      a.addEventListener("click",e=>
      {
        sparql.undo(binding.cs.value);
      });
    }
  });
}
