/** @module */
/* eslint no-console: 0 */
// temporary solution. todo: use a logging library or write more elegantly using enums or integers

/** Logs the given messages with log level info */
export function info(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay==="info"||config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(!config||config.logLevelConsole==="info"||config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {console.log.apply(console,arguments);}
}

/** Logs the given messages with log level info */
export function debug(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(typeof config === 'undefined'||config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {console.log.apply(console,arguments);}
}

/** Logs the given messages with log level error
 Errors are always shown both on console and display.*/
export function error(s)
{
  if((typeof dhtmlx) !== "undefined") {dhtmlx.message({type: "error", text: s});}
  console.error.apply(console,arguments);
}

/** Logs the given messages with log level warn */
export function warn(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay!=="error")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(typeof config === 'undefined'||config.logLevelConsole!=="error")
  {console.warn.apply(console,arguments);}
}

/** Logs the given messages with log level trace. Never shown as an overlay. */
export function trace()
{
  if(typeof config === 'undefined'||config.logLevelConsole!=="trace") {return;}
  console.log.apply(console,arguments);
}
