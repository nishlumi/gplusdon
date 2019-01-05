var MYAPP;
var vue_settings;

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_settings").classList.add("active");
    //ID("sm_settings").classList.add("active");

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
                },
                type_action : {
                    confirmBefore : true,
                    image_everyNsfw : false,
                    popupNewtoot_always : false,
                    close_aftertoot : false,
                },
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
                console.log("type_action=",MYAPP.session.config.action,this.type_action);
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
