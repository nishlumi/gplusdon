var MYAPP;
var vue_accounts;

function btn_reg_account_clicked(text) {
    console.log(text);
    MYAPP.acman.addInstance(text);
}
function onsubmit_addinstance(e) {
    btn_reg_account_clicked(this.inputinstance);
}
function ondelete_account(e) {
    var selected = [];
    for (var i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i].selected) {
            selected.push(i);
        }
    }
    appConfirm(_T("remove_account_mes01"),() => {
        for (var i = 0; i < selected.length; i++) {
            var sel = selected[i];
            MYAPP.commonvue.nav_sel_account.accounts.splice(sel,1);
            MYAPP.commonvue.inputtoot.accounts.splice(sel,1);
            this.accounts.splice(sel,1);
            //MYAPP.acman.items.splice(sel,1);
            var seli = MYAPP.acman.items[sel];
            MYAPP.acman.remove({
                idname : seli.idname,
                instance: seli.instance
            });
        }
        MYAPP.acman.save();
        if (MYAPP.acman.items.length > 0) {
            var ac = MYAPP.acman.items[0];
            MYAPP.commonvue.nav_sel_account.setCurrentAccount(ac);
        }else{
            //---initialize app (because of accounts not found)
            MYAPP.commonvue.nav_sel_account.setCurrentAccount(null);
            MYAPP.acman.uninstall();
            //MYAPP.commonvue.leftmenu.applogined = false;
            MYAPP.commonvue.sidebar.applogined = false;
            //MYAPP.commonvue.nav_search.applogined = false;
            MYAPP.commonvue.nav_search.applogined = false;
            MYAPP.commonvue.nav_btnbar.applogined = false;
            MYAPP.commonvue.nav_notification.applogined = false;
            MYAPP.commonvue.nav_sel_account.applogined = false;
            
        }
        if (MYAPP.session.config.action.open_url_after_remove_account) {
            appAlert(_T("remove_account_mes02",[seli.instance]),function(){
                window.open(`https://${seli.instance}/oauth/authorized_applications`,target="_blank");
                if (!MYAPP.commonvue.nav_sel_account.applogined) {
                    location.href = "/";
                }
            });
        }
    });
}
/*function generate_account_row(data) {
    var tr = GEN("tr");

    var td_0 = GEN("td");
    var label = GEN("label");
    var inputchk = GEN("input");
    var inputspan = GEN("span");
    inputchk.type = "checkbox";
    label.appendChild(inputchk);
    label.appendChild(inputspan);
    td_0.appendChild(label);

    var td_1 = GEN("td");

    var td_2 = GEN("td");

    var a = GEN("a");
    var a2 = GEN("a");
    a.title = `${data.instance}/${data.idname}`;
    a2.title = `${data.instance}/${data.idname}`;
    a.href = `${MYAPP.appinfo.firstPath}/accounts/${data.instance}/${data.idname}`;
    a2.href = `${MYAPP.appinfo.firstPath}/accounts/${data.instance}/${data.idname}`;
    var a_formsend = function(e) {
        MYAPP.session.status.showingAccount.instance = data.instance;
        MYAPP.session.status.showingAccount.idname = data.idname;
        MYAPP.session.status.showingAccount.data = data;
        MYAPP.session.save();
        var fm = document.forms.accountsform;
        fm.action = e.currentTarget.href; //`${MYAPP.appinfo.firstPath}/accounts/${e.currentTarget.title}`;
        ID("udata").value = JSON.stringify(data);
        fm.submit();
        return false;
    }
    a.onclick = a_formsend;
    a2.onclick = a_formsend;

    var img = GEN("img");
    img.src = data.rawdata.avatar_static;
    img.alt = data.idname;
    img.width = "40";
    img.height = "40";
    var img_title = GEN("span");
    img_title.innerHTML = data.display_name;
    a.appendChild(img);
    a2.appendChild(img_title);
    td_1.appendChild(a)
    td_2.appendChild(a2);

    var td_3 = GEN("td");
    td_3.innerHTML = "@" + data.idname;

    var td_4 = GEN("td");
    td_4.innerHTML = "@" + data.instance;

    var td_5 = GEN("td");
    td_5.innerHTML = data.rawdata.statuses_count;

    var td_6 = GEN("td");
    td_6.innerHTML = data.rawdata.following_count;
    
    var td_7 = GEN("td");
    td_7.innerHTML = data.rawdata.followers_count;

    tr.appendChild(td_0);
    tr.appendChild(td_1);
    tr.appendChild(td_2);
    tr.appendChild(td_3);
    tr.appendChild(td_4);
    tr.appendChild(td_5);
    tr.appendChild(td_6);
    tr.appendChild(td_7);

    return tr;
}*/
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

    //MYAPP.setupCommonTranslate();
    vue_accounts = new Vue({
        el : "#area_accounts",
        delimiters : ["{?", "?}"],
        data : {
            is_bottomsheet : false,
            inputinstance : "",
            accounts : [], //account: Object, selected : Boolean
            accounts_config : [], //idname, instance, is_notification
            select_desktop : {
                alert : {
                    mention : false,
                    follow : false,
                    reblog : false,
                    favourite : false
                }
            },
            select_subscription : {
                account : null,
                alert : {
                    mention : false,
                    follow : false,
                    reblog : false,
                    favourite : false
                }
            },
            translations : {},

        },
        watch : {
            accounts_config : {
                handler : function (newval,oldval) {
                    console.log(newval,oldval);
                    if (newval && (newval.is_notification === true)) {
                        this.doRegister(newval);
                    }
                },
                deep : true
            }
        },
        methods : {
            onsubmit_addinstance : onsubmit_addinstance,
            accountAppLink : function(item) {
                return `${MYAPP.appinfo.firstPath}/accounts/${item.instance}/${item.idname}`
            },
            fullname : function (ac) {
                return `<span style="display:inline-block">${MUtility.replaceEmoji(ac.display_name,ac.instance,[],"14")}@${ac.instance}</span>`;
            },
            doRegister : function(ac) {
                MYAPP.sns.permissionPushSubscription()
                .then(result=>{
                    console.log("permission push:",result);
                });
            },
            get_translated_typename : function (type) {
                if (type == "reblog"){
                    return _T(`${type}_${MYAPP.session.config.application.showMode}`);
                }else if (type == "favourite") {
                    return _T(`${type}_${MYAPP.session.config.application.showMode}`);
                }else if (type == "follow") {
                    return _T("acc_tab_following");
                }else if (type == "mention") {
                    return _T(type);
                }else{
                    return "Unknown";
                }
            },
            ondelete_account : ondelete_account,
            onclick_pushsub : function(account) {
                var mainfunc = ()=>{
                    console.log((account));
                    var bkup = MYAPP.sns._accounts;

                    if (account.others["alert"]) {
                        for (var obj in this.select_desktop.alert) {
                            this.select_desktop.alert[obj] = account.others.alert[obj];
                        }
                    }

                    MYAPP.sns.setAccount(account);
                    MYAPP.sns.getPushSubscription({})
                    .then(result=>{
                        console.log("result=",result);
                        this.select_subscription.alert.mention = result.data.alerts.mention;
                        this.select_subscription.alert.reblog = result.data.alerts.reblog;
                        this.select_subscription.alert.favourite = result.data.alerts.favourite;
                        this.select_subscription.alert.follow = result.data.alerts.follow;
                        return Promise.resolve(true);
                    })
                    .catch(error=>{
                        MYAPP.sns.createPushSubscription({
                            mention : true,
                            follow : true,
                            reblog : true,
                            favourite : true
                        })
                        .then(result2=>{
                            console.log("result2=",result2);
                            this.select_subscription.alert.mention = result2.data.alerts.mention;
                            this.select_subscription.alert.reblog = result2.data.alerts.reblog;
                            this.select_subscription.alert.favourite = result2.data.alerts.favourite;
                            this.select_subscription.alert.follow = result2.data.alerts.follow;
                        })
                    })
                    .finally(()=>{
                        this.select_subscription.account = account;
                        this.is_bottomsheet = !this.is_bottomsheet;
                        MYAPP.sns.setAccount(bkup);
                    });
                }

                if (Push.Permission.has()) {
                    mainfunc();
                }else{
                    Push.Permission.request(()=>{
                        console.log("Push notification OK");
                        mainfunc();
                    },()=>{
                        console.log("Push notification NG");
                    });
                }

            },
            onclick_savepushsub : function (e) {
                var bkup = MYAPP.sns._accounts;
                MYAPP.sns.setAccount(this.select_subscription.account);
                MYAPP.sns.updatePushSubscription(this.select_subscription.alert)
                .then(result=>{
                    console.log("after updatePushSubscription=",result);
                })
                .finally(()=>{
                    var account = this.select_subscription.account;
                    if (!("alert" in account.others)) {
                        account.others["alert"] = {};
                    }
                    for (var obj in this.select_desktop.alert) {
                        account.others.alert[obj] = this.select_desktop.alert[obj];
                    }
                    MYAPP.sns.setAccount(bkup);
                    MYAPP.acman.checkVerify();
                    alertify.message(`${this.select_subscription.account.acct}:${_T("msg_save_pushsub")}`);
                });
            }
        }
    });

    /*ID("btn_reg_account").addEventListener("click", btn_reg_account_clicked, false);
    ID("txt_add_instance").addEventListener("keydown", function (e) {
        //console.log(e.keyCode);
        if ((e.keyCode == 13) ) {
            btn_reg_account_clicked();
        }
    });*/
    

    var istest = localStorage.getItem("callback_code");
    if (istest) {
        var eachload = (data) => {
            istest = JSON.parse(istest);
            var authCode = istest["code"];
            localStorage.removeItem("callback_code");
            MYAPP.acman.afterAddInstance(authCode)
            .then(result=>{
                MYAPP.afterLoadAccounts(data);
                var ac = MYAPP.acman.get({
                    "instance":MYAPP.session.status.selectedAccount.instance,
                    "idname" : MYAPP.session.status.selectedAccount.idname
                });
                if (!ac) ac = result.users[0];
                MYAPP.selectAccount(ac);
    
                for (var i = 0; i < result.users.length; i++) {
                    var tmpac = Object.assign({},result.users[i]);
                    //var tmp = JSON.stringify(MYAPP.acman.items[i]);
                    vue_accounts.accounts.push({
                        account : tmpac,
                        selected : false,
                    });
                    vue_accounts.accounts_config.push({
                        idname : tmpac.idname,
                        instance : tmpac.instance,
                        is_notification : false
                    });
                }

            });
            

        };
        MYAPP.acman.load().then(eachload,eachload);
    } else {


        //---if no account register, redirect /start
        MYAPP.acman.load().then(function (data) {
            MYAPP.acman.checkVerify();
            //var elem = ID("tbl_acc").tBodies[0];
            //var frag = document.createDocumentFragment();
            vue_accounts.translations = curLocale.messages;

            for (var i = 0; i < MYAPP.acman.items.length; i++) {
                var tmpac = Object.assign({},MYAPP.acman.items[i]);
                //var tmp = JSON.stringify(MYAPP.acman.items[i]);
                vue_accounts.accounts.push({
                    account : tmpac,
                    selected : false
                });
                vue_accounts.accounts_config.push({
                    idname : tmpac.idname,
                    instance : tmpac.instance,
                    is_notification : false
                });
            }
            //elem.appendChild(frag);
            //---account load
            var ac = MYAPP.acman.get({
                "instance":MYAPP.session.status.selectedAccount.instance,
                "idname" : MYAPP.session.status.selectedAccount.idname
            });
            if (!ac) ac = data[0];
            MYAPP.selectAccount(ac);
            MYAPP.afterLoadAccounts(data);
        }, function (flag) {
            appAlert(_T("msg_notlogin_myapp"), function () {
                var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
                window.location.replace(newurl);
            });
        });
        //ID("area_sel_account").classList.add("common_ui_off");
    }

})();
