
class Gpstatus {
    constructor(status){
        //---main toot base setup
        this.body = Object.assign({},status);
        this.body.created_at = new Date(this.body.created_at);
        var diff_created_at = this.body.created_at.diffDateTime();
        var translate_created_at = {
            val : Math.round(diff_created_at.time),
            text : curLocale.messages["dt_"+diff_created_at.type]
        };
        if ((diff_created_at.type == "day") && (diff_created_at.time > 3)) {
            translate_created_at.val = this.body.created_at.toLocaleString();
            translate_created_at.text = "";
        }
        this.body["spoilered"] = this.body.spoiler_text != "" ? true : false;
        this.body["diff_created_at"] = translate_created_at;
        this.medias = this.body.media_attachments;
        //this.body["visibility"] = curLocale.messages["tt_"+this.body.visibility];

        //---main toot account setup
        this.account = Object.assign({},status.account);
        if (this.account.display_name == "") {
            this.account.display_name = this.account.acct;
        }else{

            this.account.display_name = MUtility.replaceEmoji(this.account.display_name,this.account.instance,this.account.emojis,18);
        }
        /*var tmpa = GEN("a");
        tmpa.href = this.account.url;
        this.account["instance"] = tmpa.hostname;*/

        //---Relationship and visibility setup
        this.relationship = {isme:false};
        if (MYAPP.session.status.selectedAccount.idname == this.account.acct) {
            this.relationship.isme = true;
        }
        var finalVisibility = this.body.visibility;

        //---reblog original toot setup
        var referContent = status.content;
        var referInstance = this.account.instance;
        var referEmojis = this.body.emojis;
        this.reblogOriginal = null;
        if (status.reblog) {
            this.reblogOriginal = Object.assign({},status.reblog);
            finalVisibility = "share_" + MYAPP.session.config.application.showMode;
            if (this.reblogOriginal.media_attachments.length > 0) {
                this.medias = this.reblogOriginal.media_attachments;
            }
            this.body.sensitive = this.reblogOriginal.sensitive;
            this.body.favourites_count = this.reblogOriginal.favourites_count;
            this.body.reblogs_count = this.reblogOriginal.reblogs_count;
            referContent = this.reblogOriginal.content;
            referInstance = this.reblogOriginal.account.instance;
            referEmojis = this.reblogOriginal.emojis;
        }
        
        for (var i = 0; i < this.medias.length; i++) {
            if (this.medias[i].meta == null) {
                var img = GEN("img");
                img.src = this.medias[i].preview_url;
                var asp = img.width / img.height;
                if (img.height > img.width) {
                    asp = img.height / img.width;
                }
                this.medias[i].meta = {
                    small : {
                        aspect : asp,
                        width : img.width,
                        height : img.height,
                        size : `${img.width}x${img.height}`
                    }
                };
            }
        }

        //---card css style class setup
        this.cardtypeSize = {
            "grid-row-end" : "span ",
        }

        this.shareColor = {
            "share-color-public" : true,
            "share-color-unlisted" : false,
            "share-color-private" : false,
            "share-color-boosted" : false
        }
        if (this.body.visibility == "unlisted") {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = true;
            this.shareColor["share-color-private"] = false;
            this.shareColor["share-color-boosted"] = false;
        }else if (this.body.visibility == "private") {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = false;
            this.shareColor["share-color-private"] = true;
            this.shareColor["share-color-boosted"] = false;
        }else if (this.reblogOriginal) {
            this.shareColor["share-color-public"] = false;
            this.shareColor["share-color-unlisted"] = false;
            this.shareColor["share-color-private"] = false;
            this.shareColor["share-color-boosted"] = true;
        }
        this.reactions = {
            fav : {
                "lighten-3" : (status.favourited ? false : true)
            },
            reb : {
                "lighten-3" : (status.reblogged ? false : true)
            }
        }

        //---translation in card setup
        this.translateText = {
            thisuser_mute : _T("thisuser_mute",[this.account.display_name]),
            thisuser_block : _T("thisuser_block",[this.account.display_name]),
            thisuser_report : _T("thisuser_report",[this.account.display_name]),
            thisuser_unmute : _T("thisuser_unmute",[this.account.display_name]),
            thisuser_unblock : _T("thisuser_unblock",[this.account.display_name]),
        };
        console.log("sensitive_imagetext=",this.translateText.sensitive_imagetext, this.medias.length);
        if (status.reblog) {
            var inst = MUtility.getInstanceFromAccount(this.reblogOriginal.account.url);
            var tmpname = this.reblogOriginal.account.display_name == "" ? this.reblogOriginal.account.username : this.reblogOriginal.account.display_name;
            tmpname = MUtility.replaceEmoji(tmpname,inst,this.reblogOriginal.account.emojis,16);
            this.translateText.visibility = _T("tt_"+finalVisibility,[tmpname]);
        }else{
            this.translateText.visibility = _T("tt_"+finalVisibility);
        }

        //---other information setup
        var content = MYAPP.extractTootInfo(referContent);
        this.body["html"] = MUtility.replaceEmoji(referContent,referInstance,referEmojis,18);
        this.body.content = content.text;
        this.mentions = content.mentions;
        this.tags = content.tags;
        this.ancestors = [];
        this.descendants = [];
        this.urls = content.urls;
        //---check URL
        for (var i = this.urls.length-1; i >= 0; i--) {
            //if no https and http, remove the url
            if (this.urls[i].indexOf("https://") != 0) {
                if (this.urls[i].indexOf("http://") != 0) {
                    this.urls.splice(i,1);
                }
            }
        }
        this.mainlink = {
            exists:false,
            site : "",
            title : "",
            description : "",
            image : "",
            isimage : false
        };

        //---decide final card size.
        var num_cardSize = 8;
        if (this.body.content.length <= 49) {
            num_cardSize += 1;
        }else if (this.body.content.length >= 50) {
            num_cardSize += 2;
        }else if (this.body.content.length >= 150) {
            num_cardSize += 3;
        }else if (this.body.content.length >= 200) {
            num_cardSize += 4;
        }else if (this.body.content.length >= 255) {
            num_cardSize += 6;
        }else{
            num_cardSize += 8;
        }
        if (this.medias.length > 0) {
            num_cardSize += 9;
        }
        //---change card size if available a link
        if (this.urls.length > 0) {
            num_cardSize += 2;
        }
        /*if ((this.medias.length > 0) && (this.urls.length > 0)) {
            num_cardSize = 28;
        }*/
        this.cardtypeSize["grid-row-end"] = `span ${num_cardSize}`;
        console.log(this.cardtypeSize);

    }
}
/**===========================================================================
 * App session class
 =============================================================================*/
class Gpsession {
    constructor(){
        this.data = {
            status : {
                pickupToote : null,
                pickupDir : "next",
                showingAccount : {
                    instance : "",
                    idname : "",
                    data : ""
                },
                selectedAccount : {
                    instance : "",
                    idname : ""
                }
            },
            config : {
                application : {
                    showMode : "mastodon"   //mastodon, twitter, gplus
                }
            }
        };
        this.persistant = false;
        var dt = new Date();
        dt.setHours(9);
        dt.setMinutes(0);
        dt.setSeconds(0);
        dt.setMilliseconds(0);
        //---guard key
        this._key = dt.valueOf();


    }
    get status() {
        return this.data.status;
    }
    get config() {
        return this.data.config;
    }
    save(is_eternal) {
        var textdata = JSON.stringify(this.data);
        if (is_eternal) {
            localStorage.setItem("gp_eternal_ses",textdata);
        }else{
            sessionStorage.setItem(`gp_${this._key}_ses`,textdata);
        }
    }
    load(is_eternal) {
        if (is_eternal) {
            var textdata = sessionStorage.getItem("gp_eternal_ses");
            if (textdata) {
                this.data = JSON.parse(textdata);
            }
        }else{
            var textdata = sessionStorage.getItem(`gp_${this._key}_ses`);
            if (textdata) {
                this.data = JSON.parse(textdata);
                sessionStorage.removeItem(`gp_${this._key}_ses`)
            }
        }
    }
}
/**===========================================================================
 * App main class
 =============================================================================*/
class Gplusdon {
    constructor() {
        const cstappinfo = {
            name: "G+don",
            firstPath : "/gplusdon",
            staticPath : ID("hid_staticpath").value,
            author: "ISHII EijU",
            version: "0.1.0",
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
        this.session.load();
        this._sns = new Gpsns();

        setupLocale({});
        this.forms = {};
        this.basevue = new Vue({
            el: "#toppanel",
            delimiters: ["{?", "?}"],
            data: () => ({
                applogined: true,
                uistyle : {
                    primary : "red",
                    bgcolor :  {
                        "grey lighten-3" : true
                    }
                },
                //---navigation drawer 
                drawer: null,
                mini: false,
                current_selaccount: {
                    
                },
                accounts : [],
                isdialog_selaccount : false,

                //statuses : [],
                //isshow_comment : false,
                //myslick : {},

                menutipdir : {
                    right : false,
                    bottom : true
                },
                menus: [
                    { icon: "dashboard", text: _T("dashboard") },
                    { icon: "view_day", text: _T("timeline") },
                    { icon: "person", text: _T("accounts") },
                    { icon: "people", text: _T("connections") },
                    { icon: "email", text: _T("direct_message") },
                    { icon: "star", text: _T("favourites") },
                    { icon: "list", text: _T("lists") },
                    { icon: "business", text: _T("instances") },
                    { icon: "settings", text: _T("settings") }
                ]
            }),
            /*mounted() {
                this.myslick = $(".slick").slick({
                    dots: true,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 1,
                    adaptiveHeight: true
                });
            },*/
            methods: {
                onclick_current_selaccount : function (e) {
                    this.isdialog_selaccount = !this.isdialog_selaccount
                    
                },
                onclick_list: function(e) {
                    alert("hoge");
                    console.log(e);
                },
                onclick_imgbrand: function(e) {
                    this.mini = !this.mini;
                    this.menutipdir.right = !this.menutipdir.right;
                    this.menutipdir.bottom = !this.menutipdir.bottom;
                    return;
                },
                /*onclick_ttbtn_reply(e){
                    this.isshow_comment = !this.isshow_comment;
                }*/
            }
        });
        this.commonvue = {
            nav_sel_account : new Vue({
                el : "#nav_sel_account",
                delimiters : ["{?", "?}"],
                data : {
                    applogined : false,
                    accounts : [],
                },
                methods: {
                    setCurrentAccount : function(ac) {
                        var display_name = ac.display_name;
                        var instance = ac.instance;
                        //ID("cursel_avatar").src = ac.rawdata.avatar;
                        //ID("cursel_display_name").textContent = display_name + "@" + instance;
                        //ID("cursel_avatar").setAttribute("data-tooltip",display_name + "@" + instance);
                    },
                    onclick_item : function(e) {
                        console.log(e.target);
                        var title = e.target.title;
                        console.log(title);
                        var v = title.split(",");

                        MYAPP.selectAccount({"idname":v[0], "instance":v[1]});
                        MYAPP.forms.modal1.close();
                    }
                }
            }),
            nav_search : new Vue({
                el : "#frm_search",
                delimiters : ["{?", "?}"],
                data : {
                    applogined : false,
                    findtext : ""
                },
                methods : {
                    onsubmit_search : function (e) {
                        //--common search function

                        //if (vue_connections !== undefined) vue_connections.search.load_search(ID("inp_search").value,{});
                        //if (vue_instances !== undefined) vue_instances.search.onsubmit_search();
                        parentCommonSearch();

                    },
                    onclick_searchClear: function(e) {
                        this.findtext = null;
                    }
                }
            }),
            leftmenu : new Vue({
                el : "#leftmenu_main",
                delimiters : ["{?", "?}"],
                data : {
                    applogined : false,
                    accounts : [],
                }
            }),
            sidebar : new Vue({
                el : "#slide-out",
                delimiters : ["{?", "?}"],
                data : {
                    applogined : false,
                    selected : {}   //---This app's Account
                }
            }),
            usercard : new Vue({
                el : "#ov_user",
                delimiters : ["{?", "?}"],
                data : {
                    translation : {
                        stat_statuses : _T("stat_statuses"),
                        stat_following : _T("stat_following"),
                        stat_follower : _T("stat_follower")
                    },
                    selected : {},   //---Mastodon's Account
                    globalInfo : {}
                },
                methods : {
                    
                }
            })
            ,
            //---input toot modal dialog
            inputtoot : new Vue({
                el : "#ov_inputtoot",
                delimiters : ["{?", "?}"],
                data :  {
                    selaccounts : [],
                    accounts : [],
                    dialog : false,
                },
                methods : {
                    remove (item) {
                        var index = -1;
                        for (var i = 0; i < this.accounts.length; i++) {
                            var ac= this.accounts[i];
                            if ((item.idname + item.instance) == (ac.idname + ac.instance) ) {
                                index = i;
                                break;
                            }
                        }
                        if (index >= 0) this.accounts.splice(index, 1)
                    }
                }
            })
        };
    }
    get sns(){
        return this._sns;
    }
    checkSession() {
        console.log(this.session.status);
        if (this.session.status.showingAccount.idname == "") {
            this.session.status.showingAccount.data = this.acman.items[0];
            this.session.status.showingAccount.idname = this.acman.items[0].idname;
            this.session.status.showingAccount.instance = this.acman.items[0].instance;

        }
        if (this.session.status.selectedAccount.idname == "") {
            this.session.status.selectedAccount.idname = this.acman.items[0].idname;
            this.session.status.selectedAccount.instance = this.acman.items[0].instance;
        }
        this.sns.setAccount(this.session.status.showingAccount.data);
    }
    afterLoadAccounts(data){
        MYAPP.commonvue.leftmenu.applogined = true;
        MYAPP.commonvue.sidebar.applogined = true;
        this.commonvue.nav_sel_account.accounts.splice(0,this.commonvue.nav_sel_account.accounts.length);
        for (var i = 0; i < data.length; i++) {
            var obj = Object.assign({},data[i]);
            this.basevue.accounts.push(obj);
            continue;
            this.commonvue.nav_sel_account.accounts.push(obj);
            this.commonvue.inputtoot.accounts.push(obj);
        }
    }
    selectAccount(key) {
        var tmpac;
        if (key instanceof Account) {
            tmpac = key;
        }else{
            tmpac = this.acman.get(key);
        }
        if (tmpac) {
            var ac = JSON.stringify(tmpac);
            var ac2 = JSON.parse(ac);
            this.session.status.selectedAccount.idname = ac2.idname;
            this.session.status.selectedAccount.instance = ac2.instance;

            if (this.session.status.selectedAccount.idname != "") {
                //ID("nav_sel_account").value = `${ac2.idname},${ac2.instance}`;
                this.commonvue.sidebar.selected = ac2;
                this.sns.setAccount(tmpac);
                this.commonvue.nav_sel_account.setCurrentAccount(tmpac);
                this.session.save();
            }
            return tmpac;
        }
        return null;
    }
    setGeneralTitle(title) {
        ID("general_title").textContent = title;
        ID("general_title").setAttribute("data-tooltip",title);
    }
    /**
     * generate text contents of toote
     * @param {Object} data Status object of Mastodon
     */
    generate_toote_content(data) {
        var cardcontent = GEN("div");

        //---toote body parts
        if (data.spoiler_text != "") {
            var c_spoiler = GEN("p");
            c_spoiler.textContent = data.spoiler_text;

            cardcontent.appendChild(c_spoiler);
        }

        var c_tootetext = GEN("p");
        c_tootetext.className = "toote_main";
        c_tootetext.textContent = data.content;
        cardcontent.appendChild(c_tootetext);

        if (data.spoiler_text != "") {
            var c_btnspoiler = GEN("span");
            c_btnspoiler.className = "button_spoiler";
            c_btnspoiler.textContent = "...";
            cardcontent.appendChild(c_btnspoiler);
        }

        return cardcontent;
    }
    /**
     * generate media parts of toote
     * @param {Object} media_attachments media properties of Status object
     */
    generate_toote_media(media_attachments) {
        var c_imagearea = GEN("div");
        c_imagearea.className = "card-image";

        var c_imagecarousel = GEN("div");
        c_imagecarousel.className = "carousel carousel-slider center";
        for (var i = 0; i < media_attachments.length; i++) {
            var c_imageitem = GEN("div");
            c_imageitem = "carousel-item grey lighten-4 white-text";
            c_imageitem.href = "#p" + i + "!";

            var c_mediaimg = GEN("img");
            c_mediaimg.src = media_attachments[i].preview_url;
            c_mediaimg.alt = media_attachments[i].description;

            if (media_attachments.meta.small.width >= media_attachments.meta.small.height) {
                c_mediaimg.className = "landscape";
            }else{
                c_mediaimg.className = "portrait";
            }

            c_imageitem.appendChild(c_mediaimg);
            c_imagecarousel.appendChild(c_imageitem);
        }
        c_imagearea.appendChild(c_imagecarousel);

        return c_imagearea;
    }
    /**
     * Generate HTML card(Materialize card element) from Status object
     * @param {Object} data Status object of Mastodon
     */
    generate_toote_in_timeline(data) {
        //---This card style is only: public, unlisted and private
        if (data.visibility == "direct") return null;

        var rootdiv = GEN("div");
        rootdiv.id = "tt_" + data.id;

        var withImage = false;
        var csscardsize = "g4";
        if (data.media_attachments.length > 0) {
            withImage = true;
            csscardsize = "g12";

        }


        rootdiv.className = "card fitcontent sticky-action post_card_base post_card_flow" + csscardsize;
    
        //---card content section---------
        var cardcontent = GEN("div");
        cardcontent.className = "card-content card-content-ex";

        //---Date, more vert parts
        var c_datetime = GEN("div");
        c_datetime.className = "card-datetime";
        var tmpdate = new Date(data.created_at).diffDateTime();
        
        var c_datespan = GEN("a");
        c_datespan.href  ="#!";
        c_datespan.textContent = `${Math.round(tmpdate.time * 100) / 100} ${_T("dt_"+tmpdate.type)}`;

        var c_morevert = GEN("a");
        c_morevert.className = "waves-effect waves-grey1 btn-flat activator";
        c_morevert.appendChild(MUtility.generate_icon("more_vert"));
        c_datetime.appendChild(c_datespan);
        c_datetime.appendChild(c_morevert);

        //---User parts
        var c_username = GEN("span");
        c_username.className = "card-title2";

        var c_userimg = GEN("img");
        c_userimg.src= data.account.avatar;
        c_userimg.width = "32";
        c_userimg.height = "32";

        var c_usernameBody = GEN("b");
        c_usernameBody.title = `@${data.account.username}@${data.instance}`;
        c_usernameBody.textContent = data.account.display_name;

        var c_userinstance = GEN("i");
        c_userinstance.className = "card-subtitle";
        
            var aaa = GEN("a");
            aaa.href = data.account.url;
        
        c_userinstance.textContent = `@${aaa.hostname}`;

        c_username.appendChild(c_userimg);
        c_username.appendChild(c_usernameBody);
        c_username.appendChild(c_userinstance);

        //---share range parts
        var c_sharearea = GEN("div");
        c_sharearea.className = "chip_box";
        var c_shareicon = MUtility.generate_icon("arrow_right");
        var c_sharetext = GEN("span");
        c_sharetext.textContent = _T("tt_"+data.visibility);
        c_sharearea.appendChild(c_shareicon);
        c_sharearea.appendChild(c_sharetext);


        cardcontent.appendChild(c_datetime);
        cardcontent.appendChild(c_username);
        cardcontent.appendChild(c_sharearea);
        //---toote body parts
        this.generate_toote_content(data);

        if (data.spoiler_text != "") {
            var c_spoiler = GEN("p");
            c_spoiler.textContent = data.spoiler_text;

            cardcontent.appendChild(c_spoiler);


        }
        var c_tootetext = GEN("p");
        c_tootetext.className = "toote_main";
        c_tootetext.textContent = data.content;

        cardcontent.appendChild(c_tootetext);
        if (data.spoiler_text != "") {
            var c_btnspoiler = GEN("span");
            c_btnspoiler.className = "button_spoiler";
            c_btnspoiler.textContent = "...";
            cardcontent.appendChild(c_btnspoiler);
        }

        rootdiv.appendChild(cardcontent);

        //---card image section---------
        if (withImage) {
            var c_imagearea = GEN("div");
            c_imagearea.className = "card-image";

            var c_imagecarousel = GEN("div");
            c_imagecarousel.className = "carousel carousel-slider center";
            for (var i = 0; i < data.media_attachments.length; i++) {
                var c_imageitem = GEN("div");
                c_imageitem = "carousel-item grey lighten-4 white-text";
                c_imageitem.href = "#p" + i + "!";
                
                var c_mediaimg = GEN("img");
                c_mediaimg.src = data.media_attachments[i].preview_url;
                c_mediaimg.alt = data.media_attachments[i].description;

                c_imageitem.appendChild(c_mediaimg);
                c_imagecarousel.appendChild(c_imageitem);
            }
            c_imagearea.appendChild(c_imagecarousel);

            rootdiv.appendChild(c_imagearea);
        }

        //---card action section
        var c_actionarea = GEN("div");
        c_actionarea.className = "card-action-ex card-action bottom";

        var c_btn_reply = GEN("button");
        c_btn_reply.className = "ttbtn_reply btn-floating btn waves-effect waves-grey1 grey lighten-3";
        var c_btn_reply_icon = MUtility.generate_icon("reply");
        c_btn_reply_icon.classList.add("black-text");
        c_btn_reply.appendChild(c_btn_reply_icon);
        c_btn_reply.onclick = function(e) {
            var target = e.currentTarget.parentElement.nextElementSibling;
            target.classList.toggle("mini");
            target.classList.toggle("open");
            e.currentTarget.classList.toggle("lighten-3");
        }

        c_actionarea.appendChild(c_btn_reply);

        var c_act_rightarea = GEN("div");
        c_act_rightarea.className = "right";

        var c_btn_fav = GEN("button");
        c_btn_fav.className = "ttbtn_fav btn-floating btn waves-effect waves-grey1 grey lighten-3";
        var c_btn_fav_icon = MUtility.generate_icon("favorite");
        c_btn_fav_icon.classList.add("black-text");
        c_btn_fav.appendChild(c_btn_fav_icon);
        var c_lab_fav = GEN("span");
        c_lab_fav.className = "ttlab_fav"; //fav count

        var c_btn_share = GEN("button");
        c_btn_share.className = "ttbtn_bst btn-floating btn waves-effect waves-grey1 grey lighten-3";
        var c_btn_share_icon = MUtility.generate_icon("share");
        c_btn_share_icon.classList.add("black-text");
        c_btn_share.appendChild(c_btn_share_icon);
        var c_lab_share = GEN("span");
        c_lab_share.className = "ttlab_bst"; //boost count

        c_act_rightarea.appendChild(c_btn_fav);
        c_act_rightarea.appendChild(c_lab_fav);
        c_act_rightarea.appendChild(c_btn_share);
        c_act_rightarea.appendChild(c_lab_share);
        c_actionarea.appendChild(c_act_rightarea);

        rootdiv.appendChild(c_actionarea);

        //---card comment(reply) section
        var c_replyarea = GEN("div");
        c_replyarea.className = "card-comment";
        var c_replylist = GEN("ul");
        c_replylist.className = "collection";

        if (data.replies_count > 0) {
            c_replyarea.classList.add("mini");

            for (var i = 0; i < data.replies_count; i++) {
                var li = GEN("li");
                li.className = "collection";
            }
        }


        //---card additional section
        var c_actionarea = GEN("div");
        c_actionarea.className = "card-reveal";

        var submenuitem = [_T("pin")];
        
        return rootdiv;
    }
    /**
     * generate reply html elements for toote
     * @param {Object} data Status reply object of Mastodon 
     */
    generate_replytoote(data) {
        var root = GEN("li");
        root.className = "collection-item avatar";

        var c_userimg = GEN("img");
        c_userimg.src= data.account.avatar;
        c_userimg.width = "32";
        c_userimg.height = "32";

        var c_usernameBody = GEN("span");
        c_usernameBody.className = "title";
        c_usernameBody.title = `@${data.account.username}@${data.instance}`;
        c_usernameBody.textContent = data.account.display_name;


    }
    /**
     * Set up all common elements for all page (exclude appinitial.html)
     */
    setupCommonElement() {
        //$('.sidenav').sidenav();
        //M.Sidenav.init(Q('.sidenav'),{})
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
                    Q(".timelinebody").scroll({top:0, behavior:"smooth"});
                }
                e.stopPropagation();
            },false);
        }

        /*ID("nav_sel_account").value = this.session.status.selectedAccount.idname + "," +  this.session.status.selectedAccount.instance;
        var instances = M.FormSelect.init(ID("nav_sel_account"), {});
        ID("nav_sel_account").addEventListener("change",function(e){
            console.log(this, this.selectedOptions[0].value);
            var v = this.selectedOptions[0].value.split(",");
            var ac = MYAPP.selectAccount({"idname":v[0], "instance":v[1]});
            //MYAPP.sns.setAccount(ac);
        });*/
        //var elems = document.querySelectorAll('.modal');
        //var instances = M.Modal.init(elems, {
        //});
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
        //var elems = document.querySelectorAll('.tooltipped');
        //var instances = M.Tooltip.init(elems, {
        //    enterDelay : 500
        //});

        //---toot modal
        //this.forms["inputtoot"] = M.Modal.getInstance(ID("ov_inputtoot"));

        ID("btn_post_toote").addEventListener("click",function(e){
            //MYAPP.forms["inputtoot"].open();
            MYAPP.commonvue.inputtoot.dialog = true;
        });
        return;

        this.forms["toot_accbox"] = $("#mn_accountbox").selectize({
			plugins : ["remove_button"],
			create : false,
			maxItems : 4,
			render : {
				option : function(item,escape){
                    /*
                     item = Account object
                    */
                    
					return `<div>
						<img src='${item.rawdata.avatar}' width='32' height='32' />
						<span>${item.text}</span>
                        </div>
                    `;
				}
			},
			onItemAdd : function (value, item){
				console.log(item);
				var arr = String(value).split("-");
				
			},
			onItemRemove : function (value) {
				console.log(value);
				var arr = $("#mn_accountbox").val();
			}
        });
        
        for (var i = 0; i < this.acman.items.length; i++) {
            var obj = Object.assign({}, this.acman.items[i]);
            var obj2 = Object.assign({},obj);

            var tmpname = obj.display_name == "" ? obj.idname : obj.display_name;
            tmpname = MUtility.replaceEmoji(tmpname,obj.instance,obj.rawdata.emojis,18);
            tmpname += "@" + obj.instance;

            obj2.text = tmpname;
            obj2.value = obj.idname + "," + obj.instance;
            this.forms.toot_accbox[0].selectize.addOption(obj2);
        }

    }
    showUserCard(rect,userdata){
        if (ID("ov_user").classList.contains("common_ui_off")) {
            //var rect = e.currentTarget.getBoundingClientRect();
            var us = JSON.stringify(userdata);
            this.commonvue.usercard.selected = JSON.parse(us);
            //popup_ovuser.options.startingTop = rect.y;
            ID("ov_user").style.top = rect.y + "px";
            ID("ov_user").style.left = rect.x + "px";
            ID("ov_user").classList.remove("common_ui_off");
            ID("ov_user").classList.add("scale-up-tl");
            //popup_ovuser.open();
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
        var ret = {
            text : text,
            mentions : twttr.txt.extractMentions(text),
            tags : twttr.txt.extractHashtags(text),
            urls : twttr.txt.extractUrls(text)
        }
        //console.log(ret);
        tmparea.removeChild(tmp);
        return ret;
    }
}
