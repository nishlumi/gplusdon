
//===========================================================================
//
//  Vue mixin Objects
//
//===========================================================================
var vue_mixin_base = {
	methods : {
		ch2seh : function(data) {
			////return data.replace(/&lt;/g,"").replace(/&gt;/g,"").replace(/innerHTML|document|querySelector|getElement/g,"");
			//return data.replace(/&lt;/g,"& lt;").replace(/&gt;/g,"& gt;")
			//---This is scary to re-write gt and lt tag.(Because, DOMpurify do not work.)
			var tmp = data.replace(/&lt;/g,"_<").replace(/&gt;/g,">_");
			return DOMPurify.sanitize(tmp,{ADD_ATTR: ['target']}).replace(/_</g,"&lt;").replace(/>_/g,"&gt;");
		}
	}
};
var vue_mixin_for_account = {
	data : {

	},
	methods: {
		/**
		 * Account append ( following, follower )
		 * @param {Array} data Array of theMastodon's Account object
		 * @param {Object} options other option 
		 */
		generate_account_detail: function (data, options) {
			//this.info.maxid = data[data.length - 1].id;
			//this.info.sinceid = data[0].id;
			var acdata = data.data;
			var paging = data.paging;

			//if (!options.app.is_nomax) this.info.maxid = data[data.length - 1].id;
			//if (!options.app.is_nosince) this.info.sinceid = data[0].id;
			if (!options.app.is_nomax) {
				if (paging.next != "") {
					this.info.maxid = paging.next; //data[data.length - 1].id;
				}
			}
			if (!options.app.is_nosince) {
				if (paging.prev != "") {
					this.info.sinceid = paging.prev; //data[0].id;
				}
			}


			var ids = [];
			for (var i = 0; i < acdata.length; i++) {
				if (!this.getAlreadyAccount(acdata[i])) {
					ids.push(acdata[i].id);
					this.accounts.push(acdata[i]);
				}
			}
			/*MYAPP.sns.getRelationship(ids)
			.then((result) => {
				for (var i = 0; i < result.data.length; i++) {
					var ac = this.getAlreadyAccount(result.data[i].id);
					if (ac) {
						this.$set(ac.data, "relationship", result.data[i]);
						this.accounts.splice(ac.index, 1, ac.data);
						//this.$set(this.accounts,ac.index,ac.data);
					}
				}
			});
			*/
		},
		getAlreadyAccount(ac) {
			for (var i = 0; i < this.accounts.length; i++) {
				if (ac.id == this.accounts[i].id) {
					return { index: i, data: this.accounts[i] };
				}
			}
			return null;
		},
	}
};
//----------------------------------------------------------------------
var vue_mixin_for_timeline = {
	data(){
		return {
			is_asyncing : false,
			is_scrolltop : true,
			is_opencomment : false,
			selshare_current : "tt_all",
			seltype_current : "tt_all",
			currentOption : {
				api : {
					exclude_replies : true,
					only_media : false,
				},
				app : {
					is_nomax : false,
					is_nosince : false,
					tlshare : "",
					tltype : [],
					exclude_reply : true,
					filter : []
				}
			},
			id : "",
			pagetype : "",
			info : {
				maxid : "",
				sinceid : "",
				is_nomax : false,
				is_nosince : false, 
			},
			translations : {},
			globalInfo : {
				staticpath : "",
				is_serveronly : false,
			},
			statuses : [],
			timeline_gridstyle : {
				width_count : true,
				width_1 : false,
				width_2 : false,
				width_3 : false,
			},
			pending : {
				above : {
					is : false,
					waiting : false,
					statuses : [],
				},
				below : {
					is : false,
					waiting : false,
					statuses : [],
				}
			},
			is_serveronly : false,
		}
	},
	created() {
		if (MYAPP) {
			this.globalInfo.staticpath = MYAPP.appinfo.staticPath;
			
		}
	},
	mounted() {
		/*this.wrapperSize.width = 1000;
		this.$nextTick(() => {
		  const erd = elementResizeDetectorMaker({
			strategy: 'scroll',
		  });
		  erd.listenTo(this.grid.$el, (element) => {
			this.wrapperSize = { width: element.offsetWidth };
		  });
		});*/
	},
	methods: {
		//---event handler----------------------------------------------
		onscroll_timeline : function(e){
			var tlid = "";
            var sa = e.target.scrollHeight - e.target.clientHeight;
            //console.log(e.target.scrollHeight+","+e.target.offsetHeight+" - "+e.target.clientHeight+"="+sa + " : " + e.target.scrollTop);
            var fnlsa = sa - Math.round(e.target.scrollTop);
            if (fnlsa < 10) {
                //---page max scroll down
                console.log("scroll down max");
                var pastOptions = {
                    api : {
                        exclude_replies : true,
                        max_id : "",
                    },
                    app : {
                        is_nomax : false,
                        is_nosince : true,
                        tlshare : this.currentOption.app.tlshare,
                        tltype : this.currentOption.app.tltype,
                        exclude_reply : true,
					}	
				}
				if ("filter" in this.currentOption.app) {
					pastOptions.app["filter"] = this.currentOption.app.filter;
				}
				for (var obj in this.currentOption.api) {
					pastOptions.api[obj] = this.currentOption.api[obj];
				}
				delete pastOptions.api["since_id"];
				delete pastOptions.api["min_id"];
                //var atab = Q(".tab .active");
                if (this.$el.id == "tl_home") {
					tlid = "home";
                }else if (this.$el.id == "tl_list") {
					tlid = "list";
					pastOptions.app["listid"] = this.currentOption.app.listid;
                }else if (this.$el.id == "tl_local") {
					tlid = "local";
					pastOptions.api["local"] = true;
                }else if (this.$el.id == "tl_public") {
					tlid = "public";
				}else if (this.$el.id == "tl_tag") {
					tlid = `tag/${this.tagname}`;
				}else if (this.$el.id == "tl_taglocal") {
					tlid = `tag/${this.tagname}`;
					pastOptions.api["local"] = true;
				}else if (this.$el.id == "tt_public") {
					if (this.pagetype == "account") {
						tlid = "me";
					}else if (this.pagetype == "user") {
						tlid = this.id;
					}
				}
				//pastOptions.api.max_id = this.info.maxid;
				//pastOptions.app.tlshare = this.selshare_current;
				//pastOptions.app.tltype = this.seltype_current;
				console.log("timeline ID=",tlid,JSON.stringify(this.info));
				this.loadTimeline(tlid,{
					api : pastOptions.api,
					app : pastOptions.app
				});

            }
            if (e.target.scrollTop == 0) {
                var futureOptions = {
                    api : {
                        exclude_replies : true,
                        //since_id : "",
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                        tlshare : this.currentOption.app.tlshare,
                        tltype : this.currentOption.app.tltype,
                        exclude_reply : true,
                    }
				}
				if ("filter" in this.currentOption.app) {
					futureOptions.app["filter"] = this.currentOption.app.filter;
				}
				for (var obj in this.currentOption.api) {
					futureOptions.api[obj] = this.currentOption.api[obj];
				}
				if (futureOptions.api["exclude_replies"] === true) {
                    futureOptions.api["exclude_replies"] = "";
                }else if (futureOptions.api["exclude_replies"] === false) {
                    delete futureOptions.api["exclude_replies"];
                }
				delete futureOptions.api["since_id"];
				delete futureOptions.api["max_id"];
                //---page max scroll up
                console.log("scroll up max");
                //var atab = Q(".tab .active");
                if (this.$el.id == "tl_home") {
					tlid = "home";
                }else if (this.$el.id == "tl_list") {
					tlid = "list";
                    futureOptions.app["listid"] = this.currentOption.app.listid;
                }else if (this.$el.id == "tl_local") {
					tlid = "local";
					futureOptions.api["local"] = true;
                }else if (this.$el.id == "tl_public") {
					tlid = "public";
                }else if (this.$el.id == "tl_tag") {
					tlid = `tag/${this.tagname}`;
				}else if (this.$el.id == "tl_taglocal") {
					tlid = `tag/${this.tagname}`;
					futureOptions.api["local"] = true;
				}else if (this.$el.id == "tt_public") {
					if (this.pagetype == "account") {
						tlid = "me";
					}else if (this.pagetype == "user") {
						tlid = this.id;
					}
				}
				//futureOptions.api.since_id = this.info.sinceid;
				//futureOptions.app.tlshare = this.selshare_current;
				//futureOptions.app.tltype = this.seltype_current;
				this.loadTimeline(tlid,{
					api : futureOptions.api,
					app : futureOptions.app
				});
				this.is_scrolltop = true;
				this.pending.above.waiting = false;
				this.pending.above.is = false;
            }else{
				this.is_scrolltop = false;
				//---pending new toot 
				if (e.target.scrollTop > MYAPP.session.config.notification.tell_newtoot_scroll) {
					if (MYAPP.session.config.notification.tell_newtoot) {
						this.pending.above.waiting = !this.is_scrolltop;
						/*if (this.pending.above.waiting) {
							for (var s = 0; s < this.statuses.length; s++) {
								this.$set(this.statuses[s].cardtypeSize,"border-top","");
							}
							this.$set(this.statuses[0].cardtypeSize,"border-top","1px solid red");
						}*/
					}
				}
				MYAPP.commonvue.bottomnav.checkScroll(fnlsa);
				
			}

        },
		onreplied_children : function (status,index) {
			//---this status.body.id is toot context OWN id, not view id for this app!
			MYAPP.sns.getConversation(status.body.id, status.body.id, index)
			.then((condata) => {
				console.log("getConversation", condata);
				var tt = this.getParentToot(condata.parentID);
				//console.log(condata.index, tt);
				if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
					/*var tmptt = Object.assign({}, tt.data, {
						ancestors : condata[0].ancestors,
						descendants : condata[0].descendants
					});*/
					var check_mediameta = function (toot) {
						for (var i = 0; i < toot.media_attachments.length; i++) {
							var data = toot.media_attachments[i];
							if (data.meta == null) {
								var img = GEN("img");
								img.src = data.preview_url;
								var asp = img.width / img.height;
								if (img.height > img.width) {
									asp = img.height / img.width;
								}
								data.meta = {
									small: {
										aspect: asp,
										width: img.width,
										height: img.height,
										size: `${img.width}x${img.height}`
									}
								};
							}
						}
						return toot;
					}
					//console.log("ancester & descendants=", condata.data);
					for (var a = 0; a < condata.data.ancestors.length; a++) {
						var ance = condata.data.ancestors[a];
						var gcls = new Gpstatus(ance,14);


						condata.data.ancestors[a] = gcls;

					}
					for (var a = 0; a < condata.data.descendants.length; a++) {
						var desce = condata.data.descendants[a];
						var gcls = new Gpstatus(desce,14);


						condata.data.descendants[a] = gcls;
					}
					//console.log(this.statuses[baseIndex]);
					//this.statuses[baseIndex].comment_stat.iszero = condata.data.descendants.length == 0 ? true : false;
					this.statuses[tt.index].comment_stat.mini = condata.data.descendants.length == 0 ? false : true;


					this.$set(this.statuses[tt.index], "ancestors", condata.data.ancestors);
					this.$set(this.statuses[tt.index], "descendants", condata.data.descendants);
					//vue_user.tootes.statuses[index].ancestors = condata.ancestors;
					//vue_user.tootes.statuses[index].descendants = condata.descendants;
					this.$nextTick(function () {
						var es = this.$el.querySelectorAll(".carousel");
						//console.log(es.length);
						for (var i = 0; i < es.length; i++) {
							M.Carousel.init(es[i], {
								dist: 0,
								fullWidth: true,
								indicators: true
							});
						}
						jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
						$("time.timeago").timeago();
					});
				}
			});
		},
		ondelete_toot_children : function (tootid) {
			var target = -1;
			for (var i = 0; i < this.statuses.length; i++){
				var e = this.statuses[i];
				if (tootid == e.id) {
					target = i;
					break;
				}
			};
			if (target > -1) {
				this.statuses.splice(target,1);
			}
		},
		onclick_show_pending : function (e) {
			var b = [];
			b = b.concat(this.pending.above.statuses);
			
			if (this.pending.above.waiting) {
				for (var s = 0; s < this.statuses.length; s++) {
					this.$set(this.statuses[s].cardtypeSize,"border-top","");
				}
				this.$set(this.statuses[0].cardtypeSize,"border-top","1px solid red");
			}

			this.currentOption.app.is_nomax = true;
			this.currentOption.app.is_nosince = false;

			this.generate_toot_detail({
				data: b,
				paging : {
					prev : this.pending.above.statuses[0].id
				}
			},{
				api : {
					exclude_replies : true,
					min_id : "",
				},
				app : this.currentOption.app
			});
			//---finish get update from stream, remove old loaded tootes
			if (this.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
				while (this.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
					this.statuses.pop();
				}
			}

			//---post scripts
			//TODO: during modification!!!
			this.clearPending();

			Q(".tab-content.active").scroll({top:0,behavior: "instant"});
		},
		onclick_load_below : function (e) {
			//---SAME AS page max scroll down
			console.log("scroll down max");
			var pastOptions = {
				api : {
					exclude_replies : true,
					max_id : "",
				},
				app : {
					is_nomax : false,
					is_nosince : true,
					tlshare : this.currentOption.app.tlshare,
					tltype : this.currentOption.app.tltype,
					exclude_reply : true,
				}	
			}
			if ("filter" in this.currentOption.app) {
				pastOptions.app["filter"] = this.currentOption.app.filter;
			}
			for (var obj in this.currentOption.api) {
				pastOptions.api[obj] = this.currentOption.api[obj];
			}
			//var atab = Q(".tab .active");
			if (this.$el.id == "tl_home") {
				tlid = "home";
			}else if (this.$el.id == "tl_list") {
				tlid = "list";
				pastOptions.app["listid"] = this.currentOption.app.listid;
			}else if (this.$el.id == "tl_local") {
				tlid = "local";
				pastOptions.api["local"] = true;
			}else if (this.$el.id == "tl_public") {
				tlid = "public";
			}else if (this.$el.id == "tl_tag") {
				tlid = `tag/${this.tagname}`;
			}else if (this.$el.id == "tl_taglocal") {
				tlid = `tag/${this.tagname}`;
				pastOptions.api["local"] = true;
			}
			pastOptions.api.max_id = this.info.maxid;
			//pastOptions.app.tlshare = this.selshare_current;
			//pastOptions.app.tltype = this.seltype_current;
			console.log("timeline ID=",tlid,JSON.stringify(this.info));
			this.loadTimeline(tlid,{
				api : pastOptions.api,
				app : pastOptions.app
			});
		},
		//---some function----------------------------------------------
		hide_on_noauth : function () {
			return !this.is_serveronly;
		},
		clearPending : function() {
			this.pending.above.statuses.splice(0,this.pending.above.statuses.length);
			this.pending.above.waiting = false;
			this.pending.above.is = false;
		},
		checkExistToot : function (id) {
			var hit = false;
			for (var i = 0; i < this.statuses.length; i++) {
				if (id == this.statuses[i].id) {
					hit = true;
					break;
				}
			}
			return hit;
		},
		/**
		 * To generate Gpstatus from Raw status json of Mastodon
		 * @param {JSON} rawdata Status array from Mastodon
		 * @param {JSON} options My app's option object included (api, app)
		 */
		generate_toot_detail: function (rawdata, options) {
			var data = rawdata.data;
			var paging = rawdata.paging;

			if (!options.app.is_nomax) {
				if (paging.next != "") {
					this.info.maxid = paging.next; //data[data.length - 1].id;
					this.currentOption.api.max_id = paging.next;
				}
			}
			if (!options.app.is_nosince) {
				if (paging.prev != "") {
					this.info.sinceid = paging.prev; //data[0].id;
					if (paging["raw_prev"]) {
						this.currentOption.api[paging["raw_prev"]] = paging.prev;	
					}else{
						this.currentOption.api.since_id = paging.prev;
						this.currentOption.api.min_id = paging.prev;
					}
				}
			}
			console.log("data.length=" + data.length);
			var generate_body = (data,options,direct) => {
				var st = new Gpstatus(data,18);
				var flag = this.filterToot("filter", st, options);
				if (flag) {
					flag = this.filterToot("share", st, options);
					if (flag) {
						flag = this.filterToot("additional", st, options);
					}
				}
				//console.log(options.app.tltype);
				if (flag) {
					//console.log(data[i].id, data[i].visibility, data[i].media_attachments.length);
					/**
					 * status append
					 *   <- Array.unshift()
					 *  data[0] - newest toot
					 *  data[n] - old toot
					 *   <- Array.push()
					 */
					//console.log("st=", st);
					var baseIndex = 0;
					if (direct == "since") {
						this.statuses.unshift(st);
					} else if (direct == "max") {
						this.statuses.push(st);
						baseIndex = this.statuses.length-1;
					}
					var tmpid = this.statuses.length - 1;
					//---get /statuses/:id/context
					var conversationData = data;
					var ascendantData = data;
					if (data.reblog != null) {
						//---if this toot boosted post from any one, replace id.
						conversationData = data.reblog;
						ascendantData = data.reblog;
					}
					if ((st.body.in_reply_to_id != null) || (st.body.replies_count < 0) || (st.body.replies_count > 0) )  {
						MYAPP.sns.getConversation(st.body.id, st.id, tmpid)
						.then((condata) => {
							console.log("getConversation", condata);
							var tt = this.getParentToot(condata.parentID);
							//console.log(condata.index, tt);
							if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
								
								//console.log("ancester & descendants=", condata.data);
								for (var a = 0; a < condata.data.ancestors.length; a++) {
									var ance = condata.data.ancestors[a];
									var gcls = new Gpstatus(ance,14);

									condata.data.ancestors[a] = gcls;

								}
								for (var a = 0; a < condata.data.descendants.length; a++) {
									var desce = condata.data.descendants[a];
									var gcls = new Gpstatus(desce,14);

									condata.data.descendants[a] = gcls;
								}
								//console.log(this.statuses[baseIndex]);
								//this.statuses[baseIndex].comment_stat.iszero = condata.data.descendants.length == 0 ? true : false;
								this.statuses[tt.index].comment_stat.mini = condata.data.descendants.length == 0 ? false : true;


								this.$set(this.statuses[tt.index], "ancestors", condata.data.ancestors);
								this.$set(this.statuses[tt.index], "descendants", condata.data.descendants);
								this.statuses[tt.index].body.replies_count = condata.data.descendants.length;
								/*this.$nextTick(function () {
									
									console.log(this.$el);
									var es = this.$el.querySelectorAll(".carousel");
									console.log(es.length);
									for (var i = 0; i < es.length; i++) {
										M.Carousel.init(es[i], {
											dist: 0,
											fullWidth: true,
											indicators: true
										});
									}
									jQuery.timeago.settings.cutoff = (1000*60*60*24) * 3;
									$("time.timeago").timeago();
									
								});*/
							}
						});
					}
					//---get site preview if link added
					//console.log("st.urls.length=", st.urls.length);
					if (st.urls.length > 0) {
						var targeturl = st.urls[0];
						//console.log("urls>0=",st.body.id, st.id, i, JSON.original(st.urls))
						//---get GPHT
						//====> Iam, denove mi ekzameos...
						/*loadGPHT(st.url[0],data[i].id)
						.then((result)=>{

						});*/
						//---get OGP
						MYAPP.sns.getTootCard(st.body.id, st.id, i)
						.then(result=>{
							var data = result.data;
							var tt = this.getParentToot(result.parentID);
							//console.log("result,tt=",result,tt);

							if (("url" in data)) {
								//---if found map, hide link preview
								if (this.statuses[tt.index].geo.enabled && MYAPP.session.config.notification["notpreview_onmap"] && (MYAPP.session.config.notification["notpreview_onmap"] === true)) {
									this.$set(this.statuses[tt.index].mainlink, "exists", false);
								}else{
									this.$set(this.statuses[tt.index].mainlink, "exists", true);
								}
								if ("provider_name" in data) {
									if (data.provider_name != "") {
										this.$set(this.statuses[tt.index].mainlink, "site", data["provider_name"]);
									}else{
										var a = GEN("a");
										a.href = data.url;
										//console.log("data.url=",a.hostname);
										this.$set(this.statuses[tt.index].mainlink, "site", a.hostname);
									}
								}
								if ("url" in data) this.$set(this.statuses[tt.index].mainlink, "url", data["url"]);
								if ("title" in data) this.$set(this.statuses[tt.index].mainlink, "title", data["title"]);
								if ("description" in data) this.$set(this.statuses[tt.index].mainlink, "description", data["description"]);
								if (("image" in data) && (data["image"] != null)) {
									this.$set(this.statuses[tt.index].mainlink, "image", data["image"]);
									this.$set(this.statuses[tt.index].mainlink, "isimage", true);
	
									//---final card size change
									if (this.statuses[tt.index].medias.length > 0) {
										var sp = parseInt(this.statuses[tt.index].cardtypeSize["grid-row-end"].replace("span", ""));
										/*if (sp < 9) {
											sp = sp + 6;
										} else {
											sp = sp + 2;
										}*/
										//this.$set(this.statuses[tt.index].cardtypeSize, "grid-row-end", `span ${sp}`);
									}
								} else {
									this.$set(this.statuses[tt.index].mainlink, "isimage", false);
								}
							}else{
								return Promise.reject({url:targeturl, tootid:st.id});
							}
						})
						.catch(param=>{
							console.log("param=",param);
							loadOGP(param.url, param.tootid)
							.then(result => {
								//---if image is none and url is pixiv, re-get image url
								var def = new Promise((resolve, reject) => {

									var tt = this.getParentToot(result.index);

									//console.log("catch,param,ogp=",result);
									//console.log(tt);
									if (tt.data.urls.length > 0) {
										if ((!("og:image" in result.data) || (result.data["og:image"] == "")) &&
											(tt.data.urls[0].indexOf("pixiv.net/member_illust") > -1)
										) {
											if ("pixiv_cards" in tt.data.body) {
												result.data["og:image"] = tt.data.body.pixiv_cards[0].image_url;
												resolve(result);
											} 
										} else {
											resolve(result);
										}

									}else{
										reject(false);
									}
								});
								return def;
							})
							.then((result) => {
								//console.log("result=", result);
								var data = result.data;
								var tt = this.getParentToot(result.index);
								//console.log("result.getParentToot=", tt);
								//console.log(this.statuses[tt.index]);

								
								//---if exists medias, not preview link
								if (MYAPP.session.config.notification["notpreview_onmedia"] && (MYAPP.session.config.notification["notpreview_onmedia"] === true)) {
									if (this.statuses[tt.index].medias.length > 0) {
										this.$set(this.statuses[tt.index].mainlink, "exists", false);
									}
								}else {
									this.$set(this.statuses[tt.index].mainlink, "exists", true);
								}
								//---if found map, hide link preview
								if (this.statuses[tt.index].geo.enabled && MYAPP.session.config.notification["notpreview_onmap"] && (MYAPP.session.config.notification["notpreview_onmap"] === true)) {
									this.$set(this.statuses[tt.index].mainlink, "exists", false);
								}else{
									this.$set(this.statuses[tt.index].mainlink, "exists", true);
								}
								if (data["og:site_name"]) this.$set(this.statuses[tt.index].mainlink, "site", data["og:site_name"]);
								if (data["og:url"]) this.$set(this.statuses[tt.index].mainlink, "url", data["og:url"]);
								if (data["og:title"]) this.$set(this.statuses[tt.index].mainlink, "title", data["og:title"]);
								if (data["og:description"]) this.$set(this.statuses[tt.index].mainlink, "description", data["og:description"]);
								if (("og:image" in data) && (data["og:image"] != "")) {
									this.$set(this.statuses[tt.index].mainlink, "image", data["og:image"]);
									this.$set(this.statuses[tt.index].mainlink, "isimage", true);

									//---final card size change
									if (this.statuses[tt.index].medias.length > 0) {
										var sp = parseInt(this.statuses[tt.index].cardtypeSize["grid-row-end"].replace("span", ""));
										if (sp < 9) {
											sp = sp + 10;
										} else {
											sp = sp + 6;
										}
										this.$set(this.statuses[tt.index].cardtypeSize, "grid-row-end", `span ${sp}`);
									}
								} else {
									this.$set(this.statuses[tt.index].mainlink, "isimage", false);
								}
							})
							/*.catch(error=>{
								//---to present link info from Mastodon Status Card
								var tt = this.getParentToot(error.index);
								var a = GEN("a");
								var url = tt.data.body.uri.replace("users", "api");
								url = url.replace(tt.data.account.username, "v1");

								MYAPP.sns.originalGet(`${url}/card`, {})
								.then(result_card => {
									result.data["og:image"] = result_card.image;
									if (result_card["image"] != null) {
										this.$set(this.statuses[tt.index].mainlink, "image", result_card.image);
										this.$set(this.statuses[tt.index].mainlink, "isimage", true);

										//---final card size change
										if (this.statuses[tt.index].medias.length > 0) {
											var sp = parseInt(this.statuses[tt.index].cardtypeSize["grid-row-end"].replace("span", ""));
											if (sp < 9) {
												sp = sp + 10;
											} else {
												sp = sp + 6;
											}
											this.$set(this.statuses[tt.index].cardtypeSize, "grid-row-end", `span ${sp}`);
										}
									}

								});
							})*/
							;
							
						});

						
					}
				}
			}

			if (!options.app.is_nomax) {
				for (var i = 0; i < data.length; i++) {
					if (this.checkExistToot(data[i].id)) continue;
					generate_body(data[i],options,"max");
				}
			}else if (!options.app.is_nosince) {
				for (var i = data.length-1; i >= 0; i--) {
					if (this.checkExistToot(data[i].id)) continue;
					generate_body(data[i],options,"since");
					
				}
			}
			console.log("vm.statuses=" + this.statuses.length);
			this.is_asyncing = false;
			this.$nextTick(() =>{
				for (var s = 0; s < this.statuses.length; s++) {
					var onest = this.statuses[s];
					/*
					if (onest.geo.enabled) {
						var OsmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
							OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
							Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
							latlng = L.latLng(onest.geo.location[0].lat, onest.geo.location[0].lng);
	
						//---$children is Vue.component
						//   But, $children[0] is parent of the array timeline-toot
						//   So, [1] is real start.
						var oneelem = this.$children[s+1];
						var geomap = L.map(
							oneelem.$el.querySelector('.here_map'), {
								center: latlng, 
								dragging : true, 
								zoom: onest.geo.location[0].zoom,
								layers: [Osm]
							}
						);

	
						for (var i = 0; i < onest.geo.location.length; i++) {
							var ll = onest.geo.location[i];
							var marker = L.marker({lat:ll.lat,lng:ll.lng}).addTo(geomap);
							marker.on("click",(ev)=>{
								//ev.sourceTarget.remove();
								//this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}&n=${}`;
							});
							marker.bindPopup(ll.name);
						}
					}
					*/
				}

			});
			return Promise.resolve(this.statuses);
		},

		/**
		 * to check a toot to show in timeline
		 * @param {String} priority priority type (filter -> share-> additional)
		 * @param {GStatus} gstatus 
		 * @param {Object} options 
		 * @return {Boolean} wheather the toot is OK ?
		 */
		filterToot: function (priority, gstatus, options) {
			var data = gstatus.body;
			var ret = true;
			//---share range
			if (priority == "share") {
				if (options.app.tlshare == "tt_public") {
					ret = data.visibility == "public" ? true : false;
				} else if (options.app.tlshare == "tt_tlonly") {
					ret =  data.visibility == "unlisted" ? true : false;
				} else if (options.app.tlshare == "tt_private") {
					ret =  data.visibility == "private" ? true : false;
				} else if (data.visibility == "direct") {
					console.log(data.visibility,"include_dmsg_tl",MYAPP.session.config.notification.include_dmsg_tl);
					if (MYAPP.session.config.notification.include_dmsg_tl) {
						ret = true;
					}else{
						ret = false;
					}
				} 
			}else if (priority == "additional") {
				//---additional option
				if (options.app.exclude_reply) {
					ret = (data.in_reply_to_id == null) ? true : false;
				}
				if (options.app.tltype.indexOf("tv_media") > -1) {
					ret =  gstatus.medias.length > 0 ? true : false;
				}
				if (options.app.tltype.indexOf("tv_exclude_bst") > -1) {
					ret = (gstatus.reblogOriginal != null) ? false : true;
				}
				if (options.app.only_media) {
					ret = gstatus.medias.length > 0 ? true : false;
				}
			}else if (priority == "filter") {
				if (("filter" in options.app) && (options.app.filter !== undefined)) {
					var hitcount = 0, hitmax = options.app.filter.filter((e)=>{return (e.operator == "=");});
					for (var i = 0; i < options.app.filter.length; i++) {
						var fil = options.app.filter[i];
						if (fil.type == "instance") {
							if (fil.operator == "=") {
								if (fil.data.indexOf(gstatus.account.instance) > -1) {
									hitcount++;
								}
							}else{
								if (fil.data.indexOf(gstatus.account.instance) == -1) {
									hitcount++;
								}
							}
						}else if (fil.type == "user") {
							if (fil.operator == "=") {
								if (fil.data.indexOf(gstatus.account.username) > -1) {
									hitcount++;
								}
							}else{
								if (fil.data.indexOf(gstatus.account.username) == -1) {
									hitcount++;
								}
							}
						}else if (fil.type == "text") {
							if (fil.operator == "=") {
								for (var a = 0; a < fil.data.length; a++) {
									if (data.content.indexOf(fil.data[a]) > -1) {
										hitcount++;
										break;
									}
								}
							}else{
								for (var a = 0; a < fil.data.length; a++) {
									if (data.content.indexOf(fil.data[a]) == -1) {
										hitcount++;
										break;
									}
								}
							}
						}
					}
					if (options.app.filter.length > 0) {
						if (hitcount >= options.app.filter.length) {
							ret = true;
						}else{
							ret = false;
						}
					}
				}
			}
			

			return ret;
		},
		/**
		 * get parent toot reply, etc
		 * @param {String} id parent toot id from referrence
		 */
		getParentToot: function (id) {
			for (var i = 0; i < this.statuses.length; i++) {
				var tt = this.statuses[i];
				if (id == tt.id) {
					return { index: i, data: tt };
				}
			}
			return null;
		},
		forWatch_allcondition : function (cond) {
			this.statuses.splice(0,this.statuses.length);
			//---this option is forcely.
			this.currentOption.api["exclude_replies"] = "";

			if ("link" in cond) {
				if (cond.link.since_id == "") {
					delete this.currentOption.api["since_id"];
					delete this.currentOption.api["min_id"];
					this.currentOption.app["is_nosince"] = false;
				}else{
					this.currentOption.api["min_id"] = cond.link.since_id;
					this.currentOption.app["is_nosince"] = false;
				}
				if (cond.link.max_id == "") {
					delete this.currentOption.api["max_id"];
					this.currentOption.app["is_nomax"] = false;
				}else{
					this.currentOption.api["max_id"] = cond.link.max_id;
					this.currentOption.app["is_nomax"] = false;
				}
			}
			//---these options are optional.
			if ("tlshare" in cond) this.currentOption.app["tlshare"] = cond.tlshare;
			if ("tltype" in cond) {
				this.currentOption.app["tltype"] = cond.tltype;
				//---its exists in real Mastodon API.
				if (cond.tltype.indexOf("tv_media") > -1) {
					this.currentOption.api["only_media"] = "";
				}else{
					delete this.currentOption.api["only_media"];
				}
			}else{
				delete this.currentOption.api["only_media"];
			}
			if ("filter" in cond) this.currentOption.app["filter"] = cond.filter;			
			
			return this.currentOption;
		},
		forWatch_selshare : function (val) {
			this.statuses.splice(0,this.statuses.length);
			//this.info.tltype = sel;
			this.currentOption.api["exclude_replies"] = true;
			this.currentOption.app["tlshare"] = val;
			this.currentOption.app["tltype"] = this.seltype_current;

			/*var opt = {
				api : {
					exclude_replies : true
				},
				app : {
					tlshare : val,
					tltype : this.seltype_current,
				}
			};*/
			return this.currentOption;
		},
		forWatch_seltype : function (val) {
			this.statuses.splice(0,this.statuses.length);
			//this.info.tltype = sel;
			this.currentOption.api["exclude_replies"] = true;
			this.currentOption.app["tlshare"] = this.selshare_current;
			this.currentOption.app["tltype"] = val;
			
			/*var opt = {
				api : {
					exclude_replies : true
				},
				app : {
					tlshare : this.selshare_current,
					tltype : val,
				}
			};*/
			if (val == "tt_media") {
				this.currentOption.api["only_media"] = true;
			}else{
				delete this.currentOption.api["only_media"];
			}
			return this.currentOption;
		},
		changeTimelineStyle : function (e) {
			for (var st in this.timeline_gridstyle) {
                this.timeline_gridstyle[st] = false;
            }
            
            if (MYAPP.session.config.application.timeline_view == "auto") {
                this.timeline_gridstyle.width_count = true;
            }else if (MYAPP.session.config.application.timeline_view == "1") {
                this.timeline_gridstyle.width_1 = true;
            }else if (MYAPP.session.config.application.timeline_view == "2") {
                this.timeline_gridstyle.width_2 = true;
            }else if (MYAPP.session.config.application.timeline_view == "3") {
                this.timeline_gridstyle.width_3 = true;
            }
		},
		/**
		 * call function of set up reply data (for from parent object)
		*/
		call_replySetup() {
			//---generateReplyObject() exists in Vue.component("timeline-toot")
			this.reply_data = this.$refs.tootview.generateReplyObject(this.toote);
		},

	}
};
//----------------------------------------------------------------------
var vue_mixin_for_inputtoot = {
	props : {
		accounts : {
			type: Array,
			default: null
		},
		initialaccounts : {
			type : Array,
			default : null
		}
	},
	data() {
		return {
			ckeditor : null,
			ckeditable : null,
			btnflags : {
                loading : false,
                mood : {
                    "red-text" : false,
                },
                send_disabled : false
			},
			toot_valid : true,
			screentype : "toot",	//toot, direct


			//---account box data
			selaccounts : [],

			//---share scope box and mention box data
			sharescopes : [
                {text : _T("sel_tlpublic"), value: "tt_public", avatar: "public", selected:{"red-text":true}},
                {text : _T("sel_tlonly"),   value: "tt_tlonly", avatar: "lock_open",selected:{"red-text":false}},
                {text : _T("sel_private"),  value: "tt_private", avatar: "lock",selected:{"red-text":false}},
                {text : _T("sel_direct"),  value: "tt_direct", avatar: "email",selected:{"red-text":false}},
            ],

			selsharescope : {
				text : _T("sel_tlpublic"),
				value : "tt_public",
				avatar : "public",
				selected:{"red-text":true}
			},
			
			isopen_mention : false,
			selmentions : [],
			mentions : [],
			mention_loading : false,
			mention_search : null,
			
			//---status textarea data
            status_text : "",
            strlength : 0,
            status_rules : [
                function (v) {
                    return twttr.txt.getUnicodeTextLength(v) <= 500 || "500文字を超えています。"
                }
            ],
            status_class : {
                dragover_indicate : false,
			},
			strlength_class : {
				"red-text" : false,
			},
			
			//---tag box data
			seltags : [],
			//tags: [],
			
			//---media
			/**
			 * pysical selected media files
			 * [
			 * {
			 *   src : {DataURL},
			 *   comemnt : {String},
			 *   data : {File}
			 * }, ...
			 * ]
			 */
			selmedias : [],
			/**
			 * returned media object from mastodon
			 * [
			 *  {
			 *   "name@instance" : {
			 * 	   id : "",
			 *     meta : {},
			 *     description : "",
			 *     preview_url : "",
			 *     remote_url : "",
			 *     text_url : "",
			 *     type : "image",
			 *     url : "",
			 *    },
			 *    "name2@instance" : {...},
			 *  }
			 * ]
			 */
            medias : [],
			switch_NSFW : false,
			
			//---link
			mainlink : {
                exists : false,
                url : "",
                isimage : false,
                image : "",
                description : "",
                site : "",
                title : "",
			},
			
			//---geo
			geotext : "",
			geouris : [],
			geochk_error : false,
			geouris_rules : [
                function (v) {
                    return v.length <= 4 || "Max: 4 location"
                }
            ],
			is_geo : false,
			geomap : null,
			geoitems : [],
			geo : {
				lat : 0,
				lng : 0,
				zoom : 1,
				locos : []
			},
			css : {
				geo : {
					common_ui_off : true
				}
			}

		}
	},
	watch : {
		selaccounts : function (val) {
			//console.log(val);
			MYAPP.session.status.toot_max_character = MYAPP.appinfo.config.toot_max_character;
			MYAPP.session.status.toot_warning_number = MYAPP.appinfo.config.toot_warning_number;
			var tmparr = [];
			for (var i = 0; i < val.length; i++) {
				var v = val[i];
				//---check toot text limit
				for (var st = 0; st < MYAPP.session.config.notification.toot_limit_instance.length; st++) {
					var lim = MYAPP.session.config.notification.toot_limit_instance[st];
					if (v.indexOf(lim.instance) > -1) {
						//---always overwrite a more max count
						if (MYAPP.session.status.toot_max_character < lim.limit) {
							MYAPP.session.status.toot_max_character = lim.limit;
							MYAPP.session.status.toot_warning_number = lim.limit - 10;
							tmparr.push(lim.limit);
						}
					}else{
						tmparr.push(MYAPP.appinfo.config.toot_max_character);
					}
				}
				//---check media
				for (var m = 0; m < this.medias.length; m++) {
					var media = this.medias[m];
					var ishit = false;
					for (var name in media) {
						if (v == name) {
							//---if hited, this account has media.
							ishit = true;
							break;
						}
					}
					if (!ishit) {
						//---this account don't has media.
						this.btnflags.send_disabled = true;
						this.btnflags.loading = true;
						var hitac = this.getTextAccount2Object(i);
						if (hitac) {
							var fdef = MYAPP.uploadMedia(hitac,this.selmedias[m].data,{
								filename : this.selmedias[m].data.name
							});
							fdef.then(mediaresult=>{
								media[v] = mediaresult.data;
							})
							.finally(()=>{
								this.btnflags.send_disabled = false;
								this.btnflags.loading = false;				
							});
						}
					}
				}
			}
			//---re check
			this.calc_fulltext(this.status_text);
			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red-text"] = true;
			}else{
				this.strlength_class["red-text"] = false;
			}
			this.btnflags.send_disabled = (this.strlength > MYAPP.session.status.toot_max_character);

			this.account_errmsg = "";
			if (val.length > 1) {
				//if (tmparr[0] != tmparr[1]) {
				//	this.account_errmsg = _T("msg_limit_max1");
					this.btnflags.send_disabled = true;
				//}
			}
			if (val.length == 0) {
				this.btnflags.send_disabled = true;
			}
			this.loadEmoji();
		},
		selmentions : function(val) {
			var mentions;
			if (this.screentype == "direct") {
				mentions = this.calc_mentionLength(val).join(" ");
			}else{
				mentions = this.calc_mentionLength(val).join(" ");
			}
			//console.log(mentions, mentions.length);
			//var tags = this.seltags.join(" ");
			var tags = [];
			for (var i = 0; i < this.seltags.length; i++) {
				tags.push(this.seltags[i]);
			}

			this.strlength = twttr.txt.getUnicodeTextLength(this.status_text)
				+ mentions.length + tags.join(" ").length;

			this.$emit("change",{
				"is_edit" : (this.strlength > 0) ? true : false,
				"length" : this.strlength
			});

		},
		seltags : function (val) {
			var mentions;
			if (this.screentype == "direct") {
				mentions = this.calc_mentionLength(this.selmentions).join(" ");
			}else{
				mentions = this.calc_mentionLength(this.selmentions).join(" ");
			}
			//console.log(mentions, mentions.length);
			//var tags = this.seltags.join(" ");
			var tags = [];
			for (var i = 0; i < val.length; i++) {
				tags.push(val[i]);
			}

			this.strlength = twttr.txt.getUnicodeTextLength(this.status_text)
				+ mentions.length + tags.join(" ").length;

			this.$emit("change",{
				"is_edit" : (this.strlength > 0) ? true : false,
				"length" : this.strlength
			});
		},
		geouris : function (val,old) {
			//var len = val.length;
			//this.strlength += len + 1; //1 is space.
			console.log(val,old);
			if (val.length > 4) {
				return false;
			}else{
			}
			this.calc_fulltext(this.status_text);

			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red-text"] = true;
			}else{
				this.strlength_class["red-text"] = false;
			}
			this.btnflags.send_disabled = (this.strlength > MYAPP.session.status.toot_max_character);
		},
		strlength: function (val) {
			this.btnflags.send_disabled = (this.strlength > MYAPP.session.status.toot_max_character);
			if (this.strlength == 0) {
				this.btnflags.send_disabled = true;
			}
			if ((this.selaccounts.length == 0) || (this.selaccounts.length > 1)) {
				this.btnflags.send_disabled = true;
			}
		},
		status_text : function(val) {

			this.calc_fulltext(val);
			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red-text"] = true;
			}else{
				this.strlength_class["red-text"] = false;
			}
			this.btnflags.send_disabled = (this.strlength > MYAPP.session.status.toot_max_character);

			if (this.strlength == 0) {
				this.btnflags.send_disabled = true;
			}
			if ((this.selaccounts.length == 0) || (this.selaccounts.length > 1)) {
				this.btnflags.send_disabled = true;
			}
			this.$emit("change",{
				"is_edit" : (this.strlength > 0) ? true : false,
				"length" : this.strlength
			});
		},

	},
	mounted() {
		//M.FormSelect.init(ID("keymaptitle"), {});
		//CKEDITOR.disableAutoInline = true;
		//CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
		//this.ckeditor = CKEDITOR.inline( 'dv_inputcontent', CK_INPUT_TOOTBOX);
	
	},
	methods : {
		autocomplete_mention_func : CK_dataFeed_mention,

		/**
		 * Get mention text calculable
		 * @param {String[]} arr 
		 */
		calc_mentionLength : function(arr){
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
		},
		joinStatusContent : function (){
			var content = "";
			if (this.selmentions.length > 0) 
				content += this.selmentions.join(" ") + " ";
			content += this.status_text;
			if (this.seltags.length > 0) {
				var tags = [];
                for (var i = 0; i < this.seltags.length; i++) {
                    tags.push(this.seltags[i].text);
                }

				content += "\n" + tags.join(" ");
			}
			if (this.geouris.length > 0) {
				content += "\n";
				content += this.geouris.join("\n") + " ";
			}
			
			return content;
		},
		calc_fulltext : function (val) {
			var cont = MYAPP.extractTootInfo(val);
			var textWithoutMentions = cont.text;
			var mentions = [];
			if (this.selmentions.length > 0) {
				mentions = MYAPP.calcMentionLength(this.selmentions);
			}
			if (cont.mentions) {
				for (var i = 0; i < cont.mentions.length; i++) {
					textWithoutMentions = textWithoutMentions.replace(cont.mentions[i],"");
				}
				mentions = mentions.concat(MYAPP.calcMentionLength(cont.mentions));
				//console.log("text=",textWithoutMentions,"mentions=",mentions);
			}

			var tags = this.seltags.join(" ");


			//console.log(textWithoutMentions,mentions,tags);
			this.strlength = twttr.txt.getUnicodeTextLength(textWithoutMentions)
				+ mentions.join(" ").length + tags.length + this.geouris.join(" ").length;
		},
		generate_geouri : function (item) {
			var name = item.Name.replace(/\s/g,"");
			//return `geo:${item.Geometry.latlng.lat},${item.Geometry.latlng.lng}?z=${item.Geometry.zoom}&n=${(name)}`;

			//---alternative output
			var mapobj = srvMaps[MYAPP.session.config.application.map_type];
			var url = mapobj.hostname;
			url += mapobj.search
				.replace(/%1/g,item.Geometry.zoom)
				.replace(/%2/g,item.Geometry.latlng.lat)
				.replace(/%3/g,item.Geometry.latlng.lng);
			return url;
		},
		generate_marker : function(lat, lng, zoom) {
			var marker = L.marker({lat:lat,lng:lng},{icon:redIcon}).addTo(this.geomap);
			marker.on("click",(ev)=>{
				//ev.sourceTarget.remove();
				//this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}`;
			});
			marker.bindPopup(`${lat},${lng}`);
			this.geoitems.push(marker);
			this.geo.locos.push({
				"Geometry" : {
					"Coordinates" : `${lng},${lat}`,
					"latlng" : {
						"lat" : lat,
						"lng" : lng,
					},
					"zoom" : zoom
				},
				"Property" : {
					"Address" : ""
				},
				"Name" : `(${lat}/${lng})`
			});

			//---arround location
			loadGeoLoco(lat,lng)
			.then(result=>{
				//---set near location marker
				
				for (var i = 0; i < result.Feature.length; i++) {
					var pos = result.Feature[i].Geometry.Coordinates.split(",");

					result.Feature[i].Geometry["latlng"] = {
						lat : pos[1],
						lng : pos[0]
					};
					result.Feature[i].Geometry["zoom"] = zoom;
					this.geo.locos.push(result.Feature[i]);
					

					var marker = L.marker({lat:pos[1],lng:pos[0]}).addTo(this.geomap);
					marker.on("click",(ev)=>{
						//ev.sourceTarget.remove();
						//this.geotext = `geo:${ev.latlng.lat},${ev.latlng.lng}?z=${this.geo.zoom}&n=${}`;
					});
					marker.bindPopup(result.Feature[i].Name);
					this.geoitems.push(marker);
				}
			})
			.catch(error=>{

			});
		},
		clear_selectaccount : function (){
			this.selaccounts.splice(0,this.selaccounts.length);
		},
		set_selectaccount : function (e) {
			this.selaccounts.push(this.initialaccounts[0]);
		},
		insertText : function (text) {
			this.ckeditor.editable().insertText(text);
			this.status_text = this.ckeditor.editable().getText();
		},
		generate_showable_mention : function () {
			var men = this.selmentions[0];
			return `To:${men}`;
		},
		//---event handler---------------------------------------------
		onchange_autocomp : function (e) {
			if (e.length > 1) {
				this.selaccounts.pop();
			}
			return false;
		},
		onchange_inputcontent : function (e) {
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			this.status_text = this.ckeditor.editable().getText();
		},
		onkeydown_inputcontent : function (e) {
			if ((e.keyCode == 13) && (e.ctrlKey || e.metaKey)) {
				this.onclick_send(e);
				console.log("enter pos!");
			}
		},
		onkeyup_inputcontent : function (e) {
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			this.status_text = content.text; //this.ckeditor.editable().getText();
			//console.log(this.ckeditor.getData(),this.status_text,content);

			if (content.urls.length > 0) {
				if (!this.mainlink.exists) {
					var link = content.urls[0];
					//---preview link image
					setTimeout(()=>{
						this.btnflags.loading = true;

						loadOGP(link)
						.then(result=>{
							this.mainlink.exists = true;
							this.mainlink.url = link;
							if ("og:description" in result.data) {
								this.mainlink.description = result.data["og:description"];
							}
							if ("og:title" in result.data) {
								this.mainlink.title = result.data["og:title"];
							}
							if ("og:site_name" in result.data) {
								this.mainlink.site = result.data["og:site_name"];
							}
							if ("og:image" in result.data) {
								this.mainlink.isimage = true;
								this.mainlink.image = result.data["og:image"];
							}
							this.btnflags.loading = false;

						});
					},400);
				}
			}else{
				this.mainlink.exists = false;
			}
		},
		ondragover_inputcontent : function(e){
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
			this.status_class.dragover_indicate = true;
		},
		ondragleave_inputcontent : function(e){
			this.status_class.dragover_indicate = false;
		},
		ondrop_inputcontent : function(e){
			e.stopPropagation();
			e.preventDefault();
			this.status_class.dragover_indicate = false;
			//console.log(e.dataTransfer);
			if (this.selaccounts.length == 0) {
				appAlert(_T("post_error_msg01"));
				return;
			}
			if ((e.dataTransfer.files.length > 4) ||
				((this.medias.length >= 1) && (e.dataTransfer.files.length >= 4)) ||
				((this.medias.length >= 2) && (e.dataTransfer.files.length >= 3)) ||
				((this.medias.length >= 3) && (e.dataTransfer.files.length >= 2)) ||
				(this.medias.length >= 4)
			) {
				appAlert(_T("image_error_msg01"));
				return;
			}
			this.btnflags.send_disabled = true;
			this.btnflags.loading = true;
			this.loadMediafiles("file",e.dataTransfer.files)
			.then(()=>{
				this.btnflags.send_disabled = false;
				this.btnflags.loading = false;
				if (this.screentype == "direct") {
					var e = Q(".timeline_cardlist_mobile");
					e.scroll({top:e.scrollHeight});
					e = Q(".timeline_cardlist")
					e.scroll({top:e.scrollHeight});
				}
			});
			/*
			appPrompt2(
				"画像のコメントを入力してください。",
				(result)=>{ console.log(result); },
				e.dataTransfer.files,
				""
			);
			return false;height="56px"*/
		},
		onchange_openmedia : function (e) {
			//console.log(e);
			this.status_class.dragover_indicate = false;
			//console.log(e.dataTransfer);
			if (this.selaccounts.length == 0) {
				appAlert(_T("post_error_msg01"));
				return;
			}
			if ((e.target.files.length > 4) ||
				((this.medias.length >= 1) && (e.target.files.length >= 4)) ||
				((this.medias.length >= 2) && (e.target.files.length >= 3)) ||
				((this.medias.length >= 3) && (e.target.files.length >= 2)) ||
				(this.medias.length >= 4)
			) {
				appAlert(_T("image_error_msg01"));
				return;
			}
			this.btnflags.send_disabled = true;
			this.btnflags.loading = true;
			this.loadMediafiles("file",e.target.files)
			.then(()=>{
				this.btnflags.send_disabled = false;
				this.btnflags.loading = false;
				if (this.screentype == "direct") {
					this.$nextTick(()=>{
						var e = Q(".timeline_cardlist_mobile");
						e.scroll({top:e.scrollHeight});
						e = Q(".timeline_cardlist")
						e.scroll({top:e.scrollHeight});
					});
				}
			});
		},
		onclick_addimage : function(e) {
			ID("dmy_openmdia").click();
		},
		onclick_addgeo : function (e) {
			if (this.is_geo) {
				this.is_geo = false;
				this.css.geo.common_ui_off = true;
				this.geo.lat = 0;
				this.geo.lng = 0;
				this.geo.zoom = 1;
				this.geo.locos.splice(0,this.geo.locos.length);
				this.geouris.splice(0,this.geouris.length);
				this.geotext = "";
				return;
			}
			
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(pos)=>{
						this.is_geo = true;
						this.css.geo.common_ui_off = false;
						this.geo.lat = pos.coords.latitude; //35.62481; //
						this.geo.lng = pos.coords.longitude; //140.05563; //

						this.geo.locos.splice(0,this.geo.locos.length);
						for (var i = 0; i < this.geoitems.length; i++) {
							this.geomap.removeControl(this.geoitems[i]);
						}

						console.log(pos);
						this.$nextTick(()=>{
							if ((this.geomap) && ("setView" in this.geomap)) {
								var latlng = L.latLng(this.geo.lat, this.geo.lng);
								this.geomap.setView(latlng);
							}else{
								var OsmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
								OsmAttr = 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
								Osm = L.tileLayer(OsmUrl, {maxZoom: 18, attribution: OsmAttr}),
								latlng = L.latLng(this.geo.lat, this.geo.lng);

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
									this.generate_marker(this.geo.lat,this.geo.lng,this.geo.zoom);
								});

							}
							//if (!this.geomap) {
							//	this.geomap = L.map(this.$el.querySelector('.here_map'), {center: latlng, dragging : true, zoom: 18,layers: [Osm]});
							//}
							this.geo.zoom = this.geomap.getZoom();
							this.generate_marker(this.geo.lat,this.geo.lng,this.geo.zoom); 
						});
					},
					(error)=>{
						aletify.error("You can not to use geolocation...");
					}
				)
			}else{
				console.log("can not to use geolocation");
			}
		},
		onclick_selloco : function(item) {
			var pos = item.Geometry.Coordinates.split(",");
			this.geomap.setView({ lat:pos[1], lng: pos[0] });
		},
		onclick_mediaclose : function(index) {
			appConfirm(_T("image_confirm_msg01"),()=>{
				//console.log("index=",index);
				this.selmedias.splice(index,1);
				this.medias.splice(index,1);
				this.$emit("change",{
					"is_edit" : (this.selmedias > 0) ? true : false,
					"length" : this.strlength
				});
			});
		},
		onclick_send: function (e) {
			if (this.toot_valid) {
				var pros = [];
				for (var i = 0; i < this.selaccounts.length; i++) {
					var account = this.getTextAccount2Object(i);
					console.log(account);
					var mediaids = [];
					for (var m = 0; m < this.medias.length; m++) {
						mediaids.push(this.medias[m][account.acct].id);
					}
					var text = this.joinStatusContent();
					//---check text limit
					if (MYAPP.session.status.toot_max_character >  MYAPP.appinfo.config.toot_max_character) {
						var ishit = null;
						for (var st = 0; st < MYAPP.session.config.notification.toot_limit_instance.length; st++) {
							var lim = MYAPP.session.config.notification.toot_limit_instance[st];
							if (account.instance == lim.instance) {
								ishit = lim;
								break;
							}
						}
						if (ishit) {
							//---trim custom limit
							if (text.length > ishit.limit) {
								text = text.substr(0,ishit.limit);
							}
						}else{
							//---trim default mastodon limit
							if (text.length > MYAPP.appinfo.config.toot_max_character) {
								text = text.substr(0,MYAPP.appinfo.config.toot_max_character);
							}
						}
	
					}
					var pr = MYAPP.executePost(text,{
						"account" : account,
						"scope" : this.selsharescope,
						"media" : mediaids,
						"nsfw" : this.switch_NSFW,
					});
					pros.push(pr);
				}

				Promise.all(pros)
				.then(values=>{
					//---clear input and close popup
					this.status_text = "";
					this.mainlink.exists = false;
					this.ckeditor.editable().setText("");
					this.selmentions.splice(0,this.selmentions.length);
					if (!MYAPP.session.config.action.noclear_tag) {
						this.seltags.splice(0,this.seltags.length);
					}
					this.selmedias.splice(0,this.selmedias.length);
					if (!this.toolbtn.otherwindow) {
						this.selaccounts.splice(0,this.selaccounts.length);
					}
					this.medias.splice(0,this.medias.length);
					this.switch_NSFW = false;
					this.is_geo = false;

					//if (!this.fullscreen) {
						this.dialog = false;
					//}
					/*if (this.otherwindow) {
						if (MYAPP.session.config.action.close_aftertoot) {
							window.close();
						}
					}*/
					this.$emit("send",{isOK:true});
				});
			}else{
				//appAlert("Found some error.");
				this.$emit("send",{isOK:false});
			}
		},

		//---some function-------------------------------------------------
		/**
		 *  Get an Account instance from text info for Account.
		 *  @param {Number} index selected index of the account box
		 */
		getTextAccount2Object : function (index) {
			var baseac = this.selaccounts[index].split("@");

			var hitac = MYAPP.acman.get({
				idname : baseac[0],
				instance : baseac[1]
			});
			return hitac;
		},
		/**
		 * Load and Upload media files.
		 * @param {String} filetype files's type: file, blob, etc...
		 * @param {Object} files Files[] or Blob[]
		 */
		loadMediafiles : function (filetype,files) {
			var backupAC = MYAPP.sns._accounts;
			//console.log("blob=",files);

			var rootdef = new Promise((rootresolve, rootreject)=>{
				var rootpros = [];

				if (filetype == "file") {
					for (var i = 0; i < files.length; i++) {
						var filedef = new Promise((resolve,reject)=>{
							var reader = new FileReader();
							reader.onload = ((fle) => {
								return (e) => {
									var imgsrc = e.target.result;
									//console.log("e=",e);
									var dat = {
										src : imgsrc,
										comment : "",
										data : fle
									};
									this.selmedias.push(dat);
									resolve(dat);
								}
							})(files[i]);
							reader.readAsDataURL(files[i]);
						});
						rootpros.push(filedef);
					}
					rootresolve(Promise.all(rootpros)
					.then(vals=>{
						console.log("vals=",vals);
						return vals;
					}));
				}else if (filetype == "blob") {
					var bbs = [];
					for (var i = 0; i < files.length; i++) {
						var dat = {
							src : files[i],
							comment : "",
							data : {
								name : new Date().valueOf()
							}
						};
						this.selmedias.push(dat);
						bbs.push(dat);
					}
					rootresolve(bbs);
				}
			})
			.then(result=>{
				var pros = [];
				//var rootdef = new Promise((rootresolve, rootreject)=>{
				console.log("result=",result);
				//---loop for loaded medias
				for (var i = 0; i < result.length; i++) {
					var re = result[i];
					//---loop for selected accounts
					for (var f = 0; f < this.selaccounts.length; f++) {
						var hitac = this.getTextAccount2Object(f);
						if (!hitac) continue;
						//console.log("hitac=",hitac);
						MYAPP.sns.setAccount(hitac);

						var opt = {
							filename : re.data.name
						};
						//---upload a media each account
						//=====future: image from canvas, clipboard, etc...
						var imgdata = re.src.split(";");
						imgdata[0] = imgdata[0].replace("data:","");
						var base64img = atob(imgdata[1].split(",")[1]);
						var buffer = new Uint8Array(base64img.length);
						for (var b = 0; b < base64img.length; b++) {
							buffer[b] = base64img.charCodeAt(b);
						}
						var fl = new Blob([buffer.buffer],{type:imgdata[0]});
						//console.log(fl,imgdata);
						//=====================================
						var fdef = MYAPP.uploadMedia(hitac,fl,opt);
						//console.log("fdef=",fdef);
						pros.push(fdef);
					}
				}
				return Promise.all(pros);
					//rootresolve(Promise.all(pros)
					//.then(vals=>{
					//	console.log("vals after vals=",vals);
					//	return vals;
					//}));
				//});
				//return rootdef;
			})
			.then(values=>{
				//---finally
				var ret = {};
				//Push media files ids of each accounts
				//console.log("values=",values);
				var loopfilename = values[0].filename;
				for (var iv = 0; iv < values.length; iv++) {
					console.log(iv,loopfilename,values[iv]);
					if (loopfilename != values[iv].filename) {
						this.medias.push(ret);
						ret = {};
					}

					ret[values[iv].account.acct] = values[iv].data;
					loopfilename = values[iv].filename;
				}
				//---push final item
				this.medias.push(ret);

				//ここでうっかりmediasを上書きしてるよ、同じインスタンスの場合！
				//this.medias.push(ret);
				console.log(
					this.selmedias,
					this.medias
				);
				return {"selmedias":this.selmedias,"medias":this.medias};
			})
			.then((res)=>{
				console.log("res=",res);
			})
			.catch(err=>{
				console.log(err);
				btnflags.loading = false;
			})
			.finally( () => {
				MYAPP.sns.setAccount(backupAC);
				console.log("finally=",backupAC);

				this.$emit("change",{
					"is_edit" : (this.strlength > 0) ? true : false,
					"length" : this.strlength
				});
			});
			return rootdef;
		},
		loadEmoji : function() {
			MYAPP.commonvue.emojisheet.emojis_title.instances.splice(0,MYAPP.commonvue.emojisheet.emojis_title.instances.length);
			for (var i = 0; i < this.selaccounts.length; i++) {
				var ac = this.getTextAccount2Object(i);
				
				if (ac) {
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
			}
		}
	}
};

//----------------------------------------------------------------------
var vue_mixin_for_notification = {
	data(){
		return {
			pagetype : "popup",
            notifications : [],
			saveitem : null,
			status : null
		}
	},
	methods : {
		//---some function--------------------
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
		/**
		 * remove read notification from AccountNotification.account.notifications
		 * @param {Notification[]} notifications AccountNotification.notifications
		 * @param {Object} id Notification's id (String) OR AccountNotification.account.notifications index (Number)
		 */
		remove_notification(notifications,id) {
			var hit = -1;
			var ac = this.currentAccount;
			if (typeof id == "number") {
				//---AccountNotification.account.notifications index (Number)
				hit = id;
			}else{
				//---Notification's id (String)

				for (var i = 0; i < notifications.length; i++) {
					if (notifications[i].id == id) {
						hit = i;
						break;
					}
				}
			}
			//NOT AccountNotification.notifications !!!
			//IS  AccountNotification.account.notifications !!!
			if (hit > -1) notifications.splice(hit,1);
			MYAPP.commonvue.nav_sel_account.checkAccountsNotification();
		},
		save_notification() {
			//sessionStorage.setItem(this.cons_savename,JSON.stringify(this.notifications));
			MYAPP.acman.save();
		},
		/**
		 * push or unshift a notification data in account.notifications 
		 * @param {AccountNotification} account target account
		 * @param {Notification[]} datas notifications to insert
		 * @param {Object} options options for API and APP
		 */
		push_notification(account,datas,options) {
			for (var i = 0; i < datas.length; i++) {
				console.log(i,datas[i]);
				var data = datas[i];
				//data.account = [data.account];
				var ismerge = this.merge_notification(account,data);
				console.log("merge=",ismerge,account,data);
				if (!ismerge) {
					if ("since_id" in options.api) {
						account.notifications.unshift(data);
					}else{
						account.notifications.push(data);
					}
					
				}
			}
			//this.save_notification();
		},
		/**
		 * merge same notification status object
		 * @param {AccountNotification} account target account
		 * @param {Notification} data Notification of Mastodon
		 */
		merge_notification(account,data) {
			var ret = false;
			var cons_statusable = ["reblog","favourite","mention"];
			//---reblog, favourite, mention
			if (cons_statusable.indexOf(data.type) > -1) {
				for (var i = 0; i < account.notifications.length; i++) {
					var notif = account.notifications[i];
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
		/**
		 * click event of notification line
		 * @param {AccountNotification} account target account
		 * @param {Number} index index of AccountNotification.notifications
		 */
		onclick_notif_line : function (account,index) {
			this.saveitem = account.notifications[index];
			if (this.saveitem.type == "follow") {
				path = MUtility.generate_userpagepath(this.saveitem.account[0]);
				location.href = path;
			}else{
				var d = new Gpstatus(this.saveitem.status,16);
				this.status = d;
				MYAPP.sns.getConversation(this.status.body.id, this.status.body.id, "")
				.then((condata) => {
					var tt = this.status; //this.getParentToot(condata.parentID);
					for (var a = 0; a < condata.data.ancestors.length; a++) {
						var ance = condata.data.ancestors[a];
						var gcls = new Gpstatus(ance,14);

						condata.data.ancestors[a] = gcls;

					}
					for (var a = 0; a < condata.data.descendants.length; a++) {
						var desce = condata.data.descendants[a];
						var gcls = new Gpstatus(desce,14);


						condata.data.descendants[a] = gcls;
					}
					//this.toote.comment_stat.mini = condata.data.descendants.length == 0 ? false : true;

					if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
						this.status.ancestors.splice(0,this.status.ancestors.length);
						this.status.descendants.splice(0,this.status.descendants.length);
						this.status.ancestors = this.status.ancestors.concat(condata.data.ancestors);
						this.status.descendants = this.status.descendants.concat(condata.data.descendants);
						this.status.body.replies_count = condata.data.descendants.length;
					}
					return condata;
				})
				.then((result)=> {
					var basetoote = this.status;
					for (var i = 0; i < basetoote.descendants.length; i++) {
						var toote = basetoote.descendants[i];
						if (("relationship" in toote) && ("following" in toote.relationship)) {
							
						}else{
							MYAPP.sns.getRelationship(toote.account.id)
							.then((result) => {
								for (var i = 0; i < result.data.length; i++) {
									for (var obj in result.data[i]) {
										toote.relationship[obj] = Object.assign({}, result.data[i][obj]);
									}
								}
							});
						}
					}

				})
				.finally( () => {
					//MYAPP.commonvue.tootecard.call_replySetup();
					//MYAPP.commonvue.tootecard.reply_data = MYAPP.commonvue.tootecard.$refs.tootview.generateReplyObject(this.status);
					//MYAPP.commonvue.tootecard.$refs.tootview.isupdate_request.reply = true;
					MYAPP.commonvue.tootecard.status = this.status;
					//MYAPP.commonvue.tootecard.$refs.tootview.toote = this.status;
					MYAPP.commonvue.tootecard.$nextTick(()=>{
						MYAPP.commonvue.tootecard.$refs.tootview.set_replydata();
						MYAPP.commonvue.tootecard.$refs.tootview.apply_initialReplyInputCounter();
					});
					
					MYAPP.commonvue.tootecard.sizing_window();
					MYAPP.commonvue.tootecard.is_overlaying = true;
					//---change URL
					if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
						MUtility.returnPathToList(MYAPP.session.status.currentLocation);
					}
					var targetpath = "";
					var changeuri = this.status.body.uri.replace("https://","");
					changeuri = changeuri.replace("statuses","toots");
					changeuri = changeuri.replace("users/","");
					//---when each screen existable toot
					targetpath = `/users/${changeuri}`;
					MUtility.enterFullpath(targetpath);
				});

				
			}

			if (this.pagetype == "popup") {
				this.remove_notification(account.notifications,index);
				MYAPP.commonvue.nav_notification.notifications--;
			}else{
				var ishit = -1;
				var an = account.notifications[index];
				for (var i = 0; i < account.account.notifications.length; i++) {
					var aan = account.account.notifications[i];
					if ((aan.status.id == an.status.id) && (aan.type == an.type)) {
						ishit = i;
						break;
					}
				}
				if (ishit > -1) {
					this.remove_notification(account.account.notifications,ishit);
				}
				if (MYAPP.commonvue.cur_sel_account.account.acct == account.account.acct) {
					MYAPP.commonvue.nav_notification.notifications--;
				}
			}
			this.save_notification();
			
		},
		onclick_notif_linebtn : function (account,index) {

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
			//this.remove_notification(this.saveitem.id);
			//this.save_notification();
			location.href = path;
		},

	}
};