'use strict';
const path = require('path');
const web = require("request");
const weburl = require("url");
const webreq = require("request-promise");
const Iconv = require('iconv-lite');
const jschardet = require('jschardet');
const mimelib = require("mimelib-noiconv");
const sanhtml = require("sanitize-html");
var cls_mstdn = require("./cls_mstdn");
var res_langs = require("./res_langs");

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
const avalable_languages = [
    {
        code: "ja", name: "日本語"
    },
    {
        code: "en", name: "English",
    },
    {
        code: "eo", name: "Esperanto",
    },
    {
        code: "fr", name: "Français",
    },
    {
        code: "de", name: "Deutsche",
    }
];

function load_gapiInfo(request) {
    var ishit = false;
    var ret = {
        cd: "0",
        msg: ""
    };
    console.log(JSON.stringify(request.headers));
    for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
        if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
            ishit = true;
            break;
        }
    }
    /*
      , sysinfo.gdaky, sysinfo.gdid, sysinfo.yh_id, sysinfo.mab_id, sysinfo.gdaky_pic, sysinfo.gdaky_pht
     */
    if (ishit) {
        ret["akey"] = sysconst.gdrive.web.api_key;
        ret["clid"] = sysconst.gdrive.web.client_id;
        ret["paky"] = sysconst.gdrive.web.picker_api_key;

        ret["yh_id"] = sysconst.yh_id;
        ret["mab_id"] = sysconst.mab_id;
        ret["VAPID"] = sysconst.vap_id();
        ret["gdaky_pht"] = sysconst.gdrive.web.photo_api_key;


        return ret;
    } else {
        ret["cd"] = "1";
        ret["msg"] = "No permit referer";
        return ret;
    }
}
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
 * @return {JSON} locale data
 */
function load_translation(request, locales) {
    var ret = "";
    var tmp = ["ja"]; //default languages
    if (locales) tmp = locales;

    var ishit = "";
    ret = res_langs.loadData(tmp[0]);
    /*
    for (var i = 0; i < tmp.length; i++) {
        var lo = tmp[i];
        var lofile = path.join(__user_dirname, `/static/strings/${lo}.json`);
        if (fs.existsSync(lofile)) {
            ishit = lo;
            ret = fs.readFileSync(lofile, "utf-8");
            break;
        }
    }
    */
    return ret;
}
async function loadWebsiteOGP(request, info, url) {
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

        var tmpurl = weburl.parse(url);

        if (CON_ACCEPT_HOSTS.indexOf(tmpurl.hostname) > -1) {
            //---when in this app site
            var arr = tmpurl.pathname.split("/");
            var instance = "";
            var id = "";
            if (arr.length >= 3) {
                instance = arr[2];
                id = arr[3];
            }
            if (arr[1] == "users") {

                var api = cls_mstdn.loadAPImaster();
                cls_mstdn.getUser(api, instance, id)
                    .then(result => {
                        //console.log(result);
                        //---set up og:
                        var oginfo = { //---default value
                            title: appEffectiveName,
                            type: "website",
                            description: "",
                            url: "https://gplusdon.net",
                            image: "https://gplusdon.net/static/images/gp_og_image.png",
                            site_name: appEffectiveName
                        };
                        if ((result) && ("id" in result)) {
                            var name = (result.display_name.trim() == "" ? result.username : result.display_name);
                            oginfo.title = ucommon._T(info.realtrans, "lab_profile", [`${name}@${result.instance}`]);
                            oginfo.description = result.text;
                            oginfo.type = "profile";
                            oginfo.url = `https://${request.hostname}/users/${instance}/${id}`;
                            oginfo.image = result.avatar;

                        }
                        var HTML_FOR_OGP = `
                        <meta property="og:title" content="${oginfo.title}" />
                        <meta property="og:type" content="${oginfo.type}" />
                        <meta property="og:description" content="${oginfo.description}" />
                        <meta property="og:url" content="${oginfo.url}" />
                        <meta property="og:image" content="${oginfo.image}"/>
                        <meta property="og:site_name" content="${oginfo.site_name}" />
                    `;
                        resolve(HTML_FOR_OGP);

                    });
            } else {
                var oginfo = { //---default value
                    title: appEffectiveName,
                    type: "website",
                    description: "",
                    url: "https://gplusdon.net",
                    image: "https://gplusdon.net/static/images/gp_og_image.png",
                    site_name: appEffectiveName
                };
                
                var HTML_FOR_OGP = `
                        <meta property="og:title" content="${oginfo.title}" />
                        <meta property="og:type" content="${oginfo.type}" />
                        <meta property="og:description" content="${oginfo.description}" />
                        <meta property="og:url" content="${oginfo.url}" />
                        <meta property="og:image" content="${oginfo.image}"/>
                        <meta property="og:site_name" content="${oginfo.site_name}" />
                    `;
                resolve({
                    raw : oginfo,
                    html: HTML_FOR_OGP
                });
            }
        } else {

            web({ url: url, method: "GET", encoding: null },(error, response, body) => {
                //console.log("web.get=", error, response, body);
                if (error) {
                    reject({
                        cd: -1,
                        err: "noget"
                    });
                } else {
                    if (response.statusCode === 200) {
                        var encoding = null;
                        //var iconv = new Iconv('EUC-JP', 'UTF-8//TRANSLIT//IGNORE');
                        if (response.headers["content-type"]) {
                            encoding = mimelib.parseHeaderLine(response.headers['content-type']).charset;
                        }
                        if (!encoding) {
                            encoding = jschardet.detect(body).encoding;
                        }
                        if (encoding && Iconv.encodingExists(encoding)) {
                            body = Iconv.decode(body, encoding);

                            var dom = new JSDOM(body);
                            var info = dom.window.document.head;
                            var ht = (info.innerHTML);
                            resolve({
                                raw: body,
                                html: sanhtml(ht)
                            });

                        } else {
                            reject({
                                cd: -1,
                                err: "nofinish"
                            });
                        
                        }
                        
                    } else {
                        reject({
                            cd: -1,
                            err: "nofinish"
                        });
                    }

                }
            });
        }

    });
    return def;
}
/*
 * 
 * @param {Rquest} request 
 * @param {JSON} param 
 *   lat : 9.99,
 *   lng : 9.99,
 *   dist : 9
 *   apitype : 9 (0 - placeinfo, 1 - localsearch)
 */
async function getGeolocation(request, param) {
    var getLatLngRange = function (lat, lng, dist) {
        let lat_len = 30.9;
        let lng_len = 20.5;
        //---km -> m
        var rad = dist * 1000;

        var lat_scope = (rad / lat_len) / 3600;
        var lng_scope = (rad / lng_len) / 3600;

        var ret = {
            ne: {
                lat: lat + lat_scope,
                lng: lng - lng_scope
            },
            nw: {
                lat: lat + lat_scope,
                lng: lng + lng_scope
            },
            se: {
                lat: lat - lat_scope,
                lng: lng - lng_scope
            },
            sw: {
                lat: lat - lat_scope,
                lng: lng + lng_scope
            }
        };
        return ret;

    };
    var def = new Promise((resolve, reject) => {
        var ishit = false;
        //console.log("refer=",request.headers.referer);
        for (var i = 0; i < CON_ACCEPT_HOSTS.length; i++) {
            if (request.headers.referer.indexOf(CON_ACCEPT_HOSTS[i]) > -1) {
                ishit = true;
                break;
            }
        }
        var endpoint = "";
        var yolpurl = "";
        if (param.apitype == "0") {
            var coord = getLatLngRange(param.lat, param.lng, parseFloat(param.dist));
            var precision = 25;
            var zoom = 13;
            endpoint = "https://map.yahooapis.jp/spatial/V1/shapeSearch";
            yolpurl = `${endpoint}?appid=${sysconst.yh_id}&coordinates=${coord.ne.lng},${coord.ne.lat} ${coord.nw.lng},${coord.nw.lat} ${coord.sw.lng},${coord.sw.lat} ${coord.se.lng},${coord.se.lat}&output=json&precision=${precision}&z=${zoom}`;
        }else{
            endpoint = "https://map.yahooapis.jp/search/local/V1/localSearch";
            yolpurl = `${endpoint}?appid=${sysconst.yh_id}&lat=${param.lat}&lon=${param.lng}&dist=${param.dist}&output=json`;
        }
        console.log(yolpurl);
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

            resolve(sanhtml(info.innerHTML));
        });

    });
    return def;
}
async function getOuterImageData(request, param) {
    const btoa = str => {
        let buffer;
        if (Buffer.isBuffer(str)) {
            buffer = str;
        } else {
            buffer = new Buffer(str.toString(), 'base64');
        }

        return buffer.toString('base64');
    };
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
        let photo = JSON.parse(param.photo);

        web(`${photo.baseUrl}=w${photo.mediaMetadata.width}-h${photo.mediaMetadata.height}-no`, {encoding :null},(error, response, body) => {
            const base64 = btoa(body);

            resolve({
                data : `data:image/png;base64,${base64}`
            });
            //resolve(body);
        });

    });
    return def;
}

var ucommon = {
    swjs : "pwabuilder-sw.js",
    sysinfo: {
        name: sysconst.package_info.name,
        fullname: appEffectiveName,
        author: sysconst.package_info.author.name,
        advisor: [],
        version: sysconst.package_info.version,
        hostname : "",
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
        gdid: sysconst.gdrive.web.client_id,
        gdaky_pic: sysconst.gdrive.web.picker_api_key,
        gdaky_pht: sysconst.gdrive.web.photo_api_key,
        color: {
            bg_first: "white",
            bg_second: "grey lighten-3",
            fw: "black--text"
        }
    },
    load_translation: load_translation,
    load_gapiInfo: load_gapiInfo,
    /**
     * 
     * @param {Request} request request object
     * @return {Object} neccesary data 
     */
    analyze_locale: function (request) {
        var lan = judgeLanguage(request);
        var trans = ucommon.load_translation(request, lan);
        //var js = trans;
        ucommon.sysinfo.oginfo = { //---default value
            title: appEffectiveName,
            type: "website",
            description: "",
            url: "https://gplusdon.net",
            image: "https://gplusdon.net/static/images/gp_og_image.png",
            site_name: appEffectiveName
        };
        ucommon.sysinfo.oginfo.description = trans.appDescription;
        ucommon.sysinfo.hostname = request.hostname;
        return {
            lang: lan[0],
            avalable_strings: res_langs.support,
            trans: JSON.stringify(trans),
            realtrans : trans,
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
    get_geolocation: getGeolocation,
    get_outerimage: getOuterImageData
};

module.exports = ucommon;