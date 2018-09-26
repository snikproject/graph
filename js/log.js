/**
Logging to console or overlay or both, depending on availability (server call using node or client) and log level.
@module */
/* eslint no-console: 0 */
// temporary solution. todo: use a logging library or write more elegantly using enums or integers


/**
 * callSource - description
 *
 * @return {type}  description

 */
function callSource()
{
  // https://stackoverflow.com/questions/1340872/how-to-get-javascript-caller-function-line-number-how-to-get-javascript-caller
  var e = new Error();
  if(!e.stack) {return "";} // old browser
  var stack = e.stack.toString().split(/\r\n|\n/);
  return "            [" + stack[2].replace(/.*\//,"") + ']';
}

/** Logs the given messages with log level info */
export function info(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay==="info"||config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(!config||config.logLevelConsole==="info"||config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {
    const argumentsArray = Array.prototype.slice.call(arguments);
    argumentsArray.push(callSource());
    console.log.apply(console,argumentsArray);
  }
}

/** Logs the given messages with log level info */
export function debug(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay==="debug"||config.logLevelDisplay==="trace")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(typeof config === 'undefined'||config.logLevelConsole==="debug"||config.logLevelConsole==="trace")
  {
    const argumentsArray = Array.prototype.slice.call(arguments);
    argumentsArray.push(callSource());
    console.log.apply(console,argumentsArray);
  }
}

/** Logs the given messages with log level error
 Errors are always shown both on console and display.*/
export function error(s)
{
  if((typeof dhtmlx) !== "undefined") {dhtmlx.message({type: "error", text: s});}
  {
    const argumentsArray = Array.prototype.slice.call(arguments);
    argumentsArray.push(callSource());
    console.log.apply(console,argumentsArray);
  }
}

/** Logs the given messages with log level warn */
export function warn(s)
{
  if(typeof config === 'undefined'||config.logLevelDisplay!=="error")
  {if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}}
  if(typeof config === 'undefined'||config.logLevelConsole!=="error")
  {
    const argumentsArray = Array.prototype.slice.call(arguments);
    argumentsArray.push(callSource());
    console.log.apply(console,argumentsArray);
  }
}

/** Logs the given messages with log level trace. Never shown as an overlay. */
export function trace()
{
  if(typeof config === 'undefined'||config.logLevelConsole!=="trace") {return;}
  const argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.push(callSource());
  console.log.apply(console,argumentsArray);
}
