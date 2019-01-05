/**
 * e.data interface:
 * @param {string} data[0] API's method
 * @param {String} data[1] API's endpoint
 * @param {Object} data[2] API's options
 * @param {Function} data[3] API's base opitons
 *     baseUrl = instance uri
 *     token = account's access token
 */
self.addEventListener('message', function(e) {
    importScripts(
        "/static/gplusdon/lib/jquery.min.js",
        "/static/gplusdon/lib/mastodon.js",
    );

    console.log('Worker: Message received from main script',e);
    var data = e.data;
    const method = data[0];
    const endpoint = data[1];
    const apioptions = data[2];
    const appoptions = data[3];
    const api = new MastodonAPI({
        instance: appoptions.baseUrl
    });
    api.setConfig("api_user_token", appoptions.token);


    if (method == "get") {
        api.get(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "post") {
        api.post(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "postMedia") {
        api.postMedia(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "delete") {
        api.delete(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "put") {
        api.put(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "patch") {
        api.patch(endpoint,apioptions)
        .then((result)=>{
            this.self.postMessage(result);
        });
    }else if (method == "oget") {
        $.ajax({
            url : endpoint,
            type : "GET",
        }).then((result)=>{
            this.self.postMessage(result);
        },(xhr,status,err)=>{
            this.self.postMessage(status);
        });
    }else if (method == "opost") {
    }
    console.log('Worker: Posting message back to main script');
},false);