// mastodon javascript lib
// by @kirschn@pleasehug.me 2017
// no fucking copyright
// do whatever you want with it
// but please don't hurt it (and keep this header)


var MastodonAPI = function (config) {
    
    var version = config.version || "1";
    var apiBase = config.instance + `/api/v${version}/`;
    

    function checkArgs(args) {
        var checkedArgs;
        if (typeof args[1] === "function") {
            checkedArgs = { data: {}, callback: args[1] };
        } else {
            checkedArgs = { data: args[1], callback: args[2] };
        }
        if (args.length >= 4) {
        	if (typeof args[3] === "function") {
        		checkedArgs["callback_fail"] = args[3];
        	}else{
        		checkedArgs["callback_fail"] = null;
        	}
        }

        return checkedArgs;
    }

    function addAuthorizationHeader(headers, token) {
        if (token) {
            headers.Authorization = "Bearer " + token;
        }

        return headers;
    }

    function onAjaxSuccess(url, op, callback, logData) {
        return function (data, textStatus, xhr) {
            console.log("Successful " + op + " API request to " + url,
                      ", status: " + textStatus,
                      ", HTTP status: " + xhr.status,
                      ", data: " + (logData ? JSON.stringify(data) : "<skipped>"),
                      data);

            if (typeof callback !== "undefined") {
                callback(data, textStatus);
            }
        };
    }

    function onAjaxError(url, op, callback) {
        return function (xhr, textStatus, errorThrown) {
            console.error("Failed " + op + " API request to " + url,
                          ", status: " + textStatus,
                          ", error: " + errorThrown,
                          ", HTTP status: " + xhr.status,
                          ", response JSON: " + JSON.stringify(xhr.responseJSON));
            if (typeof callback !== "undefined") {
                callback(xhr, textStatus);
            }
        };
    }

    return {
        "config" : config,
        setConfig: function (key, value) {
            // modify initial config afterwards
            this.config[key] = value;
        },
        getConfig: function (key) {
            // get config key
            return this.config[key];
        },
        get: function (endpoint) {
            // for GET API calls
            // can be called with two or three parameters
            // endpoint, callback
            // or
            // endpoint, queryData, callback
            // where queryData is an object { paramname1: "paramvalue1", paramname2: paramvalue2 }

            var args = checkArgs(arguments);
            var queryData = args.data;
            var callback = args.callback;
        	var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;

            // ajax function
            return $.ajax({
                url: url,
                type: "GET",
                data: queryData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "GET", callback, false),
                error: onAjaxError(url, "GET", callback_fail)
            });
        },
        get2: function (endpoint) {
            // for GET API calls
            // can be called with two or three parameters
            // endpoint, callback
            // or
            // endpoint, queryData, callback
            // where queryData is an object { paramname1: "paramvalue1", paramname2: paramvalue2 }

            var args = checkArgs(arguments);
            var queryData = args.data;
            var callback = args.callback;
        	var callback_fail = args.callback_fail || function() {};
            var url = this.config.instance + `/api/v2/` + endpoint;

            // ajax function
            return $.ajax({
                url: url,
                type: "GET",
                data: queryData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "GET", callback, false),
                error: onAjaxError(url, "GET", callback_fail)
            });
        },
        post: function (endpoint) {
            // for POST API calls
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;

            return $.ajax({
                url: url,
                type: "POST",
                data: postData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "POST", callback, false),
                error: onAjaxError(url, "POST", callback_fail)
            });
        },
        postMedia: function (endpoint) {
            // for POST API calls
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;
            var fd = new FormData();
            
            fd.append("file",postData["file"]);

            return $.ajax({
                url: url,
                type: "POST",
                //data: postData,
                data : fd,
                contentType: false,
                processData: false,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                //success: onAjaxSuccess(url, "POST MEDIA", callback, false),
                //error: onAjaxError(url, "POST MEDIA", callback_fail)
            });
        },
        put: function (endpoint) {
            // for PUT API calls
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;

            return $.ajax({
                url: url,
                type: "PUT",
                data: postData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "PUT", callback, false),
                error: onAjaxError(url, "PUT", callback_fail)
            });
        },
        patch: function (endpoint) {
            // for POST API calls
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;
            var fd = new FormData();
            
            for (var obj in postData) {
                fd.append(obj,postData[obj]);
            }

            return $.ajax({
                url: url,
                type: "PATCH",
                //data: postData,
                data : fd,
                contentType: false,
                processData: false,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                //success: onAjaxSuccess(url, "POST MEDIA", callback, false),
                //error: onAjaxError(url, "POST MEDIA", callback_fail)
            });
        },
        patch_credential: function (endpoint) {
            // for PATCH API calls  only update_credential
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;
            
            var fd = new FormData();
            var normaldata = {};
            
            var isimage = false;
            /*for (var obj in postData) {
                
                if ((obj == "avatar") || (obj == "header")) {
                    isimage = true;
                    fd.append(obj,postData[obj]);
                }else{
                    normaldata[obj] = postData[obj];
                }
            }*/

            return $.ajax({
                url: url,
                type: "PATCH",
                data: postData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "PATCH", callback, false),
                error: onAjaxError(url, "PATCH", callback_fail)
            });
            /* $.ajax({
                url: url,
                type: "PATCH",
                //data: postData,
                data : fd,
                contentType: false,
                processData: false,

                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "PATCH", callback, false),
                error: onAjaxError(url, "PATCH", callback_fail)
            });*/
        },
        delete: function (endpoint, callback) {
            // for DELETE API calls.
            var args = checkArgs(arguments);
            var postData = args.data;
            var callback = args.callback;
            var callback_fail = args.callback_fail || function() {};
            var url = apiBase + endpoint;
            
            return $.ajax({
                url: url,
                type: "DELETE",
                data: postData,
                headers: addAuthorizationHeader({}, this.config.api_user_token),
                success: onAjaxSuccess(url, "DELETE", callback, false),
                error: onAjaxError(url, "DELETE")
            });
        },
        stream: function (streamType, onData, onError) {
            // Event Stream Support
            // websocket streaming is undocumented. i had to reverse engineer the fucking web client.
            // streamType is either
            // user for your local home TL and notifications
            // public for your federated TL
            // public:local for your home TL
            // hashtag&tag=fuckdonaldtrump for the stream of #fuckdonaldtrump
            // callback gets called whenever new data ist recieved
            // callback { event: (eventtype), payload: {mastodon object as described in the api docs} }
            // eventtype could be notification (=notification) or update (= new toot in TL)
            var wss = this.getConfig("stream_url");
            if (wss) {
            	wss += "/api/v1/";
            }else{
            	wss = "wss://" + apiBase.substr(8);
            }
            var es = new WebSocket(wss		//"wss://" + apiBase.substr(8)
                + "streaming/?access_token=" + this.config.api_user_token + "&stream=" + streamType);
            var listener = function (event) {
                console.log("Got Data from Stream " + streamType);
                event = JSON.parse(event.data);
                event.payload = JSON.parse(event.payload);
                onData(event);
            };
            es.onmessage = listener;
            es.onclose = function (e) {
            	console.log("wss closed:",e);
            	onError(e);
            }
            this.setConfig("stream_"+streamType,es);
        },
        stream_noauth: function (streamType, onData, onError) {
            // Event Stream Support
            // websocket streaming is undocumented. i had to reverse engineer the fucking web client.
            // streamType is either
            // user for your local home TL and notifications
            // public for your federated TL
            // public:local for your home TL
            // hashtag&tag=fuckdonaldtrump for the stream of #fuckdonaldtrump
            // callback gets called whenever new data ist recieved
            // callback { event: (eventtype), payload: {mastodon object as described in the api docs} }
            // eventtype could be notification (=notification) or update (= new toot in TL)
            var wss = this.getConfig("stream_url");
            if (wss) {
            	wss += "/api/v1/";
            }else{
            	wss = "wss://" + apiBase.substr(8);
            }
            var es = new WebSocket(wss		//"wss://" + apiBase.substr(8)
                + "streaming?stream=" + streamType);
            var listener = function (event) {
                console.log("Got Data from Stream " + streamType);
                event = JSON.parse(event.data);
                event.payload = JSON.parse(event.payload);
                onData(event);
            };
            es.onmessage = listener;
            es.onclose = function (e) {
            	console.log("wss closed:",e);
            	onError(e);
            }
            this.setConfig("stream_"+streamType,es);
        },
        closeStream : function (streamType) {
        	var es = this.getConfig("stream_"+streamType);
        	if (es && (es.readyState === 1)) {
        		es.close();
        	}
        },
        llstream: function (streamType, onData, onError) {
            // Event Stream Support
            // websocket streaming is undocumented. i had to reverse engineer the fucking web client.
            // streamType is either
            // user for your local home TL and notifications
            // public for your federated TL
            // public:local for your home TL
            // hashtag&tag=fuckdonaldtrump for the stream of #fuckdonaldtrump
            // callback gets called whenever new data ist recieved
            // callback { event: (eventtype), payload: {mastodon object as described in the api docs} }
            // eventtype could be notification (=notification) or update (= new toot in TL)
            var xmlHttpRequest=new XMLHttpRequest();
            var lastResponse="";
            var data="";
            var listener = function (event) {
                console.log("Got Data from long polling " + streamType);
                //event = JSON.parse(event.data);
                //event.payload = JSON.parse(event.payload);
                onData(event);
            };
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
                        listener({
                            event : event,
                            payload : payload
                        });
                        
                    }
                } while (content!=null);
            },false);
            xmlHttpRequest.addEventListener("error",function(event) {
                console.log("long polling closed:",event);
                onError(event);
            },false);
            xmlHttpRequest.open("GET",`${apiBase}streaming/${streamType}`);
            xmlHttpRequest.setRequestHeader("Authorization",`Bearer ${this.config.api_user_token}`);
            xmlHttpRequest.send(null);
            this.setConfig("stream_"+streamType,xmlHttpRequest);
        },
        closellstream : function (streamType) {
        	var es = this.getConfig("stream_"+streamType);
        	if (es) {
        		es.abort();
        	}
        },
        registerApplication: function (client_name, redirect_uri, scopes, website, callback) {
            // register a new application

            // OAuth Auth flow:
            // First register the application
            // 2) get a access code from a user (using the link, generation function below!)
            // 3) insert the data you got from the application and the code from the user into
            // getAccessTokenFromAuthCode. Note: scopes has to be an array, every time!
            // For example ["read", "write"]

            // determine which parameters we got
            if (website === null) {
                website = "";
            }
            // build scope array to string for the api request
            if (typeof scopes !== "string") {
                scopes = scopes.join(" ");
            }
            var url = apiBase + "apps";
            return $.ajax({
                url: url,
                type: "POST",
                data: {
                    client_name: client_name,
                    redirect_uris: redirect_uri,
                    scopes: scopes,
                    website: website
                },
                success: onAjaxSuccess(url, "REGISTER", callback, true),
                error: onAjaxError(url, "REGISTER")
            });
        },
        generateAuthLink: function (client_id, redirect_uri, responseType, scopes) {
            return config.instance + "/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri +
                    "&response_type=" + responseType + "&scope=" + scopes.join("+");
        },
        getAccessTokenFromAuthCode: function (client_id, client_secret, redirect_uri, code, callback) {
            var url = config.instance + "/oauth/token";
            return $.ajax({
                url: url,
                type: "POST",
                data: {
                    client_id: client_id,
                    client_secret: client_secret,
                    redirect_uri: redirect_uri,
                    grant_type: "authorization_code",
                    code: code
                },
                success: onAjaxSuccess(url, "TOKEN", callback, true),
                error: onAjaxError(url, "TOKEN")
            });
        }
    };
};

// node.js
if (typeof module !== "undefined") { module.exports = MastodonAPI; }
