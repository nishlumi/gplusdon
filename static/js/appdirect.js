var MYAPP;
var vue_direct;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {
    if (type == "taglocal") {
        vue_direct.taglocal.info.tltype = vue_direct.taglocal.seltype_current;
        vue_direct.taglocal.statuses.splice(0,vue_direct.taglocal.statuses.length);
        vue_direct.taglocal.loadTimeline(`tag/${id}`,{
            api : {
                local : true
            },
            app : {
                tlshare : vue_direct.tag.selshare_current,
                exclude_reply : true,
            }
        });
        notifAccount.account.streams.taglocal.setQuery("tag="+vue_direct.taglocal.tagname);
        notifAccount.account.streams.taglocal.start();

    }else if (type == "tag") {
        vue_direct.tag.info.tltype = vue_direct.tag.seltype_current;
        vue_direct.tag.statuses.splice(0,vue_direct.tag.statuses.length);
        vue_direct.tag.loadTimeline(`tag/${id}`,{
            api : {},
            app : {
                tlshare : vue_direct.tag.selshare_current,
                exclude_reply : true,
            }
        });
        notifAccount.account.streams.tag.setQuery("tag="+vue_direct.tag.tagname);
        notifAccount.account.streams.tag.start();

    }
}

function loadTimelineCommon(user,options){
    console.log("loadTimelineCommon",options);
    if (this.is_asyncing) return false;

    var meacct = this.account.rawdata.url;
    options["app"]["acct"] = meacct;
    options["app"]["user"] = user;
    var useracct = user.url;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getTimeline("direct",options)
    .then((result)=>{
        console.log("getTimeline",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        /*var ret = {
            data : [],
            paging : result.paging,
        }
        for (var i = 0; i < result.data.length; i++) {
            console.log("dmsg info=",
                result.data[i].id,
                result.data[i].account.url,
                result.data[i].in_reply_to_id,
                result.data[i].mentions[0].url
            );
            var dataacct = result.data[i].account.url;
            //  condition
            //    he: username & instance
            //    me: username & instance , mentions[0].url == his account.url
            //
            if ((dataacct == useracct) ||
                ((dataacct == meacct) && (result.data[i].mentions[0].url == user.url))
            ) {
                ret.data.push(result.data[i]);
            }
        }
        console.log("direct msg=",ret.data);*/

        this.generate_toot_detail(result,options);
        
    })
    .catch(error=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        alertify.error("読み込みに失敗しました。");
        console.log("loadTimelineCommonにて不明なエラーです。",error);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        this.$nextTick(()=>{
            //var e = Q(".timeline_cardlist_mobile");
            ////e.scroll({top:e.scrollHeight});
            //e.scrollTop = e.scrollHeight;
            //e = Q(".timeline_cardlist")
            ////e.scroll({top:e.scrollHeight});
            //console.log("e.scrollHeight;=",e.scrollHeight);
            //e.scrollTop = e.scrollHeight;
        });
    });
}
function load_for_contact() {
    if (this.is_asyncing) return false;
    if (this.account.directlst.length > 0) {
        this.contacts = this.account.directlst;
        return false;
    }

    MUtility.loadingON();
    this.is_asyncing = true;
    var meacct = this.account.rawdata.url;

    MYAPP.sns.getTimeline("direct",{
        api : {
            limit : 40,
        },
        app : {

        }
    })
    .then((result)=>{
        console.log("direct",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        var arr = [];
        for (var i = 0; i < result.data.length; i++) {
            var dmsg = result.data[i];
            //---get only first toot
            console.log(i,dmsg.in_reply_to_id,dmsg.mentions[0]);
            if (!dmsg.in_reply_to_id && (dmsg.mentions.length > -1)) {
                if (dmsg.account.url == meacct) { //---if sender is me
                    if (dmsg.mentions.length > 0) {
                        var inst = MUtility.getInstanceFromAccount(dmsg.mentions[0].url);
                        dmsg.mentions[0]["instance"] = inst;
                        dmsg.mentions[0]["display_name"] = "";
                        dmsg.mentions[0]["emojis"] = [];
                        //---added account is mention object
                        if ((this.exist_contact(dmsg.mentions[0]) == -1)) {
                            this.contacts.push({
                                user : dmsg.mentions[0],
                                info : {
                                    selected : {
                                        "grey" : false,
                                        "lighten-2" : false,
                                    }
                                }
                            });
                        }

                    }
                }else{ //---if sender is other user
                    //---added account is mastodon account
                    if ((this.exist_contact(dmsg.account) == -1)) {
                        this.contacts.push({
                            user : dmsg.account,
                            info : {
                                selected : {
                                    "grey" : false,
                                    "lighten-2" : false,
                                }
                            }
                        });
                    }
                }
            }
        }
        return this.contacts;
    })
    .then(result_contacts=>{
        console.log("contacts=",result_contacts);
        var pro = [];
        for (var i = 0; i < result_contacts.length; i++) {
            var pr = MYAPP.sns.getUser(
                result_contacts[i].user.username,
                result_contacts[i].user.instance,
                {api:{},app:{
                    index : i
                }}
            )
            .then(result=>{
                var index = result.options.app.index;
                this.$set(result_contacts[index], "user", result.data);
                return result_contacts[index];
            });
            pro.push(pr);
        }
        //this.contacts = arr;
        Promise.all(pro)
        .then(values=>{
            this.account.directlst = JSON.original(this.contacts);
            MYAPP.acman.save();    
        });
    })
    .catch(error=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        alertify.error("読み込みに失敗しました。");
        console.log("loadTimelineCommonにて不明なエラーです。",error);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
/**
 * 
 * @param {Object} rawdata {data:toote[], paging:{}}
 * @param {Object} options {api:{}, app:{}}
 * app : {
 *   acct : hoge at instance
 * }
 */
function generate_toot_detail(rawdata,options) {
    var data = rawdata.data;
    var paging = rawdata.paging;
    var meacct = this.account.rawdata.url;

    if (!options.app.is_nomax) {
        if (paging.next != "") {
            this.msginfo.maxid = paging.next; //data[data.length - 1].id;
        }
    }
    if (!options.app.is_nosince) {
        if (paging.prev != "") {
            this.msginfo.sinceid = paging.prev; //data[0].id;
        }
    }
    for (var i = 0; i < data.length; i++) {
        var dataacct = data[i].account.url;
        /*  condition
            he: account.url
            me: account.url , mentions[0].url == his account.url
        */
        if (this.checkExistToot(data[i].id)) continue;

        if ((dataacct == options.app.user.url) ||
            ((dataacct == meacct) && (data[i].mentions[0].url == options.app.user.url))
        ) {
            var st = new Gpstatus(data[i],18);

            var useracct = st.body.account.url;

            var ret = {
                toote : st,
                user_direction : {
                    type : (meacct == useracct) ? "me" : "they",
                },
                options : {
                    hideDot : (meacct == useracct) ? false : true,
                    color : "",
                }
            }
            if (paging.next != "")  {
                this.msgs.unshift(ret);
            }else{
                this.msgs.push(ret);
            }
            //---get link preview
            if (st.urls.length > 0) {
                var targeturl = st.urls[0];
                //console.log("urls>0=",st.body.id, st.id, i, JSON.original(st.urls))
                //---get GPHT
                /*loadGPHT(st.url[0],data[i].id)
                .then((result)=>{

                });*/
                //---get OGP
                MYAPP.sns.getTootCard(st.body.id, st.id, i)
                .then(result=>{
                    var data = result.data;
                    var tt = this.getParentToot(result.parentID);
                    //console.log("result,tt=",result,tt);

                    if (("url" in data)) {
                        var thistoote = this.msgs[tt.index].toote;
                        this.$set(thistoote.mainlink, "exists", true);
                        if ("provider_name" in data) {
                            if (data.provider_name != "") {
                                this.$set(thistoote.mainlink, "site", data["provider_name"]);
                            }else{
                                var a = GEN("a");
                                a.href = data.url;
                                //console.log("data.url=",a.hostname);
                                this.$set(thistoote.mainlink, "site", a.hostname);
                            }
                        }
                        if ("url" in data) this.$set(thistoote.mainlink, "url", data["url"]);
                        if ("title" in data) this.$set(thistoote.mainlink, "title", data["title"]);
                        if ("description" in data) this.$set(thistoote.mainlink, "description", data["description"]);
                        if (("image" in data) && (data["image"] != null)) {
                            this.$set(thistoote.mainlink, "image", data["image"]);
                            this.$set(thistoote.mainlink, "isimage", true);

                            //---final card size change
                            //if (thistoote.medias.length > 0) {
                            //    var sp = parseInt(thistoote.cardtypeSize["grid-row-end"].replace("span", ""));
                            //}
                        } else {
                            this.$set(thistoote.mainlink, "isimage", false);
                        }
                    }else{
                        return Promise.reject({url:targeturl, tootid:st.id});
                    }
                })
                .catch(param=>{
                    console.log("param=",param);
                    loadOGP(param.url, param.tootid)
                    .then(result => {
                        //---if image is none and url is pixiv, re-get image url
                        var def = new Promise((resolve, reject) => {

                            var tt = this.getParentToot(result.index);

                            //console.log("catch,param,ogp=",result);
                            console.log(tt);
                            if (tt.data.toote.urls.length > 0) {
                                if ((!("og:image" in result.data) || (result.data["og:image"] == "")) &&
                                    (tt.data.toote.urls[0].indexOf("pixiv.net/member_illust") > -1)
                                ) {
                                    if ("pixiv_cards" in tt.data.body) {
                                        result.data["og:image"] = tt.data.toote.body.pixiv_cards[0].image_url;
                                        resolve(result);
                                    } 
                                } else {
                                    resolve(result);
                                }

                            }else{
                                reject(false);
                            }
                        });
                        return def;
                    })
                    .then((result) => {
                        //console.log("result=", result);
                        var data = result.data;
                        var tt = this.getParentToot(result.index);
                        var thistoote = this.msgs[tt.index].toote;

                        this.$set(thistoote.mainlink, "exists", true);
                        if (data["og:site_name"]) this.$set(thistoote.mainlink, "site", data["og:site_name"]);
                        if (data["og:url"]) this.$set(thistoote.mainlink, "url", data["og:url"]);
                        if (data["og:title"]) this.$set(thistoote.mainlink, "title", data["og:title"]);
                        if (data["og:description"]) this.$set(thistoote.mainlink, "description", data["og:description"]);
                        if (("og:image" in data) && (data["og:image"] != "")) {
                            this.$set(thistoote.mainlink, "image", data["og:image"]);
                            this.$set(thistoote.mainlink, "isimage", true);

                            //---final card size change
                            /*if (thistoote.medias.length > 0) {
                                var sp = parseInt(thistoote.cardtypeSize["grid-row-end"].replace("span", ""));
                                if (sp < 9) {
                                    sp = sp + 10;
                                } else {
                                    sp = sp + 6;
                                }
                                this.$set(thistoote.cardtypeSize, "grid-row-end", `span ${sp}`);
                            }*/
                        } else {
                            this.$set(thistoote.mainlink, "isimage", false);
                        }
                    })
                    
                    ;
                    
                });

                
            }
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_timeline").classList.add("active");
    //ID("sm_timeline").classList.add("active");
    

    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    const tlshare_options = [
        {text : "---", type: "share", value: "tt_all", selected:true},
        {text : _T("sel_tlpublic"), type: "share", value: "tt_public", selected:false},
        {text : _T("sel_tlonly"), type: "share", value: "tt_tlolny", selected:false},
        {text : _T("sel_private"), type: "share", value: "tt_private", selected:false},
    ];
    const tltype_options =  [
        {text : "---", type: "type", value: "tt_all", selected:true},
        {text : _T("sel_media"), type: "type", value: "tt_media", selected:false},
        {text : _T("sel_exclude_share_"+MYAPP.session.config.application.showMode), type: "type", value: "tt_exclude_bst", selected:false},
    ];

    vue_direct = new Vue({
        el : "#area_dmsg",
        delimiters : ["{?","?}"],
        mixins : [vue_mixin_for_inputtoot],
        //mixins : [vue_mixin_for_timeline],
        data : {
            translations : {},
            globalInfo : {},

            mode : "",      //pc, mobile
            is_turn : 0,
            domgrid : {},
            account : null,   //---current account
            /*
                user : Mastodon's account array,
                info : {
                    selected : {
                        grey : false, lighten-2 : false
                    }
                }
            */
            contacts : [],  
            show_user : null,
            show_user_info : {
                reply_to_id : "",
            },
            input : "",
            /*
            toote : Gpstatus, 
            user_direction : {}
            options : {
                hideDot : false,
                color : "",
            }
            */
            is_show_autocom : false,
            autocom_mention : "",   //---for direct message, one user
            a_mentions : [],
			a_mention_loading : false,
			a_mention_search : null,

            msginfo : {
				maxid : "",
				sinceid : "",
				is_nomax : false,
				is_nosince : false, 
            },
            msgs : [],
        },
        created : function() {
            //---if normaly indicate "active" class in html, it is shiftted why digit position
            //   the workarround for this.
            
        },
        mounted() {
            if (this.$vuetify.breakpoint.smAndDown) {
                this.mode = "mobile";
            }else{
                this.mode = "pc";
            }
            this.selsharescope = {
                text : _T("sel_direct"),
                value: "tt_direct",
                avatar: "email",
                selected:{"red-text":false}
            };
            this.screentype = "direct";
            //this.selmentions = "";

            //---create ckeditor for direct message input box
            CKEDITOR.disableAutoInline = true;
            CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
            this.ckeditor = CKEDITOR.inline( 'dv_inputcontent', CK_INPUT_TOOTBOX);
    
            console.log("this.status_text=",this.status_text);
            //this.ckeditor.setData(this.status_text);
    
            $("#dv_inputcontent").pastableContenteditable();
            $("#dv_inputcontent").on('pasteImage',  (ev, data) => {
                console.log(ev,data);
                if (this.dialog || this.otherwindow) {
                    this.loadMediafiles("blob",[data.dataURL]);
                }
            }).on('pasteImageError', (ev, data) => {
                alert('error paste:',data.message);
                if(data.url){
                    alert('But we got its url anyway:' + data.url)
                }
            }).on('pasteText',  (ev, data) => {
                console.log("text: " + data.text);
            });
    
        },
        watch : {
            autocom_mention : function (val) {
                if (val == "") return;

                //---if direct message, append to contact list
                var tmparr = val.split("@");
                MYAPP.sns.getUser(tmparr[1],tmparr[2],{
                    api : {},
                    app : {}
                })
                .then(result=> {
                    this.contacts.push({
                        user : result.data,
                        info : {
                            selected : {
                                "grey" : false,
                                "lighten-2" : false,
                            }
                        }
                    });
                    this.mentions.splice(0,this.mentions.length);
    
                });
            },
            a_mention_search : _.debounce(function(val) {
                if (val == "") return;
                //var baseac = this.selaccounts[0].split("@");
                console.log("mention_search=",val);
    
                var hitac = this.getTextAccount2Object(0);
                if (!hitac) return;
    
                var backupAC = MYAPP.sns._accounts;
                MYAPP.sns.setAccount(hitac);
    
                for (var i = this.a_mentions.length-1; i >= 0; i--) {
                    if (this.autocom_mention.indexOf(this.a_mentions[i].acct) == -1) {
                        this.a_mentions.splice(i,1);
                    }
                }
    
                this.a_mention_loading = true;
    
                MYAPP.sns.getUserSearch(val,{
                    api : {
                        limit:5
                    },
                    app : {}
                })
                .then(result=>{
                    for (var i = 0; i < result.data.length; i++) {
                        this.a_mentions.push({
                            avatar : result.data[i].avatar,
                            acct : `@${result.data[i].username}@${result.data[i].instance}`,
                            username : result.data[i].username,
                            instance : result.data[i].instance,
                            display_name : result.data[i].display_name,
                        });
                        
                    }
                    console.log(this.a_mentions);
                },result=>{
    
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(()=>{
                    this.a_mention_loading = false;
                    MYAPP.sns.setAccount(backupAC);
                    
                });   
            },1000)
    
        },
        computed: {
            timeline () {
                return this.msgs.slice().reverse();
            }
        },
        methods : {
            load_for_contact : load_for_contact,
            loadTimeline : loadTimelineCommon,
            exist_contact : function (user) {
                var ishit = -1;
                var target_acct = user.url;
                for (var i = 0; i < this.contacts.length; i++) {
                    var acct = this.contacts[i].user.url;
                    if (acct == target_acct) {
                        ishit = i;
                        break;
                    }
                }
                return ishit;
            },
            full_display_name : function(user) {
                if (user) {
                    return MUtility.replaceEmoji(user.display_name,user.instance,user.emojis,18) + `@${user.instance}`;
                }else{
                    return "";
                }
            },
            checkExistToot : function (id) {
                var hit = false;
                for (var i = 0; i < this.msgs.length; i++) {
                    if (id == this.msgs[i].toote.id) {
                        hit = true;
                        break;
                    }
                }
                return hit;
            },
            /**
             * get parent toot reply, etc
             * @param {String} id parent toot id from referrence
             */
            getParentToot: function (id) {
                for (var i = 0; i < this.msgs.length; i++) {
                    var tt = this.msgs[i];
                    if (id == tt.toote.id) {
                        return { index: i, data: tt };
                    }
                }
                return null;
            },
            remove_mention (item) {
                this.autocom_mention = "";
            },

            generate_toot_detail : generate_toot_detail,
            clear_dmsg_tl : function () {
                //---clear tl
                this.msgs.splice(0,this.msgs.length);
                //---clear input box
                this.status_text = "";
                this.mainlink.exists = false;
                this.ckeditor.editable().setText("");
                this.selmentions.splice(0,this.selmentions.length);
                this.seltags.splice(0,this.seltags.length);
                this.selmedias.splice(0,this.selmedias.length);
                this.medias.splice(0,this.medias.length);
                this.switch_NSFW = false;

            },
            //---event handler
            onclick_contactuser : function (item) {
                for (var i = 0; i < this.contacts.length; i++) {
                    this.contacts[i].info.selected = {
                        "grey" : false, "lighten-2" : false
                    }
                }
                item.info.selected.grey = true;
                item.info.selected["lighten-2"] = true;
                this.show_user = item.user;
                this.selmentions.splice(0,this.selmentions.length);
                this.selmentions.push("@"+item.user.acct);
                this.msgs.splice(0,this.msgs.length);
                this.loadTimeline(this.show_user,{
                    api : {
                        limit : 40,
                    },
                    app : {}
                });
                if (this.mode == "mobile") {
                    this.is_turn = 1;
                }

            },
            onclick_addContact : function (e) {
                this.is_show_autocom = !this.is_show_autocom;
            },
            onclick_reloadContact : function (e) {
                vue_direct.account.directlst.splice(0,vue_direct.account.directlst.length);
                vue_direct.load_for_contact();
            },
            onclick_mention_addenter : function (e) {
                MYAPP.sns.getUser(
                    this.mentions[0].username,
                    this.mentions[0].instance,
                    {api:{},app:{
                        
                    }}
                )
                .then(result=>{
                    this.contacts.push({
                        user : result.data,
                        info : {
                            selected : {
                                "grey" : false,
                                "lighten-2" : false,
                            }
                        }
                    });
                    this.mentions.splice(0,this.mentions.length);
                    this.selmentions.splice(0,this.selmentions.length);
                });
            },
            onclick_returnwin : function (e) {
                this.is_turn = 0;
            },
            onsubmit_comment : function (e) {
                var pros = [];

                var account = this.account;
                console.log(account);
                var mediaids = [];
                for (var m = 0; m < this.medias.length; m++) {
                    mediaids.push(this.medias[m][account.acct].id);
                }
                MYAPP.executePost(this.joinStatusContent(),{
                    "in_reply_to_id" : this.reply_to_id,
                    "account" : account,
                    "scope" : this.selsharescope,
                    "media" : mediaids
                })
                .then(values=>{
                    //---clear input and close popup
                    this.status_text = "";
                    this.selmentions.splice(0,this.selmentions.length);
                    this.seltags.splice(0,this.seltags.length);
                    this.selmedias.splice(0,this.selmedias.length);
    
    
                    if (!this.fullscreen) {
                        this.dialog = false;
                    }
                })
                .finally(()=>{
                    //---recover base reply mention of this toot 
                    this.selmentions.push("@"+this.show_user);
    
                    //---fire onreplied event to parent element
    
                    this.status_text = "";
                    this.mainlink.exists = false;
                    this.ckeditor.editable().setText("");
                    this.seltags.splice(0,this.seltags.length);
                    this.selmedias.splice(0,this.selmedias.length);
                    this.medias.splice(0,this.medias.length);
                    this.switch_NSFW = false;
    
                });
            },
            onscroll_dmsg : function (e) {
                var sa = e.target.scrollHeight - e.target.clientHeight;
                //console.log(e.target.scrollHeight+","+e.target.offsetHeight+" - "+e.target.clientHeight+"="+sa + " : " + e.target.scrollTop);
                var fnlsa = sa - Math.round(e.target.scrollTop);
                if (fnlsa < 10) {
                }
                if (e.target.scrollTop == 0) {
                    //---get past toot conversation
                    this.loadTimeline(this.show_user,{
                        api : {
                            limit : 40,
                            max_id : this.msginfo.maxid,
                        },
                        app : {
                            is_nomax : false,
                            is_nosince : true,        
                        }
                    });

                }    
            }

        }
    });

    //MYAPP.setupCommonTranslate();
    //vue_user.tabbar.setTranslation();

    M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_timeline").scroll({top:0});
            ID("hid_timelinetype").value = e.id.replace("tl_","");
            if (e.id == "tl_tag") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_direct.tag.info.tltype = vue_direct.tag.seltype_current;
                    vue_direct.tag.statuses.splice(0,vue_direct.tag.statuses.length);
                    vue_direct.tag.loadTimeline(`tag/${vue_direct.tag.tagname}`,{
                        api : {
                            exclude_replies : true,
                        },
                        app : {
                            tlshare : vue_direct.tag.selshare_current,
                            tltype : vue_direct.tag.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.taglocal.setQuery("tag="+vue_direct.tag.tagname);
                notifAccount.account.streams.tag.start();
                notifAccount.account.streams.taglocal.stop();
            }else if (e.id == "tl_taglocal") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_direct.taglocal.info.tltype = vue_direct.taglocal.seltype_current;
                    vue_direct.taglocal.statuses.splice(0,vue_direct.taglocal.statuses.length);
                    vue_direct.taglocal.loadTimeline(`tag/${vue_direct.taglocal.tagname}`,{
                        api : {
                            exclude_replies : true,
                            local : true,
                        },
                        app : {
                            tlshare : vue_direct.taglocal.selshare_current,
                            tltype : vue_direct.taglocal.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.taglocal.setQuery("tag="+vue_direct.taglocal.tagname);
                notifAccount.account.streams.taglocal.start();
                notifAccount.account.streams.tag.stop();
            }
        }
    });
    thisform.select = M.FormSelect.init(Qs("select"), {
        dropdownOptions : {
            constrainWidth : false,
            onCloseEnd : function (e) {
                //console.log(e);
                //console.log(thisform.select.getSelectedValues());
            }
        }
    });

    var elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems, {
        constrainWidth : false
    });

    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();

        MYAPP.checkSession();
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];


        MYAPP.session.status.currentLocation = `/direct`;
    
        vue_direct.translations = Object.assign({},curLocale.messages);

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);

        //barancerTimelineType("taglocal",tltypeid);
        //vue_direct.load_for_contact();

        var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
        notifAccount.account.direct.setTargetDirect(vue_direct);
        notifAccount.account.direct.start();

    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
