var MYAPP;
var vue_archmain;
var vue_tltab;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {

}

function loadTimelineCommon(type,options){

}


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_timeline").classList.add("active");
    //ID("sm_timeline").classList.add("active");
    MYAPP.showPostCtrl(false);
    MYAPP.showBottomCtrl(false);

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

    
    vue_archmain = new Vue({
        el : "#area_archmain",
        delimiters : ["{?","?}"],
        mixins : [vue_mixin_base,vue_mixin_for_timeline],
        data () { return {
            
            tlcond : null,
            onboarding : 0,
            options : {
                service : {
                    "g" : "Google+",
                    "t" : "Twitter",
                    "m" : "Mastodon"
                }
            },
            importlog : "",
            datalist : [],
            currentdataIndex : -1,
            currentFilter : {},
            cssclass : {
                localrefer : {
                    beforedrag_indicate : true,               
                    dragover_indicate : false,
                }
            },
            backup : {
                "statuses" : {
                    tlcond : null,
                    currentOption : null,
                    pagetype : "",
                    info : {},
                    pending : {}
                }
            }
        };},
        created : function() {
            //---if normaly indicate "active" class in html, it is shiftted why digit position
            //   the workarround for this.
            //Q(".tab.col a").classList.add("active");
            this.tlcond = new GTimelineCondition();
            this.tlcond.type = "statuses";
            this.tl_tabtype = this.tlcond.type;
            this.is_archivemode = true;
        },
        beforeMount() {
            this.gallery_options.initials.is = true;
            this.gallery_options.initials.value = 1;
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
                if (this.is_archivemode) return;
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;

                if (val == "statuses") {
                    this.forWatch_allcondition(this.tlcond.getReturn());
                    this.loadTimeline(`tag/${this.tagname}`,this.currentOption);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.tag.setQuery("tag="+this.tagname);
                    notifAccount.account.streams.tag.start();
                    notifAccount.account.streams.taglocal.stop();
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

            //---management panel
            writeLog : function (text) {
                this.$nextTick(()=>{
                    this.importlog += `${text}\n`;
                });
                
            },
            appendDatalist : function (service,data,original) {
                var lst = [];
                for (var i = 0; i < data.length; i++) {
                    lst.push(data[i]);
                }
                var ost = [];
                for (var i = 0; i < original.length; i++) {
                    ost.push(original[i]);
                }
                this.datalist.push({
                    "is_gpdon" : "1",
                    "service" : service,
                    "data" : lst,
                    "original" : ost,
                });
            },
            showServiceName : function (item) {
                return this.options.service[item.service];
            },
            showSenderName : function (item) {
                if (item.data.length > 0) {
                    return _T("tt_share_name",[item.data[0].account.display_name]);
                }else{
                    return "";
                }
            },
            showData_dateperiod : function (item) {
                if (item.data.length > 0) {
                    var st = item.data[0].body.created_at;
                    var ed = item.data[item.data.length-1].body.created_at;
                    return `${st.toLocaleString()} - ${ed.toLocaleString()}`;
                }else{
                    return "";
                }
            },
            apply_filter : function (filter) {
                //this.clearTimeline();
                this.currentFilter = filter;
                MUtility.loadingON();
                this.$nextTick(()=>{
                    var curdata = this.datalist[this.currentdataIndex];
                    var farr = filter.current.yymm.split(",");
                    var fily = parseInt(farr[0]);
                    var film = parseInt(farr[1]);
                    var putTL = (post,index,currentCount) =>  {
                        if (currentCount < MYAPP.session.config.application.timeline_viewcount) {
                            var ishit = this.statuses.find(e=>{
                                if (e.id == post.id) return true;
                            });
                            if (!ishit) {
                                this.statuses.push(post);
                                this.currentOption["api"]["max_id"] = index;
                            }
                        }
                    }
                    var startIndex = 0;
                    if (this.currentOption.api.max_id) {
                        startIndex = this.currentOption.api.max_id+1;
                        if (startIndex >= curdata.data.length) startIndex = curdata.length-1;
                    }
                    var curcnt = 0;
                    for (var i = startIndex; i < curdata.data.length; i++) {
                        var gobjs = curdata.data[i];
                        //for (var g = 0; g < gobjs.length; g++) {
                            var y = gobjs.body.created_at.getFullYear();
                            var m = gobjs.body.created_at.getMonth()+1;
                            if ((fily == 0) || (film == 0)) {
                                //---year or month is 0, show all.
                                //this.statuses.push(gobjs);
                                putTL(gobjs,i,curcnt);
                                curcnt++;
                            }else{
                                //---specify year and month, show specify
                                var test_ym = (fily == y) && (film == m);
                                var test_share = false;
                                if (filter.current.share_only == "al") {
                                    test_share = true;
                                }else if (filter.current.share_only == "pu") {
                                    test_share = (gobjs.body.visibility == "public");
                                }else if (filter.current.share_only == "pr") {
                                    test_share = (gobjs.body.visibility == "private");
                                }else if (filter.current.share_only == "cl") {
                                    test_share = (gobjs.body.visibility_str.indexOf("collection") > -1);
                                }else if (filter.current.share_only == "cm") {
                                    test_share = (gobjs.body.visibility_str.indexOf("community") > -1);
                                }
                                if (
                                    (test_ym) &&
                                    (test_share)
                                ){
                                    //this.statuses.push(gobjs);
                                    putTL(gobjs,i,curcnt);
                                    curcnt++;
                                }
                            }
                        //}
                    }
                    jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
                    $("time.timeago").timeago();
                    MUtility.loadingOFF();
                });
            },
            onclick_startview : function(item,index) {
                this.clearTimeline();
                /*for (var i = 0; i < item.data.length; i++) {
                    this.statuses.push(item.data[i]);
                }*/
                
                this.currentdataIndex = index;
                var firstfilter = null;
                firstfilter = MYAPP.commonvue.cur_sel_account.reload_filterdata(item);
                firstfilter = MYAPP.commonvue.sidebar.reload_filterdata(item);
                this.apply_filter(firstfilter);
                this.onboarding = 1;
            },
            onclick_downloadview : function (item,index) {

                var file = new File([JSON.stringify(item.original)], "gpdon_archive.json", {type: "text/plain;charset=utf-8"});
                saveAs(file);
            },
            onclick_backtimeline : function (e) {
                this.onboarding = 0;
            },

            
            //---timeline panel
            onsaveclose : function (e) {
                var param = e;
                if (e.status) {
                    this.forWatch_allcondition(param);
                    if (this.is_archivemode) return;
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
                    if (this.is_archivemode) return;
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

    MYAPP.setGeneralTitle(_T("lab_archive_title"));
    vue_archmain.translations = curLocale.messages;
    if ("navibar" in MYAPP.commonvue) MYAPP.commonvue.navibar.applogined = true;
    if ("nav_btnbar" in MYAPP.commonvue) MYAPP.commonvue.nav_btnbar.applogined = true;
    if ("navigation" in MYAPP.commonvue) MYAPP.commonvue.navigation.applogined = true;

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

        vue_archmain.tagname = tltypeid;

        ///for (var obj in vue_timeline) {
        ///    if ("timeline_gridstyle" in vue_timeline[obj]) {
        ///        vue_timeline[obj].changeTimelineStyle();            
        ///    }
        ///}
        //vue_timeline.changeTimelineStyle(); 

        //---account load
        MYAPP.afterLoadAccounts([]);
        //MYAPP.selectAccount(ac);


        //barancerTimelineType("taglocal",tltypeid);



    }, function (flag) {
        /*appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });*/
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
