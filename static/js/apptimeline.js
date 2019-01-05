var MYAPP;
var vue_timeline;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {
    if (type == "home") {
        vue_timeline.home.info.tltype = vue_timeline.home.seltype_current;
        vue_timeline.home.statuses.splice(0,vue_timeline.home.statuses.length);
        vue_timeline.home.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_timeline.home.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "list") {
        vue_timeline.list.info.tltype = id;
        vue_timeline.list.statuses.splice(0,vue_timeline.list.statuses.length);
        vue_timeline.list.loadTimeline(type,{
            api : {},
            app : {
                listid : vue_timeline.list.sellisttype_current,
                tlshare : vue_timeline.list.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "local") {
        vue_timeline.local.info.tltype = vue_timeline.local.seltype_current;
        vue_timeline.local.statuses.splice(0,vue_timeline.local.statuses.length);
        vue_timeline.local.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_timeline.local.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "public") {
        vue_timeline.public.info.tltype = vue_timeline.public.seltype_current;
        vue_timeline.public.statuses.splice(0,vue_timeline.public.statuses.length);
        vue_timeline.public.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_timeline.public.selshare_current,
                exclude_reply : true,
            }
        });
    }
}

function loadTimelineCommon(type,options){
    console.log("loadTimelineCommon",type,options);
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    var fnltype = type;
    if (type == "list") {
        fnltype = `list/${options.app.listid}`;
    }
    MYAPP.sns.getTimeline(fnltype,options)
    .then((data)=>{
        console.log("getMyToots",data);
        if (data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        this.generate_toot_detail(data,options);
        
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


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_timeline").classList.add("active");
    //ID("sm_timeline").classList.add("active");
    ID("btn_post_toote").classList.remove("common_ui_off");

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

    vue_timeline = {
        "home" : new Vue({
            el : "#tl_home",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                /*is_asyncing : false,
                selshare_current : "tt_all",
                seltype_current : "tt_all",
                info : {
                    maxid : "",
                    sinceid : "",
                    is_nomax : false,
                    is_nosince : false, 
                    tltype : "tt_all"
                },
                translations : {},
                globalInfo : {
                    staticpath : MYAPP.appinfo.staticPath
                },
                statuses : [],*/
                domgrid : {},
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,

            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                Q(".tab.col a").classList.add("active");
            },
            mounted() {

            },
            watch : {
                selshare_current : _.debounce(function(val) {
                    /*console.log(val);
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    //this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : sel,
                            tltype : this.seltype_current,
                        }
                    };*/
                    this.statuses.splice(0,this.statuses.length);

                    this.loadTimeline("home",this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    /*console.log(val);
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    //this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : this.selshare_current,
                            tltype : sel,
                        }
                    };
                    if (val == "tt_media") {
                        opt.app["only_media"] = true;
                    }*/
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("home",this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon
                //filterToot : checkFilteringToot,
                //getParentToot : getParentToot
            }
        }),
        "list" : new Vue({
            el : "#tl_list",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                sel_listtype : [],
                sellisttype_current : "",

                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,

            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                Q(".tab.col a").classList.add("active");
            },
            mounted() {

            },
            watch : {
                sellisttype_current : _.debounce(function(val){
                    if (val == "0") return;
                    ID("hid_timelinetypeid").value = val;
                    var opt = this.forWatch_selshare(this.selshare_current);
                    opt.app["listid"] = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("list",opt);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.list.stop();
                    notifAccount.account.streams.list.setQuery("list="+val);
                    notifAccount.account.streams.list.start();
                },400),
                selshare_current : _.debounce(function(val) {
                    var opt = this.forWatch_selshare(val);
                    opt.app["listid"] = sellisttype_current;
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("list",opt);
                },400),
                seltype_current : _.debounce(function(val) {
                    var opt = this.forWatch_seltype(val);
                    opt.app["listid"] = sellisttype_current;
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("list",opt);
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon,
                loadListNames : function(){
                    var opt = {api:{},app:{}};
                    MYAPP.sns.getLists(opt)
                    .then(result=>{
                        this.sel_listtype.splice(0,this.sel_listtype.length);
                        this.sel_listtype.push({
                            text : "--",
                            value : "0",
                            selected : true
                        });
                        for (var i = 0; i < result.data.length; i++) {
                            this.sel_listtype.push({
                                text : result.data[i].title,
                                value : result.data[i].id,
                                selected : false
                            });
                        }
                        this.sellisttype_current = this.sel_listtype[0].value;
                        this.$nextTick(function () {
                            ID("sel_listtype").value = this.sel_listtype[0].value;
                            M.FormSelect.init(ID("sel_listtype"), {
                                dropdownOptions : {
                                    constrainWidth : false
                                }
                            });

                        });
                    });
                }
            }
        }),
        "local" : new Vue({
            el : "#tl_local",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                /*is_asyncing : false,
                selshare_current : "tt_all",
                seltype_current : "tt_all",
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
                info : {
                    maxid : "",
                    sinceid : "",
                    is_nomax : false,
                    is_nosince : false, 
                    tltype : "tt_all"
                },
                translations : {},
                globalInfo : {
                    staticpath : MYAPP.appinfo.staticPath
                },
                statuses : [],*/
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
               
            },
            watch : {
                selshare_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : sel,
                            tltype : this.seltype_current,
                        }
                    };*/
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("local",this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : this.selshare_current,
                            tltype : sel,
                        }
                    };
                    if (val == "tt_media") {
                        opt.api["only_media"] = true;
                    }*/
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("local",this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon
                //filterToot : checkFilteringToot,
                //getParentToot : getParentToot
            }
        }),
        "public" : new Vue({
            el : "#tl_public",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                /*is_asyncing : false,
                selshare_current : "tt_all",
                seltype_current : "tt_all",
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
                info : {
                    maxid : "",
                    sinceid : "",
                    is_nomax : false,
                    is_nosince : false, 
                    tltype : "tt_all"
                },
                translations : {},
                globalInfo : {
                    staticpath : MYAPP.appinfo.staticPath
                },
                statuses : [],*/
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
               
            },
            watch : {
                selshare_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : sel,
                            tltype : this.seltype_current,
                        }
                    };*/
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("public",this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.info.tltype = sel;
                    var opt = {
                        api : {
                            exclude_replies : true
                        },
                        app : {
                            tlshare : this.selshare_current,
                            tltype : sel,
                        }
                    };
                    if (val == "tt_media") {
                        opt.api["only_media"] = true;
                    }*/
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("public",this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon
                //filterToot : checkFilteringToot,
                //getParentToot : getParentToot
            }
        })

    };

    //MYAPP.setupCommonTranslate();
    //vue_user.tabbar.setTranslation();

    M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_timeline").scroll({top:0});
            ID("hid_timelinetype").value = e.id.replace("tl_","");
            if (e.id == "tl_home") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_timeline.home.info.tltype = vue_timeline.home.seltype_current;
                    vue_timeline.home.statuses.splice(0,vue_timeline.home.statuses.length);
                    vue_timeline.home.loadTimeline("home",{
                        api : {
                            exclude_replies : true,
                        },
                        app : {
                            tlshare : vue_timeline.home.selshare_current,
                            tltype : vue_timeline.home.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.list.stop();
                notifAccount.account.streams.local.stop();
                notifAccount.account.streams.public.stop();

            }else if (e.id == "tl_list") {
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                if (vue_timeline.list.sel_listtype.length > 0) {
                    vue_timeline.list.info.tltype = vue_timeline.list.seltype_current;
                    vue_timeline.list.statuses.splice(0,vue_timeline.list.statuses.length);
                    if (vue_timeline.list.sellisttype_current != "0") {
                        vue_timeline.list.loadTimeline("list",{
                            api : {
                            },
                            app : {
                                listid : vue_timeline.list.sellisttype_current,
                                tlshare : vue_timeline.local.selshare_current,
                                tltype : vue_timeline.local.seltype_current,
                                exclude_reply : true,
                            }
                        });
                        notifAccount.account.streams.list.setQuery("list="+vue_timeline.list.sellisttype_current);
                        notifAccount.account.streams.list.start();
                    }
                    notifAccount.account.streams.local.stop();
                    notifAccount.account.streams.public.stop();

                }
            }else if (e.id == "tl_local") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_timeline.local.info.tltype = vue_timeline.local.seltype_current;
                    vue_timeline.local.statuses.splice(0,vue_timeline.local.statuses.length);
                    vue_timeline.local.loadTimeline("local",{
                        api : {
                            local : true
                        },
                        app : {
                            tlshare : vue_timeline.local.selshare_current,
                            tltype : vue_timeline.local.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.list.stop();
                notifAccount.account.streams.local.start();
                notifAccount.account.streams.public.stop();

            }else if (e.id == "tl_public") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_timeline.public.info.tltype = vue_timeline.public.seltype_current;
                    vue_timeline.public.statuses.splice(0,vue_timeline.public.statuses.length);
                    vue_timeline.public.loadTimeline("public",{
                        api : {
                            local : false
                        },
                        app : {
                            tlshare : vue_timeline.public.selshare_current,
                            tltype : vue_timeline.public.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.list.stop();
                notifAccount.account.streams.local.stop();
                notifAccount.account.streams.public.start();

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

    //---not use-----------------------------------------------------
    Qs(".xtab-content").forEach(e => {
        e.addEventListener("scroll",function(e){
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
                if (atab.hash == "#tl_home") {
                    console.log(JSON.stringify(vue_timeline.home.info));
                    pastOptions.api.max_id = vue_timeline.home.info.maxid;
                    pastOptions.app.tlshare = vue_timeline.home.selshare_current;
                    pastOptions.app.tltype = vue_timeline.home.seltype_current;
                    vue_timeline.home.loadTimeline("home",{
                        api : pastOptions.api,
                        app : pastOptions.app
                    });
                }else if (atab.hash == "#tl_list") {
                    pastOptions.api.max_id = vue_timeline.list.info.maxid;
                    pastOptions.app["listid"] = vue_timeline.list.sellisttype_current;
                    pastOptions.app.tlshare = vue_timeline.list.selshare_current;
                    pastOptions.app.tltype = vue_timeline.list.seltype_current;
                    console.log(JSON.stringify(vue_timeline.list.info));
                    vue_timeline.list.loadTimeline("list",{
                        api : pastOptions.api,
                        app : pastOptions.app
                    });
                }else if (atab.hash == "#tl_local") {
                    pastOptions.api.max_id = vue_timeline.local.info.maxid;
                    pastOptions.app.tlshare = vue_timeline.local.selshare_current;
                    pastOptions.app.tltype = vue_timeline.local.seltype_current;
                    console.log(JSON.stringify(vue_timeline.local.info));
                    vue_timeline.local.loadTimeline("local",{
                        api : pastOptions.api,
                        app : pastOptions.app
                    });
                }else if (atab.hash == "#tl_public") {
                    pastOptions.api.max_id = vue_timeline.public.info.maxid;
                    pastOptions.app.tlshare = vue_timeline.public.selshare_current;
                    pastOptions.app.tltype = vue_timeline.public.seltype_current;
                    console.log(JSON.stringify(vue_timeline.public.info));
                    vue_timeline.public.loadTimeline("public",{
                        api : pastOptions.api,
                        app : pastOptions.app
                    });
                }
            }
            if (e.target.scrollTop == 0) {
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
                //---page max scroll up
                console.log("scroll up max");
                var atab = Q(".tab .active");
                if (atab.hash == "#tl_home") {
                    futureOptions.api.since_id = vue_timeline.home.info.sinceid;
                    futureOptions.app.tlshare = vue_timeline.home.selshare_current;
                    futureOptions.app.tltype = vue_timeline.home.seltype_current;
                    vue_timeline.home.loadTimeline("home",{
                        api : futureOptions.api,
                        app : futureOptions.app
                    });
                }else if (atab.hash == "#tl_list") {
                    futureOptions.api.since_id = vue_timeline.list.info.sinceid;
                    futureOptions.app["listid"] = vue_timeline.list.sellisttype_current;
                    futureOptions.app.tlshare = vue_timeline.list.selshare_current;
                    futureOptions.app.tltype = vue_timeline.list.seltype_current;
                    vue_timeline.list.loadTimeline("list",{
                        api : futureOptions.api,
                        app : futureOptions.app
                    });
                }else if (atab.hash == "#tl_local") {
                    futureOptions.api.since_id = vue_timeline.local.info.sinceid;
                    futureOptions.app.tlshare = vue_timeline.local.selshare_current;
                    futureOptions.app.tltype = vue_timeline.local.seltype_current;
                    vue_timeline.local.loadTimeline("local",{
                        api : futureOptions.api,
                        app : futureOptions.app
                    });
                }else if (atab.hash == "#tl_public") {
                    futureOptions.api.since_id = vue_timeline.public.info.sinceid;
                    futureOptions.app.tlshare = vue_timeline.public.selshare_current;
                    futureOptions.app.tltype = vue_timeline.public.seltype_current;
                    vue_timeline.public.loadTimeline("public",{
                        api : futureOptions.api,
                        app : futureOptions.app
                    });
                }
                this.is_scrolltop;
            }else{

            }
        });
    });

    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();

        
        var tltype = ID("hid_timelinetype").value;
        if (tltype == "") {
            tltype = "home";
            ID("hid_timelinetype").value = tltype;
        }
        var tltypeid = ID("hid_timelinetypeid").value;

        //generate_account_info(ac);
        //MYAPP.session.status.showingAccount.data = ac;
        //MYAPP.session.status.showingAccount.idname = ac.idname;
        //MYAPP.session.status.showingAccount.instance = ac.instance;
        //MYAPP.sns.setAccount(MYAPP.session.status.showingAccount.data);
        MYAPP.checkSession();
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];

        if (tltypeid == "") {
            MYAPP.session.status.currentLocation = `/tl/${tltype}`; //location.pathname;
        }else{
            MYAPP.session.status.currentLocation = `/tl/${tltype}/${tltypeid}`;
        }
    
        vue_timeline.home.translations = Object.assign({},curLocale.messages);
        vue_timeline.list.translations = Object.assign({},curLocale.messages);
        vue_timeline.local.translations = Object.assign({},curLocale.messages);
        vue_timeline.public.translations = Object.assign({},curLocale.messages);


        for (var obj in vue_timeline) {
            vue_timeline[obj].changeTimelineStyle();            
        }

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);

        barancerTimelineType(tltype,tltypeid);

        vue_timeline.list.loadListNames();
    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
