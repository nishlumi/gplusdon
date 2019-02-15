const request = require("request-promise");
const url = require("url");
const sysconst = require("./sysconst");

const Mastodon = require("mastodon-api");
//import Mastodon from '../node_modules/mastodon-api/lib/mastodon';
const needAuthInstances = [
    "pawoo.net","qiitadon.com","friends.nico"
];

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
        return request.get(url,options.api)
        .then(result=>{
            return {
                data : result,
                options : options
            };
        });
    }
    originalPost(url, options) {
        console.log("url=", url);
        var res = request.post(url,options.api);
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
                var arr = url.parse(data.url);
                data["instance"] = arr.hostname;
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
            return { data: result.data, paging: hlink, userid : userid, options : options };
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
            return api.getToots(result1.id, {
                api : {limit:1},
                app : {
                    copyuser : result1
                }
            });
        })
        .then(result2 => {
            console.log("result2=",result2);
            var sta = result2.data[0];

            var realuri = sta.url.replace(`/@${idname}`, "/api/v1/statuses");
            return api.originalGet(realuri, {
                api : {},
                app : {
                    copy_userid : result2.options.app.copyuser.id,
                    copy_instance : result2.options.app.copyuser.instance
                }
            });
        })
        .then(result3 => {
            console.log("result3=",result3);
            var tt = JSON.parse(result3.data);
            tt.account["instance"] = instance;
            tt.account["copy"] = {
                id : tt.account.id,
                instance : instance,
            };
            if (needAuthInstances.indexOf(instance) > -1) {
                //---if request instance is need auth, return the instance with to call API(mastodon.cloud)
                tt.account.copy.id = result3.options.app.copy_userid;
                tt.account.copy.instance = api.instance;
            }
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