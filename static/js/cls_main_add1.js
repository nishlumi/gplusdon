/**===========================================================================
 * Additionnal and Dependencies defines for App main class 
 * necessary **1st** include
 =============================================================================*/
function defineForMainPage(app) {
    app.commonvue["navibar"] = new Vue({
        el : "#frm_navleft",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            findtext : "",
            show_notif_badge : false,
            notif_badge_count : 0,

        },
        methods: {
            onclick_sidenavbtn : function (e) {
                MYAPP.commonvue.sidebar.drawer = !MYAPP.commonvue.sidebar.drawer;
            }
        },
    });
    app.commonvue["appdialog"] = new Vue({
        el : "#appverdlg",
        delimiters : ["{?", "?}"],
        data : {
            isappdialog : false,
        }
    });

    app.commonvue["cur_sel_account"] = new Vue({
        el : "#maincol_leftmenu",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            isappdialog : false,
            account : {},
            whole_notification : false,
            css : {
                colwidth : {
                    l3 : true,
                    l1 : false
                },
                bgred : {
                    red : false,
                }
            },
            menu_text : true
        },
        mounted : function(){
            this.$nextTick(()=>{
                this.menu_text = MYAPP.session.config.application.show_menutext;
                if (MYAPP.session.config.application.show_menutext) {
                    MYAPP.commonvue.cur_sel_account.css.colwidth.l3 = true;
                    MYAPP.commonvue.cur_sel_account.css.colwidth.l1 = false;
                    ID("maincol_rightmain").classList.add("l9");
                    ID("maincol_rightmain").classList.remove("l11");
                }else{
                    MYAPP.commonvue.cur_sel_account.css.colwidth.l3 = false;
                    MYAPP.commonvue.cur_sel_account.css.colwidth.l1 = true;
                    ID("maincol_rightmain").classList.remove("l9");
                    ID("maincol_rightmain").classList.add("l11");
                }

            });
        },
        computed : {
            
            acct : function(){
                return this.account.idname + "@" + this.account.instance;
            }
        },
        methods: {
            fullname : function (ac) {
                return `<span style="display:inline-block">${MUtility.replaceEmoji(ac.display_name,ac.instance,[],"14")}@${ac.instance}</span>`;
            },
            onclick_current_selaccount : function(e) {
                if (e.shiftKey) {
                    var url =`/accounts/${this.account.instance}/${this.account.idname}`;
                    location.href = url;
                    return;
                }
                if (!MYAPP.commonvue.nav_sel_account.isdialog_selaccount) {
                    if (this.$vuetify.breakpoint.xs) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "100%";
                    }else if (this.$vuetify.breakpoint.sm) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "100%";
                    }else if (this.$vuetify.breakpoint.md) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "50%";
                    }else if (this.$vuetify.breakpoint.lgAndUp) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "40%";
                    }

                }
                MYAPP.commonvue.nav_sel_account.isdialog_selaccount = !MYAPP.commonvue.nav_sel_account.isdialog_selaccount;
            },
            onclick_menulink : function (url) {
                location.href = url;
            },
            onclick_menulink2 : function () {
                MYAPP.forms.sidenav.close();
                MYAPP.commonvue.appdialog.isappdialog = true;
            },
        }
    });
    /*app.commonvue["leftmenu"] = new Vue({
        el : "#leftmenu_main",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            accounts : [],
        }
    });*/
    app.commonvue["sidebar"] = new Vue({
        el : "#slide-out",
        delimiters : ["{?", "?}"],
        data : {
            drawer : false,
            applogined : false,
            account : {},   //---This app's Account
            whole_notification : false,
        },
        computed : {
            acct : function(){
                return this.account.idname + "@" + this.account.instance;
            }
        },
        methods: {
            //---event handler--------------------
            onclick_current_selaccount : function(e) {
                MYAPP.forms.sidenav.close();
                if (!MYAPP.commonvue.nav_sel_account.isdialog_selaccount) {
                    if (this.$vuetify.breakpoint.xs) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "100%";
                    }else if (this.$vuetify.breakpoint.sm) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "100%";
                    }else if (this.$vuetify.breakpoint.md) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "50%";
                    }else if (this.$vuetify.breakpoint.lgAndUp) {
                        MYAPP.commonvue.nav_sel_account.dialog_width = "40%";
                    }

                }
                MYAPP.commonvue.nav_sel_account.isdialog_selaccount = !MYAPP.commonvue.nav_sel_account.isdialog_selaccount;
            },
            onclick_menulink : function (url) {
                location.href = url;
            },

            onclick_menulink2 : function () {
                MYAPP.forms.sidenav.close();
                MYAPP.commonvue.appdialog.isappdialog = true;
            },
        }
    });
    app.commonvue["nav_sel_account"] = new Vue({
        el : "#modal1", //"#nav_sel_account",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            dialog_width : "50%",
            accounts : [],
            isdialog_selaccount : false,
            uistyle : {
                primary : "red",
                bgcolor :  {
                    "grey lighten-3" : true
                }
            },
        },
        watch : {
            
        },
        mounted(){
            
        },
        methods: {
            setCurrentAccount : function(ac) {
                //var display_name = ac.display_name;
                //var instance = ac.instance;
                //ID("cursel_avatar").src = ac.rawdata.avatar;
                //ID("cursel_display_name").textContent = display_name + "@" + instance;
                //ID("cursel_avatar").setAttribute("data-tooltip",display_name + "@" + instance);
                if (ac) {
                    MYAPP.commonvue.sidebar.account = ac; //Object.assign({},ac);
                    MYAPP.commonvue.cur_sel_account.account = ac; //Object.assign({},ac);
                }else{
                    var newac = new Account();
                    MYAPP.commonvue.sidebar.account = newac;
                    MYAPP.commonvue.cur_sel_account.account = newac;
                }
            },
            /**
             * to check the count of all accounts notification 
             */
            checkAccountsNotification : function () {
                var ishit = false;
                for (var i = 0; i < this.accounts.length; i++) {
                    if (this.accounts[i].notifications.length > 0) {
                        ishit = true;
                        break;
                    }
                }
                MYAPP.commonvue.cur_sel_account.whole_notification = ishit;
                MYAPP.commonvue.cur_sel_account.css.bgred.red = ishit;
                MYAPP.commonvue.sidebar.whole_notification = ishit;
            },
            fullname : function (ac) {
                return `<span style="display:inline-block">${MUtility.replaceEmoji(ac.display_name,ac.instance,[],"14")}@${ac.instance}</span>`;
            },
            onclick_item : function(idname,instance) {
                /*console.log(e.target);
                var title = e.target.title;
                console.log(title);
                var v = title.split(",");*/

                MYAPP.selectAccount({"idname":idname, "instance":instance});
                //MYAPP.forms.modal1.close();
                this.isdialog_selaccount = false;

                //---reload each page contents
                //   /users
                if (ID("area_user")) {
                    vue_user.userview.loadUserInfo(ID("hid_uid").value,ID("hid_instance").value,{
                        api : {},
                        app : {}
                    });        
                }
                //   /tl
                if (ID("area_timeline")) {
                    barancerTimelineType(ID("hid_timelinetype").value,ID("hid_timelinetypeid").value);
                    vue_timeline.list.loadListNames();
                }
                
            }
        }
    });
    app.commonvue["nav_search"] = new Vue({
        el : "#frm_search",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            findtext : ""
        },
        methods : {
            onsubmit_search : function (e) {
                //--common search function

                /*if (vue_connections !== undefined) vue_connections.search.load_search(ID("inp_search").value,{});
                if (vue_instances !== undefined) vue_instances.search.onsubmit_search();*/
                //parentCommonSearch();
                if (ID("area_instance")) {
                    vue_instances.search.onsubmit_search(this.findtext);
                }
                if (ID("area_connections")) {
                    vue_connections.search.load_search(this.findtext,{
                        api : {},
                        app : {}
                    });                
                }
                if (ID("area_timeline")) {
                    location.href = `/s/${this.findtext}`;
                }
                if (ID("area_search")) {
                    location.href = `/s/${this.findtext}`;
                }
            },
            onclick_searchClear: function(e) {
                this.findtext = null;
            }
        }
    });
    app.commonvue["nav_btnbar"] = new Vue({
        el : "#nav_btnbar",
        delimiters : ["{?", "?}"],
        data : {
            applogined : false,
            items : [
                {key : "10", text : "hoge"}
            ],
            show_notif_badge : false,
            notif_badge_count : 0,
            
        },
        methods : {
            //---some function--------------------
            checkNotificationCount : function () {
                var ret = "";
                if (app.commonvue.nav_notification.currentAccount.notifications.length > 0) {
                    ret = "notifications";
                }else{
                    ret = "notifications_none";
                }
                return ret;
            },
            //---event handler--------------------
            onclick_notification : function (e) {
                var brk = this.$vuetify.breakpoint;
                if (!MYAPP.commonvue.nav_notification.dialog) {
                    var rect = e.target.getBoundingClientRect();
                    ID("ov_notif_menu").style.top = (rect.y+64) + "px";
                    ID("ov_notif_menu").style.right = (0) + "px";
                    //ID("ov_notif_menu").classList.remove("common_ui_off");
                    if (brk.xs === true) {
                        ID("ov_notif_menu").style.width = "100%";
                    }
                    
                    /*MYAPP.commonvue.nav_notification.gpstatus.splice(0,MYAPP.commonvue.nav_notification.gpstatus.length);
                    for (var i = 0; i < MYAPP.commonvue.nav_notification.notifications.length; i++) {
                        var d = new Gpstatus(MYAPP.commonvue.nav_notification.notifications[i].status,16);
                        MYAPP.commonvue.nav_notification.gpstatus.push(d);
                    }*/
                }
                ID("ov_notif").classList.toggle("common_ui_off");
                ID("ov_notif_menu").classList.toggle("scale-up-tr");        
                MYAPP.commonvue.nav_notification.dialog = !MYAPP.commonvue.nav_notification.dialog;
            },
            onclick_search : function (e) {
                MYAPP.commonvue.mbl_search.dialog = true;
            },
            onclick_refresh : function (e) {
                //---/tl
                if (Q(".timeline_body")) {
                    if (Q(".timelinebody")) {
                        Q(".tab-content.active").scroll({top:0, behavior:"smooth"});
                    }
                }
                //---/hashtag
                if (Q(".hashtag_body")) {
                    Q(".tab-content.active").scroll({top:0, behavior:"smooth"});
                }
                //---/notifications
                if (ID("area_notifications")){
                    var ac = vue_notifications.accounts[vue_notifications.current_itemID];
                    ac.notifications.splice(0,ac.notifications.length);
                    vue_notifications.loadNotifications(vue_notifications.accounts[vue_notifications.current_itemID],{
                        api:{
                            
                        },app:{
                            is_nomax : false,
                            is_nosince : false,

                        }
                    });
                }
                //---/s/*
                if (Q(".search_body")) {
                    MYAPP.sns.search(MYAPP.commonvue.nav_search.findtext,{
                        api : {
                            resolve : true
                        },
                        app : {
                            
                        }
                    })
                    .then(result=>{
                        vue_search.hashtags.tags = result.data.hashtags;
                        vue_search.accounts.accounts.splice(0,vue_search.accounts.accounts.length);
                        vue_search.accounts.load_accounts(result.data.accounts,{api:{},app:{}});
                        vue_search.accounts.tootes.statuses(0,vue_search.tootes.statuses.length);
                        vue_search.tootes.loadTimeline(result.data.statuses,{
                            api:{},
                            app:{
                                tltype : "tt_all"
                            }
                        });
                    });            
                }
            }
        }
    });
    app.commonvue["nav_notification"] = new Vue({
        el : "#ov_notif",
        delimiters : ["{?", "?}"],
        mixins : [vue_mixin_for_timeline],
        data : {
            dialog : false,
            applogined : false,
            boarding : 0,  //---window page: 0 - notification list, 1 - contents
            length : 3,
            currentAccount : { //---AccountNotification object
                account : null,
                notifications : []
            },  
            notifications : 0,
            //gpstatus : [],
            saveitem : null,
            translation : {},
            status : null,
            popuping : "ov_",
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
            globalInfo : {
				staticpath : ""
			},
            users : [],

            cons_savename : "gp_sv_notif"
        },
        watch : {
            /*currentAccount : {
                handler : function (newval,oldval) {
                    console.log(newval,oldval);
                    if (newval) {
                        this.notifications = newval.notifications.length;
                    }
                },
                deep : true
            }
            ,*/
            notifications : function (val) {
                if (val > 0) {
                    ID("navbtn_icon_notification").textContent = "notifications";
                    MYAPP.commonvue.nav_btnbar.notif_badge_count = val;
                    MYAPP.commonvue.nav_btnbar.show_notif_badge = true;
                }else{
                    ID("navbtn_icon_notification").textContent = "notifications_none";
                    MYAPP.commonvue.nav_btnbar.notif_badge_count = 0;
                    MYAPP.commonvue.nav_btnbar.show_notif_badge = false;
                }
            }
        },
        mounted(){
            this.globalInfo.staticpath = ID("hid_staticpath").value;

            //var hit = sessionStorage.getItem(this.cons_savename);
            //if (hit) {
            //    this.notifications = JSON.parse(hit);
                /*for (var i = 0; i < this.notifications.length; i++) {
                    var d = new Gpstatus(this.notifications[i].status,16);
                    this.gpstatus.push(d);
                }*/
            //}
        },
        methods : {
            //---some function--------------------
            next_page : function () {
                this.boarding = this.boarding + 1 === this.length
                ? 0
                : this.boarding + 1;
            },
            prev_page : function () {
                this.boarding = this.boarding - 1 < 0
                ? this.length - 1
                : this.boarding - 1;
            },
            judge_colorFromType : function (type) {
                var ret = {
                    red : false,
                    blue : false,
                    yellow : false,
                    green : false,
                    "white-text" : true,
                    "black-text" : false
                };
                if (type == "mention") {
                    ret.green = true;
                }else if (type == "reblog") {
                    ret.red = true;
                }else if (type == "favourite") {
                    ret.yellow = true;
                    ret["white-text"] = false;
                    ret["black-text"] = true;
                }else if (type == "follow") {
                    ret.blue = true;
                }
                return ret;
            },
            /**
             * 
             * @param {Account} account Mastodon's Notification.account
             */
            get_display_name_html :function (account) {
                var acc = account[0];
                var iconsize = 16;
                var inst = MUtility.getInstanceFromAccount(acc.url);
                var tmpname = acc.display_name == "" ? acc.acct : acc.display_name;
                tmpname = MUtility.replaceEmoji(tmpname,inst,acc.emojis,iconsize-2);

                var ret;
                if (account.length > 1) {
                    ret = _T("msg_notification_multi",[tmpname,account.length-1]);
                }else{
                    ret = _T("msg_notification_line",[tmpname]);
                }
                return ret;
            },
            get_translated_typename : function (type) {
                if (type == "reblog"){
                    return _T(`${type}_${MYAPP.session.config.application.showMode}`);
                }else if (type == "favourite") {
                    return _T(`${type}_${MYAPP.session.config.application.showMode}`);
                }else if (type == "follow") {
                    return _T(type);
                }else if (type == "mention") {
                    return _T(type);
                }else{
                    return "Unknown";
                }
            },
            get_type_icon : function (type) {
                if (type == "reblog"){
                    return "repeat";
                }else if (type == "favourite") {
                    return this.favourite_icon();
                }else if (type == "follow") {
                    return "person_add";
                }else if (type == "mention") {
                    return "alternate_email";
                }else{
                    return "unknown";
                }
            },
            favourite_icon : function () {
                if (MYAPP.session.config.application.showMode == "gplus") {
                    return "plus_one";
                }else if (MYAPP.session.config.application.showMode == "twitter") {
                    return "favorite";
                }else{
                    return "star";
                }
            },    
            remove_notification(id) {
                var hit = -1;
                if (typeof id == "number") {
                    hit = id;
                }else{
                    for (var i = 0; i < this.currentAccount.notifications.length; i++) {
                        if (this.currentAccount.notifications[i].id == id) {
                            hit = i;
                            break;
                        }
                    }
                }
                this.currentAccount.notifications.splice(hit,1);
                this.notifications = this.currentAccount.notifications.length;
                MYAPP.commonvue.nav_sel_account.checkAccountsNotification();
                //this.gpstatus.splice(hit,1);
            },
            save_notification() {
                MYAPP.acman.save();
            },
            push_notification(datas) {
                for (var i = datas.length-1; i >= 0; i--) {
                    console.log(i,datas[i]);
                    var data = datas[i];
                    //data.account = [data.account];
                    var ishit = this.currentAccount.notifications.filter(e=>{
                        if (data.id == e.id) {
                            return true;
                        }else{
                            return false;
                        }
                    });
                    if (ishit == 0) {
                        var ismerge = this.merge_notification(data);
                        if (!ismerge) {
                            /*
                            nav_notification.push_notification is 
                            new and unread notification only.
                            Therefore, always unshift to Array[0].
                            */
                            this.currentAccount.notifications.unshift(data);

                        }
                    }
                    this.notifications = this.currentAccount.notifications.length;
                }
                this.save_notification();
            },
            /**
             * merge same notification status object
             * @param {Notification} data Notification of Mastodon
             */
            merge_notification(data) {
                var ret = false;
                var cons_statusable = ["reblog","favourite","mention"];
                //---reblog, favourite, mention
                if (cons_statusable.indexOf(data.type) > -1) {
                    for (var i = 0; i < this.currentAccount.notifications.length; i++) {
                        var notif = this.currentAccount.notifications[i];
                        if (notif["status"]) {
                            //---insert account to same status notification
                            if ((notif.status.id == data.status.id) &&
                                (notif.type == data.type)
                            ) {
                                var ishitacc = notif.account.filter(e=>{
                                    if (data.account[0].id == e.id) {
                                        return true;
                                    }
                                    return false;
                                });
                                if (ishitacc.length == 0) {
                                    notif.account.push(data.account[0]);
                                    ret = true;
                                    break;
                                }
                            }
                        }
                    }
                }else{
                    //---follow
                    ret = false;
                }
                return ret;
            },
            generate_oneline_content : function (item) {
                var ret = "";
                if ("status" in item) {
                    var a = GEN("div");
                    a.innerHTML = item.status.content;
                    var tmptext = a.textContent;
                    ret = tmptext.substr(0,100);
                }
                return ret;
            },    
            //---event handler--------------------------
            onclick_ov_notif_overlay : function (e) {
                ID("ov_notif").classList.toggle("common_ui_off");
                ID("ov_notif_menu").classList.toggle("scale-up-tr");        
                MYAPP.commonvue.nav_notification.dialog = !MYAPP.commonvue.nav_notification.dialog;

            },
            onclick_notif_line : function (index) {
                if (index > -1) {
                    this.saveitem = this.currentAccount.notifications[index];
                    if (this.saveitem.type == "follow") {
                        path = MUtility.generate_userpagepath(this.saveitem.account[0]);
                        location.href = path;
                    }else{
                        this.status = null;
                        var d = new Gpstatus(this.saveitem.status,16);
                        this.status = d;
                        
                        MYAPP.sns.getConversation(d.body.id, d.id, "")
						.then((condata) => {
                            var context = condata.data;
                            for (var a = 0; a < context.ancestors.length; a++) {
                                var ance = context.ancestors[a];
                                var gcls = new Gpstatus(ance,14);
                    
                                context.ancestors[a] = gcls;
                    
                            }
                            for (var a = 0; a < context.descendants.length; a++) {
                                var desce = context.descendants[a];
                                var gcls = new Gpstatus(desce,14);
                    
                                context.descendants[a] = gcls;
                            }
                            this.status.ancestors = context.ancestors;
                            this.status.descendants = context.descendants;
                        })
                        .finally((a)=>{
                            this.$nextTick(()=>{
                                this.boarding++;
                            });
                        });

                    }
                }
            },
            onclick_notif_linebtn : function (index) {
                console.log("delete");
                this.remove_notification(index);
                this.save_notification();
            },
            onclick_clearall : function (e) {
                this.currentAccount.notifications.splice(0,this.currentAccount.notifications.length);
                this.notifications = this.currentAccount.notifications.length;
                this.save_notification();
                MYAPP.commonvue.nav_sel_account.checkAccountsNotification();
            },
            onclick_open_in_new_toot : function (status) {
                console.log("line click");

                var path;
                if (this.saveitem.type == "reblog"){
                    path = MUtility.generate_tootpath(status);
                }else if (this.saveitem.type == "favourite") {
                    path = MUtility.generate_tootpath(status);
                }else if (this.saveitem.type == "follow") {
                    path = MUtility.generate_userpagepath(status);
                }else if (this.saveitem.type == "mention") {
                    path = MUtility.generate_tootpath(status);
                }

                //---delete read notification and goto target page
                this.remove_notification(this.saveitem.id);
                this.save_notification();
                location.href = path;
            },
            onclick_current_clear : function (id) {
                this.remove_notification(id);
                this.save_notification();
                this.boarding--;
            }
        }
        
    });
    app.commonvue["mbl_search"] = new Vue({
        el : "#mbl_search",
        delimiters : ["{?", "?}"],
        data : {
            dialog : false,
            findtext : ""
        },

        methods : {
            onsubmit_search : function (e) {
                //--common search function
                this.dialog = false;

                /*if (vue_connections !== undefined) vue_connections.search.load_search(ID("inp_search").value,{});
                if (vue_instances !== undefined) vue_instances.search.onsubmit_search();*/
                //parentCommonSearch();
                if (ID("area_instance")) {
                    vue_instances.search.onsubmit_search(this.findtext);
                }
                if (ID("area_connections")) {
                    vue_connections.search.load_search(this.findtext,{
                        api : {},
                        app : {}
                    });                
                }
                if (ID("area_timeline")) {
                    location.href = `/s/${this.findtext}`;
                }
                if (ID("area_search")) {
                    location.href = `/s/${this.findtext}`;
                }
            },
            onclick_searchClear: function(e) {
                this.findtext = null;
            }
        }
    });
    app.commonvue["bottomnav"] = new Vue({
        el : "#bottomnav",
        delimiters : ["{?", "?}"],
        data : {
            activeBtn : 0,
            showNav : false,
            oldsa : 0,
            idpath : [
                "tl",
                "connections",
                "notifications"
            ]
        },

        methods : {
            onclick_accounts : function (e) {
                MYAPP.commonvue.cur_sel_account.onclick_current_selaccount(e);
            },
            onclick_btn : function (id) {
                location.href = `/${this.idpath[id]}`;
            },
            checkScroll : function (cursa) {
                if (!this.$vuetify.breakpoint.smAndDown) return;
                if (cursa >= this.oldsa) {
                    //---to top
                    this.showNav = true;
                    ID("post_btn_area").classList.add("postbtn_scrollup");
                    ID("post_btn_area").classList.add("postbtn_scroll");
                }else{
                    //---to bottom
                    this.showNav = false;
                    ID("post_btn_area").classList.remove("postbtn_scrollup");
                    ID("post_btn_area").classList.remove("postbtn_scroll");
                }
                this.oldsa = cursa;
            }
        }
    }),
    app.commonvue["usercard"] = new Vue({
        el : "#ov_user",
        delimiters : ["{?", "?}"],
        data : {
            translation : {
                stat_statuses : _T("stat_statuses"),
                stat_following : _T("stat_following"),
                stat_follower : _T("stat_follower")
            },
            selected : null,   //---Mastodon's Account
            relationship : null,
            globalInfo : {
                firstPath : ""
            },
        },
        methods : {
            onmouseleave_card : function(e){
                ID("ov_user").classList.add("common_ui_off");
                ID("ov_user").classList.remove("scale-up-tl");
            }
        }
    });
    app.commonvue["tootecard"] = new Vue({
        el : "#ov_toote",
        delimiters : ["{?", "?}"],
        mixins : [vue_mixin_for_timeline],

        data : {
            is_overlaying : false,

            fullscreen : false,
            isfull_toolbar : false,
            activewidth : "50%",
            
            translations : curLocale.messages,
            status : null,
            popuping : "ov_",
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
            globalInfo : {
                staticpath : app.appinfo.staticPath
            },
        },
        watch : {
            is_overlaying : function (val) {
                if (!val) {
                    this.status = {};

                    //---change URL
                    if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
                        MUtility.returnPathToList(MYAPP.session.status.currentLocation);
                    }
                }
            }
        },
        methods : {
            onclick_overlay : function (e){
                //======old: the element moving mode
                
                //======new: Vue data format mode
                this.status = {};

                //Q(".onetoote_screen").classList.toggle("common_ui_off");
                this.is_overlaying = false;

                //---change URL
                if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
                    MUtility.returnPathToList(MYAPP.session.status.currentLocation);
                }
            },
            onclick_tootearea : function (e) {
                e.stopPropagation();
            },
            onclick_close : function (e) {
                this.is_overlaying = false;
            },
            onclick_scrolltop : function (e) {
                Q(".onetoote_cardtext").scroll({top:0, behavior:"smooth"});
            },
            sizing_window(){
                var breakpoint = this.$vuetify.breakpoint;
                var ju_width = "";
                var ju_fullscreen = false;
                var ju_toolbar = false;
                if (breakpoint.lgAndUp) {
                    ju_width = "70%";
                    ju_fullscreen = false;
                }else if (breakpoint.md) {
                    if (breakpoint.mdAndDown) {
                        if (breakpoint.mdAndUp) {
                            ju_width = "70%";
                            ju_fullscreen = false;        
                        }else{
                            ju_width = "90%";
                            ju_fullscreen = false;
                        }
                    }else{
                        ju_width = "70%";
                        ju_fullscreen = false;        
                    }
                }else if (breakpoint.smAndDown) {
                    ju_toolbar = true;
                    if (breakpoint.smAndUp) {
                        if (breakpoint.height > breakpoint.width) {
                            ju_width = "90%";
                            ju_fullscreen = false;
                        }else{
                            ju_fullscreen = true;    
                        }
                    }else{
                        ju_width = "100%";
                        ju_fullscreen = true;
                    }
                }else{
                    ju_width = "70%";
                    ju_fullscreen = false;
                }
                this.isfull_toolbar = ju_toolbar;
                this.activewidth = ju_width;
                this.fullscreen = ju_fullscreen;
            },
        }
    });
    app.commonvue["imagecard"] = new Vue({
        el : "#imagescreen",
        delimiters : ["{?", "?}"],
        data : {
            imgdialog : false,
            item : null,
            
        },
        methods : {
            
        }
    });
    /*
    app.commonvue["mapviewer"] = new Vue({
        el : "#mapviewer",
        delimiters : ["{?", "?}"],
        data : {
            dialog : false,
            toote : null,
            geomap : null,
            isfirst : true,
        },
        mounted() {
            var OsmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
            latlng = L.latLng(35.6811, 139.7671);

            this.geomap = L.map("mv_map", {
                center: latlng, dragging : true, zoom: 18,layers: [Osm]});
            console.log("geomap=",this.geomap);
            
            //---re-calculate location mark

            
        },
        Updated() {
            if (this.isfirst) {
                this.isfirst = false;
            }
        },
        methods : {
            set_data : function (item) {
                this.toote = item;

                var locs = this.toote.geo.location;
                for (var i = 0; i < locs.length; i++) {
                    var loc = locs[i];
                    var marker = L.marker({lat:loc.lat,lng:loc.lng},{icon:redIcon}).addTo(this.geomap);
                    marker.on("click",(ev)=>{
                        //ev.sourceTarget.remove();
                        //this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}`;
                    });
                    marker.bindPopup(`${loc.lat},${loc.lng}`);
                }
            },
            onclick_selloco : function (item) {
                if (this.geomap) {
                    this.geomap.setView({ lat:item.lat, lng: item.lng });
                }
            },
            onclick_close : function () {
                this.dialog = false;
            }
    
        }
    });*/


    app["setupMainPageElement"] = function() {
        //------------------------------------------------
        //  navigation bar
        //$('.sidenav').sidenav();
        /*window.onunload = function(){
            navigator.serviceWorker.getRegistration()
            .then(registration => {
                registration.unregister();
            })
        }*/
        this.forms["sidenav"] = M.Sidenav.init(Q('.sidenav'),{});
        ID("sidenav_btn").addEventListener("click",function(e){
            MYAPP.forms.sidenav.open();
            e.stopPropagation();
        });
        ID("img_brand").addEventListener("click", function (e) {
            /*var elems = document.querySelectorAll("#maincol_leftmenu div.collection a.collection-item span");
            for (var i = 0; i < elems.length; i++) {
                elems[i].classList.toggle("user-slideOutLeft");
            }*/
            MYAPP.commonvue.cur_sel_account.menu_text = !MYAPP.commonvue.cur_sel_account.menu_text;
            MYAPP.commonvue.cur_sel_account.css.colwidth.l3 = !MYAPP.commonvue.cur_sel_account.css.colwidth.l3;
            MYAPP.commonvue.cur_sel_account.css.colwidth.l1 = !MYAPP.commonvue.cur_sel_account.css.colwidth.l1;
            //ID("maincol_leftmenu").classList.toggle("l3");
            //ID("maincol_leftmenu").classList.toggle("l1");
            ID("maincol_rightmain").classList.toggle("l9");
            ID("maincol_rightmain").classList.toggle("l11");

            MYAPP.session.config.application.show_menutext = !MYAPP.session.config.application.show_menutext;
            MYAPP.session.save(true);
            e.stopPropagation();
        });
        /*var menu = document.querySelector("#maincol_leftmenu div.collection a.menu_parent, #slide-out");
        if (menu) {
            menu.addEventListener("click", function (e) {
                var elem = document.querySelectorAll("#maincol_leftmenu div.collection a.maincol_menu.menu_sub");
                for (var i = 0; i < elem.length; i++) {
                    elem[i].classList.toggle("common_ui_off");
                }
            });
        }*/
        console.log(Qs(".nav-wrapper .navcol-left, .navcol-right"));
        var es = Qs(".nav-wrapper .navcol-left, .navcol-right");
        var scrollOpt = {
            duration: 300,
            offset: 0,
            easing: "linear"
        };
        for (var i = 0; i < es.length; i++) {
            var elem = es[i];
            elem.addEventListener("click",function(e){
                var elemName = "";
                //---/index
                if (Q(".view_area")) {
                    //Q(".view_area").scroll({top:0, behavior:"smooth"});
                    elemName = ".view_area";
                }
                //---/accounts/:instance/:idname
                //---/users/:instance/:idname
                if (Q(".account_body")) {
                    //Q(".account_body").scroll({top:0, behavior:"smooth"});
                    elemName = ".account_body";
                }
                //---/connections
                if (ID("following")) {
                    //ID("following").scroll({top:0, behavior:"smooth"});
                    elemName = "#following";
                }
                if (ID("follower")) {
                    //ID("follower").scroll({top:0, behavior:"smooth"});
                    elemName = "#follower";
                }
    
                //---/tl
                if (Q(".timeline_body")) {
                    if (Q(".timelinebody")) {
                        //Q(".tab-content.active").scroll({top:0, behavior:"smooth"});
                        elemName = ".tab-content.active";
                    }
                }
                //---/notifications
                if (Q(".notifcation_body")) {
                    //ID(vue_notifications.tabvalue).scroll({top:0, behavior:"smooth"});
                    elemName = ".notifcation_body";
                }
                //MYAPP.commonvue.nav_btnbar.$vuetify.goTo(Q(elemName),scrollOpt);
                if (elemName != "") {
                    Q(elemName).scroll({top:0,behavior: "smooth"});
                }
                e.stopPropagation();
            },false);
        }
        ID("navbtn_refresh").addEventListener("click",function(e){
            //---/tl
            if (Q(".timelinebody")) {
                var tabs = M.Tabs.getInstance(Q(".tabs"));
                var atab = Q(".tab .active");
                if (tabs) {
                    tabs.select(atab.hash.replace("#",""));
                }
            }
            e.stopPropagation();
        },false);
    
    
        //------------------------------------------------
        //  overlay and dialog
    
        
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems, {
        });
        //this.forms["modal1"] = M.Modal.getInstance(ID("modal1"));
    
    
        //---toote popup for detail
        
    
        //---user popup card
        ID("ov_user").addEventListener("mouseleave",function(e){
            ID("ov_user").classList.add("common_ui_off");
            ID("ov_user").classList.remove("scale-up-tl");
        });
        /*Q("#ov_user > div").addEventListener("mouseleave",function(e){
            ID("ov_user").classList.add("common_ui_off");
            ID("ov_user").classList.remove("scale-up-tl");
        });*/
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems, {
            enterDelay : 500
        });
    
        //---toot modal
        ID("btn_post_toote").addEventListener("click",function(e){
            //MYAPP.forms["inputtoot"].open();
            console.log(e);
            MYAPP.setupInstanceAdditionalData();
            var defsel = MYAPP.session.status.selectedAccount.idname + "@" + MYAPP.session.status.selectedAccount.instance;
            MYAPP.commonvue.inputtoot.selaccounts.splice(0,MYAPP.commonvue.inputtoot.selaccounts.length);
            MYAPP.commonvue.inputtoot.selaccounts.push(defsel);
            MYAPP.commonvue.inputtoot.$refs.inputbox.set_selectaccount();
            if (e.shiftKey) {
                MYAPP.commonvue.inputtoot.onclick_openInNew();
                return;
            }
            if (MYAPP.session.config.action.popupNewtoot_always) {
                MYAPP.commonvue.inputtoot.onclick_openInNew();
                return;
            }
            
            MYAPP.commonvue.inputtoot.sizing_window();

            MYAPP.commonvue.inputtoot.dialog = true;
            
            
        });
    
    }
 }
