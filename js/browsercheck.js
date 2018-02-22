/** Browser version checking to warn the user if the browser may not be able to display SNIK graph properly.
Imprecise, just to cover the majority of cases.
*/

navigator.sayswho= (function()
{
  var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1]))
  {
    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name:'IE',version:(tem[1] || '')};
  }
  if(M[1]=== 'Chrome')
  {
    tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
    if(tem!== null) {return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};}
  }
  M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem= ua.match(/version\/(\d+)/i))!== null) {M.splice(1, 1, tem[1]);}
  return {name:M[0],version:M[1]};
})();

/**Alerts the user if the browser cannot run ES6. Only an approximation using some browser name and versions, may fail to warn or warn incorrectly. */
function browsercheck()
{
  if (
    (navigator.sayswho.name === 'Firefox' && navigator.sayswho.version < 54) ||
  (navigator.sayswho.name === 'Internet Explorer') ||
  (navigator.sayswho.name === 'Chrome' && navigator.sayswho.version < 60)
  )
  {alert(`Your browser ${navigator.sayswho.name} version ${navigator.sayswho.version} may be outdated. Graph may not work properly.`);}
}

browsercheck();
