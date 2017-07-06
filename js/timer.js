export default function timer(name)
{
  var start = new Date();
  return {
    stop: function()
    {
      var end  = new Date();
      var time = end.getTime() - start.getTime();
      console.log(name, 'finished in', time, 'ms');
    },
  };
}
