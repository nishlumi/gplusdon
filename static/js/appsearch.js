var MYAPP;
var vue_search;
var thisform = {
    select : ""
};

function barancerTimelineType(type,id) {
    if (type == "home") {
        vue_search.home.info.tltype = vue_search.home.seltype_current;
        vue_search.home.statuses.splice(0,vue_search.home.statuses.length);
        vue_search.home.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_search.home.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "list") {
        vue_search.list.info.tltype = id;
        vue_search.list.statuses.splice(0,vue_search.list.statuses.length);
        vue_search.list.loadTimeline(type,{
            api : {},
            app : {
                listid : vue_search.list.sellisttype_current,
                tlshare : vue_search.list.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "local") {
        vue_search.local.info.tltype = vue_search.local.seltype_current;
        vue_search.local.statuses.splice(0,vue_search.local.statuses.length);
        vue_search.local.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_search.local.selshare_current,
                exclude_reply : true,
            }
        });
    }else if (type == "public") {
        vue_search.public.info.tltype = vue_search.public.seltype_current;
        vue_search.public.statuses.splice(0,vue_search.public.statuses.length);
        vue_search.public.loadTimeline(type,{
            api : {},
            app : {
                tlshare : vue_search.public.selshare_current,
                exclude_reply : true,
            }
        });
    }
}

function loadTimeline(data,options){
    console.log("loadTimelineCommon",data,options);
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;

    this.generate_toot_detail({
        data : data,
        paging : {
            next : "",
            prev : ""
        }
    },options);
    

    MUtility.loadingOFF();
    this.is_asyncing = false;

}
function load_accounts(accounts,options) {
    console.log("getUserSearch");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    var users = [];
    for (var i = 0; i < accounts.length; i++) {
        users.push(accounts[i].id);
    }
    MYAPP.sns.getRelationship(users)
    .then(result=>{
        for (var d = 0; d < accounts.length; d++) {
            var datum = accounts[d];
            for (var i = 0; i < result.data.length; i++) {
                if (datum.id == result.data[i].id) {
                    datum["relationship"] = result.data[i];
                    datum["lists"] = [];
                    break;
                }
            }
        }
        this.generate_account_detail({
            data : accounts,
            paging : {
                next : "",
                prev : ""
            }
        },options);
    })
    .catch((xhr,status)=>{
        MUtility.loadingOFF();
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

    vue_search = {
        "accounts" : new Vue({
            el : "#s_user",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "normal",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {},
                }
            },
            methods: {
                load_accounts : load_accounts,
                onscroll_tab : function(e){
                    var sa = e.target.scrollHeight - e.target.clientHeight;
                    var fnlsa = sa - Math.round(e.target.scrollTop);
                    if (fnlsa < 10) {
                        //---page max scroll down
                        console.log("scroll down max");
                        this.load_accounts({
                            api : {
                                max_id : this.info.maxid,
                                //since_id : this.info.sinceid,
                            },
                            app : {
                                is_nomax : false,
                                is_nosince : true,
            
                            }
                        });
                    }
                    MYAPP.commonvue.bottomnav.checkScroll(fnlsa);
                },
                oncheck_selectable : function(e) {
                    console.log(e);
                    if (e.checked) {
                        var ishit = this.selectedAccount.filter(elem=>{
                            if (e.userid == elem.userid) {
                                return true;
                            }
                        });
                        if (ishit.length == 0) {
                            this.selectedAccount.push(e);
                        }
                    }else{
                        for (var i = this.selectedAccount.length-1; i >= 0; i--) {
                            if (e.userid == this.selectedAccount[i].userid) {
                                this.selectedAccount.splice(i,1);
                            }
                        };
                    }

                    if (this.selectedAccount.length > 0) {
                        this.sheet = true;
                    }else{
                        this.sheet = false;
                    }
                },
            }
        }),
        "hashtags" : new Vue({
            el : "#s_hashtags",
            delimiters : ["{?","?}"],
            mixins : [],
            data : {
                tags : [],
                translations : {},
                globalInfo : {},

            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                Q(".tab.col a").classList.add("active");
            },
            mounted() {

            },
            watch : {
                
            },
            methods : {
                onclick_tagitem : function(name) {
                    location.href = `/tl/tags/${name}`;
                }
            }
        }),
        "tootes" : new Vue({
            el : "#s_toot",
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
                    ID("hid_timelinetypeid").value = val;
                    var opt = this.forWatch_selshare(this.selshare_current);
                    opt.app["listid"] = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.loadTimeline("list",opt);

                    var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                    notifAccount.account.streams.list.stop();
                    notifAccount.account.streams.list.setQuery(val);
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
                loadTimeline : loadTimeline,
                loadListNames : function(){
                    var opt = {api:{},app:{}};
                    MYAPP.sns.getLists(opt)
                    .then(result=>{
                        this.sel_listtype.splice(0,this.sel_listtype.length);
                        for (var i = 0; i < result.data.length; i++) {
                            this.sel_listtype.push({
                                text : result.data[i].title,
                                value : result.data[i].id,
                                selected : (i == 0 ? true : false)
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
    };

    //MYAPP.setupCommonTranslate();
    //vue_user.tabbar.setTranslation();

    M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_search").scroll({top:0});
            if (e.id == "s_user") {
                var et = ID("area_search");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);


            }else if (e.id == "s_hashtags") {


                
            }else if (e.id == "s_toot") {

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

        
        var findtext = ID("hid_findtext").value;
        MYAPP.commonvue.nav_search.findtext = findtext;

        MYAPP.checkSession();
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];

        MYAPP.session.status.currentLocation = `/s/${findtext}`; //location.pathname;
    
        vue_search.accounts.translations = Object.assign({},curLocale.messages);
        vue_search.hashtags.translations = Object.assign({},curLocale.messages);
        vue_search.tootes.translations = Object.assign({},curLocale.messages);

        for (var obj in vue_search) {
            if ("timeline_gridstyle" in vue_search[obj]) {
                vue_search[obj].changeTimelineStyle();
            }
        }

        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);


    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
