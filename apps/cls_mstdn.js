const request = require("request-promise");
const Mastodon = require("mastodon-api");
//import Mastodon from '../node_modules/mastodon-api/lib/mastodon';
const SERVER_TOKEN = "c84d803cc6eacb9d0dad2282ce32157db543332275a162f1835c32e099200fa9";

class MastodonServer {
    constructor(instance) {
        this.token = SERVER_TOKEN;
        this.instance = instance;
        this.api = new Mastodon({
            access_token: this.token,
            timeout_ms: 60 * 1000,
            api_url: `https://${this.instance}/api/v1/`
        });
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
                return result.data[0];
            } else {
                return { };
            }
        });
    }

}

var cls_mstdn = {
    loadAPI: function (instance) {
        return new MastodonServer("mastodon.cloud");
    }
};

module.exports = cls_mstdn;