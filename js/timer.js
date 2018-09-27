/**
Measures elapsed duration.
@module */

import * as log from "./log.js";

const MIN_INFO_TIME = 500;
const MIN_DEBUG_TIME = 50;

/** Generates a timer object that logs the elapsed time after its stop function is called.
Call example: myTimer = timer("egg cooking"); cookEgg(); timer.stop("successfull");
 * @param  {String} name identifies the timer
 * @return {Object}      the timer object with the stop(message) function. The message is optional.
 */
export default function timer(name)
{
  var start = new Date();
  return {
    stop: function(message)
    {
      var end  = new Date();
      var time = end.getTime() - start.getTime();
      const f = (time>MIN_INFO_TIME)?log.info:((time>MIN_DEBUG_TIME)?log.debug:log.trace);
      f(name, 'finished in', time, 'ms'+(message?` (${message})`:""));
    },
  };
}
