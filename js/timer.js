/**
Measures elapsed duration.
@module */

import * as log from "./log.js";

/** Generates a timer object that logs the elapsed time after its stop function is called.
Call example: myTimer = timer("egg cooking"); cookEgg(); timer.stop("successfull");
 * @param  {String} name identifies the timer
 * @return {Object}      the timer object with the stop(message) function. The message is optional.
 */
export default function timer(name)
{
  const start = new Date();
  return {
    stop: function(message)
    {
      const end  = new Date();
      const time = end.getTime() - start.getTime();
      const f = (time>config.minInfoTime)?log.info:((time>config.minDebugTime)?log.debug:log.trace);
      f(name, 'finished in', time, 'ms'+(message?` (${message})`:""));
    },
  };
}
