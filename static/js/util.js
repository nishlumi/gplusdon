//define of Utilities
//shortcut of i18n function
var onKeyope=false;
var curLocale = {
	messages : null,
	name : "",
	fullName : "",
	environment : {}
};
var appEnvironment = "d"; //h - honban, d - kaihatu

const SNSPROP = {
	"twitter": {
		"name" : "name",
		"imageurl": "profile_image_url",
		"status_count": "statuses_count",
		"follow_count": "friends_count",
		"follower_count": "followers_count"
	},
	"croudia": {
		"name": "name",
		"imageurl": "profile_image_url_https",
		"status_count": "statuses_count",
		"follow_count": "friends_count",
		"follower_count": "followers_count"
	},
	"mastodon": {
		"name": "display_name",
		"imageurl": "avatar",
		"status_count": "statuses_count",
		"follow_count": "following_count",
		"follower_count": "followers_count"
	}
};
const LONGPOLLING_INSTANCE = [
	"oransns.com"
];
function _T(){
	//console.log(arguments);
	var res = arguments[0];
	var params = [];
	if (arguments.length > 1) {
		params = arguments[1];
	}
	var retstr = "";
	//console.log(res);
	//if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
	if (curLocale.environment.platform == "chromeapps"){
		//---ChromeApps
		retstr = chrome.i18n.getMessage(res);
	//}else if (("WinJS" in window)){
	}else if (curLocale.environment.platform == "windowsapp") {
		//---Windows store app
		retstr = WinJS.Resources.getString(res).value;
	}else{
		//---web app
		//console.log(res);
		if (curLocale.messages != null) {
			if (res in curLocale.messages) {
				retstr = curLocale.messages[res];
			}else{
				//---no hit, return original
				retstr = res;
			}
		}else{
			retstr = res;
		}
		
	}
	//置換文字列がある場合はそれらを置き換え(%1～%9)
	var pcnt = params.length;
	if (pcnt > 9) pcnt = 9;
	for (var i = 0; i < pcnt; i++) {
		var repstr = "%"+(i+1);
		retstr = retstr.replace(repstr,params[i]);
	}
	return retstr;
}

/**
 * shortcut for document.getElementById()
 * @param {String} id 
 */
var ID=function(id) { return document.getElementById(id); };
/**
 * shortcut for document.getElementsByTagName
 * @param {*} id 
 */
var Ts=function(id) { return document.getElementsByTagName(id); };
/**
 * shortcut for document.getElementsByClassName
 * @param {string} id 
 */
var Cs=function(id) { return document.getElementsByClassName(id); };
/**
 * shortcut for document.querySelector()
 * @param {String} query 
 */
var Q=function(query) { return document.querySelector(query); };
/**
 * shortcut for document.querySelectorAll()
 * @param {String} query 
 */
var Qs=function(query) { return document.querySelectorAll(query); };
/**
 * shortcut for document.createElement()
 * @param {String} tag 
 */
var GEN=function(tag) { return document.createElement(tag); };

function DEBUGLOG() {
	if (appEnvironment == "h") return;
	var arr = [];
	for (var i = 0; i < arguments.length; i++) {
		arr.push(arguments[i]);
	}
	console.log(arguments);
}

function setupLocale(params){
	var a = document.querySelectorAll("script");
	var b = [];
	a.forEach(e => {
		if (e.src.indexOf("/dist/vue.min.js") > -1) {
			b.push(e);
		}
	});
	if (b.length > 0) {
		appEnvironment = "h";
	}
	if (appEnvironment == "h") {
		window.console.log = function(){ };
	}


	//var def = $.Deferred();
	curLocale.environment = checkBrowser();
	//only webapp, setup locale
	//}else if (("WinJS" in window)){
	if (curLocale.environment.platform == "windowsapp") {
		var def = new Promise((resolve,reject)=>{
			//---Windows store app
			curLocale.name = String(Windows.Globalization.ApplicationLanguages.languages[0]).split("-")[0];
			curLocale.fullName = Windows.Globalization.ApplicationLanguages.languages[0];
			return resolve(true);
		});
		return def;
	}
	//URL引数から lng=* を取得
	var p_lng = (params["lng"] ? params["lng"] : "");
	
	var arr = String(navigator.language).split("-");
	var curloc = arr[0];
	if (p_lng == "") {
		curLocale.name = curloc;
		curLocale.fullName = navigator.language;
	}else{
		curLocale.name = p_lng;
		curLocale.fullName = p_lng;
	}
	curLocale.messages = JSON.parse(ID("hid_currentlocale").value);
	ID("hid_currentlocale").value = "";
	var def2 = new Promise((resolve,reject)=>{
		resolve(true);
	});
	return def2;

	var prm = new URLSearchParams();
	prm.append("srclang",curLocale.name);
	var req = new Request(ID("hid_staticpath").value + ID("hid_currentlocale").value,{
		method : "POST",
		body : prm
	});
	var def2 = new Promise((resolve,reject)=>{
		return fetch(req).then((res)=>{
			console.log("fetch res=",res);
			if (res.ok) {
				return res.json().then((jsdata)=>{
					console.log("success locale");
					console.log(jsdata);
					curLocale.messages = jsdata;
					resolve(jsdata);
				});
			}
		});
	
	});
	return def2;

}
function checkBrowser(){
	var ret = {
		"platform" : "",
		"kind" : ""
	};
	if ("Windows" in window) {
		ret.platform = "windowsapp";
		return ret;
	}
	if ("chrome" in window) {
		if ("storage" in chrome) {
			ret.platform =  "chromeapps";
		}else if ("runtime" in chrome){
			ret.kind =  "chrome";
			ret.platform = "browser";
		}
		return ret;
	}
	if ("nw" in window) {
		ret.kind = "chrome";
		ret.platform = "nw";
		return;
	}
	if (navigator.userAgent.toLowerCase().indexOf("electron") != -1) {
		ret.kind =  "chrome";
		ret.platform = "electron";
	}
	if (navigator.userAgent.toLowerCase().indexOf("edge") != -1) {
		ret.kind =  "edge";
		ret.platform = "browser";
	}
	if (navigator.userAgent.toLowerCase().indexOf("trident") != -1) {
		ret.kind =  "ie";
		ret.platform = "browser";
	}
	if (navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
		ret.kind =  "firefox";
		ret.platform = "browser";
	}
	if (navigator.userAgent.toLowerCase().indexOf("opr") != -1) {
		ret.kind =  "opera";
		ret.platform = "browser";
	}
	if (navigator.userAgent.toLowerCase().indexOf("vivaldi") != -1) {
		ret.kind =  "vivaldi";
		ret.platform = "browser";
	}
	return ret;
}
//defines of global variables


//UTF-8 Characters list
var charlistEnum = [];
function generate_charListEnum() {
    charlistEnum = [
		//---for pictogram etc
		{ type : "pict", text: _T('Dingbats'), group: _T("Pictogram"), start: 0x2700, end: 0x27BF },
		{ type : "pict", text: _T('MiscellaneousSymbols'), group: _T("Pictogram"), start: 0x2600, end: 0x26FF },
		{ type : "pict", text: _T('Arrows'), group: _T("Pictogram"), start: 0x2190, end: 0x21FF },
		{ type : "pict", text: _T('MiscellaneousSymbolsandArrows'), group: _T("Pictogram"), start: 0x2B00, end: 0x2BFF },
		{ type : "pict", text: _T('GeometricShapes'), group: _T("Pictogram"), start: 0x25A0, end: 0x25FF },
		{ type : "pict", text: _T('CurrencySymbols'), group: _T("Pictogram"), start: 0x20A0, end: 0x20CF },
		{ type : "pict", text: _T('GeneralPunctuation'), group: _T("Pictogram"), start: 0x2000, end: 0x206F },
		{ type : "pict", text: _T('NumberForms'), group: _T("Pictogram"), start: 0x2150, end: 0x218F },
		{ type : "pict", text: _T('MathematicalOperators'), group: _T("Pictogram"), start: 0x2200, end: 0x22FF },
		{ type : "pict", text: _T('MiscellaneousTechnical'), group: _T("Pictogram"), start: 0x2300, end: 0x23FF },
		{ type : "pict", text: _T('BlockElements'), group: _T("Pictogram"), start: 0x2580, end: 0x259F },
		{ type : "pict", text: _T('BraillePatterns'), group: _T("Pictogram"), start: 0x2800, end: 0x28FF },
		{ type : "pict", text: _T('LetterlikeSymbols'), group: _T("Pictogram"), start: 0x2100, end: 0x214F },
		{ type : "pict", text: _T('SupplementalArrowsB'), group: _T("Pictogram"), start: 0x2900, end: 0x297F },
		{ type : "pict", text: _T('DominoTiles'), group: _T("Pictogram"), start: 0x1F030, end: 0x1F09F },
		{ type : "pict", text: _T('MiscellaneousMathematicalSymbolsB'), group: _T("Pictogram"), start: 0x2980, end: 0x29FF },
		{ type : "pict", text: _T('CJKSymbolsandPunctuation'), group: _T("Pictogram"), start: 0x3000, end: 0x303F },
		{ type : "pict", text: _T('EnclosedCJKLettersandMonths'), group: _T("Pictogram"), start: 0x3200, end: 0x32FF },
		{ type : "pict", text: _T('CJKCompatibility'), group: _T("Pictogram"), start: 0x3300, end: 0x33FF },
		{ type : "pict", text: _T('CJKCompatibilityForms'), group: _T("Pictogram"), start: 0xFE30, end: 0xFE4F },
		{ type : "pict", text: _T('SupplementalMathematicalOperators'), group: _T("Pictogram"), start: 0x2A00, end: 0x2AFF },
		{ type : "pict", text: _T('SupplementalPunctuation'), group: _T("Pictogram"), start: 0x2E00, end: 0x2E7F },
		{ type : "pict", text: _T('CombiningDiacriticalMarksSupplement'), group: _T("Pictogram"), start: 0x1DC0, end: 0x1DFF },
		{ type : "pict", text: _T('SpacingModifierLetters'), group: _T("Pictogram"), start: 0x02B0, end: 0x02FF },
		{ type : "pict", text: _T('OpticalCharacterRecognition'), group: _T("Pictogram"), start: 0x2440, end: 0x245F },
		{ type : "pict", text: _T("Weather, landscape, and sky symbols"), group: _T("Pictogram"), start: 0x1F300, end: 0x1F3FF},
		{ type : "pict", text: _T("Animal, body, and communications"), group: _T("Pictogram"), start: 0x1F400, end: 0x1F4FF},
		{ type : "pict", text: _T("UI, Tool, and Miscellaneous etc"), group: _T("Pictogram"), start: 0x1F500, end: 0x1F5FF},
		//---for Language
		{ type : "lett", text: _T('BasicLatin'), group: _T("Letter"), start: 0x1E00, end: 0x1EFF },
		{ type : "lett", text: _T('PhoneticExtentions'), group: _T("Letter"), start: 0x1D00, end: 0x1D8F },
		{ type : "lett", text: _T('PhoneticExtentionsSupplement'), group: _T("Letter"), start: 0x1D80, end: 0x1DBF },
		{ type : "lett", text: _T('LatinExtendedAdditional'), group: _T("Letter"), start: 0x1E00, end: 0x1EFF },
		{ type : "lett", text: _T('Latin1Supplement'), group: _T("Letter"), start: 0x0080, end: 0x00FF },
		{ type : "lett", text: _T('LatinExtendedA'), group: _T("Letter"), start: 0x0100, end: 0x017F },
		{ type : "lett", text: _T('LatinExtendedB'), group: _T("Letter"), start: 0x0180, end: 0x024F },
		{ type : "lett", text: _T('LatinExtendedC'), group: _T("Letter"), start: 0x2C60, end: 0x2C7F },
		{ type : "lett", text: _T('LatinExtendedD'), group: _T("Letter"), start: 0xA720, end: 0xA7FF },
		{ type : "lett", text: _T('GreekExtended'), group: _T("Letter"), start: 0x1F00, end: 0x1FFF },
		{ type : "lett", text: _T('GreekandCoptic'), group: _T("Letter"), start: 0x0370, end: 0x03FF },
		{ type : "lett", text: _T('CJKRadicalsSupplement'), group: _T("Letter"), start: 0x2E80, end: 0x2EFF },
		{ type : "lett", text: _T('KangxiRadicals'), group: _T("Letter"), start: 0x2F00, end: 0x2FDF },
		{ type : "lett", text: _T('YijingHexagramSymbols'), group: _T("Letter"), start: 0x4DC0, end: 0x4DFF },
		{ type : "lett", text: _T('Bopomofo'), group: _T("Letter"), start: 0x3100, end: 0x312F },
		{ type : "lett", text: _T('HangulCompatibilityJamo'), group: _T("Letter"), start: 0x3130, end: 0x318F },
		{ type : "lett", text: _T('Kanbun'), group: _T("Letter"), start: 0x3190, end: 0x319F },
		{ type : "lett", text: _T('Hebrew'), group: _T("Letter"), start: 0x0590, end: 0x05FF },
		{ type : "lett", text: _T('ModifierToneLetters'), group: _T("Letter"), start: 0xA700, end: 0xA71F },
		{ type : "lett", text: _T('HangulSyllables'), group: _T("Letter"), start: 0xAC00, end: 0xD7AF },
		{ type : "lett", text: _T('Gurmukhi'), group: _T("Letter"), start: 0x0A00, end: 0x0A7F },
		{ type : "lett", text: _T('Gujarati'), group: _T("Letter"), start: 0x0A80, end: 0x0AFF },
		{ type : "lett", text: _T('Oriya'), group: _T("Letter"), start: 0x0B00, end: 0x0B7F },
		{ type : "lett", text: _T('Tamil'), group: _T("Letter"), start: 0x0B80, end: 0x0BFF },
		{ type : "lett", text: _T('Telugu'), group: _T("Letter"), start: 0x0C00, end: 0x0C7F },
		{ type : "lett", text: _T('Kannada'), group: _T("Letter"), start: 0x0C80, end: 0x0CFF },
		{ type : "lett", text: _T('Malayalam'), group: _T("Letter"), start: 0x0D00, end: 0x0D7F },
		{ type : "lett", text: _T('Sinhara'), group: _T("Letter"), start: 0x0D80, end: 0x0DFF },
		{ type : "lett", text: _T('Thai'), group: _T("Letter"), start: 0x0E00, end: 0x0E7F },
		{ type : "lett", text: _T('Tibetan'), group: _T("Letter"), start: 0x0F00, end: 0x0FFF },
		{ type : "lett", text: _T('Buginese'), group: _T("Letter"), start: 0x1A00, end: 0x1A1F },
		{ type : "lett", text: _T('Balinese'), group: _T("Letter"), start: 0x1B00, end: 0x1B7F },
		{ type : "lett", text: _T('Sundanese'), group: _T("Letter"), start: 0x1B80, end: 0x1BBF },
		{ type : "lett", text: _T('Lepcha'), group: _T("Letter"), start: 0x1C00, end: 0x1C4F },
		{ type : "lett", text: _T('Ol_Chiki'), group: _T("Letter"), start: 0x1C50, end: 0x1C7F },
		{ type : "lett", text: _T('Glagolitic'), group: _T("Letter"), start: 0x1C50, end: 0x1C7F },
		{ type : "lett", text: _T('Coptic'), group: _T("Letter"), start: 0x2C80, end: 0x2CFF },
		{ type : "lett", text: _T('GeorgianSupplement'), group: _T("Letter"), start: 0x2D00, end: 0x2D2F },
		{ type : "lett", text: _T('Ethiopic'), group: _T("Letter"), start: 0x1200, end: 0x137F },
		{ type : "lett", text: _T('EthiopicSupplement'), group: _T("Letter"), start: 0x1380, end: 0x139F },
		{ type : "lett", text: _T('EthiopicExtended'), group: _T("Letter"), start: 0x2D80, end: 0x2DDF },
		{ type : "lett", text: _T('Nko'), group: _T("Letter"), start: 0x07C0, end: 0x07FF },
		{ type : "lett", text: _T('Cherokee'), group: _T("Letter"), start: 0x13A0, end: 0x13FF },
		{ type : "lett", text: _T('Runic'), group: _T("Letter"), start: 0x16A0, end: 0x16FF },
		{ type : "lett", text: _T('Cyrillic'), group: _T("Letter"), start: 0x0400, end: 0x04FF },
		{ type : "lett", text: _T('CyrillicSupplement'), group: _T("Letter"), start: 0x0500, end: 0x052F },
		{ type : "lett", text: _T('Armenian'), group: _T("Letter"), start: 0x0530, end: 0x058F },
		{ type : "lett", text: _T('Arabic'), group: _T("Letter"), start: 0x0600, end: 0x06FF },
		{ type : "lett", text: _T('ArabicSupplement'), group: _T("Letter"), start: 0x0750, end: 0x077F },
		{ type : "lett", text: _T('Syriac'), group: _T("Letter"), start: 0x0700, end: 0x074F },
		{ type : "lett", text: _T('Thaana'), group: _T("Letter"), start: 0x0780, end: 0x07BF },
		{ type : "lett", text: _T('Devanagari'), group: _T("Letter"), start: 0x0900, end: 0x097F },
		{ type : "lett", text: _T('Bengali'), group: _T("Letter"), start: 0x0980, end: 0x09FF },
		{ type : "lett", text: _T('Myanmar'), group: _T("Letter"), start: 0x1000, end: 0x109F },
		{ type : "lett", text: _T('CanadianAboriginal'), group: _T("Letter"), start: 0x1400, end: 0x167F },
		{ type : "lett", text: _T('Ogham'), group: _T("Letter"), start: 0x1680, end: 0x169F },
		{ type : "lett", text: _T('Tagalog'), group: _T("Letter"), start: 0x1700, end: 0x171F },
		{ type : "lett", text: _T('Hanunoo'), group: _T("Letter"), start: 0x1720, end: 0x173F },
		{ type : "lett", text: _T('Buhid'), group: _T("Letter"), start: 0x1740, end: 0x175F },
		{ type : "lett", text: _T('Tagbanwa'), group: _T("Letter"), start: 0x1760, end: 0x177F },
		{ type : "lett", text: _T('Khmer'), group: _T("Letter"), start: 0x1780, end: 0x17FF },
		{ type : "lett", text: _T('Mongolian'), group: _T("Letter"), start: 0x1800, end: 0x18AF },
		{ type : "lett", text: _T('Limbu'), group: _T("Letter"), start: 0x1900, end: 0x194F },
		{ type : "lett", text: _T('TaiLe'), group: _T("Letter"), start: 0x1950, end: 0x197F },
		{ type : "lett", text: _T('NewTaiLue'), group: _T("Letter"), start: 0x1980, end: 0x19DF },
		{ type : "lett", text: _T('cuneiform'), group: _T("Letter"), start: 0x12000, end: 0x1236E },

    ];
}

//---instead of window.alert, confirm, prompt
function appAlert(message,callback){
	if (curLocale.environment.platform == "windowsapp") {
		var msg = new Windows.UI.Popups.MessageDialog(message);



		msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_close"), null, 1));
		msg.defaultCommandIndex = 1;
		try {

			msg.showAsync();
		} catch (e) {
			console.log(e);
		}
	}else{
		alertify.alert(MYAPP.appinfo.name,message,callback);
	}
}
function appConfirm(message,callback,callthen) {
	if (curLocale.environment.platform == "windowsapp") {
		var msg = new Windows.UI.Popups.MessageDialog(message);



		msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_yes"), null, 1));
		msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_cancel"), null, 2));
		msg.defaultCommandIndex = 2;
		msg.cancelCommandIndex = 2;
		var ret = msg.showAsync();//.then(callback);
		ret.then(function (data) {
			console.log(data);
			if (data.id == 1) {
				if (!callback()) {
					if (callthen) callthen();
				}
			}
		});
	}else{
        alertify.confirm(MYAPP.appinfo.name,message,callback,callthen);
	}
}
function appPrompt( message, callthen, defaultval ) {
	if (curLocale.environment.platform == "windowsapp") {
		var msg = new Windows.UI.Popups.MessageDialog( message );
		
		
		swal({
			title : MYAPP.appinfo.name,
			text : message,
			type : "input",
			showCancelButton : true,
			inputValue : defaultval
		},function(str){
			onKeyope = true;
			if (callthen) callthen(str);
		});
	}else{
        alertify.prompt(MYAPP.appinfo.name,message,defaultval,callthen);
	}

}
function appPrompt2(message,callthen,callparams,defaultval){
	/*alertify.set({ 
		buttonReverse : true
	});*/
	alertify.prompt(MYAPP.appinfo.name,message,defaultval, 
		function(evt,value){
			if (callthen) callthen(callparams,value);
		},
		function () {
			console.log("cancel:" + message);
		}
	);
	/*swal({
        title: MYAPP.appinfo.name,
		text : message,
		type : "input",
		showCancelButton : true,
		inputValue : defaultval
	},function(str){
		if (callthen) callthen(callparams,str);
	});*/
}


/**
* 画像を外部から取得
* @param {String} url 画像のURL
* @return {Deferred.Promise} DeferredのPromiseオブジェクト
* -> 呼び出したロジックでは.then(funtion(data){ ... })で処理を続けること。
*/
function loadImage(url){
	//var def = $.Deferred();
	var def = new Promise((resolve,reject)=>{
		if (!url) return reject(false);

		if (curLocale.environment.platform == "windowsapp") {
			var xhr = new XMLHttpRequest();
			xhr.open("GET",url,true);
			xhr.responseType = "blob";
			xhr.onload = function(e){
				//console.log(e);
				resolve(window.URL.createObjectURL(this.response));
			}
			xhr.send();
		}else{
			resolve(url);
		}
	});
	return def;
	
	//return def.promise();
}
var glodiv;
/**
 * OGP情報をサーバ側から取得
 * @param {String} url サイトのURL
 * @param {String} index 呼び出し元のトゥートのIDおよび配列の添字
 */
function loadOGP(url,index) {
	var prm = new URLSearchParams();
	var srvurl = ID("hid_staticpath").value.replace("/static","");
	prm.append("url",url);
	prm.append("_csrf",ID("_csrf").value);
	var req = new Request("/srv/ogp",{
		method : "POST",
		body : prm
	});
	var def = new Promise((resolve,reject)=>{
		return fetch(req).then((res)=>{
			return res.text().then((data)=>{
				//console.log("ogp rawdata=",data);
				var ret = {};
				if (data == "") {
					var tmpa = GEN("a");
					tmpa.href = url;
					ret["og:url"] = url;
					var a = GEN("a");
					a.href = url;
					ret["og:title"] = tmpa.hostname;
					ret["og:site_name"] = tmpa.hostname;
					resolve({data:ret, index: index});

				}else{
					var div = GEN("div");
					//console.log("ogp get=",url,index,data);
					div.innerHTML = data;
					glodiv = div;
					var a = div.querySelectorAll("meta[property]");
					//console.log(a);
					var ogcnt = 0;
					for (var i = 0; i < a.length; i++) {
						//console.log("property&content=",a[i].attributes["property"],a[i].attributes["content"]);
						var pr = a[i].attributes["property"].value;
						var cn = a[i].attributes["content"].value;
						
						if (pr.indexOf("og:") > -1) {
							//console.log(pr, "=", cn);
							ret[pr] = cn;
							ogcnt++;
						}
					}
					a = div.querySelectorAll("meta[name]");
					for (var i = 0; i < a.length; i++) {
						//console.log("name&content=",a[i].attributes["name"],a[i].attributes["content"]);
						var pr = a[i].attributes["name"].value;
						var cn = a[i].attributes["content"] ? a[i].attributes["content"].value : "";
						if (pr.indexOf("og:") > -1) {
							ret[pr] = cn;
							ogcnt++;
						}
					}
					if (ogcnt == 0) {
						var tmpa = GEN("a");
						tmpa.href = url;
						ret["og:url"] = url;
						ret["og:image"] = "";
						//console.log(div,div.querySelector("title"));
						var qsel_title = div.querySelector("title");
						if (qsel_title) {
							ret["og:title"] = qsel_title.textContent;
						}else{
							ret["og:title"] = tmpa.hostname;
						}
						ret["og:site_name"] = tmpa.hostname;
					}
					resolve({data:ret, index: index});

				}
			});
		})
		.catch(error=>{
			reject({error:error, index: index});
		});
	
	});
	return def;
}
/**
 * GPHTのサムネイルをサーバ側から取得
 * @param {String} url サイトのURL
 * @param {String} index 呼び出し元のトゥートのIDおよび配列の添字
 */
function loadGPHT(url,index) {
	var prm = new URLSearchParams();
	var srvurl = ID("hid_staticpath").value.replace("/static","");
	prm.append("url",url);
	prm.append("_csrf",ID("_csrf").value);
	var req = new Request(srvurl+"srv/gpht",{
		method : "POST",
		body : prm
	});
	var def = new Promise((resolve,reject)=>{
		return fetch(req).then((res)=>{
			return res.text().then((data)=>{
				var div = GEN("div");
				div.innerHTML = data;
				var a = div.querySelectorAll("div.RY3tic");
				console.log(a);
				var ret = [];
				for (var i = 0; i < a.length; i++) {
					var elem = a[i].style["backgroundImage"];
					elem = elem.replace("url(","").replace(")","")
						.replace(/"/g,"");
					ret.push(elem);
				}
				resolve({data:ret, index: index});
			});
		});
	
	});
	return def;
}
function loadIAPI() {
	var def = new Promise((resolve,reject)=>{
		var srvurl = ID("hid_staticpath").value.replace("/static","");
		$.ajax({
			url : srvurl+"srv/iapi",
			type : "GET",

		}).then((result)=>{
			console.log(result);
			MYAPP.sns.setInstanceToken(result);
			resolve(true);
		},(xhr,status,err)=>{
			reject(false);
		});
	});
	return def;
}
/**
* プレーンテキストをHTMLで適切な表示になるよう変換する
* @param {String} text 元のテキスト
* @return {String} 変換後のテキスト
*/
function convertText_ForHTML(text) {
    return text;
}

Date.prototype.toFullText = function(){
	var a = this.toLocaleDateString(navigator.language,{year:"numeric", month: "2-digit", day : "2-digit"});
	var b = this.toLocaleTimeString(navigator.language,{hour : "2-digit", minute: "2-digit", second : "2-digit"});
	

	a = a.replace(/\//g,"");
	b = b.replace(/:/g,"");
	if (b.length < 6) {
		b = "0" + b;
	}
	return a+b;
}
Date.prototype.diffDateTime = function () {
	//return (target.getTime() - this.getTime()) / (1000 * 60 * 60 * 24);
	var t = this.getTime();
	var now = new Date().getTime();
	var df = (now - t) / 1000;
	var ret = {
		time : 0,
		type : ""
	};
	if (df < 60) { //  < 60 seconds
		ret.time = 1;
		ret.type = "second"; 
	}else if (df < 3600) { // < 60 minutes
		ret.time = df / 60;
		ret.type = "minute";
	}else if (df < 86400) { // < 24 hours
		ret.time = df / 3600;
		ret.type = "hour";
	}else if (df < 2764800) { // < N days
		ret.time = df / 86400;
		ret.type = "day";
	}else{ // default: < N days
		ret.time = df / 86400;
		ret.type = "day";
	}
	return ret;
}
Date.prototype.diffTime = function (target) {
	return (target.getTime() - this.getTime()) / (1000 * 60 * 60);
}
JSON["original"] = function(obj) {
	return JSON.parse(JSON.stringify(obj));
}
/**
 * check wheather val is during min and max
 * @param {Number} min 
 * @param {Number} val 
 * @param {Number} max 
 * @return {Boolean} true / false
 */
function checkRange(min,val,max){
	if ((min <= val) && (val <= max)) {
		return true;
	}
	return false;
}

/**
 * Cover object for browser localStorage / UWP current.localSettings
 */
var AppStorage = {
    apptype: "",
    filename: "gpdn.db",
    data: {},
    isEnable: function () {
        if (Windows.Storage.ApplicationData.current.localSettings) {
            return true;
        } else {
            return false;
        }
    },
    get: function (key, defaults) {
        var a;
        if (curLocale.environment.platform == "windowsapp") {
            a = Windows.Storage.ApplicationData.current.localSettings.values[key];
        } else {
            a = localStorage.getItem(key);
        }
        if (!a) {
            a = defaults;
        } else {
            a = JSON.parse(a);
        }
        return a;
    },
    set: function (key, value) {
        //console.log("set size=", JSON.stringify(value).length, JSON.stringify(value));
        if (curLocale.environment.platform == "windowsapp") {
            Windows.Storage.ApplicationData.current.localSettings.values[key] = JSON.stringify(value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },
    remove: function (key) {
        if (curLocale.environment.platform == "windowsapp") {
            Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
        } else {
            localStorage.removeItem(key);
        }
    },
    clear: function () {
        if (curLocale.environment.platform == "windowsapp") {
            Windows.Storage.ApplicationData.current.localSettings.values.clear();
        } else {
            localStorage.clear();
        }
    },
    initialize: function (callback) {
        this.apptype = "storeapp";
        callback();
    },
    load: function () {
        var folder = Windows.Storage.ApplicationData.current.localFolder;
        folder.getFileAsync("tweem.ini")
		.then(function (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = reader.result;
               AppStorage.data = JSON.parse(text);
            }
            reader.onerror = function (e) {
               appAlert("not valid file!!");
            }
            reader.readAsText(file);
		}, function (data) {
            console.log("AppStorage.load: not found ini file.");
		});
    },
    save: function () {
        var folder = Windows.Storage.ApplicationData.current.localFolder;
        folder.getFileAsync(AppStorage.filename)
		.then(function (file) {
            Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(AppStorage.data));
		}, function (data) {
           folder.createFileAsync(AppStorage.filename)
			.then(function (file) {
                Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(AppStorage.data));
			});
		});

    }
};


/**
 * Multiple Utility Object
 */
var MUtility = {
	loadingON : function () {
		ID("apploading").classList.remove("common_ui_hidden");
		ID("apploading").classList.add("active");
	},
	loadingOFF : function () {
		ID("apploading").classList.add("common_ui_hidden");
		ID("apploading").classList.remove("active");
	},
	checkRootpath : function (checkpath,basepath) {
		var r = new RegExp(basepath + "$");
		return checkpath.search(r);
	},
	extractPathParams : function (search) {
		var params = search.split("&");
		var ret = {};
        for (var i = 0; i < params.length; i++) {
			var item = params[i].splice("=","");
			ret[item[0]] = item[1];
		}
		return ret;
	},
	/**
	 * enter path following: /hogetype -> /hogetype/123
	 * @param {String} checkpath It's location.pathname , etc...
	 * @param {String} targetpath to go to path
	 */
	enterPathInDetail : function (checkpath, targetpath) {
		history.pushState("","",checkpath+"/"+targetpath);
		location.hash = "";
		return location.pathname;
	},
	enterFullpath : function (targetpath) {
		history.pushState("","",targetpath);
		location.hash = "";
		return location.pathname;
	},
	/**
	 * recovery base path following: /hogetype/123 -> /hogetype
	 * @param {String} targetpath base path to return
	 */
	returnPathToList : function (targetpath) {
		history.pushState("","","..");
		history.replaceState("","",targetpath);
		return location.pathname;
	},
	/**
	 * generate Materialize's material-icon element
	 * @param {string} iconname materialize-icon name
	 */
	generate_icon : function (iconname) {
		var icon = GEN("i");
		icon.className = "material-icons";
		icon.textContent = iconname;
		return icon;
	},
	/**
	 * generate toot path for this app and return it
	 * @param {Gpstatus} status status object of this app
	 */
	generate_tootpath : function (status) {
		var retpath;
		retpath = `/users/${status.account.instance}/${status.account.username}/toots/${status.id}`;
		return retpath;
	},
	/**
	 * generate user page path for this app and return it
	 * @param {Account} status status object of this app
	 */
	generate_userpagepath : function (account) {
		var retpath;
		retpath = `/users/${account.instance}/${account.username}`;
		return retpath;
	},

	getInstanceFromAccount(url) {
		var a = GEN("a");
		a.href = url;
		var tmp = a.hostname;
		return tmp;
	},
	/**
	 * 
	 * @param {String} text target text
	 * @param {String} instance Instance name with the text
	 * @param {Array} emojis emojis info in the toot
	 * @param {Number} size emoji size 
	 */
	replaceEmoji : function (text,instance,emojis,size) {
		var re = text.match(/\:\w+\:/g);
		//console.log(text,re,emojis);
		if (!re) return text;
		var instemojis = {data : {}};
		if (instance in MYAPP.acman.instances) {
			instemojis = MYAPP.acman.instances[instance].emoji;
		}
		for (var r = 0; r < re.length; r++) {
			var rstr = re[r];
			//---from emojis of toot 
			for (var i = 0; i < emojis.length; i++) {
				var emo = emojis[i];
				//console.log("emoji loop=",r,rstr,emo.shortcode,(rstr.indexOf(emo.shortcode) > -1));
				if (rstr.indexOf(emo.shortcode) > -1) {
					var img = `<img src="${emo.url}" alt="${emo.shortcode}" width="${size}" height="${size}">`;
					text = text.replace(rstr,img);
					break;
				}
			}
			//---from emojis of instance
			var ori_rstr = rstr.replace(/\:/g,"");
			if (ori_rstr in instemojis.data) {
				var emo = instemojis.data[ori_rstr];
				var img = `<img src="${emo.url}" alt="${emo.shortcode}" width="${size}" height="${size}">`;
				text = text.replace(rstr,img);
			}
		}
		//console.log(text);
		return text;
	},
	openDirectOnetoot(rawdata){
		var tootdata = JSON.parse(rawdata);
		var toot = JSON.parse(tootdata.toot);
		var context = JSON.parse(tootdata.context);
		var tt = new Gpstatus(toot,14);
		for (var a = 0; a < context.ancestors.length; a++) {
			var ance = context.ancestors[a];
			var gcls = new Gpstatus(ance,14);

			context.ancestors[a] = gcls;

		}
		for (var a = 0; a < context.descendants.length; a++) {
			var desce = context.descendants[a];
			var gcls = new Gpstatus(desce,14);

			context.descendants[a] = gcls;
		}
		tt.ancestors = context.ancestors;
		tt.descendants = context.descendants;

		MYAPP.commonvue.tootecard.status = tt;
		MYAPP.commonvue.tootecard.comment_list_area_viewstyle.default = false;


		//---change each states
		MYAPP.commonvue.tootecard.sizing_window();

		MYAPP.commonvue.tootecard.$nextTick(function(){
			MYAPP.commonvue.tootecard.is_overlaying = true;
		})
		

	}
};
var gevts;
function test_oran() {
	var token = "";
	/*var mst = new MastodonAPI({
		instance: "https://oransns.com",
		api_user_token: token,
	});
	mst.setConfig("stream_url",`wss://${token}@oransns.com`);
	mst.stream("user",function(e){
		console.log("oransns.com: server sents event=",e);
	},function(e) {
		console.log("EventSource failed.",e);
	});*/
	
	/*
	var url = "https://oransns.com/api/v1/streaming/user?access_token=";
	gevts = new EventSource(url, { withCredentials: false } ); 
	gevts.onmessage  = function (e) {
		console.log("oransns.com: server sents event=",e.data);

	}
	gevts.onerror = function(e) {
		console.log("EventSource failed.",e);
	};
	*/

	var xmlHttpRequest=new XMLHttpRequest();
	var lastResponse="";
	var data="";
	xmlHttpRequest.addEventListener("progress",function(event) {
		// chunk=今回受信した断片
		var chunk=xmlHttpRequest.response.substring(lastResponse.length);
		lastResponse=xmlHttpRequest.response;
		
		// data=まだ処理してない断片 (改行まで受信してるとは限らない)
		data=data+chunk;
		
		// 空行をスキップ
		data=data.replace(/^\n/gm,"");
		
		// タイムアウトで切断されないようにするためのダミーデータをスキップ
		data=data.replace(/^:(.*)\n/gm,"");
		
		var content;
		do {
			content=data.match(/^event: (.*)\ndata: (.*)\n([\s\S]*)$/);
			if (content!=null)
			{
				var event=content[1];
				var payload=(content[2]!="undefined" ? JSON.parse(content[2]) : null);
				
				// event(イベント名), payload(データ内容)で処理をする
				
				data=content[3];
				console.log(event,payload);
			}
		} while (content!=null);
		console.log("data=",data);
	},false);
	xmlHttpRequest.open("GET","https://oransns.com/api/v1/streaming/user");
	xmlHttpRequest.setRequestHeader("Authorization",`Bearer ${token}`);
	xmlHttpRequest.send(null);
}