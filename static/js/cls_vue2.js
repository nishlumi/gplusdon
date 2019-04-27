//===----------------------------------------------------------------------===
//  Component: toot-inputbox
//===----------------------------------------------------------------------===
Vue.component("toot-inputbox", {
    template : CONS_TEMPLATE_INPUT_BOX,
    mixins: [vue_mixin_base, vue_mixin_for_inputtoot],
	props: {
		id : String,
		visibility : Boolean,
		translation: Object,
		globalinfo: Object,
		first_sharescope : String,
		firsttext : {
			type : String,
			default : ""
		},
		popuping : {
			type : String,
			default : ""
		},
		toolbtn : {
			type : Object,
			default : {
				close : true,
				open_in_new : true,
				otherwindow : false,
				help : true,
				open_in_browser : false,
				addcw : true,
				addimage : true,
				addgeo : true,
				addpoll: true,
				emoji : true,
				send : true
			}
		},
		tags : {
			type : Array,
			default : null
		},
		title : {
			type : String,
			default : ""
		}
		//account_info : Object,
    },
    data() {
		return {
			isfirst : true,
			isfirsttext : true,
			inputtoot_win : 0, //0 - normal input toot, 1 - scheduled status list
			show_openInNew : false,
            CNS_SAVENAME : "gp_inpt_conn",

			//---account box data
			max_account : 1,
			account_errmsg : "",
            account_rules : [
                v => {
					var flag = (v.length <= this.max_account);

					this.btnflags.send_disabled = !flag;

                    return flag || _T("post_error_msg03",[this.max_account])
                },
			],
			mainlink : {
                exists : false,
                url : "",
                isimage : false,
                image : "",
                description : "",
                site : "",
                title : "",
            },
            //---tag box data
            seltags : [],
			//tags: [],

			//---scheduled status screen
			schedules : [],
        };
	},
	watch: {
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
				tags.push(val[i]);
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
		},1000),
	},
	beforeMount() {
	},
	mounted() {
		//'dv_inputcontent'
		var newid = this.movingElementID('newinput_');
		CKEDITOR.disableAutoInline = true;
		CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
		this.ckeditor = CKEDITOR.inline( newid, CK_INPUT_TOOTBOX);

		this.ckeditable = this.ckeditor.editable();

		console.log("this.status_text=",this.status_text);

		$("#"+newid).pastableContenteditable();
		$("#"+newid).on('pasteImage',  (ev, data) => {
			console.log(ev,data);
			if (this.is_enable_poll) {
				appAlert(_T("msg_error_poll1"));
			}else{
				this.loadMediafiles("blob",[data.dataURL]);
			}
		}).on('pasteImageError', (ev, data) => {
			alert('error paste:',data.message);
			if(data.url){
				alert('But we got its url anyway:' + data.url)
			}
		}).on('pasteText',  (ev, data) => {
			console.log("text: " + data.text);
			this.status_text = this.status_text + data.text;
		});
	},
	beforeUpdate() {
		if (this.isfirsttext) {
			this.status_text = this.firsttext;
			this.$nextTick(()=>{
				if (this.ckeditor.editable()) {
					this.ckeditor.editable().setText(this.firsttext);
				}
				this.strlength = twttr.txt.getUnicodeTextLength(this.firsttext);

			});
			
			
			this.isfirsttext = false;
		}
	},
	Updated() {
		if (this.isfirst) {

			var OsmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
			latlng = L.latLng(34.3939, 134.3939);

			this.geomap = L.map(this.$el.querySelector('.here_map'), {center: latlng, dragging : true, zoom: 18,layers: [Osm]});
			console.log("geomap=",this.geomap);
			//---re-calculate location mark
			this.geomap.on("click",(e)=>{
				console.log(e);
				this.geo.locos.splice(0,this.geo.locos.length);
				for (var i = 0; i < this.geoitems.length; i++) {
					this.geomap.removeControl(this.geoitems[i]);
				}
				

				this.geo.lat = e.latlng.lat;
				this.geo.lng = e.latlng.lng;
				generate_marker(this.geo.lat,this.geo.lng,this.geo.zoom);
			});
			this.isfirst = false;
		}
		
	},
    methods : {
		//---Some function------------------------------------
		movingElementID : function (text) {
			return this.popuping + text + this.id;
		},
		select_window : function (index) {
			this.inputtoot_win = index;
		},
		select_scope: function (item) {
			for (var i = 0; i < this.sharescopes.length; i++) {
				this.sharescopes[i].selected["red--text"] = false;
			}
			item.selected["red--text"] = true;
			this.selsharescope.text = item.text;
			this.selsharescope.value = item.value;
			this.selsharescope.avatar = item.avatar;

			if (item.value == "tt_public") {
				this.isopen_mention = false;
			}else{
				this.isopen_mention = true;
			}
		},
		/**
		 * remove selected account
		 * @param {String} item 
		 */
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
			if (index >= 0) {
				for (var i = 0; i < this.medias.length; i++) {
					for (var name in this.medias[i]) {
						if (name == item.acct) {
							delete this.medias[i][name];
						}
					}
				}
				this.selaccounts.splice(index, 1);
			}
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
		chip_user_name : function (data) {
			var dispname = data.display_name;
			/*if (dispname.length > 11) {
				dispname = dispname.substr(0,10) + "...";
			}
			dispname = MUtility.replaceEmoji(dispname,data.instance,data.emojis,12)
			*/
			var ret = dispname + "@" + data.instance;
			return ret;
		},
		setText : function (text) {
			this.status_text = text;
			this.ckeditor.editable().setText(this.status_text);
		},
		setHTML : function (text) {
			this.status_text = text;
			this.ckeditor.editable().setHtml(this.status_text);
		},
		onclick_close : function (e) {
			var msg = _T("msg_cancel_post");
			var chkedit = false;
			if (this.status_text != "") chkedit = true;
			if (this.selmentions.length > 0) chkedit = true;
			if (this.selmedias.length > 0) chkedit = true;
			
			if (chkedit) {
				appConfirm(msg,()=>{
					this.clearEditor();
					if (this.otherwindow) {
						window.close();
					}else{
						this.dialog = false;
					}
					this.$emit("close",{});
				});
			}else{
				this.clearEditor();
				if (this.otherwindow) {
					window.close();
				}else{
					this.dialog = false;
				}
				this.$emit("close",{});
			}
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
		onclick_sched : function (e) {
			this.is_panel_sched = !this.is_panel_sched;
		},
		onclick_turn_win : function (e) {
			if (this.inputtoot_win == 0) {
				//---normal input -> scheduled statuses list
				this.onclick_reloadsched(e);
				this.inputtoot_win = 1;
			}else{
				//---scheduled statuses list -> normal input
				this.inputtoot_win = 0;
			}
		},
		onclick_reloadsched : function (e) {
			var hitac = this.getTextAccount2Object(0);
			if (hitac) {
				var backupAC = MYAPP.sns._accounts;
				MYAPP.sns.setAccount(hitac);

				var options = {
					api : {},
					app : {}
				};
				MYAPP.sns.getScheduledPost(null,options)
				.then(result=>{
					this.schedules = result.data;
				})
				.catch(err => {
					console.log(err);
				})
				.finally(()=>{
					MYAPP.sns.setAccount(backupAC);
				});
			}
		},
		onclick_schedline : function (item) {

		},
		onclick_moodbtn : function (e) {
			this.btnflags.mood["red--text"] = !this.btnflags.mood["red--text"];
			MYAPP.commonvue.emojisheet.is_sheet = !MYAPP.commonvue.emojisheet.is_sheet;

			if (!MYAPP.commonvue.emojisheet.is_sheet) {
				return;
			}
			MYAPP.commonvue.emojisheet.emojis_title.instances.splice(0,MYAPP.commonvue.emojisheet.emojis_title.instances.length);
			MYAPP.commonvue.emojisheet.emoji_subtitle.splice(0,MYAPP.commonvue.emojisheet.emoji_subtitle.length);
			for (var i = 0; i < this.selaccounts.length; i++) {
				var ac = this.getTextAccount2Object(i);
				
				if (MYAPP.acman.instances[ac.instance]["emoji"]) {
					var ins = MYAPP.acman.instances[ac.instance]["emoji"];
					var len_emoji = 0;
					for (var e in ins.data) {
						len_emoji++;
					}
					MYAPP.commonvue.emojisheet.emojis_title.instances.push({
						type : "inst",
						text : ins.instance,
						group : _T("instances"),
						start : 0,
						end : len_emoji
					});
				}else{
					MYAPP.sns.getInstanceEmoji(ac.instance)
					.then(emojiresult => {
						var ins = emojiresult;
						var len_emoji = 0;
						for (var e in ins.data) {
							len_emoji++;
						}
						MYAPP.acman.instances[emojiresult.instance]["emoji"] = emojiresult;
						MYAPP.commonvue.emojisheet.emojis_title.instances.push({
							type : "inst",
							text : emojiresult.instance,
							group : _T("instances"),
							start : 0,
							end : len_emoji
						});
					});

				}
			}
		},
    }
});
//===----------------------------------------------------------------------===
//  Component: reply-inputbox
//===----------------------------------------------------------------------===
Vue.component("reply-inputbox", {
	template: CONS_TEMPLATE_REPLYINPUT,
	mixins: [vue_mixin_base, vue_mixin_for_inputtoot],
	props: {
		id : String,
		visibility : Boolean,
		translation: Object,
		globalinfo: Object,
		first_sharescope : String,
		popuping : {
			type : String,
			default : ""
		},
		/**
		 * @param {String} reply_to_id toot ID to reply 
		 * @param {String} mention_to_id user ID to reply
		 * @param {Object} reply_account user object to reply
		 * @param {String} selectaccount account data to use as sender
		 */
		replydata : {
			type : Object,
			default : null
		}
	},
	data() {
		return {
			reply_to_id : "",
			//mention_to_id : "",
			isfirst : true,
			ismediamenu : false,
			wasset_replydata : false,
			ckeditor : {},
			btnflags : {
				send_disabled : false
			},

			//---share scope box and mention box data
            sharescopes : [
                {text : _T("sel_tlpublic"), value: "tt_public", avatar: "public", selected:{"red--text":true}},
                {text : _T("sel_tlonly"),   value: "tt_tlonly", avatar: "lock_open",selected:{"red--text":false}},
                {text : _T("sel_private"),  value: "tt_private", avatar: "lock",selected:{"red--text":false}},
                {text : _T("sel_direct"),  value: "tt_direct", avatar: "email",selected:{"red--text":false}},
            ],
			selsharescope : {
				text : _T("sel_tlpublic"),
				value : "tt_public",
				avatar : "public",
				selected:{"red--text":true}
			},

		}
	},
	beforeMount(){
	},
	mounted(){
		//---each initialize
		if (this.replydata) {
			this.selaccounts.push(this.replydata.selectaccount);
			this.reply_to_id = this.replydata.reply_to_id;
			if (this.replydata.reply_account) this.selmentions.push("@"+this.replydata.reply_account.acct);
		}
		//this.mention_to_id = this.replydata.mention_to_id;

		//this.ckeditor.on("keydown",this.onkeydown_inputcontent);
		//this.ckeditor.on("dragstart",this.ondragover_inputcontent);
		//this.ckeditor.on("change",this.onchange_inputcontent);

		var tmpscope = "tt_"+this.first_sharescope;
		if (this.first_sharescope == "unlisted") {
			tmpscope = "tt_tlonly";
		}
		//console.log("first_sharescope=",this.first_sharescope,tmpscope);
		var hitscopes = this.sharescopes.filter(e=>{
			if (tmpscope == e.value) {
				return true;
			}
			return false;
		});
		//console.log(hitscopes);
		this.select_scope(hitscopes[0]);


	},
	beforeUpdate() {
		if (this.replydata.reply_account) {
			if (!this.wasset_replydata) {
				this.reply_to_id = this.replydata.reply_to_id;
				this.selmentions.splice(0,this.selmentions.length);
				this.selmentions.push("@"+this.replydata.reply_account.acct);
				this.select_sender_account();
				this.wasset_replydata = true;
			}
		}
		if (this.isfirst) {
			//---setup CKeditor

			//this.isfirst = false;
		}
	},
	updated() {
		if (this.isfirst) {
			/*CKEDITOR.disableAutoInline = true;
			CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
			//console.log("popuping=",this.popuping + 'replyinput_'+this.id);
			//console.log(ID(this.popuping + 'replyinput_'+this.id));
			this.ckeditor = CKEDITOR.inline( this.popuping + 'replyinput_'+this.id, CK_INPUT_TOOTBOX);
			*/


			CKEDITOR.disableAutoInline = true;
			CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
			var elemid = this.movingElementID('replyinput_');
			this.ckeditor = CKEDITOR.inline( elemid, CK_INPUT_TOOTBOX);

			console.log("this.status_text=",this.status_text);
			//this.ckeditor.setData(this.status_text);

			$("#"+elemid).pastableContenteditable();
			$("#"+elemid).on('pasteImage',  (ev, data) => {
				console.log(ev,data);
				if (this.is_enable_poll) {
					appAlert(_T("msg_error_poll1"));
				}else{
					this.loadMediafiles("blob",[data.dataURL]);
				}
			}).on('pasteImageError', (ev, data) => {
				alert('error paste:',data.message);
				if(data.url){
					alert('But we got its url anyway:' + data.url)
				}
			}).on('pasteText',  (ev, data) => {
				console.log("text: " + data.text);
				this.status_text = this.status_text + data.text;
			});

			this.isfirst = false;
		}
	},
	watch: {
	},
	computed : {

	},
	methods: {
		movingElementID : function (text) {
			return this.popuping + text + this.id;
		},
		select_scope: function (item) {
			for (var i = 0; i < this.sharescopes.length; i++) {
				this.sharescopes[i].selected["red--text"] = false;
			}
			item.selected["red--text"] = true;
			this.selsharescope.text = item.text;
			this.selsharescope.value = item.value;
			this.selsharescope.avatar = item.avatar;
		},
		select_mention: function (mention) {
			this.selmentions.splice(0,this.selmentions.length);
			if (this.replydata.reply_account) this.selmentions.push("@"+this.replydata.reply_account.acct);
			this.calc_fulltext(this.status_text,{
				counting_firstmention : this.is_set_mention_checkbox
			});
		},
		select_sender_account : function (e) {
			this.selaccounts.splice(0,this.selaccounts.length);
			this.selaccounts.push(this.replydata.selectaccount);
		},
		enable_wasReplyInput : function (flag) {
			this.wasset_replydata = flag;
		},
		autocomplete_mention_func : CK_dataFeed_mention,
		//---event handler-------------------------------------
		onfocus_dv_inputcontent: function (e) {
			//e.target.nextElementSibling.classList.remove("common_ui_off");
		},
		onclick_btn_reply_cancel: function (e) {
			var msg = _T("msg_cancel_post");

			appConfirm(msg,()=>{
				this.ckeditor.editable().setText("");
				this.status_text = "";
				this.selsharescope = {
					text : _T("sel_tlpublic"),
					value : "tt_public",
					avatar : "public",
					selected:{"red--text":true}
				};
				this.selmedias.splice(0,this.selmedias.length);
				this.medias.splice(0,this.medias.length);
				this.switch_NSFW = false;
				this.seltags.splice(0,this.seltags.length);
				//this.tags.splice(0,this.tags.length);
				this.strlength = 0;
			});

		},
		onclick_btn_reply_post : function (e) {
			var pros = [];
			this.select_sender_account();
			for (var i = 0; i < this.selaccounts.length; i++) {
				var account = this.getTextAccount2Object(i);
				console.log(account);
				var mediaids = [];
				for (var m = 0; m < this.medias.length; m++) {
					mediaids.push(this.medias[m][account.acct].id);
				}
				var maintext = this.joinStatusContent({
					counting_firstmention : this.is_set_mention_checkbox
				});
				var pr = MYAPP.executePost(maintext,{
					"in_reply_to_id" : this.reply_to_id,
					"account" : account,
					"scope" : this.selsharescope,
					"media" : mediaids
				});
				pros.push(pr);
			}

			Promise.all(pros)
			.then(values=>{
				//---clear input and close popup
				this.status_text = "";
				this.selmentions.splice(0,this.selmentions.length);
				this.seltags.splice(0,this.seltags.length);
				this.selmedias.splice(0,this.selmedias.length);


				if (!this.fullscreen) {
					this.dialog = false;
				}
			})
			.finally(()=>{
				//---recover base reply mention of this toot 
				this.selmentions.push("@"+this.replydata.reply_account.acct);

				//---fire onreplied event to parent element

				this.status_text = "";
				this.mainlink.exists = false;
				this.ckeditor.editable().setText("");
				this.seltags.splice(0,this.seltags.length);
				this.selmedias.splice(0,this.selmedias.length);
				this.medias.splice(0,this.medias.length);
				this.switch_NSFW = false;

				this.$emit('replied');
			});
		}

	}
});