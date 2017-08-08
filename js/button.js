import * as graph from "./graph.js";
//import * as history from "./history.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";

var saveData = (function ()
{
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName)
  {
    var json = JSON.stringify(data),
      blob = new Blob([json], {type: "application/json"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

const buttonConfigs =
[
  ["Reset View", graph.resetStyle],
  //  ["History",   history.showHistory],
  ["Reload", loadGraphFromSparql],
  ["Export", ()=>{saveData(graph.cy.json(),"snik.json");}],
];
export default function addButtons()
{
  for(const buttonConfig of buttonConfigs)
  {
    const button = document.createElement("button");
    document.getElementById("buttons").appendChild(button);
    button.innerText = buttonConfig[0];
    button.addEventListener("click",buttonConfig[1]);
  }
}
