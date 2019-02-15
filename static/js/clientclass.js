

/**===========================================================================
 * App main class
 =============================================================================*/
class Gplusdon {
    constructor() {
        var hidinfo = ID("hid_appinfo").value.split(",");
        var cstappinfo = {
            name: hidinfo[1],
            firstPath : "",
            staticPath : ID("hid_staticpath").value,
            author: hidinfo[2],
            version: hidinfo[3],
            revision : "20190215-02",
            config : {
                limit_search_instance : 50,
                toot_max_character : 500,
                toot_warning_number : 490,
            }
        };
        this.appinfo = cstappinfo;

        this.siteinfo = {
            cke : "_gp_logined",
            lancke : "_gp_lang",
            srv_inst : "mastodon.cloud",
            key: "",
            secret: "",
            token: "",
            appurl : "https://gplusdon.net",
            //redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
            redirect_uri : "/redirect",
            scopes: ["read", "write", "follow","push"],
            ggl : {
                ak : hidinfo[4],
                ci : hidinfo[5]
            },
            yh : hidinfo[6],
            mab : hidinfo[7]
        };
        
        this.acman = new AccountManager();

        //---for no login user (call no-auth API)
        this.server_account = new Account();
        this.is_serveronly = false;

        this.session = new Gpsession();
        //---if session data from before page, load it.
        this.session.load(true);
        this._sns = new Gpsns();

        var locquery = MUtility.generate_searchQuery(location.search)
        this.session.status.urlquery = location.search;
        this.session.status.urlqueryObject = locquery;
        setupLocale(locquery);
        this.forms = {};
        
        this.commonvue = {
        };
        this.userstore = new Gsuserstore();
        /*this.session.config.action.tags.forEach(e=>{
            this.commonvue.inputtoot.tags.push(e);
        });*/
        if ("defineForMainPage" in window) {
            defineForMainPage(this);
            this.commonvue.usercard.globalInfo.firstPath = this.appinfo.firstPath;
        }
        if ("defineForTootPage" in window) defineForTootPage(this);
        
    }
    get sns(){
        return this._sns;
    }
    checkSession() {
        console.log(this.session.status);
        if (this.session.status.showingAccount.idname == "") {
            //this.session.status.showingAccount.data = this.acman.items[0];
            this.session.status.showingAccount.idname = this.acman.items[0].idname;
            this.session.status.showingAccount.instance = this.acman.items[0].instance;

        }
        if (this.session.status.selectedAccount.idname == "") {
            this.session.status.selectedAccount.idname = this.acman.items[0].idname;
            this.session.status.selectedAccount.instance = this.acman.items[0].instance;
        }
        /*var tmpac = MYAPP.acman.get({
            idname : this.session.status.showingAccount.idname,
            instance : this.session.status.showingAccount.instance
        });
        this.sns.setAccount(tmpac);*/
    }
    afterLoadAccounts(data){
        //---set up login status to left menu and side bar
        if ("cur_sel_account" in this.commonvue) this.commonvue.cur_sel_account.applogined = true;
        if ("sidebar" in this.commonvue) this.commonvue.sidebar.applogined = true;
        if ("nav_search" in this.commonvue) this.commonvue.nav_search.applogined = true;
        if ("nav_btnbar" in this.commonvue) this.commonvue.nav_btnbar.applogined = true;
        if ("navibar" in this.commonvue) this.commonvue.navibar.applogined = true;

        if ("nav_notification" in this.commonvue) {
            this.commonvue.nav_notification.applogined = true;
            this.commonvue.nav_notification.translations = Object.assign({},curLocale.messages);
            this.commonvue.nav_notification.globalInfo.firstPath = this.appinfo.firstPath;
        }


        var is_nav_sel_account = ("nav_sel_account" in this.commonvue);
        if (is_nav_sel_account) this.commonvue.nav_sel_account.accounts.splice(0,this.commonvue.nav_sel_account.accounts.length);
        var inputtoot = ("inputtoot" in this.commonvue);
        for (var i = 0; i < data.length; i++) {
            var obj = Object.assign({},data[i]);
            if (is_nav_sel_account) this.commonvue.nav_sel_account.accounts.push(obj);
            if (inputtoot)  this.commonvue.inputtoot.accounts.push(obj);
        }
    }
    /**
     * choose current active account
     * @param {JSON} key 
     */
    selectAccount(key) {
        var tmpac;
        if (key instanceof Account) {
            tmpac = key;
        }else{
            tmpac = this.acman.get(key);
        }
        if (tmpac) {
            //var ac = JSON.stringify(tmpac);
            //var ac2 = JSON.parse(ac);
            this.session.status.selectedAccount.idname = tmpac.idname;
            this.session.status.selectedAccount.instance = tmpac.instance;

            if (this.session.status.selectedAccount.idname != "") {
                //ID("nav_sel_account").value = `${ac2.idname},${ac2.instance}`;
                //if ("sidebar" in this.commonvue) this.commonvue.sidebar.account = ac2;
                this.sns.setAccount(tmpac);
                console.log("tmpac=",tmpac);
                if ("nav_sel_account" in this.commonvue) this.commonvue.nav_sel_account.setCurrentAccount(tmpac);
                this.session.save(true);

                //---notification setting
                var notifAccount = new AccountNotification(tmpac);
                notifAccount.notifications = notifAccount.account.notifications;
                if ("nav_notification" in this.commonvue) {
                    //---remove old connected account.stream
                    if (this.commonvue.nav_notification.currentAccount.account) {
                        this.commonvue.nav_notification.currentAccount.account.stream.setTargetNotification(null);
                        this.commonvue.nav_notification.currentAccount.account.stream.setTargetTimeline(null);
                        for (var obj in this.commonvue.nav_notification.currentAccount.account.streams) {
                            this.commonvue.nav_notification.currentAccount.account.streams[obj].stop();
                            this.commonvue.nav_notification.currentAccount.account.streams[obj].setTargetTimeline(null);
                        }
                        this.commonvue.nav_notification.notifications = 0;
                    }
                    this.commonvue.nav_notification.currentAccount = null;
                    //---to connect new account.stream
                    this.commonvue.nav_notification.currentAccount = notifAccount;
                    this.commonvue.nav_notification.notifications = notifAccount.notifications.length;
                    notifAccount.account.stream.setTargetNotification(this.commonvue.nav_notification);
                }
                if ("nav_sel_account" in MYAPP.commonvue) MYAPP.commonvue.nav_sel_account.checkAccountsNotification();


                //---set up each page
                if (Q(".timeline_body")) {
                    //---if timeline page, connect timeline element
                    notifAccount.account.stream.setTargetTimeline(vue_timeline.home);
                    notifAccount.account.streams.list.setTargetTimeline(vue_timeline.list);
                    //notifAccount.account.streams.list.start();
                    notifAccount.account.streams.local.setTargetTimeline(vue_timeline.local);
                    //notifAccount.account.streams.local.start();
                    notifAccount.account.streams.public.setTargetTimeline(vue_timeline.public);
                    //notifAccount.account.streams.public.start();
                
                }
                if (Q(".hashtag_body")) {
                    notifAccount.account.streams.tag.setTargetTimeline(vue_timeline.tag);
                    notifAccount.account.streams.taglocal.setTargetTimeline(vue_timeline.taglocal);
                }
                if (Q("#area_account")) {
                    notifAccount.account.stream.setTargetTimeline(vue_user.tootes);
                    notifAccount.account.stream.isme = true;
                }
                if (Q("#area_user")) {
                    //---rapidly open and show user data
                    var serverdata = JSON.parse(ID("hid_userdata").value);
                    console.log(serverdata);
                    if ("acct" in serverdata) {
                        vue_user.userview.loadUserInfoDirect(serverdata);
                    }else{
                        vue_user.userview.loadUserInfo(ID("hid_uid").value,ID("hid_instance").value,{
                            api : {},
                            app : {}
                        });
                    }
                    
                }
                if (Q(".connections_body")) {
                    var targetpath = "";
                    vue_connections.tabbar.locked = tmpac.rawdata.locked;
                    vue_connections.tabbar.load_tabStates(tmpac);

                    vue_connections.tabbar.following_count = tmpac.rawdata.following_count;
                    vue_connections.tabbar.follower_count = tmpac.rawdata.followers_count;
                    vue_connections.tabbar.followRequest_count = 0;
            
                    var defsel = ID("hid_page").value;
                    if (ID("hid_page").value == "finder") {
                        vue_connections.suggestion.accounts.splice(0,vue_connections.suggestion.accounts.length);
                        vue_connections.suggestion.load_suggestion({api:{},app:{}});
                    }else if (ID("hid_page").value == "list") {
                        vue_connections.list.load_listmember({api:{},app:{}});
                        MYAPP.setGeneralTitle(_T("list"));
                    }else if (ID("hid_page").value == "frequest") {
                        vue_connections.frequest.accounts.splice(0,vue_connections.frequest.accounts.length);
                        vue_connections.frequest.load_followRequest({api:{},app:{}});
                        MYAPP.setGeneralTitle(_T("con_tab_followrequest"));
                        defsel = "following";
                    }else if (ID("hid_page").value == "following") {
                        vue_connections.following.accounts.splice(0,vue_connections.following.accounts.length);
                        vue_connections.following.load_following({api:{},app:{}});
                    }else if (ID("hid_page").value == "follower") {
                        vue_connections.follower.accounts.splice(0,vue_connections.follower.accounts.length);
                        vue_connections.follower.load_follower({api:{},app:{}});
                    }
                    thisform.tab.select(defsel);
                }
                if (Q(".search_body")) {
                    MYAPP.sns.search(MYAPP.commonvue.nav_search.findtext,{
                        api : {
                            resolve : true
                        },
                        app : {
                            
                        }
                    })
                    .then(result=>{
                        //vue_search.accounts.accounts = result.data.accounts;
                        vue_search.hashtags.tags = result.data.hashtags;
                        //vue_search.tootes.statuses = result.data.statuses;
                        vue_search.accounts.accounts.splice(0,vue_search.accounts.accounts.length);
                        vue_search.accounts.load_accounts(result.data.accounts,{api:{},app:{}});
                        vue_search.tootes.statuses.splice(0,vue_search.tootes.statuses.length);
                        vue_search.tootes.loadTimeline(result.data.statuses,{
                            api:{},
                            app:{
                                tltype : "tt_all"
                            }
                        });
                    });            
                }
                if (Q(".dmsg_body")) {
                    vue_direct.account = tmpac;
                    //vue_direct.selaccounts.splice(0,vue_direct.selaccounts.length);
                    //vue_direct.selaccounts.push(`${vue_direct.account.idname}@${vue_direct.account.instance}`);

                    vue_direct.contacts.splice(0,vue_direct.contacts.length);
                    vue_direct.load_for_contact();
                    tmpac.directlst = JSON.original(vue_direct.contacts);
                    vue_direct.clear_dmsg_tl();

                }
                //this.session.createStream("user",null,this.commonvue.nav_notifications);
            }
            return tmpac;
        }
        return null;
    }
    setGeneralTitle(title) {
        ID("general_title").innerHTML = title;
        ID("general_title").setAttribute("data-tooltip",title);
    }
    /**
     * Set up all common elements for all page (exclude appinitial.html)
     */
    setupCommonElement() {
        Vue.use(Vuetify, {
            theme: {
                primary: "#F44336",
                secondary: "#EF5350",
                accent: "#3F51B5",
                error: "#E91E63",
                warning: "#ffeb3b",
                info: "#2196f3",
                success: "#4caf50"
            }
        });
        document.execCommand("DefaultParagraphSeparator", false, "br");

        //---if page other than win_toot, execute this.
        if ("setupMainPageElement" in MYAPP) MYAPP.setupMainPageElement();

        //---all page, execute this
        if ("setupTootPageElement" in MYAPP) MYAPP.setupTootPageElement();

        //---below was moved---
        return;
        

    }
    showUserCard(rect,userdata){
        //if (ID("ov_user").classList.contains("common_ui_off")) {
            //var rect = e.currentTarget.getBoundingClientRect();
            this.commonvue.usercard.selected = userdata.account;
            this.commonvue.usercard.relationship = userdata.relationship;
            //popup_ovuser.options.startingTop = rect.y;
            this.commonvue.usercard.$nextTick(function(){

                ID("ov_user").style.top = rect.y + "px";
                ID("ov_user").style.left = rect.x + "px";
                ID("ov_user").classList.remove("common_ui_off");
                ID("ov_user").classList.add("scale-up-tl");
            });
        //popup_ovuser.open();
        //}
    }
    showPostCtrl(flag) {
        if (flag) {
            ID("btn_post_toote").classList.remove("common_ui_off");
        }else{
            ID("btn_post_toote").classList.add("common_ui_off");
        }
    }
    showBottomCtrl(flag) {
        if (flag) {
            //ID("btn_post_toote").classList.remove("common_ui_off");
            //if (MYAPP.commonvue.bottomnav.$vuetify.breakpoint.mdAndUp) return;
            ID("bottomnav").classList.remove("common_ui_off");
        }else{
            //ID("btn_post_toote").classList.add("common_ui_off");
            //if (MYAPP.commonvue.bottomnav.$vuetify.breakpoint.mdAndUp) return;
            ID("bottomnav").classList.add("common_ui_off");
        }
    }
    setupCommonTranslate(){
        //------tranlation for common elements of all pages
        //---navigation bar
        ID("inp_search").placeholder = _T("search any");

        var elems = Qs("#box_navright_btns a");
        elems[0].title = _T("search");
        elems[1].title = _T("notification");
        elems[2].title = _T("reload");
        elems[3].title = _T("other menu");

        elems = Qs("#maincol_leftmenu .collection a span");
        var tmparr = [_T("Dashboard"),_T("Accounts"),
            _T("Timeline"),_T("Home"),_T("List"),_T("Local"),_T("Public"),
            _T("Connection"),_T("Direct message"),_T("Favourites"),
            _T("Lists"),_T("Settings")
        ];
        /*for (var i = 1; i < tmparr.length; i++) {
            elems[i].textContent = tmparr[i];
        }*/
        //---sidenav

    }
    setupInstanceAdditionalData(){
        for (var obj in this.acman.instances) {
            var ins = this.acman.instances[obj];
            var len_emoji = 0;
            for (var e in ins.emoji.data) {
                len_emoji++;
            }
            this.commonvue.emojisheet.emojis_title.instances.push({
                type : "inst",
                text : obj,
                group : _T("instances"),
                start : 0,
                end : len_emoji
            });

        }
    }
    calcMentionLength(arr){
        var fnlarr = [];
        for (var i = 0; i < arr.length; i++) {
            var tmp = arr[i].split("@");
            /*
                @hoge@mstdn.jp
                    0   1     2
                ->  "", hoge, mstdn.jp
                */
            fnlarr.push("@" + tmp[1]);
        }
        return fnlarr;
    }
    extractTootInfo(content) {
        var tmp = GEN("div");
        tmp.innerHTML = content.replace(/invisible/g,"");
        tmp.style.whiteSpace = "pre-wrap";

        var frag = document.createDocumentFragment();
        frag.append(tmp);
        var tmparea = ID("temporary_area");
        tmparea.innerHTML = "";
        tmparea.appendChild(frag);

        var text = tmparea.innerText;
        var contentText = tmp.textContent;
        if (text.endsWith("\n")) {
            text = text.substr(0,text.length-1);
        }

        var mentionReg = new RegExp("(?:\@[a-zA-Z0-9]+\@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*|@[a-zA-Z0-9]+)","g");
        var resultMentions = text.match(mentionReg);
        if (resultMentions) {
            for (var i = 0; i < resultMentions.length; i++) {
                var e = resultMentions[i];
                e = e.replace("@","");
            };
        }else{
            resultMentions = [];
        }
        //console.log(`text=[${text}]`,resultMentions);

        //---geo tag ( geo:35.3939,139.3939?z=5&n=%39%49%96 )
        var geoReg = new RegExp("(?:geo:([a-zA-Z0-9.,?=&$%\(\)//]|[^\x01-\x7E])+)","g");
        var tmpgeo = text.match(geoReg);
        var resultGeo = {
            enabled : false,
            location : [],
        };
        //{
        //    enabled : false,
        //    [
        //    lat:0, lng:0, zoom:1, name:""
        //    ],... 
        //};
        if (tmpgeo) {
            for (var i = 0; i < tmpgeo.length; i++) {
                var onegeo = tmpgeo[i];
                var tmpa = GEN("a");
                tmpa.href = onegeo;
                var asearch = MUtility.generate_searchQuery(tmpa.search);


                onegeo = onegeo.replace("geo:","");
                var arr = onegeo.split("?");
                var arr2 = arr[0].split(",");
                var fnlgeo = {lat:0, lng:0, zoom:1, name:""};
                if (arr2.length >= 2) {
                    fnlgeo.lat = arr2[0];
                    fnlgeo.lng = arr2[1];
                    fnlgeo.zoom = asearch["z"];
                    fnlgeo.name = decodeURIComponent(asearch["n"]);
                    
                    resultGeo.location.push(fnlgeo);
                    resultGeo.enabled = true;

                }
            }
        }

        var ret = {
            text : text,
            mentions : resultMentions, //twttr.txt.extractMentions(text),
            tags : twttr.txt.extractHashtags(text),
            urls : twttr.txt.extractUrls(text),
            geo : resultGeo
        }
        //console.log(ret);
        tmparea.removeChild(tmp);
        return ret;
    }
    /**
     * 
     * @param {String} content toot body text
     * @param {Object} options toot options
     * @return {Object} cd - erro code, msg - error message 
     */
    checkPostBefore(content,options) {
        var len = twttr.txt.getUnicodeTextLength(content);

        if (len <= 0) {
            return {
                cd : "pst02",
                msg : "no content"
            };
        }

        return {
            cd : "",
            msg : ""
        };
    }
    /**
     * 
     * @param {Account} account Account class instance
     * @param {File} data Media file object
     * @param {Object} options parameters
     * @return {Object} parameter Account and Mastodon's Attachment object
     */
    uploadMedia(account,data,options) {
        var def = new Promise((resolve, reject)=>{
            if (!account) {
                reject(false);
                return;
            }
            var fnlopt = {
                api : {},
                app : {}
            };
            if ("comment" in options) {
                fnlopt.api["description"] = options["comment"];
            }
            if ("focus" in options) {
                fnlopt.api["focus"] = options["focus"];
            }
            fnlopt.api["file"] = data;
            console.log("fnlopt=",fnlopt);

            //---test
            /*resolve({
                "filename" : data.name,
                "account" : account,
                "data" : {"id":"dummy","url":"hogehoge"}
            });*/
            //---test
            var bkupac = MYAPP.sns._accounts;
            MYAPP.sns.setAccount(account);
            
            MYAPP.sns.postMedia(fnlopt)
            .then(result=>{
                resolve({
                    "filename" : options.filename,
                    "account" : account,
                    "data" : result
                });
            },error=>{
                console.log(error);
            })
            .catch(error=>{
                alertify.error("Failed: Update media file.");
                
                reject(error);
            })
            .finally( ()=>{
                MYAPP.sns.setAccount(bkupac);
            });

        });

        return def;
    }
    executePost(content,options){
        var def = new Promise((resolve,reject)=>{
            //---check an error
            var convScope = {
                "tt_public" : "public",
                "tt_tlonly" : "unlisted",
                "tt_private" : "private",
                "tt_direct" : "direct"
            };
            console.log("executePost=",content,options);
            var chk = this.checkPostBefore(content,options);
            if (chk.cd != "") {
                reject(chk);
            }
            var post_opt = {
                status : content
            }

            //---get and cut Contents-Warning word
            var cwpos = content.indexOf("-cw-");
            if (cwpos > -1) {
                post_opt["spoiler_text"] = content.substr(0,cwpos);
                post_opt.status = content.substr(cwpos+4,content.length);
            }

            //---get medias
            if (options.media.length > 0) {
                post_opt["media_ids"] = options.media;

                if (options.nsfw) {
                    post_opt["sensitive"] = true;
                }
            }

            //---decide scope
            post_opt["visibility"] = convScope[options["scope"].value];

            //---if reply
            if ("in_reply_to_id" in options) {
                post_opt["in_reply_to_id"] = options.in_reply_to_id;
            }

            //---start post
            var backupac = MYAPP.sns._accounts;
            MYAPP.sns.setAccount(options.account);
            MYAPP.sns.postStatus({api : post_opt, app : {}})
            .then(result=>{
                alertify.success(`${options.account.acct}:${_T("post_msg01")}`);

                resolve(result);
            })
            .catch(error=>{
                alertify.error(`${options.account.acct}:${_T("post_msg02")}`);
                console.log("err=",error);
                reject({error:error,flag:false});
            })
            .finally(()=>{
                MYAPP.sns.setAccount(backupac);
            });
            
        });
        return def;
    }
    createNewTootTemplate() {
        return {
            selaccounts : [],
            selsharescope : "",
            mentions : [],
            selmentions : [],
            seltags : [],
            status_text : [],
            medias : []
        };
    }
    callNewToot(options) {
        var savedata = {
            accounts : JSON.original(options.selaccounts),
            scope : JSON.original(options.selsharescope),
            mentionlist : JSON.original(options.mentions),
            mentions : JSON.original(options.selmentions),
            tags : JSON.original(options.seltags),
            text : JSON.original(options.status_text),
            medias : JSON.original(options.medias)
        };
        localStorage.setItem(MYAPP.commonvue.inputtoot.CNS_SAVENAME,JSON.stringify(savedata));
        MYAPP.commonvue.inputtoot.selaccounts = savedata.accounts;
        MYAPP.commonvue.inputtoot.selsharescope = savedata.scope;
        MYAPP.commonvue.inputtoot.mentions = savedata.mentionlist;
        MYAPP.commonvue.inputtoot.selmentions = savedata.mentions;
        MYAPP.commonvue.inputtoot.seltags = savedata.tags;
        MYAPP.commonvue.inputtoot.status_text = savedata.text;
        MYAPP.commonvue.inputtoot.media = savedata.medias;

        MYAPP.commonvue.inputtoot.sizing_window();
        MYAPP.commonvue.inputtoot.dialog = true;

        return;
        var srvurl = ID("hid_staticpath").value.replace("/static","");
        var openpath = srvurl+"toot/new";
        var features = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=640,height=500"
        window.open(openpath,"_blank",features);
    }
    createTempAccount (instance) {
        var def = new Promise((resolve,reject)=>{
            this.server_account.instance = instance;
            this.sns.getInstanceInfo(instance)
            .then(result=>{
                this.server_account.api = new MastodonAPI({
                    instance: this.server_account.getBaseURL()
                });
                this.server_account.token["stream_url"] = result.urls.streaming_api;
                this.server_account.api.setConfig("stream_url",this.server_account.token["stream_url"]);
                resolve(this.server_account);
            });
        });
        return def;
    }
}
