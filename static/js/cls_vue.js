//===========================================================================
//
//  Vue component define body
//
//===========================================================================
class GalleryOptions {
	constructor() {
		this.carousel = {
			adjustableHeight : false,
		};
		this.first_sensitive = true;
		this.initials = {
			is : false,
			value : -1
		}
	}
	copy(src){
		this.carousel.adjustableHeight = src.carousel.adjustableHeight;
		this.first_sensitive = src.first_sensitive;
		this.initials.is = src.initials.is;
		this.initials.value = src.initials.value;
	}
}
//===----------------------------------------------------------------------===
//  Component: timeline-toot
//===----------------------------------------------------------------------===
Vue.component("timeline-toot", {
	template: CONS_TEMPLATE_TOOTBODY,
	mixins: [vue_mixin_base],
	props: {
		translation: Object,
		globalinfo: Object,
		comment_viewstyle : {
			type : Object,
			default : null
		},
		comment_list_area_viewstyle : {
			type : Object,
			default : null
		},
		content_body_style : {
			type : Object,
			default : null,
		},
		popuping : {
			type : String,
			default : ""
		},
		/**
		 * Each element's css style JSON
		 */
		datastyle : {
			type : Object,
			default : null
		},
		gallery_options : {
			type: GalleryOptions,
			default : function() {
				return new GalleryOptions();
			},
		},
		toote: {
			type : Object,
			default : null
		}
	},
	data: function(){
		return {
			toot_body_stat : {
				"sizing-min" : false,
				"sizing-mid" : false,
				"sizing-max" : false,
				"sizing-fullmax" : false,
			},
			isfirst : true,
			issinglewindow : false,
			isboostmenu : false,
			isboost_hover : false,
			timerid : 0,
			timerparam : null,

            first_comment_stat : {
				close : true,
				mini : false,
				minione : false,
                open : false,
                full : false
			},
			comment_stat : {
				close : true,
				mini : false,
				minione : false,
                open : false,
                full : false
			},
			comment_list_area_stat : {
				default : true,
				scrollwithoutmini : false,
			},
			elementStyle : {
				"comment-list" : {
					sizing : true
				},
				"toot_avatar_imgsize" : "32px",
				"toot_action_class" : {
					has_comment_pos_close : true,
					has_comment_pos_mini : false,
					has_comment_pos_minione : false,
					has_comment_pos_open : false,
					has_comment_pos_full : false,
				},
				"instanceticker_class" : {
					"display-name" : true,
				}

			},
			isshow_replyinput : false,
			reply_to_id : "",
			mention_to_id : "",
			reply_data : {
				reply_to_id : "",
				reply_account : null,
				selectaccount : "",
			},
			
			//---share scope box and mention box data
            sharescopes : [
                {text : _T("sel_tlpublic"), value: "tt_public", avatar: "public", selected:{"red--text":true}},
                {text : _T("sel_tlonly"),   value: "tt_tlonly", avatar: "lock_open",selected:{"red--text":false}},
                {text : _T("sel_private"),  value: "tt_private", avatar: "lock",selected:{"red--text":false}},
            ],
			selsharescope : {
				text : _T("sel_tlpublic"),
				value : "tt_public",
				avatar : "public",
				selected:{"red--text":true}
			},

			//---reaction dialog: favorite, boost
			is_reactiondialog : false,
			reaction_dialog_title : "",
			reaction_info : {
				max_id : "",
				since_id : "",
			},
			reaction_accounts : [],
			is_reply_boostmenu : [],

			geomap : "",

			//---poll variables
			pollradio : "",
			currentPoll : {},

			//---request each updates
			isupdate_request : {
				reply : false
			},
			local_galoption : this.gallery_options,

		};
    },
    watch:  {
        status_text : function(val) {
            var mentions = this.calc_mentionLength(this.selmentions).join(" ");
            var tags = this.seltags.join(" ");
            this.strlength = twttr.txt.getUnicodeTextLength(val)
                + mentions.length + tags.length;
            
        },
		toote : function (val) {
			if (val.body.poll) {
				var tmppoll = this.initialize_poll(val.body.poll);
				this.currentPoll[val.body.id] = tmppoll;
			}

		}
    },
	computed: {
		tootElementId: function () {
            if ("body" in this.toote) {
                return this.popuping + "toot_" + this.toote.id;
            }
		},
		
		favourite_type : function() {
			return _T("favourite_"+MYAPP.session.config.application.showMode);
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
		reblog_type : function() {
			return _T("reblog_"+MYAPP.session.config.application.showMode);
		},
		gal_viewmode : function () {
			return MYAPP.session.config.application.gallery_type;
		},
		boost_actiontype : function() {
			if ("boost_actiontype" in MYAPP.session.config.action) {
				return MYAPP.session.config.action.boost_actiontype;
			}else{
				return "0";
			}
		},
		nopermit_action : function() {
			if (MYAPP.commonvue.cur_sel_account.applogined) {
				return this.toote.is_archive;
			}else{
				return true;
			}
		}
		
	},
	beforeMount(){

		//---from commonvue.tootcard
		if (this.datastyle) {
			this.elementStyle = Object.assign({},this.datastyle);
		}
		if (this.comment_viewstyle) {
			for (var obj in this.comment_stat) {
				this.comment_stat[obj] = this.comment_viewstyle[obj];
				this.first_comment_stat[obj] = this.comment_viewstyle[obj];
			}
			this.isshow_replyinput = false;
			this.issinglewindow = true;
		}
		if (this.comment_list_area_viewstyle) {
			this.comment_list_area_stat.default = this.comment_list_area_viewstyle.default;
		}

		//---for media object(tootgallery-carousel)
		this.local_galoption = new GalleryOptions();
		if (this.gallery_options) {
			this.local_galoption.copy(this.gallery_options);
		}

		//---option: remove nsfw, if specified instance
		if ((MYAPP) && (MYAPP.session.config.action.remove_nsfw_remove_instance === true)) {
			if (this.toote) {
				if (MYAPP.session.config.action.nsfw_remove_instances.indexOf(this.toote.account.instance) > -1) {
					this.local_galoption.first_sensitive = false;
				}
			}
		}

		//---for applying InstanceTicker css class
		if ((MYAPP) && ("show_instanceticker" in MYAPP.session.config.application)) {
			this.elementStyle.instanceticker_class["display-name"] = MYAPP.session.config.application.show_instanceticker;
		}

		
	},
	mounted(){
		//console.log("created html=",this.toote.body.html)
		if (this.toote) {
			var pcnt = this.toote.body.html.match(/<p/g) || [];
			var brcnt = this.toote.body.html.match(/<br/g) || [];
			var fnlcnt = pcnt.length + brcnt.length + (this.toote.body.spoiler_text.length > 0 ? 1 : 0);
			var gridsp = parseInt(this.toote.cardtypeSize["grid-row-start"].replace("span", ""));
			var contentlength = this.toote.body.content.length + this.toote.body.spoiler_text.length;

			//console.log("created cnt=",pcnt,brcnt);
			if ((fnlcnt < 3) && (contentlength < 40)) {
				this.toot_body_stat["sizing-min"] = true;
			}else if ((fnlcnt < 5)) {
				if ((checkRange(1,contentlength,50))) {
					this.toot_body_stat["sizing-min"] = true;
				}else if ((checkRange(50,contentlength,100))) {
					this.toot_body_stat["sizing-mid"] = true;
				}else{
					gridsp += 1;
					if (this.toote.urls.length > 0) {
						this.toot_body_stat["sizing-mid"] = true;
					}else{
						this.toot_body_stat["sizing-max"] = true;
					}
				}
			}else{
				this.toot_body_stat["sizing-max"] = true;
				gridsp += 2;
			}

			//this.toote.cardtypeSize["grid-row-start"] = `span ${gridsp}`;

			
			if (this.toote.geo.enabled) {  //
				//this.initialize_geomap();
				this.get_mapurl(this.toote.geo.location[0],0);
			}

			if (this.toote.body.poll) {
				var tmppoll = this.initialize_poll(this.toote.body.poll);
				this.currentPoll[this.toote.body.id] = tmppoll;
			}
	
		}
		
		//console.log(this.$el);
		/*var es = this.$el.querySelectorAll(".carousel");
		console.log(es.length);
		for (var i = 0; i < es.length; i++) {
			M.Carousel.init(es[i], {
				dist: 0,
				fullWidth: true,
				indicators: true
			});
		}*/
		jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
		$("time.timeago").timeago();

	
	},
	updated(){
		if ((this.toote) && ("descendants" in this.toote)) {
			if (this.toote.descendants.length > 0) {
				if (this.isfirst) {
					if (!this.elementStyle.toot_action_class.has_comment_pos_full &&
						!this.elementStyle.toot_action_class.has_comment_pos_open
					) {
						if (this.toote.descendants.length <= 1) {
							this.comment_stat.minione = true;
							this.first_comment_stat.minione = true;
							this.elementStyle.toot_action_class.has_comment_pos_minione = true;
						}else{
							this.comment_stat.mini = true;
							this.first_comment_stat.mini = true;
							this.elementStyle.toot_action_class.has_comment_pos_mini = true;
						}

					}
					this.comment_stat.close = false;
					this.first_comment_stat.close = false;
					this.elementStyle.toot_action_class.has_comment_pos_close = false;

					if (this.comment_viewstyle) {
						for (var obj in this.comment_stat) {
							this.comment_stat[obj] = this.comment_viewstyle[obj];
							this.first_comment_stat[obj] = this.comment_viewstyle[obj];
						}
						this.isshow_replyinput = true;
					}
				}
				
				this.isfirst = false;
			}
		}
		if (this.comment_list_area_viewstyle) {
			this.comment_list_area_stat.default = this.comment_list_area_viewstyle.default;
		}
		if (this.content_body_style) {
			this.toot_body_stat["sizing-fullmax"] = true;
		}

		if (this.isupdate_request.reply) {
			this.apply_childReplyInput();
			this.isupdate_request.reply = false;
		}
		if (this.gallery_options) {
			this.local_galoption.copy(this.gallery_options);
		}

	},
	methods: {
		//---some function----------------------------------------
		generate_userlink: function (data) {
			return `/users/${data.instance}/${data.username}`;
		},
		hide_on_noauth : function () {
			return !this.globalinfo.is_serveronly;
		},
		replyElementId: function (reply) {
			return this.popuping + "reply_" + reply.id;
		},
		reply_usertitle : function (reply) {
			return (reply.account.display_name != "" ? reply.account.display_name : reply.account.username) + " @" + reply.account.instance;
		},
		generateReplyObject: function (reply){
			var selac = MYAPP.session.status.selectedAccount;
			var data = {
				reply_to_id : reply.body.id,
				reply_account : reply.account,
				selectaccount : `${selac.idname}@${selac.instance}`
			};
			this.$refs.replyinput.enable_wasReplyInput(false);
			return data;
		},
		set_replydata : function (paramtoote) {
			
			this.reply_data = this.generateReplyObject(paramtoote ? paramtoote : this.toote);
		},
		apply_childReplyInput : function () {
			this.$refs.replyinput.select_mention();
			this.$refs.replyinput.select_sender_account();
			this.apply_initialReplyInputCounter();
		},
		apply_initialReplyInputCounter : function () {
			if (this.$refs.replyinput) {
				this.$refs.replyinput.calc_fulltext("",{
					counting_firstmention : true
				});
			}
		},
		favourite_reaction_msg : function() {
			return _T("msg_reaction_fav_"+MYAPP.session.config.application.showMode);
		},
		reblog_reaction_msg : function() {
			return _T("msg_reaction_bst_"+MYAPP.session.config.application.showMode);
		},
		get_instance_original_url : function (toote) {
			return MUtility.generate_instanceOriginalURL(MYAPP.commonvue.cur_sel_account.account,toote);
		},
		get_tagurl : function (tag) {
			return MUtility.generate_hashtagpath(tag);
		},
		get_mapurl : function (location,index) {
			this.geomap =  MUtility.getStaticMap(location,MYAPP.session.config.application.map_type,index);
		},
		initialize_geomap : function () {
			var OsmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
			latlng = L.latLng(this.toote.geo.location[0].lat, this.toote.geo.location[0].lng);

			//---$children is Vue.component
			//   But, $children[0] is parent of the array timeline-toot
			//   So, [1] is real start.
			var oneelem = this.$el;
			//oneelem.querySelector('.here_map')
			var geomap = L.map(
				ID("heremap"+this.toote.id), {
					center: latlng, 
					dragging : true, 
					zoom: this.toote.geo.location[0].zoom,
					layers: [Osm]
				}
			);
			this.geomap = geomap;
			this.curLocation = null;

			for (var i = 0; i < this.toote.geo.location.length; i++) {
				var ll = this.toote.geo.location[i];
				var marker = L.marker({lat:ll.lat,lng:ll.lng}).addTo(geomap);
				marker.on("click",(ev)=>{
					//ev.sourceTarget.remove();
					//this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}&n=${}`;
				});
				marker.bindPopup(ll.name);
			}
		},
		initialize_poll : function (poll){
			var cho = "";
			var tmppoll = {
				original : {},
				icon : [],
				choice : [],
			};
			for (var obj in poll) {
				tmppoll.original[obj] = poll[obj];
			}
			if (tmppoll.original.multiple) {
				cho = "check_box_outline_blank";
			}else{
				cho = "radio_button_unchecked";
			}
			for (var i = 0; i < tmppoll.original.options.length; i++) {
				tmppoll.icon.push(cho);
				tmppoll.choice.push(false);
			}
			return tmppoll;
		},
		counting_vote : function (poll,allcount) {
			var tmp = "";
			var v = poll.votes_count;
			if (allcount > 0) {
				v = v / allcount;
			}else{
				v = 0;
			}
			var percent = Math.round(v * 100);
			return percent;
		},
		is_off_vote : function (poll) {
			return poll.voted || poll.expired;
		},
		isBoostable : function (toote) {
			var boostable = [
				"private", "direct"
			];
			if (!MYAPP.commonvue.cur_sel_account.applogined) return true;

			if (boostable.indexOf(toote.body.visibility) > -1) {
				return true;
			}else{
				if (toote.is_archive) {
					return true;
				}else{
					return false;
				}
			}
		},
		voteicon_styling : function (choice,poll,toote) {
			if (toote && this.currentPoll[toote.body.id]) {
				if (poll.multiple) {
					if (this.currentPoll[toote.body.id].choice[choice] === true) {
						return "check_box";
					}else{
						return "check_box_outline_blank";
					}
				}else{
					if (this.currentPoll[toote.body.id].choice[choice] === true) {
						return "radio_button_checked";
					}else{
						return "radio_button_unchecked";
					}
				}
			}else{
				return "radio_button_unchecked";
			}
		},
		is_off_mini : function () {
			return !this.comment_stat.mini && !this.comment_stat.minione;
		},
		checkMediasCount : function () {
			var cnt = 0;
			cnt = this.toote.medias.length;
			for (var a = 0; a < this.toote.descendants.length; a++) {
				var chld = this.toote.descendants[a];
				cnt += chld.medias.length;
			}
			return cnt;
		},
		/**
		 * 
		 * @param {JSON} options options after to get conversation
		 *  options = {
		 *    mode : boolean (r - read, p - posted)
		 *    descendants {before : integer, after : integer}
		 *  }
		 */
		reload_tootcontext_body : function (options) {
			var def = new Promise((resolve,reject)=>{
				if (!this.toote.is_archive) {
					var conversa_opt = {
						api : {
		
						},
						app : {
							parent : {
								ID : this.toote.body.id,
								index : ""
							},
							descendants : options.descendants
						}
					};
					//MYAPP.sns.getConversation(this.toote.body.id, this.toote.body.id, "")
					MYAPP.sns.getConversation(this.toote.body.id, conversa_opt)
					.then((condata) => {
						var tt = this.toote; //this.getParentToot(condata.parentID);
						for (var a = 0; a < condata.data.ancestors.length; a++) {
							var ance = condata.data.ancestors[a];
							var gcls = new Gpstatus(ance,14);

							condata.data.ancestors[a] = gcls;

							if (gcls.body.poll) {
								var tmppoll = this.initialize_poll(gcls.body.poll);
								this.currentPoll[gcls.body.id] = tmppoll;
							}
			

						}
						for (var a = 0; a < condata.data.descendants.length; a++) {
							var desce = condata.data.descendants[a];
							var gcls = new Gpstatus(desce,14);


							condata.data.descendants[a] = gcls;
							if (gcls.body.poll) {
								var tmppoll = this.initialize_poll(gcls.body.poll);
								this.currentPoll[gcls.body.id] = tmppoll;
							}
						}
						//this.toote.comment_stat.mini = condata.data.descendants.length == 0 ? false : true;

						if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
							this.toote.ancestors.splice(0,this.toote.ancestors.length);
							this.toote.descendants.splice(0,this.toote.descendants.length);
							this.toote.ancestors = this.toote.ancestors.concat(condata.data.ancestors);
							this.toote.descendants = this.toote.descendants.concat(condata.data.descendants);
							this.toote.body.replies_count = condata.data.descendants.length;
							if (!this.comment_stat.full) {
								//---normal to read comment
								this.first_comment_stat.close = false;
								this.elementStyle.toot_action_class.has_comment_pos_close = false;
								if (this.toote.descendants.length <= 1) {
									this.first_comment_stat.minione = true;
									this.comment_stat.minione = false;
									this.elementStyle.toot_action_class.has_comment_pos_minione = this.comment_stat.minione;
								}else{
									this.first_comment_stat.mini = true;
									this.comment_stat.mini = false;
									this.elementStyle.toot_action_class.has_comment_pos_mini = this.comment_stat.mini;
								}
								this.comment_stat.open = true;
								this.elementStyle.toot_action_class.has_comment_pos_open = this.comment_stat.open;
								if (condata.options.app.descendants) {
									//---if initial get 0, but reget is N, append span 3 to grid-row-start
									if ((condata.options.app.descendants.before == 0) && (condata.options.app.descendants.before < condata.data.descendants.length)) {
										var sp = parseInt(this.toote.cardtypeSize["grid-row-start"].replace("span", ""));
										sp = sp + 3;
										this.$set(this.toote.cardtypeSize, "grid-row-start", `span ${sp}`);
		
									}
								}
							}
							this.$nextTick(function () {
								jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
								$("time.timeago").timeago();
							});
		
						}
						return condata;
					})
					.then((result)=> {
						

						var basetoote = this.toote;
						for (var i = 0; i < basetoote.descendants.length; i++) {
							var toote = basetoote.descendants[i];
							if (("relationship" in toote) && ("following" in toote.relationship)) {
								
							}else{
								MYAPP.sns.getRelationship(toote.account.id)
								.then((result2) => {
									for (var i = 0; i < result2.data.length; i++) {
										for (var obj in result2.data[i]) {
											toote.relationship[obj] = Object.assign({}, result2.data[i][obj]);
										}
									}
								});
							}
						}
						resolve({
							condata : result,
							first_comment_stat : this.first_comment_stat,
							comment_stat : this.comment_stat,
							toot_action_class : this.toot_action_class
						});

					})
					.finally( () => {
						//e.target.classList.toggle("lighten-3");
						//this.isshow_replyinput = !this.isshow_replyinput;
						//target.querySelector("div.template_reply_box").classList.toggle("common_ui_off");	
					});
				}
				this.isshow_replyinput = true;
			});
			return def;
		},
		//---event handler----------------------------------------
		onclick_toot_ancestor : function (e) {
			var ans = this.toote.ancestors[this.toote.ancestors.length-1];

			MYAPP.commonvue.tootecard.status = ans;

			MYAPP.commonvue.tootecard.comment_list_area_viewstyle.default = false;
			MYAPP.commonvue.tootecard.comment_list_area_viewstyle.scrollwithoutmini = true;
			MYAPP.commonvue.tootecard.datastyle.toot_action_class.has_comment_pos_full = true;
			//MYAPP.commonvue.tootecard.comment_stat.full = true;

			MYAPP.commonvue.tootecard.$refs.tootview.reply_data = this.generateReplyObject(this.toote);
			MYAPP.commonvue.tootecard.$nextTick(()=>{
				MYAPP.commonvue.tootecard.$refs.tootview.set_replydata();
				MYAPP.commonvue.tootecard.$refs.tootview.apply_childReplyInput();
				MYAPP.commonvue.tootecard.$refs.tootview.$refs.replyinput.select_sender_account();
			});

			MYAPP.commonvue.tootecard.sizing_window();
			MYAPP.commonvue.tootecard.is_overlaying = true;
			//---change URL
			if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
				MUtility.returnPathToList(MYAPP.session.status.currentLocation);
			}
			var targetpath = "";
			/*var changeuri = ans.body.uri.replace("https://","");
			changeuri = changeuri.replace("statuses","toots");
			changeuri = changeuri.replace("users/","");
			//---when each screen existable toot
			targetpath = `/users/${changeuri}`;*/
			targetpath = MUtility.generate_tootpath(ans);
			MUtility.enterFullpath(targetpath);
		},
		/**
		 * To show toot as fullscreen view
		 * @param {Event} e Event object
		 */
        onclick_tt_datetime: function (e) {
			//console.log(e);

			//---reload some information
			if (!this.toote.is_archive) {
				MYAPP.sns.getToot(this.toote.id,{})
				.then(result=>{
					this.toote.body.favourites_count = result.data.favourites_count;
					this.toote.body.reblogs_count = result.data.reblogs_count;
				});
			}
			
			if (this.issinglewindow) return;

			//======old: the element moving mode
			//---refer to destination parent 
			//var dest = Q("div.onetoote_area");
            //dest.appendChild(target);
			//======new: Vue data format mode
			MYAPP.commonvue.tootecard.status = null;
			MYAPP.commonvue.tootecard.status = this.toote;
			MYAPP.commonvue.tootecard.comment_list_area_viewstyle.default = false;
			MYAPP.commonvue.tootecard.comment_list_area_viewstyle.scrollwithoutmini = true;
			MYAPP.commonvue.tootecard.datastyle.toot_action_class.has_comment_pos_full = true;
			//MYAPP.commonvue.tootecard.comment_stat.full = true;

			MYAPP.commonvue.tootecard.$refs.tootview.reply_data = this.generateReplyObject(this.toote);
			MYAPP.commonvue.tootecard.$nextTick(()=>{
				MYAPP.commonvue.tootecard.$refs.tootview.set_replydata();
				MYAPP.commonvue.tootecard.$refs.tootview.apply_childReplyInput();
				MYAPP.commonvue.tootecard.$refs.tootview.$refs.replyinput.select_sender_account();
			});

			//---change each states
			///Q("div.onetoote_screen").classList.toggle("common_ui_off");
			MYAPP.commonvue.tootecard.sizing_window();
			MYAPP.commonvue.tootecard.is_overlaying = true;

			//---change URL
			if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
				MUtility.returnPathToList(MYAPP.session.status.currentLocation);
			}
			var ispleroma = false;
			if (this.toote.body.url.indexOf("/notice") > -1) {
				//---Pleroma instance
				ispleroma = true;
			}
			var targetpath = "";
			var changeuri = "";
			if (ispleroma) {
				//pleroma: "https://pl.smuglo.li/notice/9iOHWzzAYkqnfGeASm"
				changeuri = this.toote.body.url.replace("https://","");
			}else{
				//mastodon: "https://server.net/users/hoge/statuses/102024957804480334",
				changeuri = this.toote.body.uri.replace("https://","");
			}
			changeuri = changeuri.replace("statuses","toots");
			changeuri = changeuri.replace("users/","");
			changeuri = changeuri.replace("/notice",`/${this.toote.account.username}/toots`);
			//---when each screen existable toot
			if (MYAPP.session.status.currentLocation.indexOf("/tl") > -1) {
				//targetpath = `/users/${this.toote.account.instance}/${this.toote.account.username}/toots/${this.toote.id}`;
				targetpath = `/users/${changeuri}`;
			}else if (MYAPP.session.status.currentLocation.indexOf("/users") > -1) {
				targetpath = `/users/${changeuri}`;
			}else if (MYAPP.session.status.currentLocation.indexOf("/accounts") > -1) {
				targetpath = `/accounts/${changeuri}`;
			}
			if (ispleroma) {
				targetpath += "?s=p";
			}
			MUtility.enterFullpath(targetpath);

			return Promise.resolve(true);
	
		},
		onclick_morevert: function (e) {
			
			var parent = e.target.parentElement.parentElement.parentElement;
			if (e.target.tagName.toLowerCase() == "i") {
				parent = e.target.parentElement.parentElement.parentElement.parentElement;
			}
			//console.log(e.target, e.target.parentElement, e.target.parentElement.parentElement, parent);
			var target = parent.querySelector(".card-userreveal");
			var userid = parent.querySelector("input[name='userid']");
			//console.log(target, userid);
			if (this.toote.relationship.isme) {
				if (this.$vuetify.breakpoint.smAndDown) {
					MYAPP.commonvue.mobilemenu.toote = this.toote;
					MYAPP.commonvue.mobilemenu.show(!MYAPP.commonvue.mobilemenu.isShow());
					return;
				}else{
					target.classList.add("is-veal");
					target.classList.remove("un-veal");
				}
			}else{
				if (this.toote.is_archive) {
					if (this.$vuetify.breakpoint.smAndDown) {
						MYAPP.commonvue.mobilemenu.toote = this.toote;
						MYAPP.commonvue.mobilemenu.show(!MYAPP.commonvue.mobilemenu.isShow());
						return;
					}else{
						target.classList.add("is-veal");
						target.classList.remove("un-veal");
					}
				}else{
					MYAPP.sns.getRelationship(userid.value)
					.then((data) => {
						for (var i = 0; i < data.data.length; i++) {
							for (var obj in data.data[i]) {
								this.toote.relationship[obj] = data.data[i][obj];
							}
						}
						if (this.$vuetify.breakpoint.smAndDown) {
							MYAPP.commonvue.mobilemenu.toote = this.toote;
							MYAPP.commonvue.mobilemenu.show(!MYAPP.commonvue.mobilemenu.isShow());
							return;
						}else{
							target.classList.add("is-veal");
							target.classList.remove("un-veal");
						}
					});
				}
			}
		},
		onclick_vealclose: function (e) {
			var parent = e.target.parentElement.parentElement.parentElement;
			if (e.target.tagName.toLowerCase() == "i") {
				parent = e.target.parentElement.parentElement.parentElement.parentElement;
			}
			var target = parent.querySelector(".card-userreveal");
			target.classList.remove("is-veal");
			target.classList.add("un-veal");
		},
		/**
		 * Open comment area of the toot, and set up reply data
		 * @param {Event} e event object
		 */
		onclick_ttbtn_reply: function (e) {
			//console.log(e);
			console.log(this.$vuetify.breakpoint);
			if ((this.$vuetify.breakpoint.xs) && (this.popuping == "")) {
				//---if smallest mobile, open other window
				this.onclick_tt_datetime(e)
				.then(flag=>{
					MYAPP.commonvue.tootecard.$refs.tootview.onclick_ttbtn_reply(e);
				});
				return;
			}
			//---set up data for reply
			this.reply_data = this.generateReplyObject(this.toote);
			this.$refs.replyinput.enable_wasReplyInput(false);
			//this.$refs.replyinput.replyinput.select_sender_account();
			//this.call_replySetup();

			//---set up view layout for reply
			var target = e.target.parentElement.parentElement.nextElementSibling;
			var rootParent = e.target.parentElement.parentElement.parentElement;

			//---change view styles
			if (this.comment_stat.full) {
				//return;
			}else{
				if (this.first_comment_stat.close) {
					this.comment_stat.close = !this.comment_stat.close;
					this.comment_stat.open = !this.comment_stat.open;
					this.elementStyle.toot_action_class.has_comment_pos_close = !this.elementStyle.toot_action_class.has_comment_pos_close;
					this.elementStyle.toot_action_class.has_comment_pos_open = !this.elementStyle.toot_action_class.has_comment_pos_open;
				}
				if (this.toote.descendants.length <= 1) {
					if (this.first_comment_stat.minione) {
						this.comment_stat.minione = !this.comment_stat.minione;
						this.comment_stat.open = !this.comment_stat.open;
						this.elementStyle.toot_action_class.has_comment_pos_minione = !this.elementStyle.toot_action_class.has_comment_pos_minione;
						this.elementStyle.toot_action_class.has_comment_pos_open = !this.elementStyle.toot_action_class.has_comment_pos_open;
					}
					this.comment_stat.mini = false;
					this.elementStyle.toot_action_class.has_comment_pos_mini = false;
				}else{
					if (this.first_comment_stat.mini) {
						this.comment_stat.mini = !this.comment_stat.mini;
						this.comment_stat.open = !this.comment_stat.open;
						this.elementStyle.toot_action_class.has_comment_pos_mini = !this.elementStyle.toot_action_class.has_comment_pos_mini;
						this.elementStyle.toot_action_class.has_comment_pos_open = !this.elementStyle.toot_action_class.has_comment_pos_open;
					}
					this.comment_stat.minione = false;
					this.elementStyle.toot_action_class.has_comment_pos_minione = false;
				}
				this.comment_list_area_stat.scrollwithoutmini = !this.comment_list_area_stat.scrollwithoutmini;
				//target.classList.toggle("mini");
				//if (!target.classList.contains("full")) {
				//	target.classList.toggle("open");
				//}
				//var style = window.getComputedStyle(rootParent);
				//var num_row = parseInt(style.gridRowStart.replace("span", ""));
				var num_row = parseInt(this.toote.cardtypeSize["grid-row-start"].replace("span", ""));
				let SIZE4COMMENT = 2;
				//if (target.classList.contains("mini")) {
				if (this.comment_stat.mini || this.comment_stat.minione) {
					num_row = num_row - SIZE4COMMENT;
				//} else if (target.classList.contains("open")) {
				}else if (this.comment_stat.close) {
					num_row = num_row - SIZE4COMMENT;
				}else if (this.comment_stat.open) {
					num_row = num_row + SIZE4COMMENT;
				}
				//rootParent.style.gridRowStart = `span ${num_row}`;
				this.toote.cardtypeSize["grid-row-start"] = `span ${num_row}`;
				
			}

			if (this.comment_stat.open || this.comment_stat.full) {
				this.is_opencomment = true;
				this.reload_tootcontext_body({
					mode:"r",
					descendants : {
						before :this.toote.descendants.length || 0, 
						after : 0,
					}
				})
				.then(result=>{
					/*var num_row = parseInt(this.toote.cardtypeSize["grid-row-start"].replace("span", ""));
					let SIZE4COMMENT = 4;
					//if (target.classList.contains("mini")) {
					if (this.comment_stat.mini || this.comment_stat.minione) {
						num_row = num_row - SIZE4COMMENT;
					//} else if (target.classList.contains("open")) {
					}else if (this.comment_stat.close) {
						num_row = num_row - SIZE4COMMENT;
					}else if (this.comment_stat.open) {
						num_row = num_row + SIZE4COMMENT;
					}
					//rootParent.style.gridRowStart = `span ${num_row}`;
					this.toote.cardtypeSize["grid-row-start"] = `span ${num_row}`;
					*/
				});
				e.target.classList.remove("lighten-3");
			}else{
				this.is_opencomment = false;
				this.isshow_replyinput = false;
				e.target.classList.add("lighten-3");
			}
			
			
			

		},
		onclick_ttbtn_allgallery : function (e) {
			var dv = GEN("div");
			var items = [];
			var lgdyna = ID("lg_dyna");
			lgdyna.innerHTML = "";
			var videocnt = 0;
			
			for (var i = 0; i < this.toote.medias.length; i++) {
				var item = this.toote.medias[i];
				/*var txt = this.toote.body.content.substr(0,50);
				var html = MUtility.replaceEmoji(txt,this.toote.account.instance,this.toote.body.emojis,16);
				var pdiv = GEN("div");
				pdiv.id = `video${videocnt}`;
				pdiv.style.display = "none";
				var videodiv = GEN("video");
				var sourcediv = GEN("source");
				var itemjson = {
					subHtml : `<h4>${item.description || html }</h4>
					<p><img src="${this.toote.account.avatar}" width="24" height="24"><span class="lg-usercaption-avatarname">${this.toote.account.display_name}</span></p>
					`,
					html : ""
				};
				if (item.type == "video") {
					//videohtml = `<div id="video${videocnt}" style="display:none;"><video controls src="${item.url}" class="lg-video-object lg-html5" title="${item.description}">Video: ${item.description}</video></div>`;
					sourcediv.src = item.url;
					sourcediv.type = "video/mp4";
					videodiv.className = "lg-video-object lg-html5";
					videodiv.title = item.description;
					videodiv.controls = true;
					videodiv.preload = "none";
					videodiv.appendChild(sourcediv);
					pdiv.appendChild(videodiv);
					
					itemjson["src"] = item.url;
					itemjson["thumb"] = item.preview_url;
					itemjson["poster"] = item.preview_url;
					itemjson["html"] = `#video${videocnt}`;
				}else if (item.type == "gifv") {
					//videohtml = `<div id="video${videocnt}" style="display:none;"><video loop autoplay src="${item.url}" class="lg-video-object lg-html5" title="${item.description}" click="onmouseenter_gifv">Video: ${item.description}</video></div>`;
					videodiv.src = item.url;
					videodiv.className = "lg-video-object lg-html5";
					videodiv.title = item.description;
					videodiv.loop = true;
					videodiv.autoplay = true;
					videodiv.preload = "none";
					videodiv.appendChild(sourcediv);
					pdiv.appendChild(videodiv);
					
					itemjson["src"] = item.url;
					itemjson["thumb"] = item.preview_url;
					itemjson["poster"] = item.preview_url;
					itemjson["html"] = `#video${videocnt}`;
				}else{
					itemjson["src"] = item.url;
					itemjson["thumb"] = item.preview_url;
				}
				lgdyna.appendChild(pdiv);
				items.push(itemjson);*/
				items.push(MUtility.generate_lightGalleryItem(this.toote,item,videocnt));
				videocnt++;
			}
			for (var a = 0; a < this.toote.descendants.length; a++) {
				var chld = this.toote.descendants[a];
				var hit = true;
				if (MYAPP.session.config.notification.show_allmedias_onlyone) {
					if (this.toote.account.acct != chld.account.acct) {
						hit = false;
					}
				}
				if (hit) {
					for (var i = 0; i < chld.medias.length; i++) {
						var item = chld.medias[i];
						/*var txt = chld.body.content.substr(0,50);
						var html = MUtility.replaceEmoji(txt,chld.account.instance,chld.body.emojis,16);
						var pdiv = GEN("div");
						pdiv.id = `video${videocnt}`;
						pdiv.style.display = "none";
						var videodiv = GEN("video");
						var itemjson = {
							subHtml : `<h4>${chld.medias[i].description || html }</h4>
							<p><img src="${chld.account.avatar}" width="24" height="24"><span class="lg-usercaption-avatarname">${chld.account.display_name}</span></p>
							`,
							html : `#video${videocnt}`
						};
						if (item.type == "video") {
							//videohtml = `<div id="video${videocnt}" style="display:none;"><video controls src="${item.url}" class="lg-video-object lg-html5" title="${item.description}">Video: ${item.description}</video></div>`;
							videodiv.src = item.url;
							videodiv.className = "lg-video-object lg-html5";
							videodiv.title = item.description;
							videodiv.controls = true;
							videodiv.preload = "none";
							videodiv.appendChild(sourcediv);
							pdiv.appendChild(videodiv);

							itemjson["src"] = item.url;
							itemjson["thumb"] = item.preview_url;
							itemjson["poster"] = item.preview_url;
							itemjson["html"] = `#video${videocnt}`;
						}else if (item.type == "gifv") {
							//videohtml = `<div id="video${videocnt}" style="display:none;"><video loop autoplay src="${item.url}" class="lg-video-object lg-html5" title="${item.description}" click="onmouseenter_gifv">Video: ${item.description}</video></div>`;
							videodiv.src = item.url;
							videodiv.className = "lg-video-object lg-html5";
							videodiv.title = item.description;
							videodiv.loop = true;
							videodiv.autoplay = true;
							videodiv.appendChild(sourcediv);
							pdiv.appendChild(videodiv);

							itemjson["src"] = item.url;
							itemjson["thumb"] = item.preview_url;
							itemjson["poster"] = item.preview_url;
							itemjson["html"] = `#video${videocnt}`;
						}else{
							itemjson["src"] = item.url;
							itemjson["thumb"] = item.preview_url;
						}
						
						lgdyna.appendChild(pdiv);
						items.push(itemjson);*/
						items.push(MUtility.generate_lightGalleryItem(chld,item,videocnt));
						videocnt++;
					}
				}
			}
			lightGallery(dv,{
				dynamic : true,
				html : true,
				thumbnail:true,
				animateThumb: false,
				showThumbByDefault: false,
				hideBarsDelay : 1000,
				dynamicEl : items
			});
			this.$nextTick(()=>{
				//MYAPP.commonvue.imagecard.imgdialog = true;
			});
			
		},
		onclick_ttbtn_fav: function(e) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				//console.log("target=",e.target);
				//e.target.parentElement.classList.add("pulse");
				MYAPP.sns.setFav(this.toote.id, !this.toote.body.favourited, {api:{},app:{}})
				.then(result=>{
					//e.target.parentElement.classList.remove("pulse");
					//console.log("fav after=",result);
					this.toote.body.favourites_count = result.favourites_count;
					this.toote.body.favourited = result.favourited;
					//---change color for favourited state.
					this.toote.reactions.fav["lighten-3"] = result.favourited ? false : true;
					this.toote.reactions.fav["red--text"] = result.favourited ? false : true;
				});
			};
			//console.log("onclick_ttbtn_fav=",e,JSON.original(this.toote),!this.toote.body.favourited);
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_confirm_fav_"+MYAPP.session.config.application.showMode);
				if (this.toote.body.favourited) {
					msg = _T("msg_confirm_unfav_"+MYAPP.session.config.application.showMode);
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_ttbtn_bst: function(e) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				//console.log("target=",e.target);
				e.target.parentElement.classList.add("pulse");
				MYAPP.sns.setBoost(this.toote.id, !this.toote.body.reblogged, {api:{},app:{}})
				.then(result=>{
					e.target.parentElement.classList.remove("pulse");
					//console.log("bst after=",result);
					this.toote.body.reblogs_count = this.toote.body.reblogs_count + result.reblogs_count;
					this.toote.body.reblogged = result.reblogged;
					//---change color for favourited state.
					this.toote.reactions.reb["lighten-3"] = result.reblogged ? false : true;
				});
			};
			//console.log("onclick_ttbtn_bst=",e,JSON.original(this.toote),!this.toote.body.favourited);
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_confirm_bst_"+MYAPP.session.config.application.showMode);
				if (this.toote.body.reblogged) {
					msg = _T("msg_confirm_unbst_"+MYAPP.session.config.application.showMode);
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_ttbtn_otherbst: function (toote) {
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
			MYAPP.commonvue.nav_sel_account.mode = "b";
			MYAPP.commonvue.nav_sel_account.callbackAfterMode = (result) => {
				var tmpac = MYAPP.acman.get(result);
				if (tmpac) {
					var bkup = MYAPP.sns._accounts;
					MYAPP.sns.setAccount(tmpac);
					MYAPP.sns.search(toote.body.url,{api:{},app:{tmpaccount:tmpac}})
					.then(result=>{
						console.log(result);
						if (result.data.statuses.length > 0) {
							var toot = result.data.statuses[0];
							console.log(toot.account.acct,toot.id, toot.content);

							return {
								toot : toot,
								options : result.options,
								bkupaccount : bkup
							};
						}else{
							throw new Error("notoot");
						}

					})
					.then(result2=>{
						var mainfunc = () => {
							//console.log("target=",e.target);
							
							MYAPP.sns.setAccount(result2.options.app.tmpaccount);
							MYAPP.sns.setBoost(result2.toot.id, !result2.toot.reblogged, {api:{},app:{}})
							.then(result=>{
								//console.log("bst after=",result);
								toote.body.reblogs_count = toote.body.reblogs_count + result.reblogs_count;
								//---this user can be another I, therefore not change button state.
								//---change color for favourited state.
								//this.toote.reactions.reb["lighten-3"] = result.reblogged ? false : true;
							})
							.catch(error=>{
								appAlert(_T("msg_error_otherboost"));
							})
							.finally(()=>{
								MYAPP.sns.setAccount(result2.bkupaccount);
							});
						};
						if (MYAPP.session.config.action.confirmBefore) {
							var msg = _T("msg_confirm_bst_"+MYAPP.session.config.application.showMode);
							appConfirm(msg,mainfunc);
						}else{
							mainfunc();
						}
					})
					.catch(error=>{
						appAlert(_T("msg_error_otherboost"));
					})
					.finally(()=>{
						MYAPP.sns.setAccount(bkup);
					});

				}
			};
			MYAPP.commonvue.nav_sel_account.isdialog_selaccount = !MYAPP.commonvue.nav_sel_account.isdialog_selaccount;
			
		},
		onclick_ttbtn_quotedbst: function(toote) {
			if (toote.is_archive) return;
			var defsel = MYAPP.session.status.selectedAccount.idname + "@" + MYAPP.session.status.selectedAccount.instance;
            MYAPP.commonvue.inputtoot.selaccounts.splice(0,MYAPP.commonvue.inputtoot.selaccounts.length);
            MYAPP.commonvue.inputtoot.selaccounts.push(defsel);
            MYAPP.commonvue.inputtoot.$refs.inputbox.clear_selectaccount();
			MYAPP.commonvue.inputtoot.$refs.inputbox.set_selectaccount();
			var tmpac = this.toote.account.display_name+"@"+this.toote.account.instance;
			var quotext = `<br>${_T("tt_share_name",[tmpac])}:<br>
			${toote.body.url}<br>
			---<br>
			${toote.body.content.substr(0,100)}...<br>
			`;

			//MYAPP.commonvue.inputtoot.tootIB.text = quotext;
			MYAPP.commonvue.inputtoot.$refs.inputbox.setHTML(quotext);
            if (MYAPP.session.config.action.popupNewtoot_always) {
                MYAPP.commonvue.inputtoot.onclick_openInNew();
                return;
            }
            
            MYAPP.commonvue.inputtoot.sizing_window();

            MYAPP.commonvue.inputtoot.dialog = true;
            MYAPP.commonvue.inputtoot.$nextTick(()=>{
                var chk = checkBrowser();
                if (chk.platform != "ios") {
                    Q(".onetoot_inputcontent").focus();
                }
            });
		},
		onclick_reaction_fav : function (toote) {
			this.reaction_dialog_title = this.favourite_reaction_msg();

			if (this.toote.is_archive) {
				this.reaction_accounts.splice(0,this.reaction_accounts.length);
				for (var i = 0; i < toote.body.favourite_users.length; i++) {
					this.reaction_accounts.push(toote.body.favourite_users[i]);
				}
				this.is_reactiondialog = !this.is_reactiondialog;
			}else{
				MYAPP.sns.getFavBy(toote.body.id,{
					api : {},
					app : {}
				},"")
				.then(result => {
					//console.log("result.data=",result.data);
					this.reaction_accounts.splice(0,this.reaction_accounts.length);
					for (var i = 0; i < result.data.length; i++) {
						this.reaction_accounts.push(result.data[i]);
					}
					this.is_reactiondialog = !this.is_reactiondialog;
				});

			}
		},
		onclick_reaction_bst : function (toote) {
			this.reaction_dialog_title = this.reblog_reaction_msg();

			if (this.toote.is_archive) {
				this.reaction_accounts.splice(0,this.reaction_accounts.length);
				for (var i = 0; i < toote.body.reblog_users.length; i++) {
					this.reaction_accounts.push(toote.body.reblog_users[i]);
				}
				this.is_reactiondialog = !this.is_reactiondialog;
			}else{
				MYAPP.sns.getBoostBy(this.toote.body.id,{
					api : {},
					app : {}
				},"")
				.then(result => {
					this.reaction_accounts.splice(0,this.reaction_accounts.length);
					for (var i = 0; i < result.data.length; i++) {
						this.reaction_accounts.push(result.data[i]);
					}
					this.is_reactiondialog = !this.is_reactiondialog;
				});
			}
		},
		/*onfocus_dv_inputcontent: function (e) {
			e.target.nextElementSibling.classList.remove("common_ui_off");
		},
		onclick_btn_reply_each: function (e) {
			var elem_reply_box = e.target.parentElement.parentElement.previousElementSibling;
			var target = elem_reply_box.querySelector(".dv_inputcontent");
			console.log(elem_reply_box);
			console.log(elem_reply_box);
			target.innerHTML = target.innerHTML + "<a href=#!>@hoge</a>&nbsp;";
		},*/
		onleave_avatar: function (e) {
			clearTimeout(this.timerid);
			this.timerparam = null;
			this.timerid = setTimeout(()=>{},500);
		},
		onenter_avatar: function (e) {
			var parent = e.target.parentElement;
			var userid = parent.querySelector("input[name='sender_id']");
			console.log(e,parent, userid);
			var toote = null;
			if (userid.alt == "thistoot") {
				toote = this.toote;
			}else if (userid.alt == "boost") {
				toote = this.toote.reblogOriginal;
			}else if (userid.alt == "parent") {
				toote = this.toote.ancestors[this.toote.ancestors.length-1];
			}else if (userid.alt == "reply") {
				toote = this.toote.descendants[Number(userid.title)];
			}else if (userid.alt == "reaction") {
				var sindex = parent.querySelector("input[name='sender_index']").value;
				//console.log(this.reaction_accounts[sindex]);
				toote = {
					"account": this.reaction_accounts[sindex],
					"relationship" : {

					}
				}
			}else{
				return;
			}

			clearTimeout(this.timerid);
			this.timerparam = e;

			this.timerid = setTimeout(()=>{
				var e = this.timerparam;
				//console.log(e,parent,userid);
				if (("relationship" in toote) && ("following" in toote.relationship)) {
					MYAPP.showUserCard(e.target.getBoundingClientRect(), 
						JSON.original({
							"account" : toote.account,
							"relationship" : toote.relationship,
						})
					);
				}else{
					var hit = MYAPP.userstore.getIndex({
						username : toote.account.username,
						instance : toote.account.instance
					});
					if (hit > -1) {
						var hitdata = MYAPP.userstore.items[hit];
						for (var obj in hitdata.relationship) {
							toote.relationship[obj] = hitdata.relationship[obj];
						}
						MYAPP.showUserCard(e.target.getBoundingClientRect(), hitdata);
					}else{
						MYAPP.sns.getRelationship(userid.value)
						.then((result) => {
							for (var i = 0; i < result.data.length; i++) {
								for (var obj in result.data[i]) {
									toote.relationship[obj] = result.data[i][obj];
								}
							}
							MYAPP.userstore.add({
								account : toote.account,
								relationship : toote.relationship
							});
							//console.log(JSON.original(toote));
							MYAPP.showUserCard(e.target.getBoundingClientRect(), 
								JSON.original({
									"account" : toote.account,
									"relationship" : toote.relationship,
								})
							);
						});
					}
				}
				this.timerparam = null;
			},MYAPP.session.config.action.usercard_delay);
		},
		onclick_comment_to_reply: function (index) {
			if (!checkRange(0,index,this.toote.descendants.length-1)) return;
			var des = this.toote.descendants[index];
			this.reply_to_id = des.body.id;
			this.mention_to_id = des.account.id;
			this.reply_data.reply_to_id = des.body.id;
			this.reply_data.reply_account = des.account;
			this.apply_childReplyInput();

			var editor = CKEDITOR.instances[this.popuping + "replyinput_"+this.toote.body.id];
			//editor.editable().editor.insertText("@"+des.account.acct);
			//this.status_text = "@"+des.account.acct; 
		},
		onclick_fav_to_reply: function (reply) {
			if (this.toote.is_archive) return;
			/*var tgt = e.target;
			if (e.target.tagName.toLowerCase() == "i") {
				tgt = e.target.parentElement;
			}*/
			//console.log(tgt,tgt.getAttribute("data-index"));
			//var index = Number(tgt.getAttribute("data-index"));

			//if (!checkRange(0,index,this.toote.descendants.length-1)) return;
			var des = reply; //this.toote.descendants[index];
			
			var mainfunc = () => {
				//tgt.classList.add("pulse");
				MYAPP.sns.setFav(des.body.id, !des.body.favourited, {api:{},app:{}})
				.then(result=>{
					//tgt.classList.remove("pulse");
					//console.log("fav after=",result);
					des.body.favourites_count = result.favourites_count;
					des.body.favourited = result.favourited;
					//---change color for favourited state.
					des.reactions.fav["lighten-3"] = result.favourited ? false : true;
					des.reactions.fav["red--text"] = result.favourited ? true : false;
				});
			};
			//console.log("onclick_ttbtn_fav=",e,JSON.original(des),!des.body.favourited);
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_confirm_fav_"+MYAPP.session.config.application.showMode);
				if (des.body.favourited) {
					msg = _T("msg_confirm_unfav_"+MYAPP.session.config.application.showMode);
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}

		},
		onclick_bst_to_reply: function(reply) {
			if (this.toote.is_archive) return;
			/*var tgt = e.target;
			if (e.target.tagName.toLowerCase() == "i") {
				tgt = e.target.parentElement;
			}
			var index = Number(tgt.getAttribute("data-index"));
			*/
			//if (!checkRange(0,index,this.toote.descendants.length-1)) return;
			var des = reply; //this.toote.descendants[index];

			var mainfunc = () => {
				//tgt.classList.add("pulse");
				MYAPP.sns.setBoost(des.body.id, !des.body.reblogged, {api:{},app:{}})
				.then(result=>{
					//tgt.classList.remove("pulse");
					//console.log("bst after=",result);
					des.body.reblogs_count = result.reblogs_count;
					des.body.reblogged = result.reblogged;
					//---change color for favourited state.
					des.reactions.reb["lighten-3"] = result.reblogged ? false : true;
					des.reactions.reb["red--text"] = result.reblogged ? true : false;
				});
			};
			//console.log("onclick_ttbtn_bst=",e,JSON.original(des),!des.body.favourited);
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_confirm_bst_"+MYAPP.session.config.application.showMode);
				if (des.body.reblogged) {
					msg = _T("msg_confirm_unbst_"+MYAPP.session.config.application.showMode);
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_otherbst_to_reply : function (toote) {
			this.onclick_ttbtn_otherbst(toote);
		},
		onclick_quotedbst_to_reply : function (toote) {
			this.onclick_ttbtn_quotedbst(toote);
		},
		onclick_toote_pinn : function (toote) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				MYAPP.sns.setPin(toote.body.id, !toote.body.pinned)
				.then(result=>{
					console.log("bst after=",result);
					toote.body.pinned = !toote.body.pinned;
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = "";
				if (toote.body.pinned) {
					msg = _T("msg_confirm_unpin");
				}else{
					msg = _T("msg_confirm_pin");
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_copytext : function (toote) {
			MUtility.copyClipboard(this.toote.body.html);
		},
		onclick_toote_delete : function (toote,commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",toote,commentIndex);
				MYAPP.sns.deleteStatus(toote.body.id)
				.then(result=>{
					console.log("del after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						this.toote.descendants.splice(commentIndex,1);
						if (this.toote.descendants.length < 1) {
							this.comment_stat.close = true;
							this.comment_stat.mini = false;
							this.comment_stat.open = false;
							this.elementStyle.toot_action_class.has_comment_pos_mini = false;
							this.elementStyle.toot_action_class.has_comment_pos_minione = false;
							this.elementStyle.toot_action_class.has_comment_pos_open = false;
						}
					}else{
						//---if toot own, to connect to parent component
						this.$emit("delete_toot",toote.body.id);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_delete_toot");
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_toote_mute : function (toote, commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",toote,commentIndex);
				MYAPP.sns.setMute(toote.body.id, !toote.body.muted)
				.then(result=>{
					console.log("mute after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						
					}else{
						//---if toot own, to connect to parent component
						this.$emit("mute_toot",toote.body.muted);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				if (toote.body.muted) {
					msg = _T("msg_confirm_unmute");
				}else{
					msg = _T("msg_confirm_mute");
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_user_mute : function (user, commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",user,commentIndex);
				MYAPP.sns.setMuteUser(user.id, !user.relationship.muted)
				.then(result=>{
					console.log("mute after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						
					}else{
						//---if toot own, to connect to parent component
						this.$emit("mute_user",result.muting);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				if (user.relationship.muting) {
					msg = _T("msg_confirm_unmute");
				}else{
					msg = _T("msg_confirm_mute");
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_user_block : function (user, commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",user,commentIndex);
				MYAPP.sns.setBlockUser(user.id, !user.relationship.blocking)
				.then(result=>{
					console.log("block after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						
					}else{
						//---if toot own, to connect to parent component
						this.$emit("block user",result.blocking);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				if (user.relationship.blocking) {
					msg = _T("msg_confirm_unblock");
				}else{
					msg = _T("msg_confirm_block");
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_user_endorse : function (user, commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",user,commentIndex);
				var isendorse = false;
				//---for example, pawoo.net don't has "endorsed" 
				if ("endorsed" in user.relationship) {
					isendorse = user.relationship.endorsed;
				}
				MYAPP.sns.setPinUser(user.id, !isendorse)
				.then(result=>{
					console.log("endorse after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						
					}else{
						//---if toot own, to connect to parent component
						this.$emit("endorse user",result);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				if (user.relationship.blocking) {
					msg = _T("msg_confirm_unendorse");
				}else{
					msg = _T("msg_confirm_endorse");
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_user_report : function (user, toot, commentIndex) {
			if (this.toote.is_archive) return;
			var mainfunc = () => {
				console.log("target=",user,commentIndex);
				MYAPP.sns.setReportUser(user.id,[toot.id],)
				.then(result=>{
					console.log("block after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						
					}else{
						//---if toot own, to connect to parent component
						this.$emit("block user",result.blocking);
					}
				});
			};
			//TODO: create report dialog !!!
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				msg = _T("msg_confirm_report");
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_any_link : function (toote) {
			var url = `/server/${toote.account.instance}`;
			location.href = url;
		},
		onmouseenter_gifv : function (e) {
			var pro = e.target.play();
			if (pro !== undefined) {
				pro.then(()=>{
					console.log("play");
				}).catch(error=>{
					console.log(error);
				});
			}
		},
		onmouseleave_gifv : function (e) {
			e.target.pause();
		},
		/**
		 * Fire event for replied a post. to connect to parent component
		 * @param {Event} e event object
		 */
		onreplied_post : function (e) {
			/*
			this.first_comment_stat.mini = true;
			this.first_comment_stat.close = false;
			this.comment_stat.mini = true;
			this.comment_stat.close = false;
			this.comment_stat.open = false;
			*/
			this.reload_tootcontext_body({
				mode:"r",
				descendants : {
					before :this.toote.descendants.length || 0, 
					after : 0,
				}
			})
			.then(result=>{
				/*var num_row = parseInt(this.toote.cardtypeSize["grid-row-start"].replace("span", ""));
				let SIZE4COMMENT = 4;
				//if (target.classList.contains("mini")) {
				if (this.comment_stat.mini || this.comment_stat.minione) {
					num_row = num_row - SIZE4COMMENT;
				//} else if (target.classList.contains("open")) {
				}else if (this.comment_stat.close) {
					num_row = num_row - SIZE4COMMENT;
				}else if (this.comment_stat.open) {
					if (result.condata.data.descendants.length == 1) {
						num_row = num_row + SIZE4COMMENT;
					}
				}
				//rootParent.style.gridRowStart = `span ${num_row}`;
				this.toote.cardtypeSize["grid-row-start"] = `span ${num_row}`;
				*/
			});
			
			//this.$el.querySelector("div.template_reply_box").classList.toggle("common_ui_off");
			this.$emit('replied_post');
		},
		onclick_selloco : function (item,index) {
			//this.geomap.setView({ lat:item.lat, lng: item.lng });
			this.geomap = MUtility.getStaticMap(item,MYAPP.session.config.application.map_type,index);
			this.curLocation = item;
		},
		onclick_map : function (e) {
			//MYAPP.commonvue.mapviewer.set_data(this.toote);
			//MYAPP.commonvue.mapviewer.dialog = true;
			if (this.curLocation) {
				var url = this.curLocation.url; //`https://www.openstreetmap.org/#map=${this.curLocation.zoom}/${this.curLocation.lat}/${this.curLocation.lng}`;
				window.open(url,"_blank");
			}
		},
		onclick_pollrefresh : function (poll) {
			MUtility.loadingON();
			MYAPP.sns.getPolls(poll.id,{
				api : {
					
				}
			})
			.then(result => {
				poll = result.data;
				MUtility.loadingOFF();
			});
		},
		onclick_pollchoice : function (choice,poll,toote) {
			if (toote.is_archive) return;
			var targetpoll = this.currentPoll[toote.body.id];
			if (poll.multiple) {
				targetpoll.choice[choice] = !targetpoll.choice[choice];
				if (this.targetpoll.choice[choice]) {
					this.$set(targetpoll.icon, choice, "check_box");
				}else{
					this.$set(th.targetpoll.icon, choice, "check_box_outline_blank");
				}
			}else{
				for (var i = 0; i < targetpoll.choice.length; i++) {
					targetpoll.choice[i] = false;
					//this.pollicon[i] = "radio_button_unchecked";
					this.$set(targetpoll.icon, i, "radio_button_unchecked");
				}
				targetpoll.choice[choice] = true;
				this.$set(targetpoll.icon, choice, "radio_button_checked");
				//this.pollicon[choice] = "radio_button_checked";
			}
		},
		onclick_pollvote : function (poll,toote) {
			if (toote.is_archive) return;
			var mainfunc = () => {
				var choices = [];
				var targetpoll = this.currentPoll[toote.body.id];
				for (var i = 0; i < targetpoll.choice.length; i++) {
					if (targetpoll.choice[i] === true) {
						choices.push(String(i));
						//choices[String(i)] = String(i);
					}
				}
				MYAPP.sns.votePolls(poll.id,{
					api : {
						"choices" : choices
					}
				})
				.then(result => {
					poll = result.data;
				});
			}
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				msg = _T("msg_voting");
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		}
	}
});
//===----------------------------------------------------------------------===
//  Component: user-popupcard
//===----------------------------------------------------------------------===
Vue.component("user-popupcard", {
	template: CONS_TEMPLATE_USERPOPUP,
	mixins: [vue_mixin_base],
	props: {
		cardtype: String,	//normal, selectable
		translation: Object,
		account: Object,
		relationship : Object,
		globalinfo: Object
	},
	data() {
		return {
			stat : {
				selected : false,
				isshow_listmenu : false,
			},
			listmenu : {
				x : 0,
				y : 0
			}
		}
	},
	methods: {
		generate_userlink: function (data) {
			return `${this.globalinfo.firstPath}/users/${data.instance}/${data.username}`;
		},
		generate_userDisplayName(data) {
			//console.log("345行目：", data);
			var tmpname = data.display_name == "" ? data.username : data.display_name;
			if (tmpname == null) return "";
			tmpname = MUtility.replaceEmoji(tmpname, data.instance, data.emojis, 18);
			return tmpname;
		},
		generate_userNote(data) {
			var tmpname = data.note;
			if (tmpname == null) return "";
			tmpname = MUtility.replaceEmoji(tmpname, data.instance, data.emojis, 14);
			return tmpname;
		},
		showRelationshpText : function(){
			if (this.relationship.followed_by) {
				return _T("to_followed_by");
			}
		},
		oncheck_following : function (e) {
			var msg = "";
			//---this stat is future stat.
			if (this.relationship.following) {
				msg = _T("msg_confirm_follow",[this.account.display_name]);
			}else{
				msg = _T("msg_confirm_unfollow",[this.account.display_name]);
			}
			appConfirm(msg,(a) =>{
				//appAlert("god!");
				//this.stat.following = true;
				MYAPP.sns.setFollow(this.account.id,this.relationship.following)
				.then(result=>{

				});
			},()=>{
				this.relationship.following = !this.relationship.following;
			});
		},
		oncheck_selectable : function (e) {
			console.log(this.account.id,this.stat.selected);
			this.$emit('check_selectable',{userid:this.account.id,checked:this.stat.selected});
		},
		onclick_removelist : function (index) {
			var msg = _T("msg_del_to_list",[this.account.display_name,this.account.lists[index].title]);
			appConfirm(msg,()=>{
				MYAPP.sns.removeMemberFromList(this.account.lists[index].id,[this.account.id])
				.then(result=>{
					this.account.lists.splice(index,1);
				});
			});
		},
		onhover_b : function(e) {
			var rect = e.target.getBoundingClientRect();
			this.listmenu.y = rect.y
			this.listmenu.x = rect.x;
			this.stat.isshow_listmenu = true;
		},
		onclick_requestOK : function (e) {
			this.$emit("request_answer",{user:this.account,answer:true});
		},
		onclick_requestNO : function (e) {
			this.$emit("request_answer",{user:this.account,answer:false});
		}
	}
});



//===----------------------------------------------------------------------===
//  Component: tootgallery-carousel
//===----------------------------------------------------------------------===
Vue.component("tootgallery-carousel", {
    template: CONS_TEMPLATE_TOOTGALLERY_CAROUSEL,
    components: {
		'carousel': VueCarousel.Carousel,
		'slide': VueCarousel.Slide
	},
	props: {
		medias : Array,
		toote : Object,
        sensitive : Boolean,
		translation : Object,
		viewmode : {
			type : String,
			default : "slide"
		},
		/*
			vue-carousel:
			carousel.adjustableHeight = true
		*/
		options : {
			type : GalleryOptions,
			default : function() {
				return new GalleryOptions();
			}
		},
    },
    data(){
        return {
			value : {
				carousel : 0
			},
			is_sensitive_hidden : {
				common_ui_off : false
			},
			is_sensitive_title : {
				common_ui_off : false
			},
			local_options : {
				carousel : {
					loop : true,
					perPage : 1
				}
			},
			is_pause : false,
			is_first : true,

			
        }
	},
	beforeMount() {
		if (this.sensitive) {
			this.is_sensitive_hidden.common_ui_off = true;
			
		}
	},
    mounted(){
		if (this.sensitive) {
			if (!this.options.first_sensitive) {
				this.$nextTick(()=>{
					this.value.carousel = 1;
				});
				this.onclick_sensitive_ingrid();
		   	}
		}
		if (this.options.initials.is) {
			this.value.carousel = this.options.initials.value;
		}
	},
	beforeUpdate() {

	},
    methods : {
        onmouseenter_gifv : function (e) {
			if (this.is_pause) {
				var pro = e.target.play();
				if (pro !== undefined) {
					pro.then(()=>{
						console.log("play");
					}).catch(error=>{
						console.log(error);
					});
				}
			}else{
				e.target.pause();
			}
			this.is_pause = !this.is_pause;
		},
		onmouseleave_gifv : function (e) {
			e.target.pause();
		},
		onclick_openinnew : function (url) {
			window.open(url,"_blank");
		},
		onclick_openfull : function (item) {
			/*if (this.$vuetify.breakpoint.smAndDown) {
				MYAPP.commonvue.imagecard.isfull = true;
			}else{
				MYAPP.commonvue.imagecard.isfull = true;
			}ID("lg_dyna")
			MYAPP.commonvue.imagecard.item = item;*/
			var lgdyna = ID("lg_dyna");
			lgdyna.innerHTML = "";
			var a = GEN("div");
			var items = [];
			var videocnt = 0;
			for (var i = 0; i < this.medias.length; i++) {
				/*items.push({
					src : this.medias[i].url,
					href : this.medias[i].url,
					thumb : this.medias[i].preview_url,
					poster : this.medias[i].preview_url,
					subHTML : `<p>${this.medias[i].description}</p>`
				});*/
				items.push(MUtility.generate_lightGalleryItem(this.toote,this.medias[i],videocnt));
				videocnt++;
			}
			lightGallery(a,{
				dynamic : true,
				html : true,
				thumbnail:true,
				animateThumb: false,
				showThumbByDefault: false,
				hideBarsDelay : 1000,
				dynamicEl : items
			});
			this.$nextTick(()=>{
				//MYAPP.commonvue.imagecard.imgdialog = true;
			});
			
		},
		onclick_sensitive_ingrid : function (e) {
			this.is_sensitive_hidden.common_ui_off = false;
			this.is_sensitive_title.common_ui_off = true;
		},
		onclick_rehide : function (){
			this.is_sensitive_hidden.common_ui_off = true;
			this.is_sensitive_title.common_ui_off = false;
		},

		//---some function--------------------------------------
		judgeSrc : function (item) {
			
		}
    }
});

//===----------------------------------------------------------------------===
//  Component: dmessage-item
//===----------------------------------------------------------------------===
Vue.component("dmessage-item", {
	template: CONS_TEMPLATE_DMSGBODY,
	mixins: [vue_mixin_base],
	props: {
		translation: Object,
		/**
		 * type : me, they
		 * 
		 */
		user_direction : Object,
		gallery_options : {
			type: GalleryOptions,
			default : function() {
				return new GalleryOptions();
			},
		},
		toote: {
			type : Object,
			default : null
		},
    },
    data(){
        return {
			elementStyle : {
				"comment-list" : {
					sizing : true
				},
				"toot_avatar_imgsize" : "32px",
				"toot_action_class" : {
					has_comment_pos_mini : false,
					has_comment_pos_minione : false,
					has_comment_pos_open : false,
				}

			},

			//---reaction dialog: favorite, boost
			is_reactiondialog : false,
			reaction_dialog_title : "",
			reaction_info : {
				max_id : "",
				since_id : "",
			},
			reaction_accounts : [],
			
			is_pause : false,

			geomap : "",

			//---poll variables
			pollradio : "",
			currentPoll : {},

			//---request each updates
			isupdate_request : {
				reply : false
			},
			local_galoption : this.gallery_options,
        }
	},
	beforeMount(){
		//---for media object(tootgallery-carousel)
		this.local_galoption = new GalleryOptions();
		if (this.gallery_options) {
			this.local_galoption.copy(this.gallery_options);
		}

		//---option: remove nsfw, if specified instance
		if ((MYAPP) && (MYAPP.session.config.action.remove_nsfw_remove_instance === true)) {
			if (this.toote) {
				if (MYAPP.session.config.action.nsfw_remove_instances.indexOf(this.toote.account.instance) > -1) {
					this.local_galoption.first_sensitive = false;
				}
			}
		}

		

	},
    mounted(){
		jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
		$("time.timeago").timeago();

		if (this.toote) {
			if (this.toote.geo.enabled) {  //
				//this.initialize_geomap();
				this.get_mapurl(this.toote.geo.location[0],0);
			}

			if (this.toote.body.poll) {
				var tmppoll = this.initialize_poll(this.toote.body.poll);
				this.currentPoll[this.toote.body.id] = tmppoll;
			}
		}
	},
	watch : {
		toote : function (val) {
			if (val.body.poll) {
				var tmppoll = this.initialize_poll(this.toote.body.poll);
				this.currentPoll[this.toote.body.id] = tmppoll;
			}

		}
	},
	computed : {
		favourite_type : function() {
			return _T("favourite_"+MYAPP.session.config.application.showMode);
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
		gal_viewmode : function () {
			return MYAPP.session.config.application.gallery_type;
		},
	},
    methods : {
		full_display_name : function(user) {
			return MUtility.replaceEmoji(user.display_name,user.instance,user.emojis,18) + `@${user.instance}`;
		},
		get_instance_original_url : function (toote) {
			return MUtility.generate_instanceOriginalURL(MYAPP.commonvue.cur_sel_account.account,toote);
		},
		get_tagurl : function (tag) {
			return MUtility.generate_hashtagpath(tag);
		},
		get_mapurl : function (location,index) {
			this.geomap =  MUtility.getStaticMap(location,MYAPP.session.config.application.map_type,index);
		},
		initialize_geomap : function () {
			var OsmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
			latlng = L.latLng(this.toote.geo.location[0].lat, this.toote.geo.location[0].lng);

			//---$children is Vue.component
			//   But, $children[0] is parent of the array timeline-toot
			//   So, [1] is real start.
			var oneelem = this.$el;
			//oneelem.querySelector('.here_map')
			var geomap = L.map(
				ID("heremap"+this.toote.id), {
					center: latlng, 
					dragging : true, 
					zoom: this.toote.geo.location[0].zoom,
					layers: [Osm]
				}
			);
			this.geomap = geomap;
			this.curLocation = null;

			for (var i = 0; i < this.toote.geo.location.length; i++) {
				var ll = this.toote.geo.location[i];
				var marker = L.marker({lat:ll.lat,lng:ll.lng}).addTo(geomap);
				marker.on("click",(ev)=>{
					//ev.sourceTarget.remove();
					//this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}&n=${}`;
				});
				marker.bindPopup(ll.name);
			}
		},
		initialize_poll : function (poll){
			var cho = "";
			var tmppoll = {
				original : {},
				icon : [],
				choice : [],
			};
			for (var obj in poll) {
				tmppoll.original[obj] = poll[obj];
			}
			if (tmppoll.original.multiple) {
				cho = "check_box_outline_blank";
				tmppoll.choice = [];
			}else{
				cho = "radio_button_unchecked";
				tmppoll.choice = "";
			}
			for (var i = 0; i < tmppoll.original.options.length; i++) {
				tmppoll.icon.push(cho);
				//tmppoll.choice.push(false);
			}
			return tmppoll;
		},
		counting_vote : function (poll,allcount) {
			var tmp = "";
			var v = poll.votes_count;
			if (allcount > 0) {
				v = v / allcount;
			}else{
				v = 0;
			}
			var percent = Math.round(v * 100);
			return percent;
		},
		is_off_vote : function (poll) {
			return poll.voted || poll.expired;
		},
		isBoostable : function (toote) {
			var boostable = [
				"private", "direct"
			];
			if (boostable.indexOf(toote.body.visibility) > -1) {
				return true;
			}else{
				if (toote.is_archive) {
					return true;
				}else{
					return false;
				}
			}
		},
		voteicon_styling : function (choice,toote) {
			if (toote.body.poll) {
				if (toote.body.poll.multiple) {
					if (choice === true) {
						return "check_box";
					}else{
						return "check_box_outline_blank";
					}
				}else{
					if (choice === true) {
						return "radio_button_checked";
					}else{
						return "radio_button_unchecked";
					}
				}
			}else{
				return "radio_button_unchecked";
			}
		},
		is_off_mini : function () {
			return !this.comment_stat.mini && !this.comment_stat.minione;
		},
		onclick_ttbtn_fav: function(e) {
			var mainfunc = () => {
				//console.log("target=",e.target);
				//e.target.parentElement.classList.add("pulse");
				MYAPP.sns.setFav(this.toote.id, !this.toote.body.favourited, {api:{},app:{}})
				.then(result=>{
					//e.target.parentElement.classList.remove("pulse");
					//console.log("fav after=",result);
					this.toote.body.favourites_count = result.favourites_count;
					//---change color for favourited state.
					this.toote.reactions.fav["lighten-3"] = result.favourited ? false : true;
				});
			};
			//console.log("onclick_ttbtn_fav=",e,JSON.original(this.toote),!this.toote.body.favourited);
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_confirm_fav_"+MYAPP.session.config.application.showMode);
				if (this.toote.body.favourited) {
					msg = _T("msg_confirm_unfav_"+MYAPP.session.config.application.showMode);
				}
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_reaction_fav : function (toote) {
			this.reaction_dialog_title = this.favourite_reaction_msg();
			MYAPP.sns.getFavBy(toote.body.id,{
				api : {},
				app : {}
			},"")
			.then(result => {
				//console.log("result.data=",result.data);
				this.reaction_accounts.splice(0,this.reaction_accounts.length);
				for (var i = 0; i < result.data.length; i++) {
					this.reaction_accounts.push(result.data[i]);
				}
				this.is_reactiondialog = !this.is_reactiondialog;
			});
		},
		onclick_toote_delete : function (toote,commentIndex) {
			var mainfunc = () => {
				console.log("target=",toote,commentIndex);
				MYAPP.sns.deleteStatus(toote.body.id)
				.then(result=>{
					console.log("del after=",result);
					if (commentIndex > -1) {
						//---if comment, delete this in here
						this.toote.descendants.splice(commentIndex,1);
						if (this.toote.descendants.length < 1) {
							this.comment_stat.close = true;
							this.comment_stat.mini = false;
							this.comment_stat.open = false;
							this.elementStyle.toot_action_class.has_comment_pos_mini = false;
							this.elementStyle.toot_action_class.has_comment_pos_minione = false;
							this.elementStyle.toot_action_class.has_comment_pos_open = false;
						}
					}else{
						//---if toot own, to connect to parent component
						this.$emit("delete_toot",toote.body.id);
					}
				});
			};
			if (MYAPP.session.config.action.confirmBefore) {
				var msg = _T("msg_delete_toot");
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		},
		onclick_selloco : function (item,index) {
			//this.geomap.setView({ lat:item.lat, lng: item.lng });
			this.geomap = MUtility.getStaticMap(item,MYAPP.session.config.application.map_type,index);
			this.curLocation = item;
		},
		onclick_map : function (e) {
			//MYAPP.commonvue.mapviewer.set_data(this.toote);
			//MYAPP.commonvue.mapviewer.dialog = true;
			if (this.curLocation) {
				var url = this.curLocation.url; //`https://www.openstreetmap.org/#map=${this.curLocation.zoom}/${this.curLocation.lat}/${this.curLocation.lng}`;
				window.open(url,"_blank");
			}
		},
		onclick_pollrefresh : function (poll) {
			MUtility.loadingON();
			MYAPP.sns.getPolls(poll.id,{
				api : {
					
				}
			})
			.then(result => {
				poll = result.data;
				this.$set(this.toote.body,"poll",result.data);
				MUtility.loadingOFF();
			});
		},
		onclick_pollchoice : function (choice,poll,toote) {
			if (toote.is_archive) return;
			var targetpoll = toote.body.pollchoices;
			if (poll.multiple) {
				//targetpoll[choice] = !targetpoll[choice];
				this.$set(targetpoll, choice, targetpoll[choice]);
				/*if (this.targetpoll.choice[choice]) {
					this.$set(targetpoll.icon, choice, "check_box");
				}else{
					this.$set(th.targetpoll.icon, choice, "check_box_outline_blank");
				}*/
			}else{
				for (var i = 0; i < targetpoll.length; i++) {
					//targetpoll[i] = false;
					this.$set(targetpoll, i, false);
					//this.pollicon[i] = "radio_button_unchecked";
					//this.$set(targetpoll.icon, i, "radio_button_unchecked");
				}
				//targetpoll[choice] = true;
				//targetpoll.icon[choice] = "radio_button_checked";
				this.$set(targetpoll, choice, true);
				//this.pollicon[choice] = "radio_button_checked";
			}
		},
		onclick_pollvote : function (poll,toote) {
			if (toote.is_archive) return;
			var mainfunc = () => {
				var choices = [];
				var targetpoll = this.currentPoll[toote.body.id];
				for (var i = 0; i < toote.body.pollchoices.length; i++) {
					if (toote.body.pollchoices[i] === true) {
						choices.push(String(i));
						//choices[String(i)] = String(i);
					}
				}
				MYAPP.sns.votePolls(poll.id,{
					api : {
						"choices" : choices
					}
				})
				.then(result => {
					//toote.body.poll = result.data;
					this.$set(toote.body,"poll",result.data);
				});
			}
			if (MYAPP.session.config.action.confirmBefore) {
				var msg;
				msg = _T("msg_voting");
				appConfirm(msg,mainfunc);
			}else{
				mainfunc();
			}
		}
    }
});


//===----------------------------------------------------------------------===
//  Component: dashboard-gadget
//===----------------------------------------------------------------------===
Vue.component("dashboard-gadget", {
	template: CONS_TEMPLATE_DASHBOARD_GADGET,
	mixins : [vue_mixin_base,vue_mixin_for_timeline],
	props: {
		//---common
		type : String,
		size : {
			type : Object,
			default : {width : 0, height : 0}
		},
		userstyle : {
			type : Object,
			default : {
				color : "primary"
			}
		},
		//---text
		body : {
			type : String,
			default : "",
		},
		//---img
		src : {
			type : String,
			default : "",
		},
		//---btn
		label : {
			type : String,
			default : "",
		},
		icon : {
			type : String,
			default : "",
		},
		//---timeline
		timeline : {
			type : Object,
			default : null
		},
		//---toot
		toot : {
			type : Object,
			default : null
		},
		//---user
		user : {
			type : Object,
			default : null
		},
		//---list
		datalist : Array,
		translation: Object,
		globalinfo: Object,

		//---input
		input : {
			type : Object,
			default : null
		}
		
    },
    data(){
        return {
			tlshare : [
				{text : "---", type: "share", value: "tt_all", selected:true},
				{text : _T("sel_tlpublic"), type: "share", value: "tt_public", selected:false},
				{text : _T("sel_tlonly"), type: "share", value: "tt_tlolny", selected:false},
				{text : _T("sel_private"), type: "share", value: "tt_private", selected:false},
			],
			tltype :  [
				{text : "---", type: "type", value: "tt_all", selected:true},
				{text : _T("sel_media"), type: "type", value: "tt_media", selected:false},
				{text : _T("sel_exclude_share_"+MYAPP.session.config.application.showMode), type: "type", value: "tt_exclude_bst", selected:false},
			],
		
			
        }
	},
	beforeMount() {
		
	},
    mounted(){
        
    },
    methods : {
		onclick_close : function (e) {

		},
		onclick_send : function (e) {

		}

    }
});


//===----------------------------------------------------------------------===
//  Component: timeline-condition
//===----------------------------------------------------------------------===
class GTimelineCondition {
	constructor() {
		//---instead of static variable / constant
		this.tlshare_options = {
			"all" : {text : _T("sel_ttall"),              type: "share", value: "tt_all", selected:true},
			"public" :	{text : _T("sel_tlpublic"), type: "share", value: "tt_public", avatar : "public", selected:false},
			"tlonly" : {text : _T("sel_tlonly"),   type: "share", value: "tt_tlolny", avatar : "lock_open", selected:false},
			"private" : {text : _T("sel_private"),  type: "share", value: "tt_private",avatar : "lock",  selected:false},
		};
		this.tlview_options =  {
			//"all" : {text : "---",           type: "type", value: "tv_all", selected:true},
			"media" : {text : _T("sel_media"), type: "type", value: "tv_media", selected:false},
			"exclude_bst" : {text : _T("sel_exclude_share_"+MYAPP.session.config.application.showMode), 
				type: "type", value: "tv_exclude_bst", selected:false
			},
		};

		//---normal properties.
		this.type = "normal";	//normal, list, search

		this.share = this.tlshare_options.all.value;
		this.view = [];
		this.listtype = "0";
		this.lists = [];
		this.filter = {
			data : [],
			text : "",
		};
		var dtb = new Date();
		var dte = new Date();
		dtb.setDate(1);
		dte.setDate(1);
		dte.setMonth(dte.getMonth()+1);
		dte.setDate(dte.getDate()-1);
		this.daterange = {
			use : false,
			begin : {
				date : dtb.toISOString().substr(0,10),
				time : dtb.toLocaleTimeString()
			},
			end : {
				date : dte.toISOString().substr(0,10),
				time : dte.toLocaleTimeString()
			}
			
		}
	}
	static TLSHARE_TYPE() {
		return {
			"all" : {text : _T("sel_ttall"),              type: "share", value: "tt_all", selected:true},
			"public" :	{text : _T("sel_tlpublic"), type: "share", value: "tt_public", selected:false},
			"tlonly" : {text : _T("sel_tlonly"),   type: "share", value: "tt_tlolny", selected:false},
			"private" : {text : _T("sel_private"),  type: "share", value: "tt_private", selected:false},
		};
	}
	static TLVIEW_TYPE() {
		return {
			//"all" : {text : "---",           type: "type", value: "tv_all", selected:true},
			"media" : {text : _T("sel_media"), type: "type", value: "tv_media", selected:false},
			"exclude_bst" : {text : _T("sel_exclude_share_"+MYAPP.session.config.application.showMode), 
				type: "type", value: "tv_exclude_bst", selected:false
			},
		};
	}
	getReturn(){
		var tootids = {
			since_id : "",
			max_id : "",
		};

		var dt = "";
		if (!this.daterange.begin.date) {
			dt = `${this.daterange.begin.date}T${this.daterange.begin.time}`;
			var dtb = new Date(dt);
			tootids.since_id = MUtility.timestamp2id(dtb);
		}
		if (!this.daterange.end.date) {
			dt = `${this.daterange.end.date}T${this.daterange.end.time}`;
			var dte = new Date(dt);
			tootids.max_id = MUtility.timestamp2id(dte);
		}

		return {
			status : true,
			tlshare : this.share,
			tltype : this.view,
			listtype : this.listtype,
			filtertext : this.filter.text,
			filter : this.filter.data,
			link : tootids,
		};
	}
}
Vue.component("timeline-condition", {
	template: CONS_TEMPLATE_TLCONDITION,
	mixins : [vue_mixin_base],
	props: {
		translation : Object,
		condition : {
			type : GTimelineCondition,
			default : null
		}
	},
	data(){
		return {
			dialog : false,
			datedialog : false,
			datemenu : false,

			sel_tlshare : "tt_all",
			sel_tltype : ["tv_all"],
			sel_listtype : "",
			sel_filtertext : "",
			timetab : 0,
			date_simple : 1,
			datecolumn : "0",

			disablecls : {
				begin : {
					date : true,
					time : true
				},
				end : {
					date : false,
					time : false
				},
			},
			colorcls : {
				beginbtn : "grey",
				endbtn : ""
			}
		};
	},
	mounted() {
		M.FormSelect.init(Qs("select"), {
			dropdownOptions : {
				constrainWidth : false
			}
		});
		if (this.condition) {
			this.sel_listtype = this.condition.listtype;
		}
	},
	methods : {
		onfocus_posttext : function (e) {
			//console.log(e);
            var defsel = MYAPP.session.status.selectedAccount.idname + "@" + MYAPP.session.status.selectedAccount.instance;
            MYAPP.commonvue.inputtoot.selaccounts.splice(0,MYAPP.commonvue.inputtoot.selaccounts.length);
            MYAPP.commonvue.inputtoot.selaccounts.push(defsel);
            MYAPP.commonvue.inputtoot.$refs.inputbox.clear_selectaccount();
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
            MYAPP.commonvue.inputtoot.$nextTick(()=>{
                var chk = checkBrowser();
                if (chk.platform != "ios") {
                    Q(".onetoot_inputcontent").focus();
                }
            });
		},
		onclick_close : function (flag) {
			//---analyze filter
			var fobj = [];
			var genOR = function (t) {
				return t.split(",");
			}
			var fs = this.condition.filter.text.split(/\s/);
			for (var i = 0; i < fs.length; i++) {
				var ftext = fs[i];
				
				if (ftext.indexOf("@@") == 0) {
					var arr = genOR(ftext.replace("@@",""));
					//------Or condition
					fobj.push({
						type : "instance",
						operator : "=",
						data : arr
					});
				}else if (ftext.indexOf("@") == 0) {
					var arr = genOR(ftext.replace("@",""));
					fobj.push({
						type : "user",
						operator : "=",
						data : arr
					});
				}else if (ftext.indexOf("!@@") == 0) {
					var arr = genOR(ftext.replace("!@@",""));
					//------Or condition
					fobj.push({
						type : "instance",
						operator : "!",
						data : arr
					});
				}else if (ftext.indexOf("!@") == 0) {
					var arr = genOR(ftext.replace("!@",""));
					fobj.push({
						type : "user",
						operator : "!",
						data : arr
					});
				}else if (ftext.indexOf("!") == 0) {
					var arr = genOR(ftext.replace("!",""));
					fobj.push({
						type : "text",
						operator : "!",
						data : arr
					});
				}else{
					var arr = genOR(ftext);
					fobj.push({
						type : "text",
						operator : "=",
						data : arr
					});
				}
			}
			

			var ret = {
				status : true,
				func : "exec",
				tlshare : this.sel_tlshare,
				tltype : this.sel_tltype,
				listtype : this.sel_listtype,
				filtertext : this.condition.filter.text,
				filter : fobj,
			};


			//---cancel is status only
			if (!flag) {
				ret = {status:false};
			}
			this.$emit("saveclose",ret);
			this.dialog = false;
		},
		onclick_dateclose : function (flag) {
			var tootids = {
				since_id : "",
				max_id : "",
			};

			var dt = "";
			if (this.timetab == 0) {
				var curdt = new Date();
				if (this.datecolumn == "0") {
					curdt.setHours(curdt.getHours() - parseInt(this.date_simple));
				}else if (this.datecolumn == "1") {
					curdt.setDate(curdt.getDate() - parseInt(this.date_simple));
				}else if (this.datecolumn == "2") {
					curdt.setDate(curdt.getDate() - (parseInt(this.date_simple)*7));
				}else if (this.datecolumn == "3") {
					curdt.setMonth(curdt.getMonth() - parseInt(this.date_simple));
				}
				
				tootids.max_id = MUtility.timestamp2id(curdt);
			} else if (this.timetab == 1) {
				if (!this.disablecls.begin.date) {
					var tmpdate = this.condition.daterange.begin.date;
					var tmptime = this.condition.daterange.begin.time;
					if (tmptime.split(":").length < 2) {
						tmptime = "00:00";
					}
					dt = `${tmpdate}T${tmptime}`;
					var dtb = new Date(dt);
					tootids.since_id = MUtility.timestamp2id(dtb);
				}
				if (!this.disablecls.end.date) {
					var tmpdate = this.condition.daterange.end.date;
					var tmptime = this.condition.daterange.end.time;
					if (tmptime.split(":").length < 2) {
						tmptime = "00:00";
					}
					dt = `${tmpdate}T${tmptime}`;
					var dte = new Date(dt);
					tootids.max_id = MUtility.timestamp2id(dte);
				}
			}
			var ret = {
				status : true,
				func : "exec",
				link : tootids
			};
			//---cancel is status only
			if (!flag) {
				ret = {status:false};
			}
			this.$emit("datesaveclose",ret);
			this.datedialog = false;
			
		},
		onclick_beginarrow : function (e) {
			this.disablecls.begin.date = !this.disablecls.begin.date;
			this.disablecls.begin.time = !this.disablecls.begin.time;
			if (this.disablecls.begin.date) {
				this.colorcls.beginbtn = "grey";
			}else{
				this.colorcls.beginbtn = "";
			}
		},
		onclick_endarrow : function (e) {
			this.disablecls.end.date = !this.disablecls.end.date;
			this.disablecls.end.time = !this.disablecls.end.time;
			if (this.disablecls.end.date) {
				this.colorcls.endbtn = "grey";
			}else{
				this.colorcls.endbtn = "";
			}
		},
		onclick_clearclose : function (flag) {
			var ret = {
				status : true,
				func : "clear",
				tlshare : "tt_all",
				tltype : ["tv_all"],
				listtype : "",
				filtertext : "",
				filter : [],
				link : {
					since_id : "",
					max_id : "",
				}
			};

			//---cancel is status only
			if (!flag) {
				ret = {status:false};
			}
			this.$emit("saveclose",ret);
			this.dialog = false;

		}
	}
});