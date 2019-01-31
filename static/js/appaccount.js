var MYAPP;
var vue_user;
var thisform = {
    select : ""
};

function btn_reg_account_clicked(e) {
    console.log(ID("txt_add_instance").value);
    MYAPP.acman.addInstance(ID("txt_add_instance").value);
}


function loadTimelineCommon(options){
    console.log("loadTimelineCommon");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getToots("me",options)
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
        alertify.error("読み込みに失敗しました。");
    });

}

function loadPinnedToot(options) {
    console.log("loadPinnedToot");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    options.api["pinned"] = true;
    options.app["tltype"] = "tt_all";
    MYAPP.sns.getToots("me",options)
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
        alertify.error("読み込みに失敗しました。");
    });
}
function load_favourites(options) {
    console.log("load_favourites");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    options.api["pinned"] = true;
    options.app["tltype"] = "tt_all";
    MYAPP.sns.getFav(options)
    .then((data)=>{
        console.log("load_favourites",data);
        if (data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        this.generate_toot_detail(data,options);
        
        MUtility.loadingOFF();
        this.is_asyncing = false;

    },(xhr,status)=>{
        MUtility.loadingOFF();
        alertify.error("読み込みに失敗しました。");
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_accounts").classList.add("active");
    //ID("sm_accounts").classList.add("active");
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

    vue_user = {
        "userview" : new Vue({
            el : "#userview",
            delimiters : ["{?","?}"],
            data : {
                header : "",
                avatar : "",
                display_name : "",
                idname : "",
                instance : "",
                rawdata : null,
            },
            computed : {
                full_display_name : function() {
                    return MUtility.replaceEmoji(this.display_name,this.instance,this.rawdata.emojis,24);
                },
            },
            methods : {
                onclick_editor : function(e) {
                    vue_user.editor.dialog = true;
                }
            }

        }),
        "tabbar" : new Vue({
            el : "#tabbar",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data : {
                translations : {},
                tab_favourite : ""
            },
            methods : {
                setTranslation : function () {
                    var a = "acc_tab_fav_" + MYAPP.session.config.application.showMode;
                    this.tab_favourite = _T(a);
                }
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
                    is_nomax : false,
                    is_nosince : false, 
                    tltype : "tt_all"
                },
                note : "",
                fields : [],
                translations : {},
                statuses : [],
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                
            },
            computed: {
            },
            methods : {
                loadPinnedToot : loadPinnedToot,
                fieldicon : function (val) {
                    return val.indexOf(":") >= 0 ? val.split(":")[0] : "comment";
                },
                fieldname : function (val) {
                    return val.indexOf(":") >= 0 ? val.split(":")[1] : val;
                }
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
                    this.loadTimeline(this.forWatch_selshare(val));
                },400),
                seltype_current : _.debounce(function(val) {
                    /*console.log(val);
                    //var sel = e.target.selectedOptions[0].value;
                    var sel = val;
                    this.statuses.splice(0,this.statuses.length);
                    this.info.tltype = sel;
                    var opt = {
                        exclude_replies : true,
                        tltype : sel
                    };
                    if (val == "tt_media") {
                        opt["only_media"] = true;
                    }*/
                    this.loadTimeline(this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon,
                onsaveclose : function (e) {
                    var param = e;
                    if (e.status) {
                        var opt = this.forWatch_allcondition(param);
                        this.loadTimeline(`tag/${this.tagname}`,opt);
                    }
                }
            }
        }),
        "fav" : new Vue({
            el : "#tt_fav",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_timeline],
            data : {
                is_asyncing : false,
                info : {
                    maxid : "",
                    sinceid : "",
                    is_nomax : false,
                    is_nosince : false, 
                },
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
                load_favourites : load_favourites,
            }
        }),
        "editor" : new Vue({
            el : "#editdlg",
            delimiters : ["{?","?}"],
            data : {
                cons : {
                    note : 160,
                    field_name : 255,
                    field_value : 255
                },
                translations : null,
                dialog : false,
                isfull : false,
                user : null,
                bkup : null,
                toggle_field : 1,
                toggle_extension : false,
                note : "",
                field_name : "",
                field_value : "",
                extensions : [],
                css : {
                    note : {
                        "red--text" : false
                    },
                    field_value : {
                        "red--text" : false
                    }
                }
                
            },
            watch: {
                toggle_field : function (val,old) {
                    console.log(val,old);
                    this.field_name = this.user.rawdata.fields[val].name;
                    var tmp = GEN("div");
                    tmp.innerHTML = this.user.rawdata.fields[val].value;
                    this.field_value = tmp.textContent;
                },
                note : function (val) {
                    if (val.length > this.cons.note) {
                        this.css.note["red--text"] = true;
                        return false;
                    }else{
                        this.css.note["red--text"] = false;
                        return true;
                    }
                },
                field_value : function (val) {
                    if (val.length > this.cons.field_value) {
                        this.css.field_value["red--text"] = true;
                        return false;
                    }else{
                        this.css.field_value["red--text"] = false;
                        return true;
                    }
                }
            },
            methods : {
                onclick_close : function (e) {
                    this.dialog = false;
                }
            }
        })
    };

    //MYAPP.setupCommonTranslate();
    vue_user.tabbar.setTranslation();

    M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_account").scroll({top:0})
            if (e.id == "basicinfo") {
                vue_user.basicinfo.statuses.splice(0,vue_user.basicinfo.statuses.length);
                vue_user.basicinfo.loadPinnedToot({api:{},app:{}});
            }else if (e.id == "tt_public") {
                var et = ID("area_account");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                //if ((fnlsa > 2) || (et.scrollTop == 0)) {
                    /*vue_user.tootes.info.tltype = ID("sel_tltype").selectedOptions[0].value;
                    vue_user.tootes.statuses.splice(0,vue_user.tootes.statuses.length);
                    vue_user.tootes.loadTimeline({
                        api : {
                            exclude_replies : true,
                        },
                        app : {
                            tltype : vue_user.tootes.info.tltype
                        }
                    });*/
                    var opt = vue_user.tootes.forWatch_allcondition(vue_user.tootes.tlcond.getReturn());
                    vue_user.tootes.loadTimeline(opt);

                //}
            }else if (e.id == "tt_fav") {
                vue_user.fav.statuses.splice(0,vue_user.basicinfo.statuses.length);
                vue_user.fav.load_favourites({
                    api : {},
                    app : {}
                });
            }
        }
    });
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

    ID("area_account").addEventListener("scroll",function(e){
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
                console.log(JSON.stringify(vue_user.tootes.info));
                /*vue_user.tootes.loadTimeline({
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
                vue_user.tootes.loadTimeline({
                    api : pastOptions.api,
                    app : pastOptions.app
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
                /*vue_user.tootes.loadTimeline({
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
                vue_user.tootes.loadTimeline({
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
            "instance":ID("hid_instance").value,
            "idname" : ID("hid_uid").value
        });
        //generate_account_info(ac);
        MYAPP.checkSession();
    
        var tmpac = new Account();
        tmpac.load(ac);
        vue_user.userview.header = tmpac.rawdata.header;
        vue_user.userview.avatar = tmpac.rawdata.avatar;
        vue_user.userview.display_name = tmpac.display_name;
        vue_user.userview.idname = tmpac.idname;
        vue_user.userview.instance = tmpac.instance;
        vue_user.userview.rawdata = tmpac.rawdata;

        vue_user.editor.user = tmpac;
        vue_user.editor.bkup = Object.assign({},tmpac);
        var tmp = GEN("div");
        tmp.innerHTML = tmpac.rawdata.note;
        vue_user.editor.note = tmp.textContent;
        vue_user.editor.toggle_field = 0;

        vue_user.basicinfo.note = tmpac.rawdata.note;
        var flds = tmpac.rawdata.fields;
        var retflds = [];
        //---analyze and get extra fields
        for (var i = 0; i < flds.length; i++) {
            var f = flds[i];
            if (f.name.indexOf("#more") > -1) {
                var tmp = GEN("div");
                tmp.innerHTML = f.value;
                console.log(tmp.textContent);
                var cnt = JSON.parse(tmp.textContent);
                for (var obj in cnt) {
                    retflds.push({
                        name : obj,
                        value : cnt[obj]
                    });
                }
            }else{
                retflds.push({
                    name : f.name,
                    value : f.value
                });
            }
        }
        vue_user.basicinfo.fields = retflds;
        vue_user.basicinfo.translations = Object.assign({},curLocale.messages);
       
        vue_user.tabbar.translations = vue_user.basicinfo.translations;
        vue_user.tootes.translations = vue_user.basicinfo.translations;
        vue_user.editor.translations = vue_user.basicinfo.translations;
        vue_user.fav.translations = vue_user.basicinfo.translations;

        var elem = document.querySelector("#tbl_acc tbody");
        /*for (var i = 0; i < MYAPP.acman.items.length; i++) {
            elem.appendChild(generate_account_row(MYAPP.acman.items[i]));
        }*/

        for (var obj in vue_user) {
            if ("timeline_gridstyle" in vue_user[obj]) {
                vue_user[obj].changeTimelineStyle();            
            }
        }

        MYAPP.session.status.currentLocation = `/accounts/${ac.instance}/${ac.idname}`; //location.pathname;
        
        //---account load
        MYAPP.afterLoadAccounts(data);
        MYAPP.selectAccount(ac);

        vue_user.basicinfo.loadPinnedToot({
            api : {},
            app : {}
        });
    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    //ID("cur_sel_account").classList.add("common_ui_off");
})();
