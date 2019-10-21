/** Populates the buttons on the top bar
@module */
import * as layout from "../layout.js";
import config from "../config.js";
import * as language from "../lang/language.js";
import * as util from "./util.js";

export default class Buttons
{
  /** Populate the buttons on the top bar using the JSON configuration. */
  constructor(graph, menu)
  {
    this.graph = graph;
    this.menu = menu;
    for(const buttonConfig of this.buttonConfigs())
    {
      const button = document.createElement("button");
      util.getElementById("buttons").appendChild(button);
      button.innerText = buttonConfig[0];
      button.setAttribute("data-i18n",buttonConfig[1]);
      button.id="button-"+buttonConfig[1];
      button.addEventListener("click",buttonConfig[2]);
    }
    log.debug('buttons added');
  }

  /** @type{[string, string,()=>void][]} */
  buttonConfigs()
  {
    return [
      [
        language.getString("recalculate-layout"),"recalculate-layout", ()=>
        {
          layout.run(this.graph.cy,layout.euler,config.defaultSubOntologies,this.menu.separateSubs()&&!this.graph.getStarMode(),true);
        },
      ],
      [
        "tight layout","tight-layout", ()=>
        {
          layout.run(this.graph.cy,layout.eulerTight,config.defaultSubOntologies,this.menu.separateSubs()&&!this.graph.getStarMode(),false);
        },
      ],
      [language.getString("reset-view"),"reset-view", this.graph.resetStyle],
    ];
  }
}
