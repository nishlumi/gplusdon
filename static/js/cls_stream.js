
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
        this._targetPageNotification = null;
        this._targetAccount = {
            acct : account.acct,
            api : account.api,
            instance : account.instance,
            notifications : account.notifications
        };
        this._type = streamType;
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
    start() {
        var mainbody = (result)=>{
            console.log(this._targetAccount.acct,`during stream:${this._type}?${this._query}`,result);
            if (result.event === "notification") {
                // result.payload is a notification
                this._start_nofitication(result.payload);
            } else if (result.event === "update") {
                // status update for one of your timelines
                if (this._targetObject) {
                    this._start_update(result.payload);
                }
            } else if (result.event === "delete") {
                // status delete from your timelines
                if (this._targetObject) {
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
            this._targetAccount.api.stream(endpoint,mainbody,errorbody);
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
        var div = GEN("div");
            div.innerHTML = data.status.content;
            data.status["html"] = data.status.content;
            data.status.content = div.textContent;
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
        MYAPP.acman.save();
    }
    _start_update(data){
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
            app : {
                is_nomax : true,
                is_nosince : false,
                tlshare : "",
                tltype : "",
                exclude_reply : true,
            }
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
    _start_delete(data) {
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
}