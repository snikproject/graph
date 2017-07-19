/* eslint no-console: 0 */

export function info(s)
{
  if((typeof dhtmlx) !== "undefined") {dhtmlx.message(s);}
  console.log.apply(console,arguments);
}

export function debug()
{
  console.log.apply(console,arguments);
}

export function error(s)
{
  if((typeof dhtmlx) !== "undefined") {dhtmlx.message({type: "error", text: s});}
  console.error.apply(console,arguments);
}

export function trace()
{
  // do nothing for now
}
