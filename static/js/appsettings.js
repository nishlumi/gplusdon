var MYAPP;
var vue_settings;

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_settings").classList.add("active");
    //ID("sm_settings").classList.add("active");
    MYAPP.showPostCtrl(true);
    MYAPP.showBottomCtrl(false);


    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    vue_settings = new Vue({
        el : "#settingview",
        mixins: [vue_mixin_base],
        delimiters : ["{?","?}"],
        data : {
            //return {
                //---setting choosable values
                vals_timeline_view : [
                    {text:_T("app_item_timelineview_auto"),value:"auto",selected:false},
                    {text:_T("app_item_timelineview_1"),value:"1",selected:false},
                    {text:_T("app_item_timelineview_2"),value:"2",selected:false},
                    {text:_T("app_item_timelineview_3"),value:"3",selected:false},
                ],
                cons_timeline_viewcont : [
                    20, 30, 40
                ],
                vals_boost_actiontype : [
                    {text:_T("act_lab_boost_actiontype_0"),value:"0",selected:false},
                    {text:_T("act_lab_boost_actiontype_1"),value:"1",selected:false},
                ],

                //---setting panel values
                type_app : {
                    showMode : "mastodon",
                    timeline_view : "auto",
                    timeline_viewcount : "20",
                    gallery_type : "slide",
                    skip_startpage : false,
                    map_type : "yahoo",
                    show_instanceticker : true,
                    cloud_manualy_save : false,
                },
                type_action : {
                    confirmBefore : true,
                    boost_actiontype : "0",
                    image_everyNsfw : false,
                    add_nsfw_force_instance : false,
                    nsfw_force_instances : [],
                    enable_nsfw_time : false,
                    force_nsfw_time : {
                        begin : null,
                        end : null
                    },
                    remove_nsfw_remove_instance : false,
                    nsfw_remove_instances : [],
                    popupNewtoot_always : false,
                    close_aftertoot : false,
                    tags : [],
                    noclear_tag : false,
                    open_url_after_remove_account : true
                },
                type_notification : {
                    enable_browser_notification : true,
                    include_dmsg_tl : false,
                    tell_newtoot : false,
                    tell_newtoot_scroll : 300,
                    tell_pasttoot_scroll : 95,
                    toot_limit_instance : [],
                    notpreview_onmap : false,
                    notpreview_onmedia : false,
                    minimumize_media_onlink : false,
                    show_mention_as_name : false,
                    show_allmedias_onlyone : false,
                },
                temp_tags : "",
                temp_toot_limit : "",
                resulturis : [],
                randomInstance : [],
                is_selected : false,
                exists_contact_account : true,
                //translation : {},
                selected : {},
                selected_base : {},

                times : {
                    begin : {
                        modal : false,
                    },
                    end : {
                        modal : false,
                    }
                },

                is_gdrive_authorize : false,
                is_sync_confirm : false,
                temp_sync : {
                    gglid : "",
                    ggldata : null,
                },
                g_is_show : false,
                globalInfo : {}
            //}
        },
        watch : {
            type_app : {
                handler : function (newval,oldval) {
                    console.log("type_app=",newval,oldval);
                    for (var obj in newval) {
                        MYAPP.session.config.application[obj] = newval[obj];
                    }
                    MYAPP.session.save(true);
                },
                deep : true
            },
            type_action : {
                handler : function (newval,oldval) {
                    console.log("type_action=",newval,oldval);
                    for (var obj in newval) {
                        MYAPP.session.config.action[obj] = newval[obj];
                    }
                    MYAPP.session.save(true);
                },
                deep : true
            },
            type_notification : {
                handler : function (newval,oldval) {
                    console.log("type_notification=",newval,oldval);
                    for (var obj in newval) {
                        MYAPP.session.config.notification[obj] = newval[obj];
                        if (["tell_newtoot_scroll","tell_pasttoot_scroll"].indexOf(obj) > -1) {
                            MYAPP.session.config.notification[obj] = Number(newval[obj]);
                        }
                    }
                    MYAPP.session.save(true);
                },
                deep : true
            },
            is_gdrive_authorize : function (val) {
                //---count config file in google drive
                if (!val) return;

                
            }
        },
        beforeMount() {
            
        },
        mounted(){
            var els = Qs("#area_settings select");
            M.FormSelect.init(els,{});
        },
        methods: {
            load_setting : function () {
                for (var obj in MYAPP.session.config.application) {
                    this.type_app[obj] = MYAPP.session.config.application[obj];
                }
                for (var obj in MYAPP.session.config.action) {
                    this.type_action[obj] = MYAPP.session.config.action[obj];
                }
                for (var obj in MYAPP.session.config.notification) {
                    this.type_notification[obj] = MYAPP.session.config.notification[obj];
                }
                if (this.type_action.tags.length > 0) {
                    var tmp = [];
                    for (var i = 0; i < this.type_action.tags.length; i++) {
                        var tag = this.type_action.tags[i];
                        tmp.push(tag.text);
                    }
                    this.temp_tags = tmp.join("\n");
                }
                if (this.type_notification.toot_limit_instance.length > 0) {
                    var tmp = [];
                    for (var i = 0; i < this.type_notification.toot_limit_instance.length; i++) {
                        var lim = this.type_notification.toot_limit_instance[i];
                        tmp.push(lim.instance + " " + lim.limit);
                    }
                    this.temp_toot_limit = tmp.join("\n");
                }
                //---temporary form (futurely to change vuetify...)
                var ishit = -1;
                for (var i = 0; i < this.vals_timeline_view.length; i++) {
                    if (this.type_app.timeline_view == this.vals_timeline_view[i].value) {
                        ishit = i;
                        ID("sel_timeline_view").selectedIndex = i;
                        M.FormSelect.init(ID("sel_timeline_view"),{});
                        break;
                    }
                }
                for (var i = 0; i < this.vals_boost_actiontype.length; i++) {
                    if (this.type_action.boost_actiontype == this.vals_boost_actiontype[i].value) {
                        ishit = i;
                        ID("sel_boost_actiontype").selectedIndex = i;
                        M.FormSelect.init(ID("sel_boost_actiontype"),{});
                        break;
                    }
                }
                console.log("type_action=",MYAPP.session.config.action,this.type_action);
            },
            onclick_savetag : function (e) {
                var arr = this.temp_tags.split("\n");
                var tagarr = [];
                for (var i = 0; i < arr.length; i++) {
                    tagarr.push({
                        id : i,
                        text : (arr[i].startsWith("#") ? arr[i] : "#"+arr[i])
                    });
                }
                this.type_action.tags = tagarr;
            },
            onclick_savetootlimit : function (e) {
                var arr = this.temp_toot_limit.split("\n");
                var tagarr = [];
                for (var i = 0; i < arr.length; i++) {
                    var ln = arr[i].split(" ");
                    if (isNaN(parseInt(ln[1]))) {
                        appAlert(_T("ntf_msg_toot_limit_instance1"));
                        return;
                    }
                    tagarr.push({
                        instance : ln[0],
                        limit : Number(ln[1]),
                    });
                }
                this.type_notification.toot_limit_instance.splice(0,this.type_notification.toot_limit_instance);
                for (var i = 0; i < tagarr.length; i++) {
                    this.type_notification.toot_limit_instance.push(tagarr[i]);
                }
            },
            onclick_uninstall_btn : function (e) {
                var msg = _T("msg_uninstall_local");

                appConfirm(msg,()=>{
                    MYAPP.session.uninstall(true);
                    appAlert(_T("msg_uninstall_after"));
                });
            },
            onclick_clearcache_btn : function(e) {
                navigator.serviceWorker.getRegistration()
                .then(registration => {
                    registration.unregister();
                });
                caches.keys().then(function(keys) {
                    var promises = [];
                    // clear all cache
                    keys.forEach(function(cacheName) {
                        if (cacheName) {
                            promises.push(caches.delete(cacheName));
                        }
                    });
                });
                localStorage.removeItem("siteinfo");
                sessionStorage.removeItem("siteinfo");
            },
            onclick_authorize_drive_btn : function (e) {
                MUtility.loadingON();
                gpGLD.handleAuth()
                .then(result=>{
                    var authres = result.getAuthResponse();
					MYAPP.siteinfo.ggl.act = authres;
                    MYAPP.saveSessionStorage();
                    
                    gpGLD.loadFromFolder()
                    .then(files=>{
                        var ret = null;
                        for (var i = 0; i < files.length; i++) {
                            if (gpGLD.setname == files[i].name) {
                                ret = files[i];
                            }
                        }
                        return ret;
                    })
                    .then(file=>{
                        if (file) {
                            //---if already exists, load config from google drive
                            this.temp_sync.gglid = file.id;
                            return gpGLD.loadFile(file.id)
                            .then(result=>{
                                this.temp_sync.ggldata = result;
                                //localStorage.setItem(MYAPP.acman.setting.NAME,result.body);
                                //return result.result;
                                this.is_sync_confirm = true;
                            });
                        }else{
                            //---newly save current local config
                            gpGLD.writeFile();
                        }
                    })
                    .finally(result=>{
                        MUtility.loadingOFF();
                        alertify.message(_T("msg_login_service",["Google"]));
                    });
                });
            },
            onclick_googlesave_btn : function (e) {
                if (gpGLD.is_authorize) {
                    MUtility.loadingON();
                    //---save to google drive
                    //---count config file in google drive
                    gpGLD.loadFromFolder()
                    .then(files=>{
                        var ret = null;
                        for (var i = 0; i < files.length; i++) {
                            ret = files[i];
                        }
                        return ret;
                    })
                    .then(file=>{
                        if (file) {
                            var items = MYAPP.acman.items;
                            var tmparr = [];
                            for (var i = 0; i < items.length; i++) {
                                tmparr.push(items[i].getRaw());
                            }
                            //---overwrite existing config file (because it already exists at here!!) 
                            gpGLD.updateFile(file.id,JSON.stringify(tmparr));
                        }
                    })
                    .finally(() =>{
                        MUtility.loadingOFF();
                        alertify.message(_T("msg_login_service",["Google"]));
                    });
    
                }
            },
            onclose_gphotodialog : function (e) {
                console.log(e);
            },
            onclick_gphoto_test_btn : function (e) {
                //MYAPP.commonvue.photodlg.is_show = true;
                this.$refs.gdlg.show();
                return;


                var gdrive_body =  () => {
                    let options = {
                        //key : gpGLD.k.pht_ap
                    };
                    gpGLD.createPhotoStream("mediaItems",options,MYAPP.siteinfo.ggl.act)
                    .then((data)=>{
                        //---get file(s) from Google Picker
                        console.log(data);
                        MYAPP.commonvue.photodlg.items = data.mediaItems;
                        MYAPP.commonvue.photodlg.nextPageToken = data.nextPageToken;
                        MYAPP.commonvue.photodlg.is_show = true;
                        /*
                        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                            var pros = [];
                            var docs = data[google.picker.Response.DOCUMENTS];
                            for (var d = 0; d < docs.length; d++) {
                                var doc = docs[d];
                                pros.push(gpGLD.loadFullFile(doc));
    
                            }
                            Promise.all(pros)
                            .then(res=>{
                                console.log(res);
                                //resolve(res);
                                var files = [];
                                for (var r = 0; r < res.length; r++) {
                                    //var blob = new Blob([res[r].data.body], {type: res[r].data.headers["Content-Type"]});
                                    //var url = window.URL.createObjectURL(blob);
                                    files.push({
                                        name : res[r].file.name,
                                        body : res[r].data.body,
                                        mimetype : res[r].data.headers["Content-Type"]
                                    });
                                }
                                this.loadMediafiles("binary",files);
                            });
                        }*/
                        
                    });
                }
    
                //---to attach a media file from Google Drive(Photos)
                if ("access_token" in MYAPP.siteinfo.ggl.act) {
                    if (!gpGLD.isExpired()) {
                        gdrive_body();
                        return;
                    }
                }
                gpGLD.handleAuth()
                .then(result=>{
                    var authres = result.getAuthResponse();
                    MYAPP.siteinfo.ggl.act = authres;
                    MYAPP.saveSessionStorage();
                    
                    gdrive_body();			
                });
            },
            onclick_organization_account_btn : function (e) {
                MUtility.loadingON();
                if (this.temp_sync.gglid == "") {
                    gpGLD.loadFromFolder()
                    .then(files=>{
                        var ret = null;
                        for (var i = 0; i < files.length; i++) {
                            if (gpGLD.setname == files[i].name) {
                                ret = files[i];
                            }
                        }
                        return ret;
                    })
                    .then(file=>{
                        if (file) {
                            this.temp_sync.gglid = file.id;
                            //---if already exists, load config from google drive
                            return gpGLD.loadFile(file.id)
                            .then(result=>{
                                this.temp_sync.ggldata = result;
                                //localStorage.setItem(MYAPP.acman.setting.NAME,result.body);
                                //return result.result;
                                this.is_sync_confirm = true;
                            });
                        }
                    })
                    .finally(result=>{
                        MUtility.loadingOFF();
                    });
                }else{
                    gpGLD.loadFile(this.temp_sync.gglid)
                    .then(result=>{
                        this.temp_sync.ggldata = result;
                        //localStorage.setItem(MYAPP.acman.setting.NAME,result.body);
                        //return result.result;
                        this.is_sync_confirm = true;
                    })
                    .finally(result=>{
                        MUtility.loadingOFF();
                    });
                }
            },
            onclick_syncconfirm : function (ans) {
                if (ans == 1) {
                    //---priority local
                }else if (ans == 2) {
                    //---priority drive
                    var file = this.temp_sync.ggldata;
                    console.log("ans=",ans,file);
                    localStorage.setItem(MYAPP.acman.setting.NAME,file.body);
                    alertify.message(_T("msg_apply_gdrive"));
                }else if (ans == 3) {
                    //---integrate, priority local
                    var local = MYAPP.acman.items;
                    var drive = this.temp_sync.ggldata.result;
                    var integarr = [];
                    var skiparr = [];
                    //---check existed, append local
                    for (var i = 0; i < local.length; i++) {
                        var ishit = false;
                        for (var j = 0; j < drive.length; j++) {
                            var test1 = (local[i].idname == drive[j].idname);
                            var test2 = (local[i].instance == drive[j].instance);
                            if (test1 && test2) {
                                integarr.push(local[i]);
                                skiparr.push(j);
                                ishit = true;
                            }
                        }
                        if (!ishit) {
                            integarr.push(local[i]);
                        }
                    }
                    //---append remaining
                    for (var i = 0; i < drive.length; i++) {
                        var ishit = false;
                        for (var j = 0; j < skiparr.length; j++) {
                            if (i != skiparr[j]) {
                                ishit = true;
                            }
                        }
                        if (!ishit) {
                            integarr.push(drive[i]);
                        }
                    }
                    console.log("ans=",ans,integarr);
                    localStorage.setItem(MYAPP.acman.setting.NAME,JSON.stringify(integarr));
                    alertify.message(_T("msg_apply_gdrive"));
                }else if (ans == 4) {
                    //---integrate, priority drive
                    var local = MYAPP.acman.items;
                    var drive = this.temp_sync.ggldata.result;
                    var integarr = [];
                    var skiparr = [];
                    //---check existed, append local
                    for (var i = 0; i < local.length; i++) {
                        var ishit = false;
                        for (var j = 0; j < drive.length; j++) {
                            var test1 = (local[i].idname == drive[j].idname);
                            var test2 = (local[i].instance == drive[j].instance);
                            if (test1 && test2) {
                                integarr.push(drive[j]);
                                skiparr.push(j);
                                ishit = true;
                            }
                        }
                        if (!ishit) {
                            integarr.push(local[i]);
                        }
                    }
                    //---append remaining
                    for (var i = 0; i < drive.length; i++) {
                        var ishit = false;
                        for (var j = 0; j < skiparr.length; j++) {
                            if (i != skiparr[j]) {
                                ishit = true;
                            }
                        }
                        if (!ishit) {
                            integarr.push(drive[i]);
                        }
                    }
                    console.log("ans=",ans,integarr);
                    localStorage.setItem(MYAPP.acman.setting.NAME,JSON.stringify(integarr));
                    alertify.message(_T("msg_apply_gdrive"));
                }else if (ans == 5) {
                    //---nothing. cancel
                    this.is_sync_confirm = false;
                }
                this.is_sync_confirm = false;
            },
            onclick_forget_drive_btn : function (e) {
                var msg = _T("msg_logout_google");
                appConfirm(msg,()=>{
                    gpGLD.handleSignout();
                });
                
            }
        }
    });

    ID("area_settings").addEventListener("scroll",function(e){
        //console.log(e);
        var sa = e.target.scrollHeight - e.target.clientHeight;
        if (e.target.scrollTop == sa) {
            //---page max scroll down
            console.log("scroll down max");
        }
        if (e.target.scrollTop == 0) {
            //---page max scroll up
            console.log("scroll up max");
        }
    });


    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();
        MYAPP.acman.loadEmoji();

        vue_settings.load_setting();
        
        //MYAPP.session.status.showingAccount.data = MYAPP.acman.items[0];
        //MYAPP.session.status.showingAccount.idname = MYAPP.acman.items[0].idname;
        //MYAPP.session.status.showingAccount.instance = MYAPP.acman.items[0].instance;
        MYAPP.checkSession();
        //MYAPP.sns.setAccount(MYAPP.session.status.showingAccount.data);

        vue_settings.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        //---account load
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];
        MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        MYAPP.session.status.currentLocation = location.pathname;

    }, function (flag) {
        /*appAlert(_T("msg_notlogin_myapp"), function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });*/
        //=== can use, if no logined===
        //---if already exists hid_instance, show instance information
        
    });

})();
