var MYAPP;
var vue_user;
var thisform = {
    select : ""
};

function btn_reg_account_clicked(e) {
    console.log(ID("txt_add_instance").value);
    MYAPP.acman.addInstance(ID("txt_add_instance").value);
}


function loadTimelineCommon(type,options){
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

    vue_user = {
        "userview" : new Vue({
            el : "#userview",
            mixins : [vue_mixin_base],
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
                full_acct : function () {
                    return "@" + this.idname + "@" + this.instance;
                }
            },
            methods : {
                onclick_editor : function(e) {
                    vue_user.editor.dialog = true;
                },
                onclick_copypath : function (e) {
                    MUtility.copyClipboard(location.href.replace("/accounts","/users"));
                }
            }

        }),
        "tabbar" : new Vue({
            el : "#tabbar",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_base, vue_mixin_for_account],
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
            mixins : [vue_mixin_base, vue_mixin_for_timeline],
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
                        sizing : false
                    }
                },
            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                this.tl_tabtype = "user";
                
            },
            computed: {
            },
            methods : {
                loadPinnedToot : loadPinnedToot,
                load_setting : function (item) {
                    this.note = item.rawdata.note;
                    var flds = item.rawdata.fields;
                    var retflds = [];
                    //---analyze and get extra fields
                    for (var i = 0; i < flds.length; i++) {
                        var f = flds[i];
                        /*if (f.name.indexOf("#more") > -1) {
                            var tmp = GEN("div");
                            tmp.innerHTML = f.value;
                            var tmptxt = tmp.textContent;
                            tmp.innerHTML = tmptxt;
                            console.log(tmp.textContent);
                            var cnt = JSON.parse(tmp.textContent);
                            for (var obj in cnt) {
                                retflds.push({
                                    name : obj,
                                    value : cnt[obj]
                                });
                            }
                        }else{*/
                            retflds.push({
                                name : f.name,
                                value : f.value
                            });
                        //}
                    }
                    this.fields = retflds;
                },
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
            mixins : [vue_mixin_base,vue_mixin_for_timeline],
            data : {
                sel_tlshare : tlshare_options,
                sel_tltype : tltype_options,

                tlcond : null,

            },
            created : function() {
                //---if normaly indicate "active" class in html, it is shiftted why digit position
                //   the workarround for this.
                Q(".tab.col a").classList.add("active");
                this.pagetype = "account";
                this.tlcond = new GTimelineCondition();

                this.tl_tabtype = "user";
            },
            mounted() {
            },
            watch : {
                selshare_current : _.debounce(function(val) {
                    this.loadTimeline("me",this.forWatch_selshare(val));
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
                    this.loadTimeline("me",this.forWatch_seltype(val));
                },400)
            },
            methods : {
                loadTimeline : loadTimelineCommon,
                onsaveclose : function (e) {
                    var param = e;
                    if (e.status) {
                        var opt = this.forWatch_allcondition(param);
                        this.loadTimeline("me",opt);
                        var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                        if (param.func == "clear") {
                            notifAccount.account.stream.start();
                        }
                    }
                },
                ondatesaveclose : function (e) {
                    var param = e;
                    if (e.status) {
                        var opt = this.forWatch_allcondition(param);
                        this.loadTimeline("me",opt);
                        var notifAccount = MYAPP.commonvue.nav_notification.currentAccount;
                        if (param.func == "exec") {
                            notifAccount.account.stream.stop();
                        }else{
                            notifAccount.account.stream.start();
                        }
                    }
                }
            }
        }),
        "fav" : new Vue({
            el : "#tt_fav",
            
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_base,vue_mixin_for_timeline],
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
            mixins: [vue_mixin_base],
            delimiters : ["{?","?}"],
            data : {
                cons : {
                    fields : [1,2,3,4],
                    extension : [1,2,3],
                    note : 160,
                    field_name : 255,
                    field_value : 255,
                    json_len : 255
                    
                },
                translations : null,
                dialog : false,
                isfull : false,
                isloading : false,
                user : null,
                bkup : null,
                toggle_field : 0,
                toggle_extension : false,
                note : "",
                field_name : "",
                field_value : "",
                ext : [
                    {name : "", value : ""},
                    {name : "", value : ""},
                    {name : "", value : ""},
                ],
                extdisabled : [
                    false,false,false
                ],
                ext_vallength : 0,
                saves : {
                    fields : [{},{},{},{}],
                    extension : [{},{},{}],
                    toggle_extension : [false,false,false,false],
                    fldjson : "",
                    avatarfile : null,
                    headerfile : null,
                },
                css : {
                    note : {
                        "red--text" : false
                    },
                    field_value : {
                        "red--text" : false
                    },
                    extension : {
                        "red--text" : false
                    }
                }
                
            },
            computed: {
                oprofile : function (){
                    var url = `https://${this.user.instance}/settings/profile`;
                    return url;
                }
            },
            watch: {
                toggle_field : function (val,old) {
                    //---save old
                    this.saves.fields[old].name = this.field_name;
                    if (this.field_name.indexOf("#more") > -1) {
                        this.saves.fields[old].value = this.saves.fldjson;
                    }else{
                        this.saves.fields[old].value = this.field_value;
                    }
                    //---turn new
                    console.log(val,old);
                    if (val < this.user.rawdata.fields.length) {
                        this.field_name = this.user.rawdata.fields[val].name;

                        var tmp = GEN("div");
                        tmp.innerHTML = this.user.rawdata.fields[val].value;
                        this.field_value = tmp.textContent;
                        if (this.field_name.indexOf("#more") > -1) {
                            this.saves.toggle_extension[val] = true;
                            this.saves.fldjson = this.field_value;
                            var calc = JSON.parse(this.saves.fldjson);
                            var ei =  0;
                            for (var obj in calc) {
                                this.ext[ei].name = obj;
                                var tmp = GEN("div");
                                tmp.innerHTML = calc[obj];
                                this.ext[ei].value = tmp.textContent;
                                ei++;
                            }
                        }else{
                            
                        }
                    }else{
                        this.field_name = "";
                        this.field_value = "";
                    }
                    //---restore flag for extension
                    this.toggle_extension = this.saves.toggle_extension[val];
                },
                toggle_extension : function (val) {
                    if (val) {
                        if (this.field_name.indexOf(this.field_name) < 0) {
                            this.field_name = this.field_name + "#more";
                        }
                    }else{
                        this.field_name = this.field_name.replace("#more","");
                    }
                    this.saves.toggle_extension[this.toggle_field] = this.toggle_extension;
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
                field_name : function (val) {
                    this.saves.fields[this.toggle_field]["name"] = val;
                    if (val.length > this.cons.field_name) {
                        this.css.field_value["red--text"] = true;
                        return false;
                    }else{
                        this.css.field_value["red--text"] = false;
                        return true;
                    }
                },
                field_value : function (val) {
                    this.saves.fields[this.toggle_field]["value"] = val;
                    if (val.length > this.cons.field_value) {
                        this.css.field_value["red--text"] = true;
                        return false;
                    }else{
                        this.css.field_value["red--text"] = false;
                        return true;
                    }
                },
                ext : {
                    handler : function (val,old) {
                        console.log("new",val);
                        var calc = {};
                        for (var i = 0; i < val.length; i++) {
                            this.saves.extension[i].name = val[i].name;
                            this.saves.extension[i].value = val[i].value;
                            calc[val[i].name] = val[i].value;
                            var tmp = JSON.stringify(calc).length;
                            if (tmp >= this.cons.json_len) {
                                //this.extreadonly[i] = true;
                                this.css.extension["red--text"] = true;
                                if ((i+1) < val.length) {
                                    for (var j = i+1; j < val.length; j++) {
                                        this.extdisabled[j] = true;
                                    }
                                }
                            }else{
                                this.extdisabled[i] = false;
                                //this.extreadonly[i] = false;
                                this.css.extension["red--text"] = false;
                            }
                        }
                        this.saves.fldjson = JSON.stringify(calc);
                        this.ext_vallength = this.saves.fldjson.length;
                        
                        console.log(JSON.stringify(calc),JSON.stringify(calc).length);
                    },
                    deep : true
                }
            },
            methods : {
                load_setting : function (item) {
                    this.user = JSON.original(item);
                    for (var i = 0; i < item.rawdata.source.fields.length; i++) {
                        this.saves.fields[i].name = item.rawdata.source.fields[i].name;
                        this.saves.fields[i].value = item.rawdata.source.fields[i].value;
                        if (i == 0) {
                            this.field_name = item.rawdata.source.fields[i].name;
                            this.field_value = item.rawdata.source.fields[i].value;
                        }
                    }
                    this.bkup = JSON.original(item);
                    //var tmp = GEN("div");
                    //tmp.innerHTML = item.rawdata.note;
                    this.note = MUtility.getEscapeHTML(item.rawdata.note);
                    //this.toggle_field = 0;
            
                },
                onclick_avatarfilepath : function (e) {
                    console.log(e);

                    var reader = new FileReader();
                    reader.onload = ((fle) => {
                        return (e) => {
                            var imgsrc = e.target.result;
                            //console.log("e=",e);
                            var dat = {
                                src : imgsrc,
                                comment : "",
                                data : fle
                            };
                            this.saves.avatarfile = dat;
                            this.user.rawdata.avatar = imgsrc;
                        }
                    })(e.target.files[0]);
                    reader.readAsDataURL(e.target.files[0]);
                },
                onclick_headerfilepath : function (e) {
                    console.log(e);

                    var reader = new FileReader();
                    reader.onload = ((fle) => {
                        return (e) => {
                            var imgsrc = e.target.result;
                            //console.log("e=",e);
                            var dat = {
                                src : imgsrc,
                                comment : "",
                                data : fle
                            };
                            this.saves.avatarfile = dat;
                            this.user.rawdata.header = imgsrc;
                        }
                    })(e.target.files[0]);
                    reader.readAsDataURL(e.target.files[0]);
                },
                onclick_close : function (e) {
                    this.dialog = false;
                },
                onclick_apply : function (e) {
                    var formdata = {}, formdata_media = {};
                    var isimage = false;

                    if (this.user.rawdata.display_name != this.bkup.rawdata.display_name) {
                        formdata["display_name"] = this.user.rawdata.display_name;
                    }
                    var tmp1 = GEN("div");
                    tmp1.innerHTML = this.bkup.rawdata.note;
                    if (this.note != tmp1.textContent) {
                        formdata["note"] = this.note;
                    }
                    if (this.user.rawdata.avatar != this.bkup.rawdata.avatar) {
                        var imgdata = this.saves.avatarfile.src.split(";");
						imgdata[0] = imgdata[0].replace("data:","");
						var base64img = atob(imgdata[1].split(",")[1]);
						var buffer = new Uint8Array(base64img.length);
						for (var b = 0; b < base64img.length; b++) {
							buffer[b] = base64img.charCodeAt(b);
						}
                        var fl = new Blob([buffer.buffer],{type:imgdata[0]});
                        
                        formdata_media["avatar"] = this.saves.avatarfile.data;
                        isimage = true;
                    }
                    if (this.user.rawdata.header != this.bkup.rawdata.header) {
                        var imgdata = this.saves.headerfile.src.split(";");
						imgdata[0] = imgdata[0].replace("data:","");
						var base64img = atob(imgdata[1].split(",")[1]);
						var buffer = new Uint8Array(base64img.length);
						for (var b = 0; b < base64img.length; b++) {
							buffer[b] = base64img.charCodeAt(b);
						}
                        var fl = new Blob([buffer.buffer],{type:imgdata[0]});
                        
                        formdata_media["header"] = fl;
                        isimage = true;
                    }
                    if (this.user.rawdata.locked != this.bkup.rawdata.locked) {
                        formdata["locked"] = this.user.rawdata.locked;
                    }

                    var tmp = [];
                    formdata["fields_attributes"] = [];
                    for (var i = 0; i < this.saves.fields.length; i++) {
                        tmp.push({
                            name : this.saves.fields[i].name,
                            value : this.saves.fields[i].value
                        });
                    }
                    formdata["fields_attributes"] = (tmp);

                    var ac = MYAPP.acman.get({
                        idname : this.user.idname,
                        instance : this.user.instance
                    });
                    var bb = MYAPP.sns._accounts;
                    MYAPP.sns.setAccount(ac);
                    this.isloading = true;
                    MYAPP.sns.patchCredential({
                        api : formdata,
                        app : {
                            ismedia : false
                        }
                    })
                    .then(result=> {
                        this.dialog = false;
                        if (isimage) {
                            return MYAPP.sns.patchCredential({
                                api : formdata_media,
                                app : {
                                    ismedia : true
                                }
                            });
                        }
                    })
                    .catch((error)=>{

                    })
                    .finally(() => {
                        this.isloading = false;
                        MYAPP.sns._accounts = bb;
                        
                    });
                    console.log(formdata);
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
                    vue_user.tootes.loadTimeline("me",opt);

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
                    exclude_replies : "",
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
                for (var obj in vue_user.tootes.currentOption.api) {
					pastOptions.api[obj] = vue_user.tootes.currentOption.api[obj];
                }

                delete pastOptions.api["since_id"];
				delete pastOptions.api["min_id"];                
                //pastOptions.api.max_id = vue_user.tootes.info.maxid;
                //pastOptions.app.tlshare = vue_user.tootes.selshare_current;
                //pastOptions.app.tltype = vue_user.tootes.seltype_current;
                vue_user.tootes.loadTimeline("me",{
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
                    exclude_replies : "",
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
                for (var obj in vue_user.tootes.currentOption.api) {
					futureOptions.api[obj] = vue_user.tootes.currentOption.api[obj];
                }
                if (futureOptions.api["exclude_replies"] === true) {
                    futureOptions.api["exclude_replies"] = "";
                }else if (futureOptions.api["exclude_replies"] === false) {
                    delete futureOptions.api["exclude_replies"];
                }
                /* TODO: ユーザーのsince_id とmin_idの挙動を改めて確認！ */
                //futureOptions.api["since_id"] = futureOptions.api["min_id"];
                delete futureOptions.api["since_id"];
				delete futureOptions.api["max_id"];
                //futureOptions.api.since_id = vue_user.tootes.info.sinceid;
                //futureOptions.app.tlshare = vue_user.tootes.selshare_current;
                //futureOptions.app.tltype = vue_user.tootes.seltype_current;
                vue_user.tootes.loadTimeline("me",{
                    api : futureOptions.api,
                    app : futureOptions.app
                });

            }
        }
        MYAPP.commonvue.bottomnav.checkScroll(fnlsa);

    });

    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();
        
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

        /*
        vue_user.editor.user = tmpac;
        vue_user.editor.bkup = Object.assign({},tmpac);
        var tmp = GEN("div");
        tmp.innerHTML = tmpac.rawdata.note;
        vue_user.editor.note = tmp.textContent;
        vue_user.editor.toggle_field = 0;
        */

       vue_user.basicinfo.load_setting(tmpac);
       vue_user.editor.load_setting(tmpac);

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
        appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
    });
    console.log("hash=",location.hash);
    location.hash = "";
    //ID("cur_sel_account").classList.add("common_ui_off");
})();
