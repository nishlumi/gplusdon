
class Gpstream {
    /**
     * 
     * @param {String} streamType Type of this stream API
     * @param {Account} account Account object to retrieve the stream
     * @param {Object} target_tl Vue instance of the timeline
     * @param {Object} target_notif Vue instance of the nofitication
     */
    constructor(streamType, account, target_tl, target_notif) {
        this._targetObject = target_tl;
        this._targetNotification = target_notif;
        this._targetDirect = null;
        this._targetPageNotification = null;
        this._targetAccount = {
            idname : account.idname,
            acct : account.acct,
            api : account.api,
            others : account.others,
            instance : account.instance,
            notifications : account.notifications
        };
        this._type = streamType;
        this._targetTLType = streamType;
        if (streamType == "user") this._targetTLType = "home";
        if (streamType == "public:local") this._targetTLType = "local";
        if (streamType == "hashtag:local") this._targetTLType = "taglocal";
        if (streamType == "hashtag") this._targetTLType = "tag";
        this.isme = false;
        this.filter = {
            enabled : false,
            username : "",
            instance : "",
        };
        this._query = "";
        this.status = {
            action : "stop"      //start, moving, stop
        };

    }
    get targetTimeline(){
        return this._targetObject;
    }
    setTargetTimeline(tl) {
        this._targetObject = tl;
    }
    setTargetDirect(tl) {
        this._targetDirect = tl;
    }
    setTargetNotification(nt) {
        this._targetNotification = nt;
    }
    setTargetPageNotification(nt) {
        this._targetPageNotification = nt;
    }
    setAccount(ac) {
        this._targetAccount = ac;
    }
    setQuery(q) {
        this._query = q;
    }
    /**
     * filtering specified user
     * @param {Account} user user account
     */
    setFilter(user) {
        this.filter.enabled = true;
        this.filter.username = user.username;
        this.filter.instance = user.instance;
    }
    clearFilter() {
        this.filter.enabled = false;
        this.filter.username = "";
        this.filter.instance = "";
    }
    checkTLType() {
        return (this._targetObject.tl_tabtype == this._targetTLType);
    }
    start() {
        var mainbody = (result)=>{
            if (result.event === "notification") {
                console.log(this._targetAccount.acct,`during stream:${this._type}?${this._query}`,result);
                // result.payload is a notification
                this._start_nofitication(result.payload);
            } else if (result.event === "update") {
                // status update for one of your timelines
                if (this._targetObject || this._targetDirect) {
                    this._start_update(result.payload);
                }
            } else if (result.event === "delete") {
                // status delete from your timelines
                if (this._targetObject || this._targetDirect) {
                    this._start_delete(result.payload);
                }
            } else {
                // probably an error
            }
        };
        var errorbody = (error)=>{
            this.status.action = "abend";
        }
        this.status.action = "start";
        var endpoint = this._type;
        if (LONGPOLLING_INSTANCE.indexOf(this._targetAccount.instance) > -1) {
            //---Long polling streaming
            endpoint = endpoint.replace(":","/");
            if (this._query != "") {
                endpoint += `&${this._query}`;
            }
            this._targetAccount.api.stream(endpoint,mainbody,errorbody);
        }else{
            //---Webscoket streaming
            if (this._query != "") {
                endpoint += `&${this._query}`;
            }
            if ((this._type.indexOf("public") > -1) || (this._type.indexOf("hashtag") > -1)) {
                this._targetAccount.api.stream_noauth(endpoint,mainbody,errorbody);    
            }else{
                this._targetAccount.api.stream(endpoint,mainbody,errorbody);
            }
        }
    }
    stop() {
        var endpoint = this._type;
        if (this._query != "") {
            endpoint += `&${this._type}=${this._query}`;
        }
        if (LONGPOLLING_INSTANCE.indexOf(this._targetAccount.instance) > -1) {
            this._targetAccount.api.closeStream(endpoint);
        }else{
            this._targetAccount.api.closeStream(endpoint);
        }
        this.status.action = "stop";
    }
    logger(text) {
        console.log(`The staream [${this._type}] operation:${text}`);
    }
    _start_nofitication(data) {
        data.created_at = new Date(data.created_at);
        data.account["instance"] = MUtility.getInstanceFromAccount(data.account.url);
        data.account = [data.account];
        if (data.type != "follow") {
            //var div = GEN("div");
            //div.innerHTML = data.status.content;
            //data.status["html"] = data.status.content;
            //data.status.content = div.textContent;
        }

        //---notification popup
        if (this._targetNotification) {
            this._targetNotification.push_notification([data]);
        }else{
            this._targetAccount.notifications.unshift(data);
            MYAPP.commonvue.nav_sel_account.checkAccountsNotification();
        }
        //---notification page
        if (this._targetPageNotification) {
            var pn = this._targetPageNotification;
            pn.vue.push_notification(pn.account,[data],{
                api : {
                    since_id : "",
                },
                app : {
                    is_nomax : true,
                    is_nosince : false,
                }
            });
        }
        if ("alert" in this._targetAccount.others) {
            if (data.type in this._targetAccount.others.alert) {
                var text = MUtility.get_body_eachtype(data);
                var div = GEN("div");
                div.innerHTML = text;

                Push.create(MUtility.get_title_eachtype(data),{
                    body : div.textContent,
                    icon : "/static/images/app_icon.png",
                    timeout : 4000,
                    onClick: function () {
                        location.href = "/notifications";
                        this.close();
                    }
                });
            }
        }
        MYAPP.acman.save();
    }
    _start_update(data){
        if (this._targetObject) {
            if (!this.checkTLType()) return;
            var isOK = true;
            if (this.isme) {
                var inst = MUtility.getInstanceFromAccount("uri" in data.account ? data.account.uri : data.account.url);
                if ((this._targetAccount.idname == data.account.username) &&
                    (this._targetAccount.instance == inst)
                ) {
                    isOK = true;
                }else{
                    isOK = false;
                }
            }
            if (this.filter.enabled) {
                var inst = MUtility.getInstanceFromAccount("uri" in data.account ? data.account.uri : data.account.url);
                if ((data.account.username == this.filter.username) &&
                    (inst == this.filter.instance)
                ) {
                    isOK = true;
                }else{
                    isOK = false;
                }
            }

            if (isOK) {
                if (this._targetObject.pending.above.waiting) {
                    this._targetObject.pending.above.statuses.unshift(data);
                    this._targetObject.pending.above.is = true;
                }else{
                    this._targetObject.currentOption.app.is_nomax = true;
                    this._targetObject.currentOption.app.is_nosince = false;
                    /*
                    {
                        api : {
                            exclude_replies : true,
                            since_id : "",
                        },
                        app : {
                            is_nomax : true,
                            is_nosince : false,
                            tlshare : "",
                            tltype : "",
                            exclude_reply : true,
                        }
                    }
                    */
                    this._targetObject.generate_toot_detail({
                            data:[data],
                            paging : {
                                prev : data.id
                            }
                        },{
                            api : {
                                exclude_replies : true,
                                since_id : "",
                            },
                            app : this._targetObject.currentOption.app
                        });
                    //---finish get update from stream, remove old loaded tootes
                    if (this._targetObject.is_scrolltop) {
                        if (this._targetObject.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
                            while (this._targetObject.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
                                this._targetObject.statuses.pop();
                            }
                        }
                    }
    
                }    
            }
        }else if (this._targetDirect) {
            var meacct = this._targetDirect.account.rawdata.url;
            var options = {
                api : {
                    since_id : "",
                },
                app : {
                    is_nomax : true,
                    is_nosince : false,
                    acct : meacct,
                    user : this._targetDirect.show_user
                    
                }
            };
        
            this._targetDirect.generate_toot_detail({
                data:[data],
                paging : {
                    next : "",
                    prev : data.id
                }
            },options);
        }
    }
    _start_delete(data) {
        if (this._targetObject) {
            if (!this.checkTLType()) return;
            var isOK = true;

            if (isOK) {
                if (this._targetObject.pending.above.waiting) {
                    
                    var arr = this._targetObject.pending.above.statuses;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].id == data) {
                            this._targetObject.pending.above.statuses.splice(i,1);
                        }
                    }
                    this._targetObject.pending.above.is = (this._targetObject.pending.above.statuses.length > 0);
                }
                var arr = this._targetObject.statuses;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == data) {
                        this._targetObject.statuses.splice(i,1);
                        this._targetObject.info.sinceid = this._targetObject.statuses[0].id;
                        this._targetObject.info.is_nosince = false;
                        this._targetObject.info.is_nomax = true;
                        this.logger(`delete toot <${data}>`);
                        break;
                    }
                }
            }
        }else if (this._targetDirect) {
            var arr = this._targetDirect.msgs;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].toote.id == data) {
                    this._targetDirect.msgs.splice(i,1);
                    this._targetDirect.msginfo.sinceid = this._targetObject.statuses[0].id;
                    this._targetDirect.msginfo.is_nosince = false;
                    this._targetDirect.msginfo.is_nomax = true;
                    this.logger(`delete toot <${data}>`);
                    break;
                }
            }
        }
    }
}