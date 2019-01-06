/**===========================================================================
 * App main class
 =============================================================================*/
class Gplusdon {
    constructor() {
        const cstappinfo = {
            name: "G+don",
            firstPath : "",
            staticPath : ID("hid_staticpath").value,
            author: "ISHII Eiju",
            version: "1.0.0",
            config : {
                limit_search_instance : 50
            }
        };
        this.appinfo = cstappinfo;

        this.siteinfo = {
            key: "",
            secret: "",
            token: "",
            //redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
            redirect_uri : "/redirect",
            scopes: ["read", "write", "follow"]
        };
        this.acman = new AccountManager();

        this.session = new Gpsession();
        //---if session data from before page, load it.
        this.session.load(true);
        this._sns = new Gpsns();

        setupLocale({});
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
        if ("leftmenu" in this.commonvue) this.commonvue.leftmenu.applogined = true;
        if ("sidebar" in this.commonvue) this.commonvue.sidebar.applogined = true;

        if ("nav_notification" in this.commonvue) {
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
                    notifAccount.account.streams.tag.setTargetTimeline(vue_timeline.public);
                    notifAccount.account.streams.taglocal.setTargetTimeline(vue_timeline.public);
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
                        vue_search.accounts.load_accounts(result.data.accounts,{api:{},app:{}});
                        vue_search.tootes.loadTimeline(result.data.statuses,{
                            api:{},
                            app:{
                                tltype : "tt_all"
                            }
                        });
                    });            
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
        //------------------------------------------------
        //  navigation bar
        //$('.sidenav').sidenav();
        this.forms["sidenav"] = M.Sidenav.init(Q('.sidenav'),{});
        ID("img_brand").addEventListener("click", function (e) {
            var elems = document.querySelectorAll("#maincol_leftmenu div.collection a.collection-item span");
            for (var i = 0; i < elems.length; i++) {
                elems[i].classList.toggle("user-slideOutLeft");
            }
            ID("maincol_leftmenu").classList.toggle("l3");
            ID("maincol_leftmenu").classList.toggle("l1");
            ID("maincol_rightmain").classList.toggle("l9");
            ID("maincol_rightmain").classList.toggle("l11");
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
        for (var i = 0; i < es.length; i++) {
            var elem = es[i];
            elem.addEventListener("click",function(e){
                //---/index
                if (Q(".view_area")) {
                    Q(".view_area").scroll({top:0, behavior:"smooth"});
                }
                //---/accounts/:instance/:idname
                //---/users/:instance/:idname
                if (Q(".account_body")) {
                    Q(".account_body").scroll({top:0, behavior:"smooth"});
                }
                //---/connections
                if (ID("following")) {
                    ID("following").scroll({top:0, behavior:"smooth"});
                }
                if (ID("follower")) {
                    ID("follower").scroll({top:0, behavior:"smooth"});
                }

                //---/tl
                if (Q(".timelinebody")) {
                    Q(".tab-content").scroll({top:0, behavior:"smooth"});
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

        ///ID("nav_sel_account").value = this.session.status.selectedAccount.idname + "," +  this.session.status.selectedAccount.instance;
        ///var instances = M.FormSelect.init(ID("nav_sel_account"), {});
        /*ID("nav_sel_account").addEventListener("change",function(e){
            console.log(this, this.selectedOptions[0].value);
            var v = this.selectedOptions[0].value.split(",");
            var ac = MYAPP.selectAccount({"idname":v[0], "instance":v[1]});
            //MYAPP.sns.setAccount(ac);
        });*/
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems, {
        });
        //this.forms["modal1"] = M.Modal.getInstance(ID("modal1"));


        //---toote popup for detail
        Q(".onetoote_overlay").addEventListener("click",function(e){
            var q = Q(".onetoote_area *");
			if (q.querySelector(".card-image .carousel")) {
                q.querySelector(".card-image .carousel").classList.toggle("fullsize");
                q.querySelector(".card-image .carousel").style.height = "";
			}
            q.querySelector(".card-comment").classList.remove("full");
            q.querySelector(".card-comment").classList.toggle("mini");
            q.querySelector(".card-comment").classList.remove("open");
            q.querySelector(".card-comment .collection").classList.toggle("sizing");
            if (MYAPP.session.status.pickupDir == "next") {
                MYAPP.session.status.pickupToote.parentElement.insertBefore(q,MYAPP.session.status.pickupToote);
            }else if (MYAPP.session.status.pickupDir == "prev") {
                MYAPP.session.status.pickupToote.parentElement.appendChild(q);
            }
            Q(".onetoote_screen").classList.toggle("common_ui_off");
            //Q(".onetoote_area").classList.toggle("common_ui_off");
            MYAPP.session.status.pickupToote = null;
            MYAPP.session.status.pickupDir = "next";
            
        },false);
        Q(".onetoote_area").addEventListener("click",function(e){
            e.stopPropagation();
        });

        //---user popup card
        ID("ov_user").addEventListener("mouseleave",function(e){
            ID("ov_user").classList.add("common_ui_off");
            ID("ov_user").classList.remove("scale-up-tl");
        });
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems, {
            enterDelay : 500
        });

        //---toot modal
        this.forms["inputtoot"] = M.Modal.getInstance(ID("ov_inputtoot"));

        ID("btn_post_toote").addEventListener("click",function(e){
            //MYAPP.forms["inputtoot"].open();
            if (MYAPP.commonvue.inputtoot.$vuetify.breakpoint.lgAndUp) {
                MYAPP.commonvue.inputtoot.activewidth = "50%";
                MYAPP.commonvue.inputtoot.fullscreen = false;
            }else if (MYAPP.commonvue.inputtoot.$vuetify.breakpoint.md) {
                MYAPP.commonvue.inputtoot.activewidth = "90%";
                MYAPP.commonvue.inputtoot.fullscreen = false;
            }else if (MYAPP.commonvue.inputtoot.$vuetify.breakpoint.smAndDown) {
                MYAPP.commonvue.inputtoot.fullscreen = true;
            }else{
                MYAPP.commonvue.inputtoot.activewidth = "50%";
                MYAPP.commonvue.inputtoot.fullscreen = false;
            }
            MYAPP.commonvue.inputtoot.dialog = true;
        });
        
        var textbox = ID("dv_inputcontent");
        textbox.addEventListener("keydown",function(e){
			//console.log(e.keyCode);
		    if ((e.keyCode == 13) && (e.ctrlKey || e.metaKey)) {
		        //var arr = Tweem.tagbox.chipsData;
		        //var fnlarr = [];
		        //for (var i = 0; i < arr.length; i++) {
		        //    fnlarr.push(arr[i].tag);
		        //}
		        //Tweem.sendPost(Tweem.getInput(), fnlarr);
			}
		});
		textbox.addEventListener("keyup",function (e){
            //Tweem.count_inputcontent(Tweem.getInput(),null,null);
            MYAPP.commonvue.inputtoot.strlength = twttr.txt.getUnicodeTextLength(this.textContent);
        });
        textbox.addEventListener("dragover",function(e){
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
			ID("dv_inputcontent").classList.add("dragover_indicate");
		},false);
		textbox.addEventListener("dragleave",function(e){
			ID("dv_inputcontent").classList.remove("dragover_indicate");
		},false);
		textbox.addEventListener("drop",function(e){
			e.stopPropagation();
			e.preventDefault();
			ID("dv_inputcontent").classList.remove("dragover_indicate");
			var acs = Tweem.getSelectedAccounts();
			if (acs.length == 0) {
				appAlert(_T("post_error_msg01"));
				return;
			}
			appPrompt2(
				"画像のコメントを入力してください。",
				Tweem.loadAttachments,
				e.dataTransfer.files,
				""
			);
			return false;
		},false);

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
            this.commonvue.inputtoot.emojis_title.instances.push({
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
        tmparea.appendChild(frag);

        var text = tmparea.innerText;
        var contentText = tmp.textContent;
        if (text.endsWith("\n")) {
            text = text.substr(0,text.length-1);
        }

        let mentionReg = new RegExp("(?:\@[a-zA-Z0-9]+\@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*|@[a-zA-Z0-9]+)","g");
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

        var ret = {
            text : text,
            mentions : resultMentions, //twttr.txt.extractMentions(text),
            tags : twttr.txt.extractHashtags(text),
            urls : twttr.txt.extractUrls(text)
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

        if (len > 500) {
            return {
                cd : "pst01",
                msg : "over 500 chars"
            };
        }
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
            });

        });

        return def;
    }
    executePost(content,options){
        var def = new Promise((resolve,reject)=>{
            //---check an error
            let convScope = {
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
                console.log(error);
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
}
