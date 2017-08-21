/* eslint no-console: 0 */
// temporary solution. todo: use a logging library or write more elegantly using enums or integers

export function info(s)
{
  if(config.logLevelDisplay==="info"||config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(config.logLevelConsole==="info"||config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {console.log.apply(console,arguments);}
}

export function debug(s)
{
  if(config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {console.log.apply(console,arguments);}
}

/** Errors are always shown both on console and display.*/
export function error(s)
{
  if((typeof dhtmlx) !== "undefined") {dhtmlx.message({type: "error", text: s});}
  console.error.apply(console,arguments);
}

export function warn(s)
{
  if(config.logLevelDisplay!=="error")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(config.logLevelConsole!=="error")
  {console.warn.apply(console,arguments);}
}

export function trace()
{
  if(config.logLevelConsole!=="trace") {return;}
  console.log.apply(console,arguments);
}
