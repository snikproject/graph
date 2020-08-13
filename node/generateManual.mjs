import fs from "fs";
import * as help from "../js/help.js";
import * as language from "../js/lang/language.js";
//global.log = {debug: (console).info, warn: console.warn }; // log is a global in the browser code
global.log = {debug: ()=>{}, warn: ()=>{}};

String.prototype.capitalize = function() {return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });};

function traverse(o, depth=1)
{
  let html = "";
  const label = key => (language.getString(key)?language.getString(key):key.replace("-"," ")).capitalize();
  const heading = key => `<h${depth}>${label(key)}</h${depth}>\n`;
  for(const key in o)
  {
    const value = o[key];
    if(typeof value !=="string")
    {
      html+=heading(key);
      if(help.flatHelp[key]) {html+=help.flatHelp[key];} // heading description
      {html+=traverse(value,depth+1);}
      continue;
    }
    if(key!=="")
    {
      if(key==="img")
      {
        html+=`<img src="img/${value}" style="max-width:100vw;">\n`;
        continue;
      }
      else {html+=heading(key);}
    }
    html+=value+"\n";
  }
  return html;
}

function generateManual()
{
  language.setLanguage("en");
  const html = traverse(help.help);

  fs.readFile('node/manual.html.template', "utf8", (err, data) =>
  {
    if(err) {throw err;}
    {fs.writeFile('manual.html', data.replace("#CONTENT#",html), (err2)=>{if(err2) {throw err2;}});}
  });
}

generateManual();
