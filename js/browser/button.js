/** Populates the buttons on the top bar
@module */
import * as graph from "./graph.js";
import * as layout from "../layout.js";
import config from "../config.js";
import * as language from "../lang/language.js";
import * as util from "./util.js";
import * as menu from "./menu.js";

/** @type{[string, string,()=>void][]} */
const buttonConfigs =
[
  [
    language.getString("recalculate-layout"),"recalculate-layout", ()=>
    {
      layout.run(graph.cy,layout.euler,config.defaultSubOntologies,menu.separateSubs()&&!graph.getStarMode(),true);
    }],
  [
    "Tight Layout","recalculate-layout", ()=>
    {
      layout.run(graph.cy,layout.eulerTight,config.defaultSubOntologies,menu.separateSubs()&&!graph.getStarMode(),false);
    }],
  [
    "Custom Layout","recalculate-layout", ()=>
    {
      layout.run(graph.cy,layout.eulerVariable(util.getElementById("layout-range").value),config.defaultSubOntologies,menu.separateSubs()&&!graph.getStarMode(),false);
    }],
  [
    "Compound Layout","recalculate-layout", ()=>
    {
      layout.run(graph.cy,layout.cose,config.defaultSubOntologies,menu.separateSubs()&&!graph.getStarMode(),false);
    }],

  [language.getString("reset-view"),"reset-view", graph.resetStyle],
//  ["Reload", loadGraphFromSparql],
//  ["Export", file.save],
];

/** Populate the buttons on the top bar using the JSON configuration. */
export default function addButtons()
{
  const text = document.createElement("input");
  text.type="text";
  text.style.width="3em";
  /** @type{HTMLInputElement} */
  const range = document.createElement("input");
  range.type="range";
  range.id="layout-range";
  range.min=10;
  range.max=999;
  range.value=40;
  range.style.width="10em";
  range.onchange=()=>text.value=range.value;
  text.value=range.value;

  util.getElementById("buttons").appendChild(range);
  util.getElementById("buttons").appendChild(text);
  for(const buttonConfig of buttonConfigs)
  {
    const button = document.createElement("button");
    util.getElementById("buttons").appendChild(button);
    button.innerText = buttonConfig[0];
    button.id = buttonConfig[1];
    button.addEventListener("click",buttonConfig[2]);
  }
}
