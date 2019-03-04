var MYAPP;
var vue_timeline;
var vue_tltab;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {
    vue_tltab.tl_tabtype = type;
    vue_timeline.changeTabType(type);
    vue_timeline.clearPending();
    vue_timeline.clearTimeline();

    vue_tltab.turnButtonStatus(type);
    
    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
    if (type == "taglocal") {
        vue_timeline.forWatch_allcondition(vue_timeline.tlcond.getReturn());
        vue_timeline.currentOption.api["local"] = true;
        vue_timeline.loadTimeline(`tag/${vue_timeline.tagname}`,vue_timeline.currentOption);

        notifAccount.account.streams.taglocal.setQuery("tag="+vue_timeline.tagname);
        notifAccount.account.streams.taglocal.start();

    }else if (type == "tag") {
        vue_timeline.forWatch_allcondition(vue_timeline.tlcond.getReturn());
        vue_timeline.loadTimeline(`tag/${vue_timeline.tagname}`,vue_timeline.currentOption);

        notifAccount.account.streams.tag.setQuery("tag="+vue_timeline.tagname);
        notifAccount.account.streams.tag.start();

    }
}

function loadTimelineCommon(type,options){
    console.log("loadTimelineCommon",type,options);
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    var fnltype = type;
    MYAPP.sns.getTimeline(fnltype,options)
    .then((result)=>{
        console.log("getTimeline",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
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
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_timeline").classList.add("active");
    //ID("sm_timeline").classList.add("active");
    MYAPP.showPostCtrl(true);
    MYAPP.showBottomCtrl(true);

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
    class tabbtn_style {
        constructor(){ 
            this.grey = false;
            this["lighten-3"] = false;
            this["red--text"] = false;
            this["black--text"] = true;
            this.active = false;

        };
    };

    vue_tltab  = new Vue({
        el : "#tl_tab",
        delimiters : ["{?","?}"],
        mixins : [vue_mixin_base],
        data : {
            translations : {},
            tl_tabtype : "taglocal",
            hashtag : "",
            css : {
                tabs : {
                    "taglocal" : new tabbtn_style(),
                    "tag" : new tabbtn_style()
                }
            },
            sel_listitem : "",
            list_items : [],
        },
        watch : {
            
        },
        computed: {
            
        },
        methods: {
            turnButtonStatus : function (val) {
                for (var obj in this.css.tabs) {
                    this.css.tabs[obj].grey = false;
                    this.css.tabs[obj]["lighten-3"] = false;
                    this.css.tabs[obj]["red--text"] = false;
                    this.css.tabs[obj]["black--text"] = true;
                    this.css.tabs[obj].active = false;

                }
                this.css.tabs[val].grey = true;
                this.css.tabs[val]["lighten-3"] = true;
                this.css.tabs[val]["red--text"] = true;
                this.css.tabs[obj]["black--text"] = false;
                this.css.tabs[val].active = true;

            },
            onclick_btntabitem : function (e) {
                this.tl_tabtype = e;
                MYAPP.commonvue.navigation.switchListSelect((e == "list"));
                vue_timeline.funcTabtype(e,this.sel_listitem);

                this.turnButtonStatus(e);
            }
        },
    });
    vue_timeline = new Vue({
        el : "#tl_common",
        delimiters : ["{?","?}"],
        mixins : [vue_mixin_base,vue_mixin_for_timeline],
        data : {
            tlcond : null,

            backup : {
                "taglocal" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                },
                "tag" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                }
            },
            tagname : "",
        },
        created : function() {
            //---if normaly indicate "active" class in html, it is shiftted why digit position
            //   the workarround for this.
            //Q(".tab.col a").classList.add("active");
            this.tlcond = new GTimelineCondition();
            this.tlcond.type = "taglocal";
            this.tl_tabtype = this.tlcond.type;
        },
        mounted() {
        },
        watch : {
            
        },
        methods : {
            funcTabtype : function (val,optionID) {
                //---common
                this.clearPending();
                this.clearTimeline();
                this.changeTabType(val);
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;

                if (val == "tag") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    this.loadTimeline(`tag/${this.tagname}`,this.currentOption);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.tag.setQuery("tag="+this.tagname);
                    notifAccount.account.streams.tag.start();
                    notifAccount.account.streams.taglocal.stop();
                }else if (val == "taglocal") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    this.currentOption.api["local"] = true;
                    this.loadTimeline(`tag/${this.tagname}`,this.currentOption);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.taglocal.setQuery("tag="+this.tagname);
                    notifAccount.account.streams.taglocal.start();
                    notifAccount.account.streams.tag.stop();
                }
            },
            changeTabType : function (tab) {
                if (this.tlcond) {
                    this.backup[this.tl_tabtype].tlcond = _.cloneDeep(this.tlcond);
                    this.backup[this.tl_tabtype].currentOption = _.cloneDeep(this.currentOption);
                    this.backup[this.tl_tabtype].pagetype = this.pagetype;
                    this.backup[this.tl_tabtype].info = _.cloneDeep(this.info);
                    this.backup[this.tl_tabtype].pending = _.cloneDeep(this.pending);
                }
                let bktab = this.tl_tabtype;

                this.tl_tabtype = tab;
                if (tab == "list") {
                    this.tlcond.type = "list";
                }else{
                    this.tlcond.type = "normal";
                }
                if (this.backup[tab]) {
                    this.tlcond = new GTimelineCondition();
                    this.currentOption = new TLoption();
                    this.pagetype = this.backup[tab].pagetype;
                    this.info = {
                        maxid : "",
                        sinceid : "",
                        is_nomax : false,
                        is_nosince : false, 
                    };
                    this.pending = new TLpending();
                }

            },
            loadTimeline : loadTimelineCommon,
            onsaveclose : function (e) {
                var param = e;
                if (e.status) {
                    this.forWatch_allcondition(param);
                    if (this.tl_tabtype == "list") {
                        this.currentOption.app["listid"] = param.listtype;
                    }
                    this.loadTimeline(`tag/${this.tagname}`,this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    if (param.func == "clear") {
                        notifAccount.account.streams[this.tl_tabtype].start();
                    }
                }
            },
            ondatesaveclose : function (e) {
                var param = e;
                if (e.status) {
                    this.forWatch_allcondition(param);
                    //opt.app["listid"] = param.listtype;
                    this.loadTimeline(`tag/${this.tagname}`,this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    if (param.func == "exec") {
                        notifAccount.account.streams[this.tl_tabtype].stop();
                    }else{
                        notifAccount.account.streams[this.tl_tabtype].start();
                    }
                }
            }

        }
    });

    if (false) {
        vue_timeline = {
            "tabbar" : new Vue({
                el : "#tabbar",
                delimiters : ["{?","?}"],
                mixins : [vue_mixin_base,vue_mixin_for_account],
                data : {
                    currentTab : "",
                    hashtag : "",
                },
                methods : {
                    
                }
            }),
            "tag" : new Vue({
                el : "#tl_tag",
                delimiters : ["{?","?}"],
                mixins : [vue_mixin_base,vue_mixin_for_timeline],
                data : {
                    domgrid : {},
                    sel_tlshare : tlshare_options,
                    sel_tltype : tltype_options,
                    tagname : "",
                    tlcond : null,
                },
                created : function() {
                    //---if normaly indicate "active" class in html, it is shiftted why digit position
                    //   the workarround for this.
                    Q(".tab.col a").classList.add("active");
                    this.tlcond = new GTimelineCondition();
                },
                mounted() {
                },
                watch : {
                    selshare_current : _.debounce(function(val) {
                        this.statuses.splice(0,this.statuses.length);

                        this.loadTimeline(`tag/${this.tagname}`,this.forWatch_selshare(val));
                    },400),
                    seltype_current : _.debounce(function(val) {
                        this.statuses.splice(0,this.statuses.length);
                        this.loadTimeline(`tag/${this.tagname}`,this.forWatch_seltype(val));
                    },400)
                },
                methods : {
                    loadTimeline : loadTimelineCommon,
                    onsaveclose : function (e) {
                        var param = e;
                        if (e.status) {
                            var opt = this.forWatch_allcondition(param);
                            this.loadTimeline(`tag/${this.tagname}`,opt);
                            var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                            if (param.func == "clear") {
                                notifAccount.account.streams.tag.start();
                            }
                        }
                    },
                    ondatesaveclose : function (e) {
                        var param = e;
                        if (e.status) {
                            var opt = this.forWatch_allcondition(param);
                            this.loadTimeline(`tag/${this.tagname}`,opt);
                            var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                            if (param.func == "exec") {
                                notifAccount.account.streams.tag.stop();
                            }else{
                                notifAccount.account.streams.tag.start();
                            }
                        }
                    }
                }
            }),
            "taglocal" : new Vue({
                el : "#tl_taglocal",
                delimiters : ["{?","?}"],
                mixins : [vue_mixin_base,vue_mixin_for_timeline],
                data : {
                    domgrid : {},
                    sel_tlshare : tlshare_options,
                    sel_tltype : tltype_options,
                    tagname : "",
                    tlcond : null,

                },
                created : function() {
                    //---if normaly indicate "active" class in html, it is shiftted why digit position
                    //   the workarround for this.
                    Q(".tab.col a").classList.add("active");
                    this.tlcond = new GTimelineCondition();
                },
                mounted() {
                },
                watch : {
                    selshare_current : _.debounce(function(val) {
                        this.statuses.splice(0,this.statuses.length);

                        this.loadTimeline(`tag/${this.tagname}`,this.forWatch_selshare(val));
                    },400),
                    seltype_current : _.debounce(function(val) {
                        this.statuses.splice(0,this.statuses.length);
                        this.loadTimeline(`tag/${this.tagname}`,this.forWatch_seltype(val));
                    },400)
                },
                methods : {
                    loadTimeline : loadTimelineCommon,
                    onsaveclose : function (e) {
                        var param = e;
                        if (e.status) {
                            var opt = this.forWatch_allcondition(param);
                            this.loadTimeline(`tag/${this.tagname}`,opt);
                            var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                            if (param.func == "clear") {
                                notifAccount.account.streams.taglocal.start();
                            }
                        }
                    },
                    ondatesaveclose : function (e) {
                        var param = e;
                        if (e.status) {
                            var opt = this.forWatch_allcondition(param);
                            this.loadTimeline(`tag/${this.tagname}`,opt);
                            var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                            if (param.func == "exec") {
                                notifAccount.account.streams.taglocal.stop();
                            }else{
                                notifAccount.account.streams.taglocal.start();
                            }
                        }
                    }
                }
            }),
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
                //---common
                vue_timeline.tag.clearPending();
                vue_timeline.taglocal.clearPending();

                //---each
                if (e.id == "tl_tag") {
                    var et = ID("area_timeline");
                    var sa = et.scrollHeight - et.clientHeight;
                    var fnlsa = sa - Math.round(et.scrollTop);
                    //vue_timeline.tag.info.tltype = vue_timeline.tag.seltype_current;
                    vue_timeline.tag.statuses.splice(0,vue_timeline.tag.statuses.length);
                    var opt = vue_timeline.tag.forWatch_allcondition(vue_timeline.tag.tlcond.getReturn());
                    vue_timeline.tag.loadTimeline(`tag/${vue_timeline.tag.tagname}`,opt);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.tag.setQuery("tag="+vue_timeline.tag.tagname);
                    notifAccount.account.streams.tag.start();
                    notifAccount.account.streams.taglocal.stop();
                }else if (e.id == "tl_taglocal") {
                    var et = ID("area_timeline");
                    var sa = et.scrollHeight - et.clientHeight;
                    var fnlsa = sa - Math.round(et.scrollTop);
                    //vue_timeline.taglocal.info.tltype = vue_timeline.taglocal.seltype_current;
                    vue_timeline.taglocal.statuses.splice(0,vue_timeline.taglocal.statuses.length);
                    var opt = vue_timeline.taglocal.forWatch_allcondition(vue_timeline.taglocal.tlcond.getReturn());
                    vue_timeline.taglocal.loadTimeline(`tag/${vue_timeline.taglocal.tagname}`,opt);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.taglocal.setQuery("tag="+vue_timeline.taglocal.tagname);
                    notifAccount.account.streams.taglocal.start();
                    notifAccount.account.streams.tag.stop();
                }
            }
        });
    }
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

        
        var tltype = ID("hid_timelinetype").value;
        if (tltype == "") {
            tltype = "tags";
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
    
        ///vue_timeline.tag.translations = curLocale.messages;
        ///vue_timeline.taglocal.translations = curLocale.messages;
        ///vue_timeline.tabbar.hashtag = tltypeid;
        ///vue_timeline.tag.tagname = tltypeid;
        ///vue_timeline.taglocal.tagname = tltypeid;

        vue_tltab.translations = curLocale.messages;
        vue_timeline.translations = curLocale.messages;
        vue_tltab.hashtag = tltypeid;
        vue_timeline.tagname = tltypeid;

        ///for (var obj in vue_timeline) {
        ///    if ("timeline_gridstyle" in vue_timeline[obj]) {
        ///        vue_timeline[obj].changeTimelineStyle();            
        ///    }
        ///}
        vue_timeline.changeTimelineStyle(); 

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);


        barancerTimelineType("taglocal",tltypeid);



    }, function (flag) {
        appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
