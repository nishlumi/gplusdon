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
    "gplusdon.azurewebsites.net",
    "gplusdon.net"
];
const INSTANCE_TOKEN = sysconst.server_token();
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
        name: sysconst.package_info.name,
        fullname: "G+Don",
        author: sysconst.package_info.author.name,
        advisor: [],
        version: sysconst.package_info.version,
        VAPID: sysconst.vap_id()
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