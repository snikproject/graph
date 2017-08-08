import * as graph from "./graph.js";
//import * as history from "./history.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";

const buttonConfigs =
[
  ["Reset View", graph.resetStyle],
  //  ["History",   history.showHistory],
  ["Reload", loadGraphFromSparql],
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
