var MYAPP;
var vue_dashboard;
var thisform = {
    select : ""
};

class GItem {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
        this.i = 0;
        this.draggable = true;
        this.resizable = true;
        this.drag = {
            allow : ".vue-draggable-handle",
            ignore : ".no-drag"
        };
        this.type = "text";
        this.size = {width : 0, height : 0};
        this.userstyle = {color : "black"};
        this.body = "";

        this.src = "";

        this.label = "";
        this.icon = "";

        this.timeline = {
            statuses : [],
            timeline_gridstyle : {
				width_count : true,
				width_1 : false,
				width_2 : false,
				width_3 : false,
			}
        };
        this.toot = {
            status : null,
            popuping : "",
            comment_viewstyle : {
                close : false,
                mini : false,
                open : false,
                full : true
            },
            comment_list_area_viewstyle : {
				default : false
            },
            content_body_style : {
                "sizing-fullmax" : true
            },
            datastyle : {
                "comment-list" : {
					sizing : true
				},
				"toot_avatar_imgsize" : "32px"
            }
        };
        this.user = {
            selected : {},   //---Mastodon's Account
            relationship : {}
        };
        this.datalist = [];
        this.input = {
            
            eid : "dvgad",
            tootIB : {
                visibility : "",
                first_scope : "public",
                popuping : "",
                btns : {
                    close : true,
                    open_in_new : true,
                    help : true,
                    open_in_browser : false,
                    addimage : true,
                    addgeo : true,
                    emoji : true,
                    send : true
                }
            },
            //---account box data
            selaccounts : [],
            accounts : [],
            tags : [],
        };
    }
}

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

    vue_dashboard = {
        "main" : new Vue({
            el : "#area_dashboard",
            delimiters : ["{?","?}"],
            data : {
                translations : {},
                globalInfo : {},
    
                grid : null,
                gadgets : [],
                grid_config : {
                    draggable : true,
                    resizable : true,
                    responsive : true
                }
            },
            created : function() {
            },
            mounted() {
                var a = new GItem();
                a.i = "0";
                a.w = 2;
                a.h = 2;
                a.x = 0;
                a.y = 0;
                a.type = "text";
                a.body = "ほげ！";
                this.gadgets.push(a);

                var b = new GItem();
                b.i = "1";
                b.w = 4;
                b.h = 4;
                b.x = 2;
                b.y = 0;
                b.type = "text";
                b.body = "This is a pen.";
                this.gadgets.push(b);
                
                var c = new GItem();
                c.i = "2";
                c.w = 2;
                c.h = 4;
                c.x = 4;
                c.y = 0;
                c.type = "btn";
                c.icon = "open_in_new";
                c.userstyle.color = "red";
                this.gadgets.push(c);

                var d = new GItem();
                d.i = "3";
                d.w = 3;
                d.h = 4;
                d.x = 6;
                d.y = 0;
                d.type = "input";
                
                this.gadgets.push(d);

            },
            watch : {
                
            },
            methods : {
            }
        }),
        "input" : new Vue({
            el : "#dab_inputbox",
            delimiters : ["{?","?}"],
            data : {
                translations : {},
                globalInfo : {},
    
                cons_boxtype : [
                    {text : "Text & link", value : "text"},
                    {text : "Image", value : "img"},
                    {text : "Button", value : "btn"},
                    {text : "Timeline", value : "timeline"},
                    {text : "One toot", value : "toot"},
                    {text : "User card", value : "user"},
                    {text : "List", value : "list"},
                    {text : "Grid", value : "grid"},
                    {text : "Toot input box", value : "input"},
                ],
                is_dialog : false,

                is_boxtype : "text",
            },
            methods : {

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

        
        vue_dashboard.main.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
  
        vue_dashboard.main.translations = Object.assign({},curLocale.messages);
        vue_dashboard.input.translations = Object.assign({},curLocale.messages);


        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);


    }, function (flag) {
        appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    
})();
