'use strict';
const path = require('path');
const web = require("request");
const sysconst = require("./sysconst");
const {
    JSDOM
} = require("jsdom");
const fs = require("fs");
//const Mastodon = require("mastodon-api")
//import Mastodon from '../node_modules/mastodon-api/lib/mastodon';

const CON_ACCEPT_HOSTS = [
    "localhost",
    "gpdontest.azurewebsites.net",
    "gplusdon.azurewebsites.net",
    "gplusdon.net"
];
const INSTANCE_TOKEN = sysconst.server_token();
//lumsis@mastodon.cloud
const __user_dirname = __dirname.replace("apps", "");
const appEffectiveName = "G+Don";


function judgeLanguage(request) {
    var lan = request.acceptsLanguages();
    if (request.query) {
        if ("hl" in request.query) {
            lan = [request.query.hl];
        }
    }
    if ("_gp_lang" in request.cookies) {
        lan = [request.cookies["_gp_lang"]];
    }
    return lan;
}
/**
 * 
 * @param {Request} request request object
 * @param {String} locales locale string
 */
function load_translation(request, locales) {
    var ret = "";
    var tmp = ["ja"]; //default languages
    if (locales) tmp = locales;

    var ishit = "";
    for (var i = 0; i < tmp.length; i++) {
        var lo = tmp[i];
        var lofile = path.join(__user_dirname, `/static/strings/${lo}.json`);
        if (fs.existsSync(lofile)) {
            ishit = lo;
            ret = fs.readFileSync(lofile, "utf-8");
            break;
        }
    }

    return ret;
}
async function loadWebsiteOGP(request, url) {
    var ret = "";
    //console.log("param url=", url);
    var def = new Promise((resolve, reject) => {
        var ishit = false;
        for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
            if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
                ishit = true;
                break;
            }
        }
        //console.log("ishit=",ishit);
        if (!ishit) reject("");

        web(url, (error, response, body) => {
            //console.log("web.get=", error, response, body);
            const dom = new JSDOM(body);
            var info = dom.window.document.head;
            
            resolve(info.innerHTML);
        });

    });
    return def;
}
async function getGeolocation(request,param) {
    var def = new Promise((resolve, reject) => {
        var ishit = false;
        //console.log("refer=",request.headers.referer);
        for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
            if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
                ishit = true;
                break;
            }
        }
        var yolpurl = `https://map.yahooapis.jp/search/local/V1/localSearch?appid=${sysconst.yh_id}&lat=${param.lat}&lon=${param.lng}&dist=${param.dist}&output=json`;
        //console.log("ishit=",ishit);
        if (!ishit) reject("");

        web(yolpurl, (error, response, body) => {
            //console.log(body);
            resolve(body);
        });

    });
    return def;
}

async function getDirectoryMastodon(request, param) {
    var def = new Promise((resolve, reject) => {
        var ishit = false;
        for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
            if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
                ishit = true;
                break;
            }
        }
        //console.log("ishit=",ishit);
        if (!ishit) reject("");

        web(url, (error, response, body) => {
            //console.log("web.get=", error, response, body);
            const dom = new JSDOM(body);
            var info = dom.window.document.head;

            resolve(info.innerHTML);
        });

    });
    return def;
}

var ucommon = {
    sysinfo: {
        name: sysconst.package_info.name,
        fullname: appEffectiveName,
        author: sysconst.package_info.author.name,
        advisor: [],
        version: sysconst.package_info.version,
        oginfo: { //---default value
            title: appEffectiveName,
            type: "website",
            description: "",
            url: "https://gplusdon.net",
            image: "https://gplusdon.net/static/images/gp_og_image.png",
            site_name: appEffectiveName
        },
        yh_id: sysconst.yh_id,
        mab_id: sysconst.mab_id,
        VAPID: sysconst.vap_id(),
        gdaky: sysconst.gdrive.web.api_key,
        gdid: sysconst.gdrive.web.client_id
    },
    load_translation: load_translation,
    analyze_locale: function (request) {
        var lan = judgeLanguage(request);
        var trans = ucommon.load_translation(request, lan);
        var js = JSON.parse(trans);
        ucommon.sysinfo.oginfo.description = js.appDescription;
        return {
            lang : lan[0],
            trans: trans,
            realtrans : js,
            sysinfo: ucommon.sysinfo
        };
    },
    _T : function () {
        var js = arguments[0];
        var res = arguments[1];
        var params = [];
        var retstr = "";
        if (arguments.length > 2) {
            params = arguments[2];
        }
        if (js != null) {
            if (res in js) {
                retstr = js[res];
            }else{
                retstr = res;
            }
        }else{
            retstr = res;
        }

        //---replace parameters.
        var pcnt = params.length;
        if (pcnt > 9) pcnt = 9;
        for (var i = 0; i < pcnt; i++) {
            var repstr = "%"+(i+1);
            retstr = retstr.replace(repstr,params[i]);
        }
        return retstr;
    },
    load_instance_search_token: function (request) {
        var ret = "";
        for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
            if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
                ret = INSTANCE_TOKEN;
                break;
            }
        }
        return ret;
    },
    load_website_ogp: loadWebsiteOGP,
    get_geolocation : getGeolocation
};

module.exports = ucommon;