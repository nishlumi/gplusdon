class Gpsns {
    constructor (){
        this._accounts = null;
        this._instanceToken = "";
    }
    setAccount(ac) {
        this._accounts = ac;
    }
    setInstanceToken(tok) {
        this._instanceToken = tok;
    }
    extractHeaderLink(link) {
        var ret = {next : "", prev : ""};
        if (!link) return ret;
        var arr = String(link).split(",");
        for (var i = 0; i < arr.length; i++) {
            //---<hogehoge>; max_id="next" ->
            var ln = arr[i].split(";");
            ln[0] = ln[0].replace("<","").replace(">","");
            ln[1] = ln[1].trim().replace("rel=","").replace(/"/g,"");
            //---?max_id=92929 -> 
            var a = GEN("a");
            a.href = ln[0];
            var ser = a.search.replace("?","").split("&");
            var consIDprop = ["since_id","min_id","max_id"];
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
/**=================================================================
 *   basic API
 * =================================================================
 */
    originalGet(url,options) {
        return $.ajax({
            url : url,
            type : "GET"
        });
    }
    normalGet(endpoint,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(endpoint,options)
            .then((data,status,xhr)=>{
                console.log(endpoint,data);
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    normalPost(endpoint,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.post(endpoint,options)
            .then((data,status,xhr)=>{
                console.log(endpoint,data);
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
/**=================================================================
 *   Statuses API
 * =================================================================
 */
    getToots(userid,options) {
        var def = new Promise((resolve,reject)=>{
            var retdef;
            var targetid = userid == "me" ? this._accounts.id : userid;
            if ("noauth" in options.app) {
                retdef = MYAPP.server_account.api.get_noauth(`accounts/${targetid}/statuses`,options.api);
            }else{
                if (this._accounts == null) {
                    reject(false);
                    return;
                }

                /*
                Get Accounts Statuses
                the order following:
                    1, pinned statuses
                    2, normal statuses (any options)
                */
                retdef = this._accounts.api.get(`accounts/${targetid}/statuses`,options.api);
            }

            retdef.then((data,status,xhr)=>{
                console.log(`accounts/${targetid}/statuses`,data, options);
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve({data: data, paging: hlink});
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getTimeline(type,options) {
        var def = new Promise((resolve,reject)=>{
            var retdef;
            var endpoint = "";
            if (type == "local") {
                endpoint = `timelines/public`;
            }else if (type == "public") {
                endpoint = `timelines/public`;
            }else{
                endpoint = `timelines/${type}`;
            }
            if ("noauth" in options.app) {
                retdef = MYAPP.server_account.api.get_noauth(endpoint,options.api);
            }else{
                if (this._accounts == null) {
                    reject(false);
                    return;
                }
                //var targetid = userid == "me" ? this._accounts.id : userid;

                //console.log(endpoint);
                retdef = this._accounts.api.get(endpoint,options.api);
            }
            retdef.then((data,status,xhr)=>{
                console.log(endpoint,data,xhr.getAllResponseHeaders());
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve({data: data, paging: hlink});
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getConversation(id,parentTootID, parentIndex) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`statuses/${id}/context`)
            .then((data)=>{
                console.log(`statuses/${id}/context`,
                    id,parentTootID, parentIndex,data);
                resolve({data: data, id: id, parentID : parentTootID, index: parentIndex});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getTootCard(id,parentTootID, parentIndex) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`statuses/${id}/card`)
            .then((data)=>{
                console.log(`statuses/${id}/card`,
                    id,parentTootID, parentIndex,data);
                resolve({data: data, id: id, parentID : parentTootID, index: parentIndex});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    /**
     * Getting who reblogged a status
     * @param {String} id status id
     * @param {Object} options api options
     * @param {String} parentIndex original statuses list index
     * @return {Promise<Account[]>} Array of Mastodon Account instance
     */
    getBoostBy(id,options,parentIndex) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`statuses/${id}/reblogged_by`,options.api)
            .then((data,status,xhr)=>{
                console.log(`statuses/${id}/reblogged_by`,
                    id,parentIndex,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].url;
                    data[i]["instance"] = tmp.hostname;
                }
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                resolve({data: data, id: id, index: parentIndex, options: options, paging: hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    /**
     * Getting who favourited a status
     * @param {String} id status id
     * @param {Object} options api options
     * @param {String} parentIndex original statuses list index
     * @return {Promise<Account[]>} Array of Mastodon Account instance
     */
    getFavBy(id,options,parentIndex) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`statuses/${id}/favourited_by`,options.api)
            .then((data,status,xhr)=>{
                console.log(`statuses/${id}/favourited_by`,
                    id,parentIndex,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].url;
                    data[i]["instance"] = tmp.hostname;
                }
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                resolve({data: data, id: id, index: parentIndex, options: options, paging: hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getFav(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            /*
              Get Accounts Favourites
                1, normal statuses (any options)
             */

            this._accounts.api.get(`favourites`,options.api)
            .then((data,status,xhr)=>{
                console.log(`favourites`,data);
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve({data: data, paging: hlink});
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setFav(tootid,flag,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "favourite" : "unfavourite";

            this._accounts.api.post(`statuses/${tootid}/${endpoint}`,options.api)
            .then((data)=>{
                console.log(`statuses/${tootid}/${endpoint}`,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setBoost(tootid,flag,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "reblog" : "unreblog";

            this._accounts.api.post(`statuses/${tootid}/${endpoint}`,options.api)
            .then((data)=>{
                console.log(`statuses/${tootid}/${endpoint}`,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setPin(tootid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "pin" : "unpin";

            this._accounts.api.post(`statuses/${tootid}/${endpoint}`)
            .then((data)=>{
                console.log(`statuses/${tootid}/${endpoint}`,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setMute(tootid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "mute" : "unmute";

            this._accounts.api.post(`statuses/${tootid}/${endpoint}`)
            .then((data)=>{
                console.log(`statuses/${tootid}/${endpoint}`,data);
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].account.url;
                    data[i].account["instance"] = tmp.hostname;
                }
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    search(query,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            
            var successfunc = (data)=>{
                console.log(`search`,
                query,data);
                for (var i = 0; i < data.accounts.length; i++) {
                    data.accounts[i]["instance"] = MUtility.getInstanceFromAccount(data.accounts[i].url);
                }
                for (var i = 0; i < data.hashtags.length; i++) {
                    if (typeof data.hashtags[i] == "string") {
                        data.hashtags[i] = {
                            name : data.hashtags[i],
                            url : `/tl/tags/${encodeURIComponent(data.hashtags[i])}`,
                            history : [],
                        }
                    }else{

                    }
                }
                resolve({data: data, query: query, options : options});
            };

            options["api"]["q"] = query;
            this._accounts.api.get2(`search`,options.api)
            .then(successfunc,(xhr,status,err)=>{

                this._accounts.api.get(`search`,options.api)
                .then(successfunc,(xhr2,status2,err2)=>{
                    reject({xhr:xhr2,status:status2});
                });
            });
        });
        return def;
    }

/**=================================================================
 *   Post API
 * =================================================================
 */
    /** 
     * @param {Object} option api and app option
    */
    postMedia(option) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            //var fnloption = {
            //    "file" : file
            //};
            //if ("description" in option.api) fnloption["description"] = option.api["description"];
            //if ("focus" in option.api) fnloption["focus"] = option.api["focus"];
            

            this._accounts.api.postMedia("media",option.api)
            .then((result)=>{
                console.log("media",result);
                
                resolve(result);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    postUpdateMediaInfo(id,option) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            //var fnloption = {};

            //if ("description" in option.api) fnloption["description"] = option.api["description"];
            //if ("focus" in option.api) fnloption["focus"] = option.api["focus"];
            

            this._accounts.api.put(`media/${id}`,option.api)
            .then((result)=>{
                console.log(`media/${id}`,result);
                
                resolve(result);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    postStatus(option) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            this._accounts.api.post("statuses",option.api)
            .then((result)=>{
                console.log("statuses",result);
                
                resolve(result);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    deleteStatus(tootid) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            this._accounts.api.delete(`statuses/${tootid}`)
            .then((result)=>{
                console.log("statuses",result);
                
                resolve(result);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
/**=================================================================
 *   User account API
 * =================================================================
 */


 /**
  * 
  * @param {Account} account This app's Account object
  */
    updateCredential(account) {
        var def = new Promise((resolve, reject)=> {
            this._accounts.api.get("accounts/verify_credentials")
            .then(result=>{
                resolve({data: result, account:account});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status,account:account});
            })
        });
        return def;
    }
    patchCredential(options) {
        var def = new Promise((resolve, reject)=> {
            if (options.app.ismedia) {
                this._accounts.api.patch("accounts/update_credentials",options.api)
                .then(result=>{
                    resolve({data: result, options:options});
                },(xhr,status,err)=>{
                    reject({xhr:xhr,status:status,options:options});
                });
            }else{
                this._accounts.api.patch_credential("accounts/update_credentials",options.api)
                .then(result=>{
                    resolve({data: result, options:options});
                },(xhr,status,err)=>{
                    reject({xhr:xhr,status:status,options:options});
                });
            }
        });
        return def;
    }
    getUser(userid,instance,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            options.api["q"] = `${userid}@${instance}`;
            this._accounts.api.get(`accounts/search`,options.api)
            .then((data)=>{
                console.log(`accounts/search`,
                userid,instance,data);
                var resdata = null;
                for (var i = 0; i < data.length; i++) {
                    var tmp = GEN("a");
                    tmp.href = data[i].url;
                    data[i]["instance"] = tmp.hostname;
                    //console.log(data[i].username, userid );
                    //console.log(data[i].instance, instance);
                    if ((data[i].username == userid) &&
                        (data[i].instance == instance)
                    ) {
                        resdata = data[i];
                        break;
                    }
                }
                //console.log("resdata=",resdata);
                if (resdata) {
                    this.getRelationship(resdata.id)
                    .then((data2)=>{
                        resdata["relationship"] = data2.data[0];
                        resolve({data: resdata, userid: userid, instance: instance, options : options});
                    });
                }else{
                    reject({cd : false, userid: userid, instance: instance, options : options})
                }
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getUserSearch(query,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            
            options["api"]["q"] = query;
            this._accounts.api.get(`accounts/search`,options.api)
            .then((data)=>{
                console.log(`accounts/search`,
                query,data);
                for (var i = 0; i < data.length; i++) {
                    data[i]["instance"] = MUtility.getInstanceFromAccount(data[i].url);
                }
                var hlink = {
                    next : "",
                    prev : ""
                }
                resolve({data: data, query: query, options : options, paging : hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getRelationship(userid) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`accounts/relationships`,{id:userid})
            .then((data)=>{
                console.log(`accounts/relationships`,
                    userid,data);
                resolve({data: data, id: userid});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getFollowing(userid,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            var targetid = userid == "me" ? this._accounts.id : userid;
            this._accounts.api.get(`accounts/${targetid}/following`,options.api)
            .then((data,status,xhr)=>{
                var headers = xhr.getAllResponseHeaders();
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                console.log(`accounts/${targetid}/following`,
                userid,data,status,xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    data[i]["instance"] = MUtility.getInstanceFromAccount(data[i].url);
                }
                resolve({data: data, id: targetid, options : options, paging : hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getFollower(userid,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            var targetid = userid == "me" ? this._accounts.id : userid;
            this._accounts.api.get(`accounts/${targetid}/followers`,options.api)
            .then((data,status,xhr)=>{
                console.log(`accounts/${targetid}/followers`,
                userid,data);
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    data[i]["instance"] = MUtility.getInstanceFromAccount(data[i].url);
                }
                resolve({data: data, id: targetid, options : options, paging : hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setFollow(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "follow" : "unfollow";

            this._accounts.api.post(`accounts/${userid}/${endpoint}`)
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getFollowRequest(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            
            this._accounts.api.get(`follow_requests`,options.api)
            .then((data)=>{
                console.log(`follow_requests`,data);
                for (var i = 0; i < data.length; i++) {
                    data[i]["instance"] = MUtility.getInstanceFromAccount(data[i].url);
                }
                resolve({data: data, options : options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setFollowRequest(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "authorize" : "reject";

            this._accounts.api.post(`follow_requests/${userid}/${endpoint}`)
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setShowBoost(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            this._accounts.api.post(`accounts/${userid}/follow`,{
                reblogs : flag
            })
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setMuteUser(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "mute" : "unmute";

            this._accounts.api.post(`accounts/${userid}/${endpoint}`)
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setBlockUser(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "block" : "unblock";

            this._accounts.api.post(`accounts/${userid}/${endpoint}`)
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setPinUser(userid,flag) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "pin" : "unpin";

            this._accounts.api.post(`accounts/${userid}/${endpoint}`)
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    setReportUser(userid,tootids,comment) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = flag ? "pin" : "unpin";

            this._accounts.api.post(`reports`,{
                account_id : userid,
                status_ids : tootids,
                comment : comment
            })
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getNotifications(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`notifications`,options.api)
            .then((data,status,xhr)=>{
                console.log(`notifications`,data);
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));
                for (var i = 0; i < data.length; i++) {
                    data[i].created_at = new Date(data[i].created_at);
                    data[i].account["instance"] = MUtility.getInstanceFromAccount(data[i].account.url);
                    data[i].account = [data[i].account];
                    if (data[i].type != "follow") {
                        //var div = GEN("div");
                        //div.innerHTML = data[i].status.content;
                        //data[i].status["html"] = data[i].status.content;
                        //data[i].status.content = div.textContent;
                    }
                }
                
                resolve({data: data, options : options, paging : hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }

/**=================================================================
 *   Instance API
 * =================================================================
 */
    getInstancePeers() {
        var def = new Promise((resolve,reject)=>{
            /*var req = new Request(`https://mastodon.social/api/v1/instance/peers`,{
                method : "GET"
            });*/
            $.ajax({
                url : "https://mastodon.social/api/v1/instance/peers",
                type : "GET",
            }).then((result)=>{
                resolve(result);
            },(xhr,status,err)=>{
                console.log("fetch original error:",xhr,status);
                reject(xhr);
            });

            /*fetch(req)
            .then((res)=>{
                if (res.ok) {
                    res.json().then((data)=>{
                        console.log(data);
                        resolve(data);
                    },(xhr,status,err)=>{
                        console.log(xhr,status,err);
                        reject([xhr,status,err]);
                    });
                }else{
                    reject({
                        flag : res.ok,
                        status : res.statusText,
                        header : res.headers
                    });
                }
            },(xhr,status,err)=>{
                reject(xhr);
            }).catch((e)=>{
                console.log("fetch original error:",e);
                reject(e);
            });*/
        });
        return def;
    }
    getInstanceList(options) {
        var def = new Promise((resolve,reject)=>{
            $.ajax({
                url : "https://instances.social/api/1.0/instances/list",
                type : "GET",
                headers : {
                    Authorization : `Bearer ${this._instanceToken}`
                },
                data : options.api
            }).then((result)=>{
                console.log(result);
                //---check app search options
                var fnlres = [];
                var optcnt = 0;
                for (var obj in options.app) {
                    optcnt++;
                }
                //---plus 1 for not include_dead 
                //optcnt++;
                for (var i = 0; i < result.instances.length; i++) {
                    var ishit = 0;
                    var inst = result.instances[i];
                    if ("user_ge" in options.app) {
                        ishit += (Number(options.app.user_ge) <= Number(inst.users)) ? 1 : 0;

                    }
                    if ("user_le" in options.app) {
                        ishit += (Number(options.app.user_le) >= Number(inst.users)) ? 1 : 0;
                    }
                    if ("score_ge" in options.app) {
                        ishit += (Number(options.app.score_ge) <= Number(inst.users)) ? 1 : 0;
                    }
                    if ("score_le" in options.app) {
                        ishit += (Number(options.app.score_ge) >= Number(inst.users)) ? 1 : 0;
                    }
                    if ("language" in options.app) {
                        ishit += (inst.languages.indexOf(options.app.language) > -1) ? 1 : 0;
                    }
                    if ("include_down" in options.app) {
                        ishit += (inst.up == false) ? 1 : 0;
                    }
                    if ("include_dead" in options.app) {
                        ishit += (inst.dead == true) ? 1 : 0;
                    }/*else{
                        ishit += (inst.dead == false) ? 1 : 0;
                    }*/

                    if ("name" in options.app) {
                        console.log(inst.name,"=",options.app.name, inst.name.toLowerCase().indexOf(options.app.name.toLowerCase()));
                        if (inst.name.toLowerCase().indexOf(options.app.name.toLowerCase()) > -1) {
                            ishit++;
                        }
                    }
                    
                    if (ishit == optcnt) {
                        fnlres.push(inst);
                    }
                }
                console.log(fnlres);
                resolve({data:fnlres, options: options});
            },(xhr,status,err)=>{
                reject(xhr);
            });
        });
        return def;
    }
    searchInstance(options) {
        var def = new Promise((resolve,reject)=>{
            options.api["name"] = true;
            $.ajax({
                url : "https://instances.social/api/1.0/instances/search",
                type : "GET",
                headers : {
                    Authorization : `Bearer ${this._instanceToken}`
                },
                data : options.api
            }).then((result)=>{
                var fnlres = [];
                var ishit = 0;
                var optcnt = 0;
                for (var obj in options.app) {
                    optcnt++;
                }
                //---plus 1 for not include_dead 
                optcnt++;
                for (var i = 0; i < result.instances.length; i++) {
                    var inst = result.instances[i];
                    if ("user_ge" in options.app) {
                        ishit += (Number(options.app.user_ge) <= Number(inst.users)) ? 1 : 0;

                    }
                    if ("user_le" in options.app) {
                        ishit += (Number(options.app.user_le) >= Number(inst.users)) ? 1 : 0;
                    }
                    if ("score_ge" in options.app) {
                        ishit += (Number(options.app.score_ge) <= Number(inst.users)) ? 1 : 0;
                    }
                    if ("score_le" in options.app) {
                        ishit += (Number(options.app.score_ge) >= Number(inst.users)) ? 1 : 0;
                    }
                    if ("language" in options.app) {
                        ishit += (inst.languages.indexOf(options.app.language) > -1) ? 1 : 0;
                    }
                    if ("include_down" in options.app) {
                        ishit += (inst.up == false) ? 1 : 0;
                    }
                    if ("include_dead" in options.app) {
                        ishit += (inst.dead == true) ? 1 : 0;
                    }else{
                        ishit += (inst.dead == false) ? 1 : 0;
                    }

                    if (ishit == optcnt) {
                        fnlres.push(inst);
                    }
                }
                resolve({data:fnlres, options: options});
            },(xhr,status,err)=>{
                reject(xhr);
            });
        });
        return def;
    }
    showInstanceInfo(options) {
        var def = new Promise((resolve,reject)=>{
            $.ajax({
                url : "https://instances.social/api/1.0/instances/show",
                type : "GET",
                headers : {
                    Authorization : `Bearer ${this._instanceToken}`
                },
                data : options.api
            }).then((result)=>{
                resolve({data:result, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr, options: options});
            });
        });
        return def;
    }
    getRandomInstances(options) {
        return $.ajax({
            url : "https://instances.social/api/1.0/instances/sample",
            type : "GET",
            headers : {
                Authorization : `Bearer ${this._instanceToken}`
            },
            data : options
        });
    }
    getInstanceInfo(uri) {
        //var prm = new URLSearchParams();
        //prm.append("srclang",curLocale.name);
        var def = new Promise((resolve,reject)=>{
            /*var req = new Request(`https://${uri}/api/v1/instance`,{
                method : "GET"
            });
            fetch(req)
            .then((res)=>{
                if (res.ok) {
                    res.json().then((data)=>{
                        console.log(data);
                        resolve(data);
                    },(xhr,status,err)=>{
                        console.log(xhr,status,err);
                        reject([xhr,status,err]);
                    });
                }else{
                    reject({
                        flag : res.ok,
                        status : res.statusText,
                        header : res.headers
                    });
                }
            },(xhr,status,err)=>{
                reject(xhr);
            }).catch((e)=>{
                console.log("fetch original error:",e);
                reject(e);
            });*/

            $.ajax({
                url : `https://${uri}/api/v1/instance`,
                type : "GET"
            }).then((result)=>{
                $.ajax({
                    url : `https://${uri}/api/v1/instance/activity`,
                    type : "GET"
                }).then(result2=>{
                    result["activity"] = result2;
                    resolve(result);
                },(xhr,status,err)=>{
                    result["activity"] = [];
                    resolve(result);
                });
                
            },(xhr,status,err)=>{
                reject(xhr);
            });

        });
        return def;
    }
    getInstanceEmoji(uri) {
        var def = new Promise((resolve,reject)=>{
            $.ajax({
                url : `https://${uri}/api/v1/custom_emojis`,
                type : "GET",
            }).then((result)=>{
                var fnl = {};
                for (var i = 0; i < result.length; i++) {
                    var obj = result[i];
                    fnl[obj.shortcode] = {
                        shortcode : obj.shortcode,
                        url : obj.url,
                        static_url : obj.static_url,
                        visible_in_picker : obj.visible_in_picker
                    };
                }
                resolve({ data : fnl, instance: uri});
            },(xhr,status,err)=>{
                reject(xhr);
            });
        });
        return def;
    }
/**=================================================================
 *   List API
 * =================================================================
 */
    getLists(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`lists`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getListMembers(id,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`lists/${id}/accounts`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists/${id}/accounts`,data);
                var hlink = this.extractHeaderLink(xhr.getResponseHeader("Link"));

                resolve({data: data, listid : id, options: options, paging : hlink});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getListOf(userid,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.get(`accounts/${userid}/lists`,options.api)
            .then((data,status,xhr)=>{
                console.log(`accounts/${userid}/lists`,data);
                resolve({data: data, userid : userid, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    createList(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.post(`lists`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    updateList(id,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.put(`lists/${id}`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists/${id}`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    removeList(id) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.delete(`lists/${id}`)
            .then((data,status,xhr)=>{
                console.log(`lists/${id}`,data);
                resolve({data: data, id: id});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    addMemberToList(id,accounts) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            var options = {
                api : {
                    account_ids : accounts
                }
            };
            this._accounts.api.post(`lists/${id}/accounts`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists/${id}/accounts`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    removeMemberFromList(id,accounts) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            var options = {
                api : {
                    account_ids : accounts
                }
            };
            this._accounts.api.delete(`lists/${id}/accounts`,options.api)
            .then((data,status,xhr)=>{
                console.log(`lists/${id}/accounts`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
/**=================================================================
 *   Push subscription API
 * =================================================================
 */
    permissionPushSubscription() {
        var def = new Promise((resolve, reject)=>{
            Notification.requestPermission().then(permission => {
                var ret = {
                    stat : "",
                    msg : ""
                };
                switch (permission) {
                    case "granted":
                        // 許可された場合
                        console.log("notification permission OK");
                        ret.stat = "yes";
                        break;
                    case "denied":
                        // ブロックされた場合
                        console.log("notification permission NG...");
                        ret.stat = "no";
                        break;
                    case "default":
                        // 無視された場合
                        console.log("notification permission nothing. re-challenge");
                        ret.stat = "nothing";
                        break;
                    default:
                        break;
                }
                if (ret.stat == "") {
                    reject(ret);
                }else{
                    resolve(ret);
                }
            });        
    
        });
        return def;
    }
    /**
     * register push subscription to the instance
     * @param {JSON} options alerts options: follow,reblog,favourite,mention.
     */
    createPushSubscription(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            var endpoint = sessionStorage.getItem("wp_endpoint");
            var publicKey = sessionStorage.getItem("wp_publickey");
            var authSecret = sessionStorage.getItem("wp_authsecret");
            if (!endpoint) {
                reject({xhr:null,status:"error",data:"subscription.endpoint"});
                return;
            }
            if (!publicKey) {
                reject({xhr:null,status:"error",data:"p256dh"});
                return;
            }
            if (!authSecret) {
                reject({xhr:null,status:"error",data:"auth"});
                return;
            }

            var opt = {
                subscription : {
                    endpoint : endpoint,
                    keys : {
                        p256dh : publicKey,
                        auth : authSecret,
                    }
                },
                data : {
                    alerts : options
                }
            };
            this._accounts.api.post(`push/subscription`,opt)
            .then((data,status,xhr)=>{
                console.log(`push/subscription`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status,data:""});
            });
        });
        return def;
    }
    getPushSubscription(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            options["api"] = {};
            this._accounts.api.get(`push/subscription`,options.api)
            .then((data,status,xhr)=>{
                console.log(`push/subscription`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    /**
     * update push subscription to the instance
     * @param {JSON} options alerts options: follow,reblog,favourite,mention.
     */
    updatePushSubscription(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            this._accounts.api.put(`push/subscription`,options)
            .then((data,status,xhr)=>{
                console.log(`push/subscription`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    deletePushSubscription(options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }
            options["api"] = {};
            this._accounts.api.delete(`push/subscription`,options.api)
            .then((data,status,xhr)=>{
                console.log(`push/subscription`,data);
                resolve({data: data, options: options});
            },(xhr,status,err)=>{
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }
    getOneNotification(id,options) {
        var def = new Promise((resolve,reject)=>{
            if (this._accounts == null) {
                reject(false);
                return;
            }

            this._accounts.api.get(`notification/${id}/`,{
                reblogs : flag
            })
            .then((data)=>{
                resolve(data);
            },(xhr,status,err)=>{
                console.log(xhr,status,err);
                reject({xhr:xhr,status:status});
            });
        });
        return def;
    }

}


/*===========================================================================
 * Status class
 =============================================================================*/
 class Gpstatus {
    constructor(status,iconsize){
        //---main toot base setup
        /**
         * Normal toot
         *    body    - original owner's toot
         *    account - original owner
         * 
         * Boosted toot(reblogged toot)
         *    body           - boosted toot 
         *    account        - owner of boosted toot
         *    reblogOriginal - owner of original toot
         *     ''.account    - owner
         */

        this.id = status.id;
        if (status.reblog != null) {
            this.body = status.reblog;
            this.account = status.reblog.account;
        }else{
            this.body = status;
            this.account = status.account;
        }
        //console.log("createed_at=",this.body.created_at);
        this.body.created_at = new Date(this.body.created_at);
        var diff_created_at = this.body.created_at.diffDateTime();
        var translate_created_at = {
            val : Math.round(diff_created_at.time),
            text : _T("dt_"+diff_created_at.type,[Math.round(diff_created_at.time)])
        };
        if ((diff_created_at.type == "day") && (diff_created_at.time > 3)) {
            translate_created_at.val = this.body.created_at.toLocaleString();
            translate_created_at.text = "";
        }
        this.body["spoilered"] = this.body.spoiler_text != "" ? true : false;
        this.body["diff_created_at"] = translate_created_at;
        this.medias = this.body.media_attachments;
        //this.body.media_attachments = null;
        //this.body["visibility"] = curLocale.messages["tt_"+this.body.visibility];
        //---append if not existed property
        if (!("replies_count" in this.body)) { //---sample: pawoo.net, etc
            this.body["replies_count"] = -1;
        }

        //---main toot account setup
        this.account["instance"] = MUtility.getInstanceFromAccount("uri" in this.account ? this.account.uri : this.account.url);
        this.account["acct"] = `${this.account.username}@${this.account.instance}`;
        
        if (this.account.display_name == "") {
            this.account.display_name = this.account.acct;
        }else{

            this.account.display_name = MUtility.replaceEmoji(this.account.display_name,this.account.instance,this.account.emojis,iconsize);
        }

        //---Relationship and visibility setup
        this.relationship = {isme:false};
        if (`${MYAPP.session.status.selectedAccount.idname}@${MYAPP.session.status.selectedAccount.instance}` == this.account.acct) {
            this.relationship.isme = true;
        }
        var finalVisibility = this.body.visibility;

        //---reblog original toot setup
        var referContent = this.body.content;
        var referInstance = this.account.instance;
        var referEmojis = this.body.emojis;
        this.reblogOriginal = null;

        //console.log("check reblog null=",status,status.reblog);
        if (status.reblog != null) {
            var dmy_status = Object.assign({},status);
            dmy_status.reblog = null;
            this.reblogOriginal = new Gpstatus(dmy_status,14);

            finalVisibility = "share_" + MYAPP.session.config.application.showMode;
            /*if (this.reblogOriginal.medias.length > 0) {
                this.medias = this.reblogOriginal.medias;
            }*/
            /*
            this.account = this.reblogOriginal.account;
            this.body.sensitive = this.reblogOriginal.body.sensitive;
            this.body.favourites_count = this.reblogOriginal.body.favourites_count;
            this.body.reblogs_count = this.reblogOriginal.body.reblogs_count;
            referContent = this.reblogOriginal.body.html;
            referInstance = this.reblogOriginal.account.instance;
            referEmojis = this.reblogOriginal.body.emojis;
            */
           
        }
        
        if (this.medias) {
            for (var i = 0; i < this.medias.length; i++) {
                if (this.medias[i].meta == null) {
                    var img = GEN("img");
                    img.src = this.medias[i].preview_url;
                    var asp = img.width / img.height;
                    if (img.height > img.width) {
                        asp = img.height / img.width;
                    }
                    this.medias[i].meta = {
                        small : {
                            aspect : asp,
                            width : img.width,
                            height : img.height,
                            size : `${img.width}x${img.height}`
                        }
                    };
                }
            }
        }
        if (MYAPP.session.config.action.image_everyNsfw === true) {
            this.body.sensitive = true;
        }
        //---option: add nsfw, if specified instance
        if (MYAPP.session.config.action.add_nsfw_force_instance === true) {
            if (MYAPP.session.config.action.nsfw_force_instances.indexOf(this.account.instance) > -1) {
                //---option: if enable nsfw time range ?
                if (MYAPP.session.config.action.enable_nsfw_time === true) {
                    var bdate = MYAPP.session.config.action.force_nsfw_time.begin + ":00";
                    var edate = MYAPP.session.config.action.force_nsfw_time.end + ":00";
                    bdate = parseInt(bdate.replace(/:/g,""));
                    edate = parseInt(edate.replace(/:/g,""));
                    var local = parseInt(this.body.created_at.toLocaleTimeString().replace(/:/g,""));
                    if ((bdate <= local) && (local <= edate)) {
                        this.body.sensitive = true;
                    }
                }else{
                    this.body.sensitive = true;
                }
            }
        }

        //---card css style class setup
        this.cardtypeSize = {
            "grid-row-end" : "span ",
            "border-top" : ""
        }

        this.shareColor = {
            "share-color-public" : true,
            "share-color-unlisted" : false,
            "share-color-private" : false,
            "share-color-boosted" : false
        }
        if (this.body.visibility == "unlisted") {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = true;
            this.shareColor["share-color-private"] = false;
            this.shareColor["share-color-boosted"] = false;
        }else if (this.body.visibility == "private") {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = false;
            this.shareColor["share-color-private"] = true;
            this.shareColor["share-color-boosted"] = false;
        }else if (this.reblogOriginal) {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = false;
            this.shareColor["share-color-private"] = false;
            this.shareColor["share-color-boosted"] = true;
        }
        this.reactions = {
            fav : {
                "red-text" : (this.body.favourited ? true : false),
                "lighten-3" : (this.body.favourited ? false : true)
            },
            reb : {
                "red-text" : (this.body.reblogged ? true : false),
                "lighten-3" : (this.body.reblogged ? false : true)
            }
        }

        //---translation in card setup
        this.translateText = {
            thisuser_mute : _T("thisuser_mute",[this.account.display_name]),
            thisuser_block : _T("thisuser_block",[this.account.display_name]),
            thisuser_report : _T("thisuser_report",[this.account.display_name]),
            thisuser_endorse : _T("thisuser_endorse",[this.account.display_name]),
            thisuser_unmute : _T("thisuser_unmute",[this.account.display_name]),
            thisuser_unblock : _T("thisuser_unblock",[this.account.display_name]),
            thisuser_unendorse : _T("thisuser_unendorse",[this.account.display_name]),
        };
        //console.log("sensitive_imagetext=",this.translateText.sensitive_imagetext, this.medias.length);
        if (this.reblogOriginal) {
            var inst = MUtility.getInstanceFromAccount(this.reblogOriginal.account.url);
            var tmpname = this.reblogOriginal.account.display_name == "" ? this.reblogOriginal.account.acct : this.reblogOriginal.account.display_name;
            tmpname = MUtility.replaceEmoji(tmpname,inst,this.reblogOriginal.account.emojis,iconsize-2);
            //---base share scope of boosted toot
            this.translateText.visibility = _T("tt_"+finalVisibility,[tmpname]);
            //---owner of share scope of boosted toot
            this.translateText.visibility2 = ""; //_T("tt_share_name",[tmpname]);
        }else{
            //---base share scope
            this.translateText.visibility = _T("tt_"+finalVisibility);
            //---owner of share scope
            this.translateText.visibility2 = "";
            //---owner of ancestor toot(limited using)
            this.translateText.visibility3 = _T("tt_share_name",[this.account.display_name]);
        }

        //---other information setup
        var text_end_pos = referContent.indexOf("-end-");
        if (text_end_pos > -1) { //---if -end- exitst, hide text.
            var tmprefcon = [
                referContent.substr(0,text_end_pos),
                referContent.substr(text_end_pos+5,referContent.length)
            ];
            referContent = tmprefcon[0] + 
                "<p class='invisible'>" + tmprefcon[1] + "</p>";
        }
        var content = MYAPP.extractTootInfo(referContent);
        //---mention, tag: change URL original to app version
        var tmp = GEN("div");
        tmp.innerHTML = referContent;
        var qa = tmp.querySelectorAll("p span.h-card a.mention");
        for (var i = 0; i < qa.length; i++) {
            var href = qa[i].href;
            var name = qa[i].children[0].textContent;
            var fnlhref = `/users/${qa[i].hostname}/${name}`;
            qa[i].href = fnlhref;
        }
        qa = tmp.querySelectorAll("p a.hashtag");
        for (var i = 0; i < qa.length; i++) {
            var href = qa[i].href;
            var fnlhref = `/tl${qa[i].pathname}`;
            qa[i].href = fnlhref;
        }

        referContent = tmp.innerHTML;
        
        this.body["html"] = MUtility.replaceEmoji(referContent,referInstance,referEmojis,iconsize);
        this.body.content = content.text;
        this.mentions = content.mentions;
        this.tags = content.tags;
        this.geo = content.geo;
        this.ancestors = [];
        this.descendants = [];
        this.comment_stat = {
            mini : false,
        };
        this.urls = content.urls;
        //---check URL
        for (var i = this.urls.length-1; i >= 0; i--) {
            //if no https and http, remove the url
            if (this.urls[i].indexOf("https://") != 0) {
                if (this.urls[i].indexOf("http://") != 0) {
                    this.urls.splice(i,1);
                }
            }
        }
        this.mainlink = {
            exists:false,
            site : "",
            title : "",
            description : "",
            image : "",
            isimage : false
        };

        //---decide final card size.
        var num_cardSize = 2;
        /*if (this.body.content.length <= 49) {
            num_cardSize += 0;
        }else if (this.body.content.length >= 50) {
            num_cardSize += 1;
        }else if (this.body.content.length >= 150) {
            num_cardSize += 2;
        }else if (this.body.content.length >= 200) {
            num_cardSize += 3;
        }else if (this.body.content.length >= 255) {
            num_cardSize += 4;
        }else{
            num_cardSize += 5;
        }*/
        if (this.medias) {
            if (this.medias.length > 0) {
                num_cardSize += 3;
            }
        }
        //---change card size if available a link
        if (this.urls.length > 0) {
            num_cardSize += 3;
        }
        /*if ((this.medias.length > 0) && (this.urls.length > 0)) {
            num_cardSize = 28;
        }*/
        this.cardtypeSize["grid-row-end"] = `span ${num_cardSize}`;
        //console.log(this.cardtypeSize);

    }
}