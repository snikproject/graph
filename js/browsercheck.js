// browser version checking
// very imprecise, just to cover the majority of cases
// gotten from somewhere (Stack Overflow?)
navigator.sayswho= (function(){
		var ua= navigator.userAgent, tem,
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if(/trident/i.test(M[1])){
				tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
				return {name:'IE',version:(tem[1] || '')};
		}
		if(M[1]=== 'Chrome'){
				tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
				if(tem!= null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
		return {name:M[0],version:M[1]};
})();

function browsercheck()
{
	if (
		(navigator.sayswho.name == 'Firefox' && navigator.sayswho.version < 48) ||
		(navigator.sayswho.name == 'Internet Explorer') ||
		(navigator.sayswho.name == 'Chrome' && navigator.sayswho.version < 52)
	)
	{alert("Your browser is outdated, please update it. Graph may not work properly.");}
}
