const request = require("request-promise");
const url = require("url");
const sysconst = require("./sysconst");

const Mastodon = require("mastodon-api");
//import Mastodon from '../node_modules/mastodon-api/lib/mastodon';

class MastodonServer {
    /**
     * 
     * @param {String} instance instance domain
     * @param {String} token server/client token
     */
    constructor(instance,token) {
        this.token = token;
        this.instance = instance;
        this.api = new Mastodon({
            access_token: this.token,
            timeout_ms: 60 * 1000,
            api_url: `https://${this.instance}/api/v1/`
        });
    }
    extractHeaderLink(link) {
        var ret = { next: "", prev: "" };
        if (!link) return ret;
        var arr = String(link).split(",");
        for (var i = 0; i < arr.length; i++) {
            //---<hogehoge>; max_id="next" ->
            var ln = arr[i].split(";");
            ln[0] = ln[0].replace("<", "").replace(">", "");
            ln[1] = ln[1].trim().replace("rel=", "").replace(/"/g, "");
            //---?max_id=92929 -> 
            var a = url.parse(ln[0]);
            
            var ser = a.search.replace("?", "").split("&");
            var consIDprop = ["since_id", "min_id", "max_id"];
            for (var s = 0; s < ser.length; s++) {
                ser[s] = ser[s].split("=");
                if (consIDprop.indexOf(ser[s][0]) > -1) {
                    ret[ln[1]] = ser[s][1];
                }
            }
            //ret[ln[1]] = a.search.split("=")[1];
        }
        return ret;
    }

    originalGet(url, options) {
        console.log("url=", url);
        var res = request.get(url,options);
        return res;
    }
    originalPost(url, options) {
        console.log("url=", url);
        var res = request.post(url,options);
        return res;
    }
    getUser(instance, idname) {
        return this.api.get(`accounts/search`, {
            q: `@${idname}@${instance}`,
            limit : 1
        })
        .then(result => {
            if (result.data.length >= 1) {
                var data =  result.data[0];
                var arr = data.url.replace("https://","").split("/");
                
                return data;
            } else {
                return { };
            }
        });
    }
    getToots(userid, options) {
        return this.api.get(`accounts/${userid}/statuses`, options)
        .then((result,resp) => {
            console.log(`accounts/${userid}/statuses`, result);
            var hlink = this.extractHeaderLink(result.resp.headers.link);
            for (var i = 0; i < result.data.length; i++) {
                var tmp = url.parse(result.data[i].account.url);
                result.data[i].account["instance"] = tmp.hostname;
            }
            return { data: result.data, paging: hlink };
        });
    }
    

}

var cls_mstdn = {
    loadAPImaster: function () {
        return new MastodonServer("mastodon.cloud", sysconst.server_mastodon_cloud());
    },
    loadAPI: function (instance) {
        return new MastodonServer(instance, "");
    },
    /**
     * retrieve real user id from API with temporary mastodon account in this server
     * @param {Mastodon} api Mastodon api object
     * @param {String} instance instance name
     * @param {String} idname username
     * @return {Promise<Account>} Account object
     */
    getUser: function (api, instance, idname) {
        return api.getUser(instance, idname)
        .then(result1 => {
            console.log("result1=",result1);
            return api.getToots(result1.id, {limit:1});
        })
        .then(result2 => {
            console.log("result2=",result2);
            var sta = result2.data[0];

            var realuri = sta.uri.replace("/users", "/api");
            realuri = realuri.replace(`/${idname}`, "/v1");
            return api.originalGet(realuri, {});
        })
        .then(result3 => {
            console.log("result3=",result3);
            var tt = JSON.parse(result3);
            tt.account["instance"] = instance;
            tt.account["text"] = tt.account.note.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
            tt.account["relationship"] = {
                id : tt.account.id,
                following : false,
                followed_by : false,
                blocking : false,
                muting : false,
                muting_notifications : false,
                requested : false,
                domain_blocking : false,
                showing_reblogs : false,
                endorsed : false
            };
            return tt.account;
        })
        .catch(error=>{
            console.log(error);
            
        });
    }
};

module.exports = cls_mstdn;