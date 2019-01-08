
//===========================================================================
//
//  Vue mixin Objects
//
//===========================================================================
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
				ids.push(acdata[i].id);
				this.accounts.push(acdata[i]);
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
		getAlreadyAccount(id) {
			for (var i = 0; i < this.accounts.length; i++) {
				if (id == this.accounts[i].id) {
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
			selshare_current : "tt_all",
			seltype_current : "tt_all",
			info : {
				maxid : "",
				sinceid : "",
				is_nomax : false,
				is_nosince : false, 
			},
			translations : {},
			globalInfo : {
				staticpath : ""
			},
			statuses : [],
			timeline_gridstyle : {
				width_count : true,
				width_1 : false,
				width_2 : false,
				width_3 : false,
			},
			grid_conf : {
				columnWidth : 200,
				duration : 100,
				gutter : 10,
			},
			wrapperSize: {
				width: 0,
			},
			grid : {} //wrapperSize.width <= 768 ? '100%' : grid_conf.columnWidth
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
                        tlshare : "",
                        tltype : "",
                        exclude_reply : true,
                    }
                }
                //var atab = Q(".tab .active");
                if (this.$el.id == "tl_home") {
					tlid = "home";
                }else if (this.$el.id == "tl_list") {
					tlid = "list";
					pastOptions.app["listid"] = this.sellisttype_current;
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
				pastOptions.app.tlshare = this.selshare_current;
				pastOptions.app.tltype = this.seltype_current;
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
                        since_id : "",
                    },
                    app : {
                        is_nomax : true,
                        is_nosince : false,
                        tlshare : "",
                        tltype : "",
                        exclude_reply : true,
                    }
                }
                //---page max scroll up
                console.log("scroll up max");
                //var atab = Q(".tab .active");
                if (this.$el.id == "tl_home") {
					tlid = "home";
                }else if (this.$el.id == "tl_list") {
					tlid = "list";
                    futureOptions.app["listid"] = this.sellisttype_current;
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
				}
				futureOptions.api.since_id = this.info.sinceid;
				futureOptions.app.tlshare = this.selshare_current;
				futureOptions.app.tltype = this.seltype_current;
				this.loadTimeline(tlid,{
					api : futureOptions.api,
					app : futureOptions.app
				});
				this.is_scrolltop = true;
            }else{
				this.is_scrolltop = false;
			}
			MYAPP.commonvue.bottomnav.checkScroll(fnlsa);

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
		//---some function----------------------------------------------
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
		generate_toot_detail: function (rawdata, options) {
			var data = rawdata.data;
			var paging = rawdata.paging;

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
			console.log("data.length=" + data.length);
			for (var i = 0; i < data.length; i++) {
				if (this.checkExistToot(data[i].id)) continue;

				var st = new Gpstatus(data[i],18);
				var flag = this.filterToot(st, options);
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
					if ("since_id" in options.api) {
						this.statuses.unshift(st);
					} else {						
						this.statuses.push(st);
						baseIndex = this.statuses.length-1;
					}
					var tmpid = this.statuses.length - 1;
					//---get /statuses/:id/context
					var conversationData = data[i];
					var ascendantData = data[i];
					if (data[i].reblog != null) {
						//---if this toot boosted post from any one, replace id.
						conversationData = data[i].reblog;
						ascendantData = data[i].reblog;
					}
					if ((st.body.in_reply_to_id != null) || (st.body.replies_count < 0) || (st.body.replies_count > 0) )  {
						MYAPP.sns.getConversation(st.body.id, st.id, tmpid)
						.then((condata) => {
							console.log("getConversation", condata);
							var tt = this.getParentToot(condata.parentID);
							//console.log(condata.index, tt);
							if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
								/*var tmptt = Object.assign({}, tt.data, {
									ancestors : condata[0].ancestors,
									descendants : condata[0].descendants
								});*/
								/*var check_mediameta = function (toot) {
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
								}*/
								//console.log("ancester & descendants=", condata.data);
								for (var a = 0; a < condata.data.ancestors.length; a++) {
									var ance = condata.data.ancestors[a];
									var gcls = new Gpstatus(ance,14);

									/*var tmpan = MYAPP.extractTootInfo(ance.content);
									var inst = MUtility.getInstanceFromAccount(ance.account.url);
									var tmpname = ance.account.display_name == "" ? ance.account.username : ance.account.display_name;
									ance.account.display_name = MUtility.replaceEmoji(tmpname,inst,ance.account.emojis,14);
									
									ance.created_at = new Date(ance.created_at);

									ance["html"] = MUtility.replaceEmoji(ance.content,inst,ance.emojis,14);
									ance.content = tmpan.text;
									ance = check_mediameta(ance);*/

									condata.data.ancestors[a] = gcls;

								}
								for (var a = 0; a < condata.data.descendants.length; a++) {
									var desce = condata.data.descendants[a];
									var gcls = new Gpstatus(desce,14);

									/*var tmpan = MYAPP.extractTootInfo(desce.content);
									var inst = MUtility.getInstanceFromAccount(desce.account.url);
									var tmpname = desce.account.display_name == "" ? desce.account.username : desce.account.display_name;
									desce.account.display_name = MUtility.replaceEmoji(tmpname,inst,desce.account.emojis,14);

									desce.created_at = new Date(desce.created_at);

									desce["html"] = MUtility.replaceEmoji(desce.content,inst,desce.emojis,14);
									desce.content = tmpan.text;
									desce = check_mediameta(desce);
									*/

									condata.data.descendants[a] = gcls;
								}
								//console.log(this.statuses[baseIndex]);
								//this.statuses[baseIndex].comment_stat.iszero = condata.data.descendants.length == 0 ? true : false;
								this.statuses[tt.index].comment_stat.mini = condata.data.descendants.length == 0 ? false : true;


								this.$set(this.statuses[tt.index], "ancestors", condata.data.ancestors);
								this.$set(this.statuses[tt.index], "descendants", condata.data.descendants);
								this.statuses[tt.index].body.replies_count = condata.data.descendants.length;
								//vue_user.tootes.statuses[index].ancestors = condata.ancestors;
								//vue_user.tootes.statuses[index].descendants = condata.descendants;
								this.$nextTick(function () {
									return;
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
								});
							}
						});
					}
					//---get site preview if link added
					//console.log("st.urls.length=", st.urls.length);
					if (st.urls.length > 0) {
						var targeturl = st.urls[0];
						//console.log("urls>0=",st.body.id, st.id, i, JSON.original(st.urls))
						//---get GPHT
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
								this.$set(this.statuses[tt.index].mainlink, "exists", true);
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
											} /*else {
												var a = GEN("a");
												var url = tt.data.body.uri.replace("users", "api");
												url = url.replace(tt.data.account.username, "v1");

												MYAPP.sns.originalGet(`${url}/card`, {})
												.then(result_card => {
													result.data["og:image"] = result_card.image;
													resolve(result);
												});
											}*/
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

								this.$set(this.statuses[tt.index].mainlink, "exists", true);
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
			console.log("vm.statuses=" + this.statuses.length);
			this.is_asyncing = false;
			this.$nextTick(function () {
				return;
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
			});
		},

		/**
		 * to check a toot to show in timeline
		 * @param {GStatus} gstatus 
		 * @param {Object} options 
		 * @return {Boolean} wheather the toot is OK ?
		 */
		filterToot: function (gstatus, options) {
			var data = gstatus.body;
			var ret = true;
			if (options.app.tlshare == "tt_public") {
				ret = data.visibility == "public" ? true : false;
			} else if (options.app.tlshare == "tt_tlonly") {
				ret =  data.visibility == "unlisted" ? true : false;
			} else if (options.app.tlshare == "tt_private") {
				ret =  data.visibility == "private" ? true : false;
			} else if (options.app.tltype == "tt_media") {
				ret =  gstatus.medias.length > 0 ? true : false;
			} else if (options.app.tltype == "tt_exclude_bst") {
				ret = (gstatus.reblogOriginal != null) ? false : true;
			} else if (options.app.tltype == "tt_all") {
				ret =  true;
			} else if (options.app.only_media) {
				ret = gstatus.medias.length > 0 ? true : false;
			} else {
				ret =  false;
			}
			
			if (options.app.exclude_reply) {
				ret = (data.in_reply_to_id == null) ? true : false;
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
		forWatch_selshare : function (val) {
			this.statuses.splice(0,this.statuses.length);
			//this.info.tltype = sel;
			var opt = {
				api : {
					exclude_replies : true
				},
				app : {
					tlshare : val,
					tltype : this.seltype_current,
				}
			};
			return opt;
		},
		forWatch_seltype : function (val) {
			this.statuses.splice(0,this.statuses.length);
			//this.info.tltype = sel;
			var opt = {
				api : {
					exclude_replies : true
				},
				app : {
					tlshare : this.selshare_current,
					tltype : val,
				}
			};
			if (val == "tt_media") {
				opt.api["only_media"] = true;
			}
			return opt;
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
		}
	}
};
//----------------------------------------------------------------------
var vue_mixin_for_inputtoot = {
	data() {
		return {
			//---account box data
			selaccounts : [],

			//---share scope box and mention box data
			selsharescope : "tt_public",
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
			tags: [],
			
			selmedias : [],
            medias : [],
            switch_NSFW : false,
		}
	},
	watch : {
		status_text : function(val) {
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
				+ mentions.join(" ").length + tags.length;
			//---warning near limit.
			if (this.strlength > 490) {
				this.strlength_class["red-text"] = true;
			}else{
				this.strlength_class["red-text"] = false;
			}
			this.btnflags.send_disabled = (this.strlength > 500);
		},
	},
	mounted() {
		//M.FormSelect.init(ID("keymaptitle"), {});
		//CKEDITOR.disableAutoInline = true;
		//CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
		//this.ckeditor = CKEDITOR.inline( 'dv_inputcontent', CK_INPUT_TOOTBOX);
	},
	methods : {
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
			if (this.seltags.length > 0)
				content += "\n" + this.seltags.join(" ");
			
			return content;
		},

		//---event handler---------------------------------------------
		onchange_inputcontent : function (e) {
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			this.status_text = this.ckeditor.editable().getText();
		},
		onkeydown_inputcontent : function (e) {
			if ((e.keyCode == 13) && (e.ctrlKey || e.metaKey)) {
				console.log("enter pos!");
			}
		},
		onkeyup_inputcontent : function (e) {
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			this.status_text = content.text; //this.ckeditor.editable().getText();
			//console.log(this.ckeditor.getData(),this.status_text,content);
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
			});
		},
		onclick_addimage : function(e) {
			ID("dmy_openmdia").click();
		},
		onclick_mediaclose : function(index) {
			appConfirm(_T("image_confirm_msg01"),()=>{
				//console.log("index=",index);
				this.selmedias.splice(index,1);
				this.medias.splice(index,1);
			});
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
			})
			.finally( () => {
				MYAPP.sns.setAccount(backupAC);
				console.log("finally=",backupAC);
			});
			return rootdef;
		},
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
		},
		/**
		 * 
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
			let cons_statusable = ["reblog","favourite","mention"];
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
		//---event handler--------------------------
		/**
		 * 
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

				MYAPP.commonvue.tootecard.status = this.status;
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
			}

			if (this.pagetype == "popup") {
				this.remove_notification(account.notifications,index);
			}
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