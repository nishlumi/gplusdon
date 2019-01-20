var MYAPP;
var vue_settings;

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_settings").classList.add("active");
    //ID("sm_settings").classList.add("active");
    MYAPP.showBottomCtrl(true);


    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    vue_settings = new Vue({
        el : "#settingview",
        delimiters : ["{?","?}"],
        data() {
            return {
                //---setting choosable values
                vals_timeline_view : [
                    {text:_T("app_item_timelineview_auto"),value:"auto"},
                    {text:_T("app_item_timelineview_1"),value:"1"},
                    {text:_T("app_item_timelineview_2"),value:"2"},
                    {text:_T("app_item_timelineview_3"),value:"3"},
                ],
                cons_timeline_viewcont : [
                    20, 30, 40
                ],

                //---setting panel values
                type_app : {
                    showMode : "mastodon",
                    timeline_view : "auto",
                    timeline_viewcount : "20",
                    gallery_type : "slide",
                },
                type_action : {
                    confirmBefore : true,
                    image_everyNsfw : false,
                    popupNewtoot_always : false,
                    close_aftertoot : false,
                    tags : []
                },
                type_notification : {
                    enable_browser_notification : true,
                    include_dmsg_tl : false,
                },
                temp_tags : "",
                resulturis : [],
                randomInstance : [],
                is_selected : false,
                exists_contact_account : true,
                //translation : {},
                selected : {},
                selected_base : {},
                globalInfo : {}
            }
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
                    }
                    MYAPP.session.save(true);
                },
                deep : true
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
                if (this.type_action.tags.length > -1) {
                    var tmp = [];
                    for (var i = 0; i < this.type_action.tags.length; i++) {
                        var tag = this.type_action.tags[i];
                        tmp.push(tag.text);
                    }
                    this.temp_tags = tmp.join("\n");
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
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
        //=== can use, if no logined===
        //---if already exists hid_instance, show instance information
        
    });

})();
