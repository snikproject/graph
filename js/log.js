/* eslint no-console: 0 */

export function info(s)
{
  dhtmlx.message(s);
  console.log.apply(console,arguments);
}

export function debug(s)
{
  console.log.apply(console,arguments);
}

export function error(s)
{
  dhtmlx.message(s);
  console.log.apply(console,arguments);
}
