var MYAPP;
var vue_user;
var thisform = {
    select : ""
};

function loadUserInfo_body(result) {
    console.log("getUser",result);
    if (!("data" in result)) {
        MUtility.loadingOFF();
        this.is_asyncing = false;
        return;
    }
    var tmpname = result.data.display_name == "" ? result.data.username : result.data.display_name;
    tmpname = MUtility.replaceEmoji(tmpname,result.data.instance,result.data.emojis,18);
    result.data.display_name = tmpname;
    /*vue_user.userview.header = result.data.rawdata.header;
    vue_user.userview.avatar = result.data.rawdata.avatar;
    vue_user.userview.display_name = result.data.display_name;
    vue_user.userview.idname = result.data.idname;
    vue_user.userview.instance = result.data.instance;*/
    vue_user.userview.setData(result.data);

    /*vue_user.basicinfo.note = result.data.rawdata.note;
    vue_user.basicinfo.fields = vue_user.basicinfo.fields.concat(result.data.rawdata.fields);
    vue_user.basicinfo.translations = Object.assign({},curLocale.messages);*/
    vue_user.basicinfo.setData(result.data);
    vue_user.basicinfo.statuses.splice(0,vue_user.basicinfo.statuses.length);
    vue_user.basicinfo.loadPinnedToot(vue_user.basicinfo.id,{
        api : {}, 
        app : {}
    });

    vue_user.tabbar.status_count = result.data.statuses_count;
    vue_user.tabbar.following_count = result.data.following_count;
    vue_user.tabbar.follower_count = result.data.followers_count;

    vue_user.tootes.statuses.splice(0,vue_user.tootes.statuses.length);
    vue_user.tootes.setData(result.data);
    vue_user.following.accounts.splice(0,vue_user.following.accounts.length);
    vue_user.following.setData(result.data);
    vue_user.follower.accounts.splice(0,vue_user.follower.accounts.length);
    vue_user.follower.setData(result.data);

    //---stream showing user only
    vue_user.userview.currentAccount.stream.setTargetTimeline(vue_user.tootes);
    vue_user.userview.currentAccount.stream.setFilter(result.data);

    MYAPP.setGeneralTitle(result.data.display_name);


}
function loadUserInfoDirect(data) {
    loadUserInfo_body({"data":data});
}
function loadUserInfo(idname, instance, options) {
    console.log("loadUserInfo");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    
    MYAPP.sns.getUser(idname,instance,options)
    .then((result)=>{
        loadUserInfo_body(result);
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}

function loadTimelineCommon(userid,options){
    console.log("loadTimelineCommon");
    if (this.is_asyncing) return false;

    if (!options.app.is_nomax && options.api.max_id == "") return;
    if (!options.app.is_nosince && options.api.since_id == "") return;
    MUtility.loadingON();
    this.is_asyncing = true;

    MYAPP.sns.getToots(userid,options)
    .then((data)=>{
        console.log("getMyToots",data);
        if (data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        
        this.generate_toot_detail(data,options);
        
        MUtility.loadingOFF();
        this.is_asyncing = false;
    },(xhr,status)=>{
        MUtility.loadingOFF();
    });

}

function loadPinnedToot(userid, options) {
    console.log("loadPinnedToot",userid,options);
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    
    this.is_asyncing = true;
    options.api["pinned"] = true;
    options.app["tltype"] = "tt_all";
    MYAPP.sns.getToots(userid,options)
    .then((data)=>{
        console.log("getMyToots",data);
        if (data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        this.generate_toot_detail(data,options);
        
        MUtility.loadingOFF();
        this.is_asyncing = false;

    },(xhr,status)=>{
        MUtility.loadingOFF();
    });
}
function load_following(userid, options) {
    console.log("getFollowing");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;

    MYAPP.sns.getFollowing(userid,options)
    .then((result)=>{
        console.log("getFollowing",result,result.data.length);
        if (!("max_id" in options.api) && (result.data.length == 0)) {
            if (vue_user.tabbar.follower_count > 0) {
                vue_user.following.is_vanished = true;
            }
            MUtility.loadingOFF();
            return;
        }
        //vue_user.tabbar.following_count = result.data.length;
        
        return result;
    })
    .then(result2=>{
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        return MYAPP.sns.getRelationship(users)
        .then(result3=>{
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result3.data.length; i++) {
                    if (datum.id == result3.data[i].id) {
                        datum["relationship"] = result3.data[i];
                        break;
                    }
                }
            }
            if (this.info.sinceid != result2.paging.prev) {
                this.generate_account_detail(result2,options);
            }
        });
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
function load_follower(userid, options){
    console.log("getFollower");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;

    MYAPP.sns.getFollower(userid,options)
    .then((result)=>{
        console.log("getFollower",result);
        if (!("max_id" in options.api) && (result.data.length == 0)) {
            if (vue_user.tabbar.follower_count > 0) {
                vue_user.follower.is_vanished = true;
            }
            MUtility.loadingOFF();
            return;
        }
        //vue_user.tabbar.follower_count = result.data.length;
        return result;
        
    })
    .then(result2=>{
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        return MYAPP.sns.getRelationship(users)
        .then(result3=>{
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result3.data.length; i++) {
                    if (datum.id == result3.data[i].id) {
                        datum["relationship"] = result3.data[i];
                        break;
                    }
                }
            }
            if (this.info.sinceid != result2.paging.prev) {
                this.generate_account_detail(result2,options);
            }
        });
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    MYAPP.showBottomCtrl(true);


    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");
    const tlshare_options = [
        {text : "---", type: "share", value: "tt_all", selected:{"red-text":true}},
        {text : _T("sel_tlpublic"), type: "share", value: "tt_public", selected:{"red-text":false}},
        {text : _T("sel_tlonly"), type: "share", value: "tt_tlolny", selected:{"red-text":false}},
        {text : _T("sel_private"), type: "share", value: "tt_private", selected:{"red-text":false}},
    ];
    const tltype_options =  [
        {text : "---", type: "type", value: "tt_all", selected:true},
        {text : _T("sel_media"), type: "type", value: "tt_media", selected:false},
        {text : _T("sel_exclude_share_"+MYAPP.session.config.application.showMode), type: "type", value: "tt_exclude_bst", selected:false},
    ];


    vue_user = {
        "userview" : new Vue({
            el : "#userview",
            delimiters : ["{?","?}"],
            data : {
                is_asyncing : false,
                header : "",
                avatar : "",
                display_name : "",
                id : "",
                idname : "",
                instance : "",
                rawdata : {},
                stat : {},
                translations : {},
                stat_style : {
                    endorsed : {
                        "red-text" : false,
                        "black-text" : true
                    },
                    mute : {
                        "red-text" : false,
                        "black-text" : true
                    },
                    block : {
                        "red-text" : false,
                        "black-text" : true
                    },
                    showing_reblogs : {
                        "red-text" : false,
                        "black-text" : true
                    }
                },
                currentAccount : null,
            },
            computed : {
                full_acct : function (){
                    return `${this.idname}@${this.instance}`;
                },
                full_display_name : function() {
                    return MUtility.replaceEmoji(this.display_name,this.instance,this.rawdata.emojis,18);
                },
                rss_url : function (){
                    return `https://${this.instance}/users/${this.idname}.rss`;
                },
                cssstyle_showing_reblogs : function (){
                    if (this.stat.showing_reblogs) {
                        return _T("to_hidden_share_" + MYAPP.session.data.config.application.showMode);
                    }else{
                        return _T("to_show_share_" + MYAPP.session.data.config.application.showMode);
                    }
                }
            },
            methods : {
                getUserDataForNewToot : function () {
                    var targetuser = {
                        avatar : this.rawdata.avatar,
                        acct : `@${this.rawdata.username}@${this.rawdata.instance}`,
                        username : this.rawdata.username,
                        instance : this.rawdata.instance,
                        display_name : this.rawdata.display_name,
                    };
                    return targetuser;
                },
                showRelationshpText : function(){
                    if (this.stat.followed_by) {
                        return _T("to_followed_by");
                    }
                },
                setData : function (data) {
                    this.id = data.id;
                    this.header = data.header;
                    this.avatar = data.avatar;
                    this.display_name = data.display_name;
                    this.idname = data.username;
                    this.instance = data.instance;
                    this.stat = data.relationship;
                    this.rawdata = Object.assign({},data);

                    if (this.stat.endorsed) {
                        this.stat_style.endorsed["red-text"] = true;
                        this.stat_style.endorsed["black-text"] = false;
                    }
                    if (this.stat.muting) {
                        this.stat_style.mute["red-text"] = true;
                        this.stat_style.mute["black-text"] = false;
                    }
                    if (this.stat.blocking) {
                        this.stat_style.block["red-text"] = true;
                        this.stat_style.block["black-text"] = false;
                    }
                    if (this.stat.showing_reblogs) {
                        this.stat_style.showing_reblogs["red-text"] = true;
                        this.stat_style.showing_reblogs["black-text"] = false;
                    }

                },
                loadUserInfo_body : loadUserInfo_body,
                loadUserInfoDirect : loadUserInfoDirect,
                loadUserInfo : loadUserInfo,
                oncheck_following : function (e) {
                    var msg = "";
                    //---this stat is future stat.
                    if (this.stat.following) {
                        msg = _T("msg_confirm_follow",[this.display_name]);
                    }else{
                        msg = _T("msg_confirm_unfollow",[this.display_name]);
                    }
                    appConfirm(msg,(a) =>{
                        //appAlert("god!");
                        //this.stat.following = true;
                        MYAPP.sns.setFollow(this.id,this.stat.following)
                        .then(result=>{

                        });
                    },()=>{
                        this.stat.following = !this.stat.following;
                    });
                },
                onclick_mention : function (e) {
                    var targetuser = this.getUserDataForNewToot();
                    var options = MYAPP.createNewTootTemplate();
                    options.selaccounts.push(MYAPP.session.status.selectedAccount.idname + "@" + MYAPP.session.status.selectedAccount.instance);
                    options.selsharescope = {text : _T("sel_private"),  value: "tt_private", avatar: "lock",selected:{"red-text":false}};
                    options.mentions.push(targetuser);
                    options.selmentions.push(targetuser.acct);
                    //options.seltags.push();
                    options.status_text = "";
                    options.medias = "";
                    MYAPP.callNewToot(options);
                },
                onclick_directmsg : function (e) {
                    var targetuser = this.getUserDataForNewToot();
                    var options = MYAPP.createNewTootTemplate();
                    options.selaccounts.push(MYAPP.session.status.selectedAccount.idname + "@" + MYAPP.session.status.selectedAccount.instance);
                    options.selsharescope = {text : _T("sel_direct"),  value: "tt_direct", avatar: "email",selected:{"red-text":false}};
                    options.mentions.push(targetuser);
                    options.selmentions.push(targetuser.acct);
                    //options.seltags.push();
                    options.status_text = "";
                    options.medias = "";
                    MYAPP.callNewToot(options);
                },
                onclick_rssfeed : function (url) {
                    window.open(url,"_blank");
                },
                onclick_endorse : function (e) {
                    var commentIndex = 0;
                    var mainfunc = () => {
                        console.log("target=",this.rawdata,commentIndex);
                        var isendorse = false;
                        //---for example, pawoo.net don't has "endorsed" 
                        if ("endorsed" in this.rawdata.relationship) {
                            isendorse = this.rawdata.relationship.endorsed;
                        }
                        MYAPP.sns.setPinUser(this.rawdata.id, !isendorse)
                        .then(result=>{
                            console.log("endorse after=",result);
                            this.stat_style.endorsed["red-text"] = !this.stat_style.endorsed["red-text"];
                            this.stat_style.endorsed["white-text"] = !this.stat_style.endorsed["white-text"];
    
                            if (commentIndex > -1) {
                                //---if comment, delete this in here
                                this.stat = result;
                                
                            }else{
                                //---if toot own, to connect to parent component
                                this.$emit("endorse user",result);
                            }
                        });
                    };
                    if (MYAPP.session.config.action.confirmBefore) {
                        var msg;
                        if (this.stat.endorsed) {
                            msg = _T("msg_confirm_unendorse",[this.display_name]);
                        }else{
                            msg = _T("msg_confirm_endorse",[this.display_name]);
                        }
                        appConfirm(msg,mainfunc);
                    }else{
                        mainfunc();
                    }
                },
                onclick_mute : function (e) {
                    var commentIndex = 0;
                    var mainfunc = () => {
                        console.log("target=",this.rawdata,commentIndex);
                        MYAPP.sns.setMuteUser(this.rawdata.id, !this.rawdata.relationship.muted)
                        .then(result=>{
                            console.log("mute after=",result);
                            this.stat_style.mute["red-text"] = !this.stat_style.mute["red-text"];
                            this.stat_style.mute["black-text"] = !this.stat_style.mute["black-text"];
    
                            if (commentIndex > -1) {
                                //---if comment, delete this in here
                                this.stat = result;
                            }else{
                                //---if toot own, to connect to parent component
                                this.$emit("mute_user",result.muting);
                            }
                        });
                    };
                    if (MYAPP.session.config.action.confirmBefore) {
                        var msg;
                        if (this.stat.muting) {
                            msg = _T("msg_confirm_unmute",[this.display_name]);
                        }else{
                            msg = _T("msg_confirm_mute",[this.display_name]);
                        }
                        appConfirm(msg,mainfunc);
                    }else{
                        mainfunc();
                    }
                },
                onclick_block : function (e) {
                    var commentIndex = 0;
                    var mainfunc = () => {
                        console.log("target=",this.rawdata,commentIndex);
                        MYAPP.sns.setBlockUser(this.rawdata.id, !this.rawdata.relationship.blocking)
                        .then(result=>{
                            console.log("block after=",result);
                            this.stat_style.block["red-text"] = !this.stat_style.block["red-text"];
                            this.stat_style.block["black-text"] = !this.stat_style.block["black-text"];
    
                            if (commentIndex > -1) {
                                //---if comment, delete this in here
                                this.stat = result;
                            }else{
                                //---if toot own, to connect to parent component
                                this.$emit("block",result.muting);
                            }
                        });
                    };
                    if (MYAPP.session.config.action.confirmBefore) {
                        var msg;
                        if (this.stat.blocking) {
                            msg = _T("msg_confirm_unblock",[this.display_name]);
                        }else{
                            msg = _T("msg_confirm_block",[this.display_name]);
                        }
                        appConfirm(msg,mainfunc);
                    }else{
                        mainfunc();
                    }
                },
                onclick_showing_reblogs : function (e) {
                    var commentIndex = 0;
                    var mainfunc = () => {
                        console.log("target=",this.rawdata,commentIndex);
                        MYAPP.sns.setShowBoost(this.rawdata.id, !this.rawdata.relationship.showing_reblogs)
                        .then(result=>{
                            console.log("showing_reblogs after=",result);
                            this.stat_style.showing_reblogs["red-text"] = !this.stat_style.showing_reblogs["red-text"];
                            this.stat_style.showing_reblogs["black-text"] = !this.stat_style.showing_reblogs["black-text"];
    
                            if (commentIndex > -1) {
                                //---if comment, delete this in here
                                this.stat = result;
                            }else{
                                //---if toot own, to connect to parent component
                                this.$emit("showing_reblogs",result.muting);
                            }
                        });
                    };
                    if (MYAPP.session.config.action.confirmBefore) {
                        var msg;
                        if (this.stat.showing_reblogs) {
                            msg = _T("msg_confirm_hidden_share_" + MYAPP.session.data.config.application.showMode,[this.display_name]);
                        }else{
                            msg = _T("msg_confirm_show_share_" + MYAPP.session.data.config.application.showMode,[this.display_name]);
                        }
                        appConfirm(msg,mainfunc);
                    }else{
                        mainfunc();
                    }
                },

            }
        }),
        "tabbar" : new Vue({
            el : "#tabbar",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data : {
                status_count : 0,
                following_count : 0,
                follower_count : 0
            }
        }),
        "basicinfo" : new Vue({
            el : "#basicinfo",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                is_asyncing : false,
                info : {
                    maxid : "",
                    sinceid : "",
                    tltype : "tt_all"
                },
                id : "",
                idname : "",
                instance : "",
                note : "",
                fields : [],
                translations : {},
                globalInfo : {
                    staticpath : MYAPP.appinfo.staticPath
                },
                statuses : [],
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                
            },
            methods : {
                clearInfo : function() {
                    this.info.maxid = "";
                    this.info.since = "";
                },
                setData : function (data) {
                    this.id = data.id;
                    this.idname = data.username;
                    this.instance = data.instance;
                    this.note = data.note;
                    this.fields = data.fields;
                    this.translations = Object.assign({},curLocale.messages);            
                },
                loadPinnedToot : loadPinnedToot,
            }

        }),
        "tootes" : new Vue({
            el : "#tt_public",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
                tlcond : null,
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                Q(".tab.col a").classList.add("active");
            },
            mounted() {
                this.tlcond = new GTimelineCondition();

            },
            watch : {
                selshare_current : _.debounce(function(val) {
                    this.loadTimeline(this.id,this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    //this.info.tltype = sel;
                    var opt = {
                        exclude_replies : true,
                        tltype : sel
                    };
                    if (val == "tt_media") {
                        opt["only_media"] = true;
                    }*/
                    this.loadTimeline(this.id,this.forWatch_seltype(val));
                },400)
            },
            methods : {
                clearInfo : function() {
                    this.info.maxid = "";
                    this.info.since = "";
                    this.info.is_nomax = false;
                    this.info.is_nosince = false;
                },
                setData : function (data) {
                    this.id = data.id;
                    this.idname = data.username;
                    this.instance = data.instance;
                    this.translations = Object.assign({},curLocale.messages);            
                },
                loadTimeline : loadTimelineCommon,
                onsaveclose : function (e) {
                    var param = e;
                    if (e.status) {
                        var opt = this.forWatch_allcondition(param);
                        this.loadTimeline(this.id,opt);
                    }
                }
            }
        }),
        "following" : new Vue({
            el : "#tt_follow",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data : {
                is_asyncing : false,
                info : {
                    maxid : "",
                    sinceid : "",
                },
                id : "",
                idname : "",
                instance : "",
                is_vanished : false,
                cardtype : "normal",
                translations : {},
                accounts : [],
                globalInfo : {}
            },
            methods: {
                clearInfo : function() {
                    this.info.maxid = "";
                    this.info.since = "";
                },
                setData : function (data) {
                    this.id = data.id;
                    this.idname = data.username;
                    this.instance = data.instance;
                    this.translations = Object.assign({},curLocale.messages);            
                },
                load_following : load_following,
            }
        }),
        "follower" : new Vue({
            el : "#tt_follower",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data : {
                is_asyncing : false,
                info : {
                    maxid : "",
                    sinceid : "",
                },
                id : "",
                idname : "",
                instance : "",
                is_vanished : false,
                cardtype : "normal",
                translations : {},
                accounts : [],
                globalInfo : {}
            },
            methods: {
                clearInfo : function() {
                    this.info.maxid = "";
                    this.info.since = "";
                },
                setData : function (data) {
                    this.id = data.id;
                    this.idname = data.username;
                    this.instance = data.instance;
                    this.translations = Object.assign({},curLocale.messages);            
                },
                load_follower : load_follower,
            }
        })
    };

    //MYAPP.setupCommonTranslate();

    M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_user").scroll({top:0})
            if (e.id == "basicinfo") {
                vue_user.basicinfo.statuses.splice(0,vue_user.basicinfo.statuses.length);
                vue_user.basicinfo.loadPinnedToot(vue_user.basicinfo.id,{
                    api : {},
                    app : {}
                });
            }else if (e.id == "tt_public") {
                var et = ID("area_user");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                if ((vue_user.tootes.info.maxid == "") && (vue_user.tootes.info.sinceid == "")) {
                    /*vue_user.tootes.info.tltype = ID("sel_tltype").selectedOptions[0].value;
                    vue_user.tootes.statuses.splice(0,vue_user.tootes.statuses.length);
                    vue_user.tootes.loadTimeline(vue_user.tootes.id,{
                        api : {
                            exclude_replies : true,
                        },
                        app : {
                            is_nomax : false,
                            is_nosince : false,    
                            tltype : vue_user.tootes.info.tltype
                        }
                    });*/
                    var opt = vue_user.tootes.forWatch_allcondition(vue_user.tootes.tlcond.getReturn());
                    vue_user.tootes.loadTimeline(vue_user.tootes.id,opt);
                }
            }else if (e.id == "tt_follow") {
                var et = ID("tt_follow");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > 2) {
                    vue_user.following.accounts.splice(0,vue_user.following.accounts.length);
                    vue_user.following.load_following(vue_user.basicinfo.id,{api:{},app:{}});
                //}
            }else if (e.id == "tt_follower") {
                var et = ID("tt_follow");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > -1) {
                    vue_user.follower.accounts.splice(0,vue_user.follower.accounts.length);
                    vue_user.follower.load_follower(vue_user.basicinfo.id,{api:{},app:{}});
                //}
            }
        }
    });
    M.FormSelect.init(ID("sel_tlshare"), {});
    thisform.select = M.FormSelect.init(ID("sel_tltype"), {
        dropdownOptions : {
            onCloseEnd : function (e) {
                //console.log(e);
                //console.log(thisform.select.getSelectedValues());
            }
        }
    });
    /*ID("sel_tltype").addEventListener("change",function(e){
        console.log(thisform.select.getSelectedValues());
        var sel = e.target.selectedOptions[0].value;
        //thisform.select.getSelectedValues()[0];
        vue_user.tootes.statuses.splice(0,vue_user.tootes.statuses.length);
        vue_user.tootes.info.tltype = sel;
        vue_user.tootes.loadTimeline({
            exclude_replies : true,
            tltype : sel
        });

    });*/
    var elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems, {
        constrainWidth : false
    });

    ID("area_user").addEventListener("scroll",function(e){
        var sa = e.target.scrollHeight - e.target.clientHeight;
        //console.log(e.target.scrollHeight+","+e.target.offsetHeight+" - "+e.target.clientHeight+"="+sa + " : " + e.target.scrollTop);
        var fnlsa = sa - Math.round(e.target.scrollTop);
        if (fnlsa < 10) {
            //---page max scroll down
            console.log("scroll down max");
            var pastOptions = {
                api : {
                    exclude_replies : true,
                    max_id : "",
                },
                app : {
                    is_nomax : false,
                    is_nosince : true,
                    tlshare : "",
                    tltype : "",
                    exclude_reply : true,
                }
            }

            var atab = Q(".tab .active");
            if (atab.hash == "#tt_public") {
                for (var obj in vue_user.tootes.currentOption.api) {
                    pastOptions.api[obj] = vue_user.tootes.currentOption.api[obj];
                }
                console.log(JSON.stringify(vue_user.tootes.info));
                /*vue_user.tootes.loadTimeline(vue_user.tootes.id,{
                    api : {
                        exclude_replies : true,
                        max_id : vue_user.tootes.info.maxid,
                        //since_id : vue_user.tootes.info.sinceid,
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                        tltype : vue_user.tootes.info.tltype
                    }
                });*/
                pastOptions.api.max_id = vue_user.tootes.info.maxid;
                pastOptions.app.tlshare = vue_user.tootes.selshare_current;
                pastOptions.app.tltype = vue_user.tootes.seltype_current;
                vue_user.tootes.loadTimeline(vue_user.tootes.id,{
                    api : pastOptions.api,
                    app : pastOptions.app
                });
            }else if (atab.hash == "#tt_follow") {
                console.log(JSON.stringify(vue_user.following.info));
                vue_user.following.load_following(vue_user.following.id,{
                    api : {
                        exclude_replies : true,
                        max_id : vue_user.following.info.maxid,
                        //since_id : vue_user.tootes.info.sinceid,
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                        tltype : vue_user.following.info.tltype
                    }
                });
            }else if (atab.hash == "#tt_follower") {
                console.log(JSON.stringify(vue_user.follower.info));
                vue_user.follower.load_follower(vue_user.follower.id,{
                    api : {
                        exclude_replies : true,
                        max_id : vue_user.follower.info.maxid,
                        //since_id : vue_user.tootes.info.sinceid,
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                        tltype : vue_user.follower.info.tltype
                    }
                });
            }
        }
        if (e.target.scrollTop == 0) {
            //---page max scroll up
            console.log("scroll up max");
            var futureOptions = {
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

            var atab = Q(".tab .active");
            if (atab.hash == "#tt_public") {
                for (var obj in vue_user.tootes.currentOption.api) {
                    futureOptions.api[obj] = vue_user.tootes.currentOption.api[obj];
                }
                /*vue_user.tootes.loadTimeline(vue_user.tootes.id,{
                    api : {
                        exclude_replies : true,
                        //max_id : vue_user.tootes.info.maxid,
                        since_id : vue_user.tootes.info.sinceid,
                    },
                    app : {
                        is_nomax : false,
                        is_nosince : true,
                        tltype : vue_user.tootes.info.tltype
                    }
                });*/
                futureOptions.api.since_id = vue_user.tootes.info.sinceid;
                futureOptions.app.tlshare = vue_user.tootes.selshare_current;
                futureOptions.app.tltype = vue_user.tootes.seltype_current;
                vue_user.tootes.loadTimeline(vue_user.tootes.id,{
                    api : futureOptions.api,
                    app : futureOptions.app
                });

            }
        }
        MYAPP.commonvue.bottomnav.checkScroll(fnlsa);

    });

    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        //MYAPP.acman.checkVerify();
        
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];
        //generate_account_info(ac);
        
        /*var tmpac = new Account();
        tmpac.load(ac);
        vue_user.userview.header = tmpac.rawdata.header;
        vue_user.userview.avatar = tmpac.rawdata.avatar;
        vue_user.userview.display_name = tmpac.display_name;
        vue_user.userview.idname = tmpac.idname;
        vue_user.userview.instance = tmpac.instance;

        vue_user.basicinfo.note = tmpac.rawdata.note;
        vue_user.basicinfo.fields = vue_user.basicinfo.fields.concat(tmpac.rawdata.fields);
        vue_user.basicinfo.translations = Object.assign({},curLocale.messages);
        */
       vue_user.following.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_user.follower.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };

        MYAPP.session.status.currentLocation = `/users/${ID("hid_instance").value}/${ID("hid_uid").value}`; //location.pathname;

        vue_user.tootes.translations = Object.assign({},curLocale.messages);
        vue_user.userview.translations = Object.assign({},curLocale.messages);
        /*var elem = document.querySelector("#tbl_acc tbody");
        for (var i = 0; i < MYAPP.acman.items.length; i++) {
            elem.appendChild(generate_account_row(MYAPP.acman.items[i]));
        }*/
        //---account load
        vue_user.userview.currentAccount = MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        //---rapidly open and show toot data
        if (ID("hid_onetoote").value != "") {
            MUtility.openDirectOnetoot(ID("hid_onetoote").value);
        }

        //---rapidly open and show user data
        var serverdata = JSON.parse(ID("hid_userdata").value);
        console.log(serverdata);
        if ("acct" in serverdata) {
            vue_user.userview.loadUserInfoDirect(serverdata);
        }else{
            vue_user.userview.loadUserInfo(ID("hid_uid").value,ID("hid_instance").value,{
                api : {},
                app : {}
            });

        }
        console.log("vue_user.basicinfo.id=",vue_user.basicinfo.id);
        for (var obj in vue_user) {
            if ("timeline_gridstyle" in vue_user[obj]) {
                vue_user[obj].changeTimelineStyle();            
            }
        }

        
    }, function (flag) {
        appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    location.hash = "";
})();
