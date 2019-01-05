'use strict';
const path = require('path');
const web = require("request");
const {
    JSDOM
} = require("jsdom");
const fs = require("fs");
//const Mastodon = require("mastodon-api")
//import Mastodon from '../node_modules/mastodon-api/lib/mastodon';

const CON_ACCEPT_HOSTS = [
    "localhost",
    "gplusdon.azurewebsites.net",
    "gplusdon.net"
];
const INSTANCE_TOKEN = "FQOBCaZyaA5PC0Tx0QyPjjboGL8qm5dpULnhzUCFDc8q8i1eD2I9Dq4S2NM6GpMVgMrfUF1o8fCBfkt5cUAGjCY2XPwQj2fbGGqFXM02IFIQuSbcbZdNcfE7jxXZ4Zkw";
//lumsis@mastodon.cloud
const __user_dirname = __dirname.replace("apps","");

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


var ucommon = {
    sysinfo: {
        VAPID: "BCGiOKTrNfAFmIPybyacC2UcM2y9zJlDCtacpZoX44U4QjkY1HtaLla0leTn5HWXUevOrSFwb3xunrHHffdPaek="
    },
    load_author: function () {
        return {
            name: "G+Don",
            author: "ISHII Eiju",
            advisor : [],
            version: "1.0.0"
        };
    },
    load_translation: function (locales) {
        var ret = "";
        for (var i = 0; i < locales.length; i++) {
            var lo = locales[i];
            var lofile = path.join(__user_dirname, `/static/strings/${lo}.json`);
            if (fs.existsSync(lofile)) {
                ret = fs.readFileSync(lofile, "utf-8");
                break;
            }
        }
        return ret;
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
    load_website_ogp: loadWebsiteOGP
};

module.exports = ucommon;