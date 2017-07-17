import * as log from "./log.js";
import * as sparql from "./sparql.js";

const GRAPH = "http://www.snik.eu/ontology/history";

export function showHistory()
{
  const overlay = document.getElementById("history-overlay");
  overlay.style.width = "100%";
  overlay.style.display= "block";
  const query = `PREFIX h: <http://www.snik.eu/ontology/history/>
  select ?user ?date ?s ?p ?o from <http://www.snik.eu/ontology/history>
  {
    ?op a h:operation;
        h:user ?user;
        h:date ?date;
        h:subject ?s;
        h:predicate ?p;
        h:object ?o;
        h:type ?t.
  }`;
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
      addTd(["user","date","subject","predicate","object","type"]);
    }
  });
}
