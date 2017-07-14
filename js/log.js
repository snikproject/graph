/* eslint no-console: 0 */

export function info(s)
{
  dhtmlx.message(s);
  console.log.apply(console,arguments);
}

export function debug()
{
  console.log.apply(console,arguments);
}

export function error(s)
{
  dhtmlx.message({type: "error", text: s});
  console.log.apply(console,arguments);
}

export function trace()
{
  // do nothing for now
}
