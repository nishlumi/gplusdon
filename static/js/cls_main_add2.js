/**===========================================================================
 * Additionnal and Dependencies defines for App main class 
 * necessary **2nd** include
 =============================================================================*/
//---input toot modal dialog
function defineForTootPage(app) {
    app.commonvue["inputtoot"] = new Vue({
        el : "#ov_inputtoot",
        delimiters : ["{?", "?}"],
        mixins : [vue_mixin_for_inputtoot],
        data :  {
            //--dialog basic data
            dialog : false,
            otherwindow : false,
            dialog_title : "",
            fullscreen : false,
            activewidth : "50%",
            show_openInNew : true,
            emoji_bottomsheet : false,
            CNS_SAVENAME : "gp_inpt_conn",


            //---account box data
            selaccounts : [],
            accounts : [],
            account_rules : [
                v => {
                    return v.length <= 4 || _T("post_error_msg03")
                },
            ],
            //---tag box data
            seltags : [],
            tags: [],

            //---share scope box and mention box data
            selsharescope : {
				text : _T("sel_tlpublic"),
				value : "tt_public",
				avatar : "public",
				selected:{"red-text":true}
			},
            sharescopes : [
                {text : _T("sel_tlpublic"), value: "tt_public", avatar: "public", selected:{"red-text":true}},
                {text : _T("sel_tlonly"),   value: "tt_tlonly", avatar: "lock_open",selected:{"red-text":false}},
                {text : _T("sel_private"),  value: "tt_private", avatar: "lock",selected:{"red-text":false}},
                {text : _T("sel_direct"),  value: "tt_direct", avatar: "email",selected:{"red-text":false}},
            ],
            isopen_mention : false,
            selmentions : [],
            mentions : [],
            mention_loading : false,
            mention_search : null,

            //---status textarea data
            /*status_text : "",
            strlength : 0,
            status_rules : [
                function (v) {
                    return twttr.txt.getUnicodeTextLength(v) <= 500 || _T("msg_over_limit")
                }
            ],
            status_class : {
                dragover_indicate : false,
            },*/

            //---emoji bottom sheet data
            emojis_title : {
                utf8 : [],
                instances : []
            },
            
            //---media box data
            /*
                selmedias -> medias
                <logical>    <phsycal>
                (*) for Mastodon

                selmedias : [
                    0 : {
                        src : "foobar.img",
                        comment : "foo.bar",
                        data : file
                    },
                    1 .. n
                ]
                medias[
                    0 : {
                        "account01" : Mastodon's Attachment class,
                        "02" ... n
                    }
                ]
            */
            mainlink : {
                exists : false,
                url : "",
                isimage : false,
                image : "",
                description : "",
                site : "",
                title : "",
            },
            selmedias : [],
            medias : [],
            switch_NSFW : false,

        },
        watch : {
            /*status_text : function(val) {
                var mentions = this.calc_mentionLength(this.selmentions).join(" ");
                var tags = this.seltags.join(" ");
                this.strlength = twttr.txt.getUnicodeTextLength(val)
                    + mentions.length + tags.length;
                
            },*/
            selmentions : function(val) {
                var mentions = this.calc_mentionLength(val).join(" ");
                console.log(mentions, mentions.length);
                //var tags = this.seltags.join(" ");
                var tags = [];
                for (var i = 0; i < this.seltags.length; i++) {
                    tags.push(this.seltags[i].text);
                }

                this.strlength = twttr.txt.getUnicodeTextLength(this.status_text)
                    + mentions.length + tags.join(" ").length;
            },
            seltags : function(val) {
                var mentions = this.calc_mentionLength(this.selmentions).join(" ");

                var tags = [];
                for (var i = 0; i < val.length; i++) {
                    tags.push(val[i].text);
                }
                this.strlength = twttr.txt.getUnicodeTextLength(this.status_text)
                    + mentions.length + tags.join(" ").length;
            },
            selsharescope : function (val) {
                console.log(val);
                if ((val.value == "tt_private") || (val.value == "tt_direct")) {
                    this.isopen_mention = true;
                }else{
                    this.isopen_mention = false;
                }
            },
            mention_search : _.debounce(function(val) {
                if (this.selaccounts.length == 0) return;
                if (val == "") return;
                //var baseac = this.selaccounts[0].split("@");
                console.log("mention_search=",val);

                var hitac = this.getTextAccount2Object(0);
                if (!hitac) return;

                var backupAC = MYAPP.sns._accounts;
                MYAPP.sns.setAccount(hitac);

                for (var i = this.mentions.length-1; i >= 0; i--) {
                    if (this.selmentions.indexOf(this.mentions[i].acct) == -1) {
                        this.mentions.splice(i,1);
                    }
                }

                this.mention_loading = true;

                MYAPP.sns.getUserSearch(val,{
                    api : {
                        limit:5
                    },
                    app : {}
                })
                .then(result=>{
                    for (var i = 0; i < result.data.length; i++) {
                        this.mentions.push({
                            avatar : result.data[i].avatar,
                            acct : `@${result.data[i].username}@${result.data[i].instance}`,
                            username : result.data[i].username,
                            instance : result.data[i].instance,
                            display_name : result.data[i].display_name,
                        });
                        
                    }
                    console.log(this.mentions);
                },result=>{

                })
                .catch(err => {
                    console.log(err);
                })
                .finally(()=>{
                    this.mention_loading = false;
                    MYAPP.sns.setAccount(backupAC);
                });   
            },1000)
        },
        mounted() {
            //if (this.otherwindow) {
            //}
            //M.FormSelect.init(ID("keymaptitle"), {});
            
            CKEDITOR.disableAutoInline = true;
            CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
            this.ckeditor = CKEDITOR.inline( 'dv_inputcontent', CK_INPUT_TOOTBOX);

            console.log("this.status_text=",this.status_text);
            //this.ckeditor.setData(this.status_text);

            $("#dv_inputcontent").pastableContenteditable();
            $("#dv_inputcontent").on('pasteImage',  (ev, data) => {
                console.log(ev,data);
                if (this.dialog || this.otherwindow) {
                    this.loadMediafiles("blob",[data.dataURL]);
                }
            }).on('pasteImageError', (ev, data) => {
                alert('error paste:',data.message);
                if(data.url){
                    alert('But we got its url anyway:' + data.url)
                }
            }).on('pasteText',  (ev, data) => {
                console.log("text: " + data.text);
            });
            

            var issave = localStorage.getItem(this.CNS_SAVENAME);
            if (issave) {
                var js = JSON.parse(issave);
                console.log(js);
                this.selaccounts = js.accounts;
                this.seltags = js.tags;
                this.selsharescope = js.scope;
                this.mentions = js.mentionlist;
                this.selmentions = js.mentions;
                this.status_text = js.text;
                this.medias = js.medias;
                localStorage.removeItem(this.CNS_SAVENAME);
                this.ckeditor.setData(js.text.replace(/\n/g,"<br>"))
                //var ed = this.ckeditor.editable();
                //ed.insertText(js.text); //
            }
    
        },
        computed : {
            
        },
        methods : {
            //---Element event handler------------------------------------
            onclick_close : function (e) {
                var msg = _T("msg_cancel_post");
                appConfirm(msg,()=>{
                    this.status_text = "";
                    this.mainlink.exists = false;
                    this.ckeditor.editable().setText("");
                    this.selmentions.splice(0,this.selmentions.length);
                    this.seltags.splice(0,this.seltags.length);
                    this.selmedias.splice(0,this.selmedias.length);
                    this.medias.splice(0,this.medias.length);
                    this.switch_NSFW = false;

                    if (this.otherwindow) {
                        window.close();
                    }else{
                        this.dialog = false;
                    }

                });
            },
            onclick_openInNew : function (e) {
                var savedata = {
                    accounts : JSON.original(this.selaccounts),
                    scope : JSON.original(this.selsharescope),
                    mentionlist : JSON.original(this.mentions),
                    mentions : JSON.original(this.selmentions),
                    tags : JSON.original(this.seltags),
                    text : JSON.original(this.status_text),
                    medias : JSON.original(this.medias)
                };
                localStorage.setItem(this.CNS_SAVENAME,JSON.stringify(savedata));
                var srvurl = ID("hid_staticpath").value.replace("/static","");
                var openpath = srvurl+"toot/new";
                var features = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=640,height=500"
                window.open(openpath,"_blank",features);
            },
            onclick_help : function (e) {
                appAlert(ID("toot_input_help").innerHTML);
            },
            onclick_moodbtn : function (e) {
                this.btnflags.mood["red-text"] = !this.btnflags.mood["red-text"];
                this.emoji_bottomsheet = !this.emoji_bottomsheet;
            },
            onclick_keymaplistitem : function (index,type) {
                if (type == "pict") {
                    MYAPP.generateSelectedCharList(index);
                }else if (type == "lett") {
                    MYAPP.generateSelectedCharList(index+28);
                }else if (type == "inst") {
                    MYAPP.generateSelectedCharList_Instance(index);
                }
            },
            onsubmit_comment : function (index) {
                console.log(this.selmedias[index].comment);
                var media = this.medias[index];
                for (var obj in media) {
                    var acmedia = media[obj];
                    MYAPP.sns.postUpdateMediaInfo(acmedia.id,{
                        api : {
                            description : this.selmedias[index].comment
                        },
                        app : {}
                    })
                    .then(result=>{

                    });
                }
                
            },
            //---Some function------------------------------------
            select_scope: function (item) {
                for (var i = 0; i < this.sharescopes.length; i++) {
                    this.sharescopes[i].selected["red-text"] = false;
                }
                item.selected["red-text"] = true;
                this.selsharescope.text = item.text;
                this.selsharescope.value = item.value;
                this.selsharescope.avatar = item.avatar;

                if (item.value == "tt_public") {
                    this.isopen_mention = false;
                }else{
                    this.isopen_mention = true;
                }
            },    
            remove (item) {
                var index = -1;
                for (var i = 0; i < this.selaccounts.length; i++) {
                    var ac= this.selaccounts[i];
                    console.log(item,ac);
                    if (item.acct == ac ) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) this.selaccounts.splice(index, 1);
            },
            remove_mention (item) {
                var index = -1;
                for (var i = 0; i < this.selmentions.length; i++) {
                    var ac= this.selmentions[i];
                    console.log(item,ac);
                    if (item.acct == ac ) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) this.selmentions.splice(index, 1);
            },
            keymaplistvalue : function (v,group) {
                return `${group}_${v}`;
            },
            sizing_window(){
                var breakpoint = this.$vuetify.breakpoint;
                var ju_width = "";
                var ju_fullscreen = false;
                if (breakpoint.lgAndUp) {
                    ju_width = "50%";
                    ju_fullscreen = false;
                }else if (breakpoint.md) {
                    if (breakpoint.mdAndDown) {
                        if (breakpoint.mdAndUp) {
                            ju_width = "50%";
                            ju_fullscreen = false;        
                        }else{
                            ju_width = "90%";
                            ju_fullscreen = false;
                        }
                    }else{
                        ju_width = "50%";
                        ju_fullscreen = false;        
                    }
                }else if (breakpoint.smAndDown) {
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
                    ju_width = "50%";
                    ju_fullscreen = false;
                }
                this.activewidth = ju_width;
                this.fullscreen = ju_fullscreen;
            },
            chip_user_name : function (data) {
                var dispname = MUtility.replaceEmoji(data.display_name,data.instance,data.emojis,12)
                if (dispname.length > 11) {
                    dispname = dispname.substr(0,10) + "...";
                }
                var ret = dispname + "@" + data.instance;
                return ret;
            }
        }
    });


    app["setupTootPageElement"] = function() {

        this.session.config.action.tags.forEach(e=>{
            this.commonvue.inputtoot.tags.push(e);
        });

        //this.forms["inputtoot"] = M.Modal.getInstance(ID("ov_inputtoot"));

        /*
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
            return false;height="56px"
        },false);
        */

        generate_charListEnum();
        for (var i = 0; i < charlistEnum.length; i++) {
            var ch = charlistEnum[i];
            this.commonvue.inputtoot.emojis_title.utf8.push(ch);
        }
        
        
    };

    app["generateSelectedCharList"] = function (sel){
		var chararea = document.getElementById("chararea");
		var rec = MYAPP.commonvue.inputtoot.emojis_title.utf8[sel];
		if (!rec) return;
		var chcnt = chararea.childElementCount;
		for (var i = chcnt-1; i >= 0; i--) {
			chararea.children[i].remove();
		}
		//chararea.children
		var ln = 0;
		for (var i = rec.start; i < rec.end; i = i + 0x1) {
			var btn = document.createElement("button");
			if (MYAPP.commonvue.inputtoot.$vuetify.breakpoint.smAndDown) {
                btn.className = 'charbutton-small';
            }else{
                btn.className = 'charbutton-normal';
            }
			if ((i >= 0x1DC0) && (i <= 0x1DFF)) {
				btn.innerHTML = "a&#" + i + ";";
			}else{
				btn.innerHTML = "&#" + i + ";";
			}
			btn.val = "&#" + i + ";";
			btn.title = "#" + i + ";";
			btn.onclick = function(){
				var a = this.innerHTML;
                /*var elem = Q("textarea[name='inputcontent']");
                var insertpos = elem.selectionStart;
                var text = MYAPP.commonvue.inputtoot.status_text;
                var before = text.substr(0,insertpos);
                var after = text.substr(insertpos,text.length);

                MYAPP.commonvue.inputtoot.status_text = before + a + after;
                */
                MYAPP.commonvue.inputtoot.ckeditor.editable().insertText(a);
                
			}
			chararea.appendChild(btn);
			ln++;
			if ((ln == 4) || (ln == 8)){
				var span = document.createElement("span");
				span.style.width = "1rem";
				span.innerHTML = " ";
				chararea.appendChild(span);
			}
			if (ln == 12) {
				//cont += "<br/>";
				var br = document.createElement("br");
				chararea.appendChild(br);
				ln = 0;
			}
		}
    };
    app["generateSelectedCharList_Instance"] = function (sel){
        var chararea = document.getElementById("chararea");
        var seltext = MYAPP.commonvue.inputtoot.emojis_title.instances[sel].text;
        var rec = MYAPP.acman.instances[seltext].emoji.data;
        if (!rec) return;
		var chcnt = chararea.childElementCount;
		for (var i = chcnt-1; i >= 0; i--) {
			chararea.children[i].remove();
		}
		//chararea.children
        var ln = 0;
        
        for (var obj in rec) {
            if (rec[obj].visible_in_picker) {
                var btn = GEN("button");
                var img = GEN("img");
                img.src = rec[obj].url;
                img.alt = rec[obj].shortcode;
                img.width = "24";
                img.height = "24";
                img.title = rec[obj].shortcode;
                if (MYAPP.commonvue.inputtoot.$vuetify.breakpoint.smAndDown) {
                    btn.className = 'charbutton-small';
                }else{
                    btn.className = 'charbutton-normal';
                }
                btn.appendChild(img);
                btn.title = rec[obj].shortcode;
                btn.onclick = function(e){
                    var a = this.title;
                    /*var elem = Q("textarea[name='inputcontent']");
                    var insertpos = elem.selectionStart;
                    var text = MYAPP.commonvue.inputtoot.status_text;
                    var before = text.substr(0,insertpos);
                    var after = text.substr(insertpos,text.length);

                    MYAPP.commonvue.inputtoot.status_text = `${before}:${a}:${after}`;*/
                    MYAPP.commonvue.inputtoot.ckeditor.editable().insertText(`:${a}:`);
                }
                chararea.appendChild(btn);
                ln++;
                if ((ln == 4) || (ln == 8)){
                    var span = document.createElement("span");
                    span.style.width = "1rem";
                    span.innerHTML = " ";
                    chararea.appendChild(span);
                }
                if (ln == 12) {
                    //cont += "<br/>";
                    var br = document.createElement("br");
                    chararea.appendChild(br);
                    ln = 0;
                }
            }
        }
    }
}