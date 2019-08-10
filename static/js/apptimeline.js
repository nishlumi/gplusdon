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
    //vue_timeline.statuses.splice(0,vue_timeline.statuses.length);
    vue_timeline.clearTimeline();

    vue_tltab.turnButtonStatus(type);
    
    if (type == "list") {
        vue_timeline.tlcond.listtype = id;
        var opt = vue_timeline.forWatch_allcondition(vue_timeline.tlcond.getReturn());
        opt.app.listid = id;
        vue_timeline.loadTimeline(type,opt);
        MYAPP.commonvue.navigation.switchListSelect(true);
    }else{
        MYAPP.commonvue.navigation.switchListSelect(false);
        /* ===alternative remove
        vue_timeline.loadTimeline(type,{
            api : {},
            app : vue_timeline.currentOption.app
        });*/
        vue_timeline.prepare_backgroundtimeline("init",type,{
            api : {},
            app : vue_timeline.currentOption.app
        });
    }
    return;

    if (type == "home") {
        //vue_timeline.home.info.tltype = vue_timeline.home.seltype_current;
        vue_timeline.home.clearPending();
        vue_timeline.home.statuses.splice(0,vue_timeline.home.statuses.length);
        vue_timeline.home.loadTimeline(type,{
            api : {},
            app : vue_timeline.home.currentOption.app
        });
    }else if (type == "list") {
        vue_timeline.list.clearPending();
        vue_timeline.list.tlcond.listtype = id;
        vue_timeline.list.statuses.splice(0,vue_timeline.list.statuses.length);
        var opt = vue_timeline.list.forWatch_allcondition(vue_timeline.list.tlcond.getReturn());
        opt.app.listid = id;
        vue_timeline.list.loadTimeline(type,opt);
        /*vue_timeline.list.loadTimeline(type,{
            api : {},
            app : {
                listid : id,
                tlshare : vue_timeline.list.tlcond.tlshare,
                tltype : vue_timeline.list.tlcond.tltype,
                exclude_reply : true,
            }
        });*/
    }else if (type == "local") {
        vue_timeline.local.clearPending();
        //vue_timeline.local.info.tltype = vue_timeline.local.seltype_current;
        vue_timeline.local.statuses.splice(0,vue_timeline.local.statuses.length);
        vue_timeline.local.loadTimeline(type,{
            api : {local:true},
            app : vue_timeline.local.currentOption.app
        });
    }else if (type == "public") {
        vue_timeline.public.clearPending();
        //vue_timeline.public.info.tltype = vue_timeline.public.seltype_current;
        vue_timeline.public.statuses.splice(0,vue_timeline.public.statuses.length);
        vue_timeline.public.loadTimeline(type,{
            api : {},
            app : vue_timeline.public.currentOption.app
        });
    }
}

function loadTimelineCommon(type,options){
    console.log("loadTimelineCommon",type,options);
    if (this.is_asyncing) return Promise.reject(false);

    MUtility.loadingON();
    this.is_asyncing = true;
    var fnltype = type;
    if (type == "list") {
        fnltype = `list/${options.app.listid}`;
    }
    return MYAPP.sns.getTimeline(fnltype,options)
    .then((data)=>{
        console.log("getMyToots",data);
        /*if (data.length == 0) {
            MUtility.loadingOFF();
            return;
        }*/
        this.generate_toot_detail(data,options);
        MUtility.loadingOFF();
        this.is_asyncing = false;
        return data;
    })
    .catch(error=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        alertify.error("読み込みに失敗しました。");
        console.log("loadTimelineCommonにて不明なエラーです。",error);
        return error;
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
            tl_tabtype : "home",
            css : {
                tabs : {
                    "home" : new tabbtn_style(),
                    "list" : new tabbtn_style(),
                    "local" : new tabbtn_style(),
                    "public" : new tabbtn_style(),
                }
            },
            sel_listitem : "",
            list_items : [],
        },
        watch : {
            /*tl_tabtype : function (val) {
                vue_timeline.setTLListItem(this.sel_listitem);
                vue_timeline.funcTabtype(val,"");
            },*/
            sel_listitem : function (val) {
                vue_timeline.funcTabtype("list",this.sel_listitem);
            }
        },
        computed: {
            isNotListTab : function () {
                if (this.tl_tabtype == "list") {
                    return false;
                }else{
                    return true;
                }
            }
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
                vue_timeline.funcTabtype(e,MYAPP.commonvue.navigation.sel_listitem);

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
                "home" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                },
                "list" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                },
                "local" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                },
                "public" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                },
            }

        },
        created : function() {
            //---if normaly indicate "active" class in html, it is shiftted why digit position
            //   the workarround for this.
            //Q(".tab.col a").classList.add("active");
            this.tlcond = new GTimelineCondition();
            this.tlcond.type = "home";
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

                if (val == "home") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    //this.loadTimeline("home",this.currentOption);
                    this.prepare_backgroundtimeline("init","home",this.currentOption);
                    notifAccount.account.streams.list.stop();
                    notifAccount.account.streams.local.stop();
                    notifAccount.account.streams.public.stop();
                    notifAccount.account.stream.setTargetTimeline(vue_timeline);
                }else if (val == "list") {
                    if (MYAPP.commonvue.navigation.sel_listitem != "0") {
                        this.forWatch_allcondition(this.tlcond.getReturn());
                        this.currentOption.app["listid"] = optionID;
                        //this.loadTimeline("list",this.currentOption);
                        this.prepare_backgroundtimeline("init","list",this.currentOption);
                        notifAccount.account.streams.list.setQuery("list="+this.currentOption.app.listid);
                        notifAccount.account.streams.list.setTargetTimeline(vue_timeline);
                        notifAccount.account.streams.list.start();
                    }
                    notifAccount.account.streams.local.stop();
                    notifAccount.account.streams.public.stop();
                }else if (val == "local") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    this.currentOption.api["local"] = true;
                    //this.loadTimeline("local",this.currentOption);
                    this.prepare_backgroundtimeline("init","local",this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.list.stop();
                    notifAccount.account.streams.local.setTargetTimeline(vue_timeline);
                    notifAccount.account.streams.local.start();
                    notifAccount.account.streams.public.stop();
                }else if (val == "public") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    this.currentOption.api["local"] = false;
                    //this.loadTimeline("public",this.currentOption);
                    this.prepare_backgroundtimeline("init","public",this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.list.stop();
                    notifAccount.account.streams.local.stop();
                    notifAccount.account.streams.public.setTargetTimeline(vue_timeline);
                    notifAccount.account.streams.public.start();
                }
            },
            changeTabType : function (tab) {
                this.backup[this.tl_tabtype].tlcond = _.cloneDeep(this.tlcond);
                this.backup[this.tl_tabtype].currentOption = _.cloneDeep(this.currentOption);
                this.backup[this.tl_tabtype].pagetype = this.pagetype;
                this.backup[this.tl_tabtype].info = _.cloneDeep(this.info);
                this.backup[this.tl_tabtype].pending = _.cloneDeep(this.pending);

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
            loadListNames : function(){
                var opt = {api:{},app:{}};
                MYAPP.sns.getLists(opt)
                .then(result=>{
                    this.tlcond.lists.splice(0,this.tlcond.lists.length);
                    this.tlcond.lists.push({
                        text : "--",
                        value : "0",
                        selected : true
                    });
                    vue_tltab.list_items.push({
                        text : "--",
                        value : "0",
                        selected : true
                    });
                    for (var i = 0; i < result.data.length; i++) {
                        this.tlcond.lists.push({
                            text : result.data[i].title,
                            value : result.data[i].id,
                            selected : false
                        });
                        vue_tltab.list_items.push({
                            text : result.data[i].title,
                            value : result.data[i].id,
                            selected : false
                        });
                    }
                    //this.sellisttype_current = this.sel_listtype[0].value;
                    this.tlcond.listtype = this.tlcond.lists[0].value;
                    this.$nextTick( () => {
                        //this.tlcond.listtype = this.tlcond.lists[0].value;
                        M.FormSelect.init(Qs("select"), {
                            dropdownOptions : {
                                constrainWidth : false
                            }
                        });

                    });
                });
            },
            onsaveclose : function (e) {
                var param = e;
                if (e.status) {
                    this.forWatch_allcondition(param);
                    if (this.tl_tabtype == "list") {
                        this.currentOption.app["listid"] = param.listtype;
                    }
                    delete this.currentOption.api["since_id"];
                    delete this.currentOption.api["min_id"];
                    delete this.currentOption.api["max_id"];
                    this.currentOption.app["is_nosince"] = false;
                    this.currentOption.app["is_nomax"] = false;
                    //this.loadTimeline(this.tl_tabtype,this.currentOption);
                    this.clearTimeline();
                    this.prepare_backgroundtimeline("init",this.tl_tabtype,this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    if (param.func == "clear") {
                        if (this.tl_tabtype == "home") {
                            notifAccount.account.stream.start();
                        }else{
                            notifAccount.account.streams[this.tl_tabtype].start();
                        }
                    }
                }
            },
            ondatesaveclose : function (e) {
                var param = e;
                if (e.status) {
                    this.forWatch_allcondition(param);
                    //opt.app["listid"] = param.listtype;
                    //this.loadTimeline(this.tl_tabtype,this.currentOption);
                    this.clearTimeline();
                    this.prepare_backgroundtimeline("init",this.tl_tabtype,this.currentOption);
                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    if (param.func == "exec") {
                        if (this.tl_tabtype == "home") {
                            notifAccount.account.stream.stop();
                        }else{
                            notifAccount.account.streams[this.tl_tabtype].stop();
                        }
                    }else{
                        if (this.tl_tabtype == "home") {
                            notifAccount.account.stream.start();
                        }else{
                            notifAccount.account.streams[this.tl_tabtype].start();
                        }
                    }
                }
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
        
        
        var tltype = ID("hid_timelinetype").value;
        if (tltype == "") {
            tltype = "user";  //---user is "home".
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
    
        ///vue_timeline.home.translations = Object.assign({},curLocale.messages);
        ///vue_timeline.list.translations = Object.assign({},curLocale.messages);
        ///vue_timeline.local.translations = Object.assign({},curLocale.messages);
        ///vue_timeline.public.translations = Object.assign({},curLocale.messages);
        //vue_timeline.translations = Object.assign({},curLocale.messages);
        //vue_tltab.translations = Object.assign({},curLocale.messages);
        for (var obj in curLocale.messages) {
            Object.defineProperty(vue_timeline.translations,obj,{
                configurable : false,
                value : curLocale.messages[obj]
            });
            Object.defineProperty(vue_tltab.translations,obj,{
                configurable : false,
                value : curLocale.messages
            });
        }



        ///for (var obj in vue_timeline) {
        ///    vue_timeline[obj].changeTimelineStyle();
        ///}
        vue_timeline.changeTimelineStyle();

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);


        barancerTimelineType(tltype,tltypeid);

        ///vue_timeline.list.loadListNames();
        MYAPP.commonvue.navigation.loadListNames();

        MYAPP.commonvue.bottomnav.activeBtn = 1;

    }, function (flag) {
        appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    //location.hash = "";
    
})();
