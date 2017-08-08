import * as graph from "./graph.js";
//import * as history from "./history.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";
import * as file from "./file.js";


const buttonConfigs =
[
  ["Reset View", graph.resetStyle],
  //  ["History",   history.showHistory],
  ["Reload", loadGraphFromSparql],
  ["Export", file.save],
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
