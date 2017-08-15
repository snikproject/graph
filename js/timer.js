import * as log from "./log.js";

export default function timer(name)
{
  var start = new Date();
  return {
    stop: function(message)
    {
      var end  = new Date();
      var time = end.getTime() - start.getTime();
      if(time>100) {log.debug(name, 'finished in', time, 'ms'+(message?` (${message})`:""));}
    },
  };
}
