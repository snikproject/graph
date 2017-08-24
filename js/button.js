//** @module */
import * as graph from "./graph.js";
import * as layout from "./layout.js";
//import loadGraphFromSparql from "./loadGraphFromSparql.js";
//import * as file from "./file.js";


const buttonConfigs =
[
  ["Recalculate Layout", ()=>layout.run(graph.cy,layout.euler)],
  ["Reset View", graph.resetStyle],
//  ["Reload", loadGraphFromSparql],
//  ["Export", file.save],
];

/** Populate the buttons on the top bar using the JSON configuration. */
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
