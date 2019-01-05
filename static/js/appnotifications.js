var MYAPP;
var vue_notifications;

function loadNotifications(account,options) {
    console.log("loadNotifications",account,options);
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    var bkupAC = MYAPP.sns._accounts;
    MYAPP.sns.setAccount(account.account);
    MYAPP.sns.getNotifications(options)
    .then((result)=>{
        console.log("getNotifications",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        var paging = result.paging;

        if (!options.app.is_nomax) account.info.maxid = paging.next; //data[data.length - 1].id;
        if (!options.app.is_nosince) account.info.sinceid = paging.prev; //data[0].id;

        this.push_notification(account,result.data,options);
        
    })
    .catch((error,status,xhr)=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        alertify.error("読み込みに失敗しました。");
        console.log("loadNotifications",error,status,xhr);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
        MYAPP.sns._accounts = bkupAC;
    });

}
document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_settings").classList.add("active");
    //ID("sm_settings").classList.add("active");

    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    vue_notifications = new Vue({
        el : "#notifcationview",
        delimiters : ["{?","?}"],
        mixins : [vue_mixin_for_notification],
        data() {
            return {
                is_asyncing : false,
                tabvalue : "",
                current_itemID : 0,
                /**
                 * The array of AccountNotification object
                 * @param {AccountNotification} accounts notifications of accounts
                 */
                accounts : [],
                globalInfo : {}
            }
        },
        watch : {
        },
        beforeMount() {
            this.pagetype = "page";
        },
        mounted(){
            //var els = Qs("#area_settings select");
            //M.FormSelect.init(els,{});
        },
        computed : {
        },
        methods: {
            //---some function----------------------------------------
            /**
             * 
             * @param {Account} account account AccountNotification object
             * @param {Boolean} isID wheather id property
             */
            href_full_acct : function (account,isID) {
                if (isID) {
                    return `${account.acct.replace("@","")}`;
                }else{
                    return `#${account.acct.replace("@","")}`;
                }
            },
            /**
             * return converted full display_name
             * @param {Account} account AccountNotification object
             */
            full_display_name : function(account) {
                return MUtility.replaceEmoji(account.display_name,account.instance,account.emojis,14);
            },
            /**
             * 
             * @param {Account} account this app's Account object (AccountNotification.account)
             * @param {Notification} notif Mastodon's Notification object (AccountNotification.notifications[n])
             */
            cssstyle_unreadNotification : function (account,notif) {
                var ret = {
                    "white" : false,
                    "grey" : true,
                    "lighten-4" : true
                };
                for (var i = 0; i < account.notifications.length; i++) {
                    var acnotif = account.notifications[i];
                    if (acnotif.id == notif.id) {
                        ret["white"] = true;
                        ret["grey"] = false;
                        ret["lighten-4"] = false;
                    }
                }
                return ret;
            },
            loadNotifications : loadNotifications,
            //---event handler----------------------------------------
            oninput_tabs : function (value) {
                var itemID = Number(value.replace("tab_",""));
                this.current_itemID = itemID;
                console.log(value,JSON.original(this.accounts[itemID].info),
                `maxid=[${this.accounts[itemID].info.maxid}]`,
                `sinceid=[${this.accounts[itemID].sinceid}]`);

                if ((this.accounts[itemID].info.maxid == "") && (this.accounts[itemID].info.sinceid == "")) {
                    this.loadNotifications(this.accounts[itemID],{
                        api:{
                            
                        },app:{
                            is_nomax : false,
                            is_nosince : false,

                        }
                    });
                }

                /*MYAPP.sns.getNotifications({api:{},app:{}})
                .then(result=>{
                    //console.log(ac,result.data);
                    vue_notifications.push_notification(value,result.data);
                });*/
            },
            onclick_past : function (index) {
                var ac = this.accounts[index];

                var pastOptions = {
                    api : {
                        max_id : ac.info.maxid,
                    },
                    app : {
                        is_nomax : false,
                        is_nosince : true,
                    }
                }
                console.log("click_past=",index,ac,pastOptions);
                this.loadNotifications(ac,pastOptions);
            },
            onscroll_tabitem : function(e){
                //console.log(e);
                console.log(e);
                var itemID = Number(e.target.id.replace("tab_",""));
                var ac = this.accounts[itemID];

                var sa = e.target.scrollHeight - e.target.clientHeight;
                var fnlsa = sa - Math.round(e.target.scrollTop);
                if (fnlsa < 10) {
                    //---page max scroll down
                    console.log("scroll down max");
                    var pastOptions = {
                        api : {
                            max_id : "",
                        },
                        app : {
                            is_nomax : false,
                            is_nosince : true,
                        }
                    }
                    pastOptions.api.max_id = ac.info.maxid;
                    this.loadNotifications(ac,pastOptions);    
                }
                if (e.target.scrollTop == 0) {
                    //---page max scroll up
                    console.log("scroll up max");
                    var futureOptions = {
                        api : {
                            since_id : "",
                        },
                        app : {
                            is_nomax : true,
                            is_nosince : false,
                        }
                    }
                    futureOptions.api.since_id = ac.info.sinceid;
                    this.loadNotifications(ac,futureOptions);    

                }
            }
        }
    });

    Qs(".xnotification-tabbody").forEach(elem=>{
        elem.addEventListener("scroll",function(e){
            //console.log(e);
            console.log(elem);
            var sa = e.target.scrollHeight - e.target.clientHeight;
            var fnlsa = sa - Math.round(e.target.scrollTop);
            if (fnlsa < 10) {
                //---page max scroll down
                console.log("scroll down max");
                var pastOptions = {
                    api : {
                        max_id : "",
                    },
                    app : {
                        is_nomax : false,
                        is_nosince : true,
                    }
                }

            }
            if (e.target.scrollTop == 0) {
                //---page max scroll up
                console.log("scroll up max");
                var futureOptions = {
                    api : {
                        since_id : "",
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                    }
                }

            }
        });
    });


    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();
        
        //MYAPP.session.status.showingAccount.data = MYAPP.acman.items[0];
        //MYAPP.session.status.showingAccount.idname = MYAPP.acman.items[0].idname;
        //MYAPP.session.status.showingAccount.instance = MYAPP.acman.items[0].instance;
        MYAPP.checkSession();
        //MYAPP.sns.setAccount(MYAPP.session.status.showingAccount.data);

        vue_notifications.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        //---account load
        var acIndex = MYAPP.acman.getIndex({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        var ac = MYAPP.acman.items[acIndex];
        if (!ac) ac = data[0];
        MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        MYAPP.session.status.currentLocation = location.pathname;

        for (var i = 0; i < MYAPP.acman.items.length; i++) {
            vue_notifications.accounts.push(
                new AccountNotification(MYAPP.acman.items[i])
            );
            var vuenoti = vue_notifications.accounts[vue_notifications.accounts.length-1];
            MYAPP.acman.items[i].stream.setTargetPageNotification({
                account : vuenoti,
                index : i,
                vue : vue_notifications
            });
        }
        
        vue_notifications.loadNotifications(vue_notifications.accounts[acIndex],{
            api : {
            },
            app : {
                is_nomax : false,
                is_nosince : false,
            }
        });
        /*MYAPP.sns.getNotifications({api:{},app:{}})
        .then(result=>{
            console.log(ac,result.data);
            vue_notifications.push_notification(acIndex,result.data);
        });*/
        vue_notifications.$nextTick(function () {
            this.tabvalue = `tab_${acIndex}`; //this.href_full_acct(this.accounts[acIndex].account,true);
            this.current_itemID = acIndex;
        });

    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
        //=== can use, if no logined===
        //---if already exists hid_instance, show instance information
        
    });

})();
