var MYAPP;
var vue_timeline;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {
    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
    if (type == "taglocal") {
        vue_timeline.taglocal.info.tltype = vue_timeline.taglocal.seltype_current;
        vue_timeline.taglocal.statuses.splice(0,vue_timeline.taglocal.statuses.length);
        vue_timeline.taglocal.loadTimeline(`tag/${id}`,{
            api : {
                local : true
            },
            app : {
                tlshare : vue_timeline.tag.selshare_current,
                exclude_reply : true,
            }
        });
        notifAccount.account.streams.taglocal.setQuery("tag="+vue_timeline.taglocal.tagname);
        notifAccount.account.streams.taglocal.start();

    }else if (type == "tag") {
        vue_timeline.tag.info.tltype = vue_timeline.tag.seltype_current;
        vue_timeline.tag.statuses.splice(0,vue_timeline.tag.statuses.length);
        vue_timeline.tag.loadTimeline(`tag/${id}`,{
            api : {},
            app : {
                tlshare : vue_timeline.tag.selshare_current,
                exclude_reply : true,
            }
        });
        notifAccount.account.streams.tag.setQuery("tag="+vue_timeline.tag.tagname);
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

    vue_timeline = {
        "tabbar" : new Vue({
            el : "#tabbar",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
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
            mixins : [vue_mixin_for_timeline],
            data : {
                domgrid : {},
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
                tagname : "",
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
                    this.statuses.splice(0,this.statuses.length);

                    this.loadTimeline(`tag/${this.tagname}`,this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline(`tag/${this.tagname}`,this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon
                //filterToot : checkFilteringToot,
                //getParentToot : getParentToot
            }
        }),
        "taglocal" : new Vue({
            el : "#tl_taglocal",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                domgrid : {},
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,
                tagname : "",
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
                    this.statuses.splice(0,this.statuses.length);

                    this.loadTimeline(`tag/${this.tagname}`,this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline(`tag/${this.tagname}`,this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon
                //filterToot : checkFilteringToot,
                //getParentToot : getParentToot
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
            if (e.id == "tl_tag") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_timeline.tag.info.tltype = vue_timeline.tag.seltype_current;
                    vue_timeline.tag.statuses.splice(0,vue_timeline.tag.statuses.length);
                    vue_timeline.tag.loadTimeline(`tag/${vue_timeline.tag.tagname}`,{
                        api : {
                            exclude_replies : true,
                        },
                        app : {
                            tlshare : vue_timeline.tag.selshare_current,
                            tltype : vue_timeline.tag.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.taglocal.setQuery("tag="+vue_timeline.tag.tagname);
                notifAccount.account.streams.tag.start();
                notifAccount.account.streams.taglocal.stop();
            }else if (e.id == "tl_taglocal") {
                var et = ID("area_timeline");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    vue_timeline.taglocal.info.tltype = vue_timeline.taglocal.seltype_current;
                    vue_timeline.taglocal.statuses.splice(0,vue_timeline.taglocal.statuses.length);
                    vue_timeline.taglocal.loadTimeline(`tag/${vue_timeline.taglocal.tagname}`,{
                        api : {
                            exclude_replies : true,
                            local : true,
                        },
                        app : {
                            tlshare : vue_timeline.taglocal.selshare_current,
                            tltype : vue_timeline.taglocal.seltype_current,
                            exclude_reply : true,
                        }
                    });
                //}
                var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                notifAccount.account.streams.taglocal.setQuery("tag="+vue_timeline.taglocal.tagname);
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
    
        vue_timeline.tag.translations = Object.assign({},curLocale.messages);
        vue_timeline.taglocal.translations = Object.assign({},curLocale.messages);
        vue_timeline.tabbar.hashtag = tltypeid;
        vue_timeline.tag.tagname = tltypeid;
        vue_timeline.taglocal.tagname = tltypeid;

        for (var obj in vue_timeline) {
            if ("timeline_gridstyle" in vue_timeline[obj]) {
                vue_timeline[obj].changeTimelineStyle();            
            }
        }

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);

        barancerTimelineType("taglocal",tltypeid);

    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
