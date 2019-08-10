var tmpobj;
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
			if (!data) return "";
			var tmp = data.replace(/&lt;/g,"_$<").replace(/&gt;/g,">$_");
			return DOMPurify.sanitize(tmp,{ADD_ATTR: ['target','rel']})
			.replace(/_\$&lt;/g,"&lt;").replace(/&gt;\$_/g,"&gt;")
			.replace(/_\$</g,"&lt;").replace(/>\$_/g,"&gt;");
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
class TLoption {
	constructor() {
		this.api = {
			exclude_replies : true,
			only_media : false,
		}
		this.app = {
			is_nomax : false,
			is_nosince : false,
			listid : "",
			tlshare : "",
			tltype : [],
			exclude_reply : true,
			filter : [],
			acct : "",
			user : "",
		};

	}
}
class TLpending {
	constructor() {
		this.above = {
			is : false,
			waiting : false,
			statuses : [],
		};
		this.below = {
			is : false,
			waiting : false,
			statuses : [],
		};
		
	}
}
class TLbackstatus {
	constructor(index,pagenumber,pageheight,status) {
		this.index = index || 0;
		this.page = pagenumber || 0;;
		this.pageHeight = pageheight || 0;
		this.domOutputed = false;
		this.status = status || null;
	}
}
var vue_mixin_for_timeline = {
	data(){
		return {
			is_asyncing : false,
			is_scrolltop : true,
			is_nowscrollloading : false,
			is_opencomment : false,
			is_archivemode : false,
			selshare_current : "tt_all",
			seltype_current : "tt_all",
			tl_tabtype : "home",
			tl_realid : "home",

			currentOption : {},
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
			/**
			 * The timeline manage object for background/virtual scroll
			 */
			bgtimeline : {
				statuses : [],
				manage : {
					domOutputed : [],
					page : {
						current : 0,
						top : -1,
						bottom : 1
					}
				},
				cons : {
					beforeTootCnt : 2
				}
			},
			timeline_gridstyle : {
				width_count : true,
				width_1 : false,
				width_2 : false,
				width_3 : false,
			},
			pending : {},
			is_serveronly : false,
			gallery_options : null,

		}
	},
	created() {
		if (MYAPP) {
			this.globalInfo.staticpath = MYAPP.appinfo.staticPath;
			this.currentOption = new TLoption();
			this.pending = new TLpending();
			this.gallery_options = new GalleryOptions();
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
			if (this.is_nowscrollloading) return true;
			var tlid = "";
			let sa = e.target.scrollHeight - e.target.clientHeight;
			
			let calcsa = this.calculateScrollEnd(e.target);
			//let fnlsa = Math.round(Math.round(e.target.scrollTop) / sa * 100); //sa - Math.round(e.target.scrollTop);
			//let judgesa = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
            if (calcsa.final > calcsa.judge) {
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
				let curoptapi = this.currentOption.api;
				for (var obj in pastOptions.api) {
					if (curoptapi[obj]) {
						pastOptions.api[obj] = curoptapi[obj];
					}
				}
				delete pastOptions.api["since_id"];
				delete pastOptions.api["min_id"];
                //var atab = Q(".tab .active");
                if (this.tl_tabtype == "home") {
					tlid = "home";
                }else if (this.tl_tabtype == "list") {
					tlid = "list";
					pastOptions.app["listid"] = this.currentOption.app.listid;
                }else if (this.tl_tabtype == "local") {
					tlid = "local";
					pastOptions.api["local"] = true;
                }else if (this.tl_tabtype == "public") {
					tlid = "public";
				}else if (this.tl_tabtype == "tag") {
					tlid = `tag/${this.tagname}`;
				}else if (this.tl_tabtype == "taglocal") {
					tlid = `tag/${this.tagname}`;
					pastOptions.api["local"] = true;
				}else if (this.tl_tabtype == "user") {
					if (this.pagetype == "account") {
						tlid = "me";
					}else if (this.pagetype == "user") {
						tlid = this.id;
					}
				}
				//pastOptions.api.max_id = this.info.maxid;
				//pastOptions.app.tlshare = this.selshare_current;
				//pastOptions.app.tltype = this.seltype_current;
				//console.log("timeline ID=",tlid,JSON.stringify(this.info));
				if (this.is_archivemode) {
					this.apply_filter(this.currentFilter);
					return;
				}
				/* ===alternative remove===
				this.loadTimeline(tlid,{
					api : pastOptions.api,
					app : pastOptions.app
				});
				*/
				//pastOptions.app["element"] = e.target;
				this.is_nowscrollloading = true;
				this.prepare_backgroundtimeline("bottom",tlid,{
					api : pastOptions.api,
					app : pastOptions.app
				});

            }
            if (e.target.scrollTop == 0) {
				/*if (this.pending.above.waiting) {
					//this.currentOption.app["element"] = e.target;
					this.onclick_show_pending();
					MYAPP.commonvue.navigation.is_returnmosttop = false;
				}else*/
				{
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
					if (this.tl_tabtype == "home") {
						tlid = "home";
					}else if (this.tl_tabtype == "list") {
						tlid = "list";
						futureOptions.app["listid"] = this.currentOption.app.listid;
					}else if (this.tl_tabtype == "local") {
						tlid = "local";
						futureOptions.api["local"] = true;
					}else if (this.tl_tabtype == "public") {
						tlid = "public";
					}else if (this.tl_tabtype == "tag") {
						tlid = `tag/${this.tagname}`;
					}else if (this.tl_tabtype == "taglocal") {
						tlid = `tag/${this.tagname}`;
						futureOptions.api["local"] = true;
					}else if (this.tl_tabtype == "user") {
						if (this.pagetype == "account") {
							tlid = "me";
						}else if (this.pagetype == "user") {
							tlid = this.id;
						}
					}
					//futureOptions.api.since_id = this.info.sinceid;
					//futureOptions.app.tlshare = this.selshare_current;
					//futureOptions.app.tltype = this.seltype_current;
					if (this.is_archivemode) {

					}else{
						/* ===alternative remove===
						this.loadTimeline(tlid,{
							api : futureOptions.api,
							app : futureOptions.app
						});
						*/
						//futureOptions.app["element"] = e.target;
						var direction = "top";
						if (MYAPP.commonvue.navigation.is_returnmosttop) {
							direction = "mosttop";
						}
						this.prepare_backgroundtimeline(direction,tlid,{
							api : futureOptions.api,
							app : futureOptions.app
						});
					}
					MYAPP.commonvue.navigation.is_returnmosttop = false;
					this.is_nowscrollloading = true;
					this.is_scrolltop = true;
					//this.pending.above.waiting = false;
					//this.pending.above.is = false;
				}

            }else{
				this.is_scrolltop = false;
				//---pending new toot 
				if (e.target.scrollTop > MYAPP.session.config.notification.tell_newtoot_scroll) {
					//if (MYAPP.session.config.notification.tell_newtoot) {
						this.pending.above.waiting = !this.is_scrolltop;
						
					//}
				}
				MYAPP.commonvue.bottomnav.checkScroll(calcsa.final);
				
			}

        },
		onreplied_children : function (status,index) {
			//---this status.body.id is toot context OWN id, not view id for this app!
			return;
			/*
			var options = {
				api : {

				},
				app : {
					parent : {
						ID : status.body.id,
						index : index
					}
				}
			};
			if ((this.tl_tabtype == "public") || (this.tl_tabtype == "local")) {
				options.app["noauth"] = true;
			}
			//MYAPP.sns.getConversation(status.body.id, status.body.id, index)
			MYAPP.sns.getConversation(status.body.id, options)
			.then((condata) => {
				//console.log("getConversation", condata);
				//var tt = this.getParentToot(condata.parentID);
				var tt = this.getParentToot(condata.options.app.parent.ID);
				//console.log(condata.index, tt);
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

				if ((tt) && ((condata.data.ancestors.length > 0) || (condata.data.descendants.length > 0))) {
					var toote = this.statuses[tt.index];
					//console.log(this.statuses[baseIndex]);
					//this.statuses[baseIndex].comment_stat.iszero = condata.data.descendants.length == 0 ? true : false;
					if (condata.data.descendants.length == 0) {

					}else if (condata.data.descendants.length <= 1) {

					}else{
						this.statuses[tt.index].comment_stat.mini = true;
						this.statuses[tt.index].elementStyle.toot_action_class.has_comment_pos_mini = this.statuses[tt.index].comment_stat.mini;	
					}

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
			});*/
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
			if (this.pending.above.statuses.length > 0) {
				this.currentOption.app.is_nomax = true;
				this.currentOption.app.is_nosince = false;
				this.prepare_backgroundtimeline("pendingtop",this.tl_realid,{
					api : {
						exclude_replies : true,
						min_id : "",
					},
					app : this.currentOption.app
				})
				.then(result=>{

				})
				.finally(()=>{
					//---post scripts
					//TODO: during modification!!!
					this.clearPending();
	
					Q(".tab-content").scroll({top:0,behavior: "instant"});
					this.is_nowscrollloading = false;
				});
			}
			return;

			this.prepare_backgroundtimeline("mosttop",this.tl_realid,{
				api : {
					exclude_replies : true,
					min_id : "",
				},
				app : this.currentOption.app
			})
			.then(result=>{
				if (this.pending.above.statuses.length > 0) {
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
					/*if (this.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
						while (this.statuses.length > MYAPP.session.config.application.timeline_viewcount) {
							this.statuses.pop();
						}
					}*/
					let direction = "top";
					var firsttoot = this.statuses[0];
					var tootdom = ID(`toot_${firsttoot.id}`);
					
					var arr = this.check_backgroundtimeline(direction);
					if (arr.length == 0) tootdom = null;
					this.postfunc_backgroundtimeline(direction,arr,true);
					this.$nextTick(()=>{
						if (tootdom) {
							tootdom.scrollIntoView({block: "center", inline: "nearest"} );
							ID("toppanel").scrollIntoView();
						}
						this.is_nowscrollloading = false;
					});	
				}
			})
			.finally(()=>{
				//---post scripts
				//TODO: during modification!!!
				this.clearPending();

				Q(".tab-content").scroll({top:0,behavior: "instant"});
				this.is_nowscrollloading = false;
			});

		},
		onclick_load_below : function (e) {
			var tlid = "";
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
			delete pastOptions.api["since_id"];
			delete pastOptions.api["min_id"];
			//var atab = Q(".tab .active");
			if (this.tl_tabtype == "home") {
				tlid = "home";
			}else if (this.tl_tabtype == "list") {
				tlid = "list";
				pastOptions.app["listid"] = this.currentOption.app.listid;
			}else if (this.tl_tabtype == "local") {
				tlid = "local";
				pastOptions.api["local"] = true;
			}else if (this.tl_tabtype == "public") {
				tlid = "public";
			}else if (this.tl_tabtype == "tag") {
				tlid = `tag/${this.tagname}`;
			}else if (this.tl_tabtype == "taglocal") {
				tlid = `tag/${this.tagname}`;
				pastOptions.api["local"] = true;
			}else if (this.tl_tabtype == "user") {
				if (this.pagetype == "account") {
					tlid = "me";
				}else if (this.pagetype == "user") {
					tlid = this.id;
				}
			}
			//pastOptions.api.max_id = this.info.maxid;
			//pastOptions.app.tlshare = this.selshare_current;
			//pastOptions.app.tltype = this.seltype_current;
			//console.log("timeline ID=",tlid,JSON.stringify(this.info));
			if (this.is_archivemode) {

			}else{
				/*this.loadTimeline(tlid,{
					api : pastOptions.api,
					app : pastOptions.app
				});*/
				this.prepare_backgroundtimeline("bottom",tlid,{
					api : pastOptions.api,
					app : pastOptions.app
				});
			}
		},
		//---some function----------------------------------------------
		hide_on_noauth : function () {
			return !this.is_serveronly;
		},
		clearPending : function() {
			this.pending.above.statuses.splice(0,this.pending.above.statuses.length);
			this.pending.above.waiting = false;
			this.pending.above.is = false;
			this.is_nowscrollloading = false;
		},
		clearTimeline : function () {
			this.is_nowscrollloading = false;
			this.bgtimeline.manage.domOutputed.splice(0,this.bgtimeline.manage.domOutputed.length);
			this.bgtimeline.manage.page.current = 0;
			this.bgtimeline.manage.page.top = -1;
			this.bgtimeline.manage.page.bottom = 1;

			this.statuses.splice(0,this.statuses.length);
			this.bgtimeline.statuses.splice(0,this.bgtimeline.statuses.length);
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
		calculateScrollEnd : function (target) {
			let sa = target.scrollHeight - target.clientHeight;
			let fnlsa = Math.round(Math.round(target.scrollTop) / sa * 100); //sa - Math.round(e.target.scrollTop);
			let judgesa = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
			return {
				final : fnlsa,
				judge : judgesa
			};
		},
		findIndex_backgroundtimeline : function (direction, index) {
			var ret = -1;
			for (var i = 0; i < this.bgtimeline.statuses.length; i++) {
				if (index == this.bgtimeline.statuses[i].index) {
					ret = i;
					break;
				}
			}
			return ret;
		},
		/**
		 * 
		 * @param {String} direction direction for timeline
		 * @param {Gpstatus} status toot status object
		 * @param {JSON} options any options
		 * @return {Number} index of element in array
		 */
		store_backgroundtimeline : function (direction,status,options) {
			if (direction == "top") {
				var pagecnt = this.bgtimeline.manage.page.top+1;
				var st = new TLbackstatus(status.id,pagecnt,0,status);
				this.bgtimeline.statuses.unshift(st);
				return 0;
			}else if (direction == "bottom") {
				var pagecnt = this.bgtimeline.manage.page.bottom-1;
				var st = new TLbackstatus(status.id,pagecnt,0,status);
				this.bgtimeline.statuses.push(st);
				return this.bgtimeline.statuses.length - 1;
			}
		},
		check_backgroundtimeline : function (direction) {
			let starr = this.bgtimeline.statuses;
			let manage = this.bgtimeline.manage;
			let domOutputedCount = manage.domOutputed.length;
			let oldpagecurrent = manage.page.current;
			var res = [];
			var isstartsearch = false;
			var loadcount = 0;
			if (direction == "top") {
				manage.page.current++;
				//manage.domOutputed.splice(this.bgtimeline.cons.beforeTootCnt,manage.domOutputed.length);
				
				for (var i = starr.length-1; i >= 0; i--) {
					let e = starr[i];

					if (isstartsearch) {
						if (manage.domOutputed.indexOf(e.index) == -1) {
							e.domOutputed = true;
							res.unshift(e);
							manage.domOutputed.unshift(e.status.id);
							loadcount++;
							if (loadcount > MYAPP.session.config.application.timeline_viewcount) {
								break;
							}
						}
					}else{
						if (e.index == manage.domOutputed[0]) {
							isstartsearch = true;
						}
					}

					/*
					if(e.page == manage.page.current) {
						e.domOutputed = true;
						res.unshift(e);
						manage.domOutputed.unshift(e.status.id);
					}else if (e.page == oldpagecurrent) {
						e.domOutputed = false;
					}
					*/
				}
			}else if (direction == "mosttop") {
				manage.page.current++;
				//manage.domOutputed.splice(this.bgtimeline.cons.beforeTootCnt,manage.domOutputed.length);
				manage.domOutputed.splice(0,manage.domOutputed.length);
				for (var i = 0; i < starr.length; i++) {
					let e = starr[i];

					e.domOutputed = true;
					res.push(e);
					manage.domOutputed.push(e.status.id);
					loadcount++;
					if (loadcount > MYAPP.session.config.application.timeline_viewcount) {
						break;
					}
					
				}
			}else if (direction == "bottom") {
				manage.page.current--;
				//manage.domOutputed.splice(0,manage.domOutputed.length - this.bgtimeline.cons.beforeTootCnt);
				for (var i = 0; i < starr.length; i++) {
					let e = starr[i];
					if (isstartsearch) {
						if (manage.domOutputed.indexOf(e.index) == -1) {
							e.domOutputed = true;
							res.push(e);
							manage.domOutputed.push(e.status.id);
							loadcount++;
							if (loadcount > MYAPP.session.config.application.timeline_viewcount) {
								break;
							}
						}
					}else{
						if (e.index == manage.domOutputed[domOutputedCount-1]) {
							isstartsearch = true;
						}
					}
					/*if(e.page == manage.page.current) {
						e.domOutputed = true;
						res.push(e);
						manage.domOutputed.push(e.status.id);
					}else if (e.page == oldpagecurrent) {
						e.domOutputed = false;
					}*/
					
				}
			}else if (direction == "init") {
				manage.page.current = 0;
				//manage.domOutputed.splice(0,manage.domOutputed.length - this.bgtimeline.cons.beforeTootCnt);
				for (var i = 0; i < starr.length; i++) {
					let e = starr[i];
					
					e.domOutputed = true;
					res.push(e);
					manage.domOutputed.push(e.status.id);
					
				}
			}
			
			return res;
		},
		autoremove_bgtimeline : function (direction) {
			let perm_count = (MYAPP.session.config.application.timeline_viewcount*2);
			if (this.statuses.length > perm_count) {
				while (this.statuses.length > perm_count) {
					var tt;
					if (direction == "top") {
						tt = this.statuses.shift();
					}else if (direction == "bottom") {
						tt = this.statuses.pop();
					}
					
					for (var i = 0; i < this.bgtimeline.statuses.length; i++) {
						let bgst =  this.bgtimeline.statuses[i];

						if (tt.id == bgst.index) {
							//---to prpare for remove(invisible) 
							bgst.domOutputed = false;
							let mantest = this.bgtimeline.manage.domOutputed.indexOf(tt.id);
							if (mantest > -1) {
								this.bgtimeline.manage.domOutputed.splice(mantest,1);
							}
							break;
						}
					}
				}
			}
		},
		load_backgroundtimeline : function (type,options) {
			return this.loadTimeline(type,options);

			/*

			//---worker version
			var def = new Promise((resolve,reject)=>{
				var wkr = new Worker("/static/js/wkr_timeline.js");
				wkr.onmessage = (evt)=>{
					console.log("getTimeline",evt);
					
					if (evt.data.data.length == 0) {
						MUtility.loadingOFF();
						return resolve([]);
					}
					this.generate_toot_detail(evt.data.data,options);
					resolve(evt.data.data);
				
					
					
					
				};
				wkr.onerror = (evt)=>{
					MUtility.loadingOFF();
					this.is_asyncing = false;
					alertify.error("読み込みに失敗しました。");
					console.log("loadTimelineCommonにて不明なエラーです。",evt);
					reject(false);
				};
				wkr.postMessage({
					account : {
						url : MYAPP.sns._accounts.getBaseURL(),
						token : MYAPP.sns._accounts.token.access_token
					},
					endpoint : type,
					options : options
				});
	
			});
			
			return def;
			*/
			
		},
		load_pending_backgroundtimeline : function (type,options) {
			var def = new Promise((resolve,reject)=>{
				var ret = {
					data : []
				};
				ret.data = ret.data.concat(this.pending.above.statuses);

				this.generate_toot_detail({
					data: ret.data,
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

				resolve(ret);
			});
			return def;
		},
		/**
		 * To prepare load from local or get from server the timeline.
		 * @param {String} direction direction for timeline
		 * @param {String} type type of timeline
		 * @param {JSON} options timeline API/APP options
		 */
		prepare_backgroundtimeline : function (direction, type, options) {
			var arr = [];
			var direction4remove = "";
			this.tl_realid = type;
			var def = new Promise((resolve,reject) =>{
				if ((direction == "top") || (direction == "mosttop")) {

					direction4remove = "bottom";
					var index = this.findIndex_backgroundtimeline(direction,this.bgtimeline.manage.domOutputed[0]);
					if ((index-1) > 0) {
						//---load already tl
						var firsttoot = this.statuses[0];
						var tootdom = ID(`toot_${firsttoot.id}`);
						arr = this.check_backgroundtimeline(direction);
						if (arr.length == 0) tootdom = null;
						this.postfunc_backgroundtimeline(direction,arr,true);
						this.$nextTick(()=>{
							
							//var scrpercent = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
							//scrpercent = scrpercent - 2;
							//var sa = options.app.element.scrollHeight * (scrpercent / 100);
							//options.app.element.scrollTop = sa * 0.5;
							if (tootdom) {
								if (direction == "top") tootdom.scrollIntoView({block: "center", inline: "nearest"} );
								//console.log("tootdom=",tootdom.getBoundingClientRect());
								ID("toppanel").scrollIntoView();
							}
							this.is_nowscrollloading = false;
							resolve(true);
						});
					}else{
						//---get mastodon server
						this.load_backgroundtimeline(type, options)
						.then((result)=>{
							if (result.data.length > 0) {
								this.bgtimeline.manage.page.top++;
								var firsttoot = this.statuses[0];
								var tootdom = ID(`toot_${firsttoot.id}`);
								arr = this.check_backgroundtimeline(direction);
								if (arr.length == 0) tootdom = null;
								this.postfunc_backgroundtimeline(direction,arr,true);
								this.$nextTick(()=>{
									//var scrpercent = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
									//scrpercent = scrpercent - 2;
									//var sa = options.app.element.scrollHeight * (scrpercent / 100);
									//options.app.element.scrollTop = sa * 0.5;
									if (tootdom) {
										tootdom.scrollIntoView({block: "center", inline: "nearest"} );
										//console.log("tootdom=",tootdom.getBoundingClientRect());
										ID("toppanel").scrollIntoView();
									}
									this.is_nowscrollloading = false;
									resolve(true);
								});
							}
						});
					}
					
				}else if (direction == "pendingtop") {
					this.load_pending_backgroundtimeline(type,options)
					.then((result3) => {
						if (result3.data.length > 0) {
							this.bgtimeline.manage.page.top++;
							var firsttoot = this.statuses[0];
							var tootdom = ID(`toot_${firsttoot.id}`);
							arr = this.check_backgroundtimeline(direction);
							if (arr.length == 0) tootdom = null;
							this.postfunc_backgroundtimeline(direction,arr,true);
							this.$nextTick(()=>{
								//var scrpercent = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
								//scrpercent = scrpercent - 2;
								//var sa = options.app.element.scrollHeight * (scrpercent / 100);
								//options.app.element.scrollTop = sa * 0.5;
								if (tootdom) {
									tootdom.scrollIntoView({block: "center", inline: "nearest"} );
									//console.log("tootdom=",tootdom.getBoundingClientRect());
									ID("toppanel").scrollIntoView();
								}
								this.is_nowscrollloading = false;
								resolve(true);
							});
						}
					});
				}else if (direction == "bottom") {
					direction4remove = "top";
					var index = this.findIndex_backgroundtimeline(direction,this.bgtimeline.manage.domOutputed[this.bgtimeline.manage.domOutputed.length-1]);
					if ((index+1) < this.bgtimeline.statuses.length) {
						//---load already tl
						var lasttoot = this.statuses[this.statuses.length-1];
						var tootdom = ID(`toot_${lasttoot.id}`);
						arr = this.check_backgroundtimeline(direction);
						this.postfunc_backgroundtimeline(direction,arr,true);
						this.$nextTick(()=>{
							//var scrpercent = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
							//scrpercent = scrpercent - 2;
							//var sa = options.app.element.scrollHeight * (scrpercent / 100);
							//options.app.element.scrollTop = sa * 0.5;
							if (tootdom) {
								tootdom.scrollIntoView({block: "center", inline: "nearest"} );
								//console.log("tootdom=",tootdom.getBoundingClientRect());
								ID("toppanel").scrollIntoView();
							}
							this.is_nowscrollloading = false;
							resolve(true);
						});
					}else{
						//---get mastodon server
						this.load_backgroundtimeline(type, options)
						.then((result)=>{
							if (result.data.length > 0) {
								this.bgtimeline.manage.page.bottom--;
								var lasttoot = this.statuses[this.statuses.length-1];
								var tootdom = ID(`toot_${lasttoot.id}`);
								arr = this.check_backgroundtimeline(direction);
								this.postfunc_backgroundtimeline(direction,arr,true);
								this.$nextTick(()=>{
									//var scrpercent = MYAPP.session.config.notification.tell_pasttoot_scroll || 95;
									//scrpercent = scrpercent - 2;
									//var sa = options.app.element.scrollHeight * (scrpercent / 100);
									//options.app.element.scrollTop = sa * 0.5;
									if (tootdom) {
										tootdom.scrollIntoView({block: "center", inline: "nearest"} );
										//console.log("tootdom=",tootdom.getBoundingClientRect());
										ID("toppanel").scrollIntoView();
									}
									this.is_nowscrollloading = false;
									resolve(true);
								});
							}
						});
					}
					
				}else if (direction == "init") {
					direction4remove = "top";
					
					//---get mastodon server
					this.load_backgroundtimeline(type, options)
					.then((result)=>{
						this.bgtimeline.manage.page.bottom = 0;
						this.bgtimeline.manage.page.top  = 0;
						/*arr = this.check_backgroundtimeline(direction);
						this.postfunc_backgroundtimeline(direction4remove,arr,true);
						this.is_nowscrollloading = false;
						resolve(true);*/

						if (result.data.length > 0) {
							
							var firsttoot = result.data[0];
							var tootdom = ID(`toot_${firsttoot.id}`);
							arr = this.check_backgroundtimeline(direction);
							if (arr.length == 0) tootdom = null;
							this.postfunc_backgroundtimeline(direction4remove,arr,true);
							this.$nextTick(()=>{
								
								if (tootdom) {
									//tootdom.scrollIntoView({block: "center", inline: "nearest"} );
									
								}
								ID("toppanel").scrollIntoView();
								this.is_nowscrollloading = false;
								resolve(true);
							});
						}
					});
					
						
					
				}
			});
			return def;
			
		},
		postfunc_backgroundtimeline : function (direction,data,isremove) {
			var direction4remove = "";
			var testhitarray = [];
			for (var s = 0; s < this.statuses.length; s++) {
				testhitarray.push(this.statuses[s].id);
			}
			if (direction == "top") {
				//---To output toot data to real DOM
				for (var i = data.length-1; i >= 0; i--) {
					if (testhitarray.indexOf(data[i].status.id) == -1) this.statuses.unshift(data[i].status);
				}
				direction4remove = "bottom";
			}else if (direction == "mosttop") {
					//---To output toot data to real DOM
					for (var i = data.length-1; i >= 0; i--) {
						if (testhitarray.indexOf(data[i].status.id) == -1) this.statuses.unshift(data[i].status);
					}
					direction4remove = "bottom";
			}else if (direction == "bottom") {
				//---To output toot data to real DOM
				for (var i = 0; i < data.length; i++) {
					if (testhitarray.indexOf(data[i].status.id) == -1) this.statuses.push(data[i].status);
				}
				direction4remove = "top";
			}
			if (isremove) this.autoremove_bgtimeline(direction4remove);
		},
		/**
		 * To generate Gpstatus from Raw status json of Mastodon
		 * @param {JSON} rawdata Status array from Mastodon
		 * @param {JSON} options My app's option object included (api, app)
		 */
		generate_toot_detail: function (rawdata, options) {
			var data = rawdata.data;
			var paging = rawdata.paging;
			var retdata = [];

			if (!options.app.is_nomax) {
				if (paging.next != "") {
					//this.info.maxid = paging.next; //data[data.length - 1].id;
					this.currentOption.api.max_id = paging.next;
				}
			}
			if (!options.app.is_nosince) {
				if (paging.prev != "") {
					//this.info.sinceid = paging.prev; //data[0].id;
					if (paging["raw_prev"]) {
						this.currentOption.api[paging["raw_prev"]] = paging.prev;
					}else{
						this.currentOption.api.since_id = paging.prev;
						this.currentOption.api.min_id = paging.prev;
					}
				}
			}
			//console.log("data.length=" + data.length);
			var generate_body = (data,options,direct) => {
				var st = new Gpstatus(data,20);
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
					var tmpid = this.statuses.length - 1;
					if (direct == "since") {
						//alternative remove this.statuses.unshift(st);
						tmpid = this.store_backgroundtimeline("top",st,options);
						retdata.unshift(st);
					} else if (direct == "max") {
						//alternative remove this.statuses.push(st);
						baseIndex = this.statuses.length-1;
						tmpid = this.store_backgroundtimeline("bottom",st,options);
						retdata.push(st);
					}
					//---get /statuses/:id/context
					var conversationData = data;
					var ascendantData = data;
					if (data.reblog != null) {
						//---if this toot boosted post from any one, replace id.
						conversationData = data.reblog;
						ascendantData = data.reblog;
					}
					if ((st.body.in_reply_to_id != null) || (st.body.replies_count < 0) || (st.body.replies_count > 0) ||
						(("options" in rawdata) && ("mentionsPickupID" in rawdata.options))
					)  {
						var conversa_opt = {
							api : {
			
							},
							app : {
								parent : {
									ID : st.id,
									index : tmpid
								}
							}
						};
						if ((this.tl_tabtype == "public") || (this.tl_tabtype == "local")) {
							conversa_opt.app["public"] = true;
						}			
						//MYAPP.sns.getConversation(st.body.id, st.id, tmpid)
						MYAPP.sns.getConversation(st.body.id, conversa_opt)
						.then((condata) => {
							//console.log("getConversation", condata);
							//var tt = this.getParentToot(condata.parentID);
							var tt = this.getParentToot(condata.options.app.parent.ID);
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

									if (("options" in rawdata) && ("mentionsPickupID" in rawdata.options)) {
										if (gcls.body.id == rawdata.options.mentionsPickupID) {
											gcls.reactions.mentionsPickup["yellow"] = true;
											gcls.reactions.mentionsPickup["lighten-3"] = true;
										}
									}
								}
								//console.log(this.statuses[baseIndex]);
								//this.statuses[baseIndex].comment_stat.iszero = condata.data.descendants.length == 0 ? true : false;
								this.statuses[tt.index].comment_stat.mini = condata.data.descendants.length == 0 ? false : true;
								//this.statuses[tt.index].elementStyle.toot_action_class.has_comment_pos_mini = this.statuses[tt.index].comment_stat.mini;

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
								//---if available comment, add space 1 ~ 3
								var sp = parseInt(this.statuses[tt.index].cardtypeSize["grid-row-start"].replace("span", ""));
								if (condata.data.descendants.length == 1) {
									sp = sp + 1;
								}else{
									sp = sp + 3;
								}
								//---if available link, remove extra space.
								if ((this.statuses[tt.index].urls.length > 0) && (this.statuses[tt.index].medias.length > 0)) {
									sp = sp - 1;
								}
								
								this.$set(this.statuses[tt.index].cardtypeSize, "grid-row-start", `span ${sp}`);
							}
						});
					}
					//---get site preview if link added
					//console.log("st.urls.length=", st.urls.length);
					if (st.urls.length > 0) {
						if (
							(!MYAPP.session.config.notification["notpreview_onmedia"]) || 
							(MYAPP.session.config.notification["notpreview_onmedia"] && (st.medias.length == 0))
						) {
							var targeturl = st.urls[0];
							//console.log("urls>0=",st.body.id, st.id, i, JSON.original(st.urls))
							//---get GPHT
							//====> Iam, denove mi ekzameos...
							/*loadGPHT(st.url[0],data[i].id)
							.then((result)=>{

							});*/
							//---get OGP
							var card_opt = {
								api : {
				
								},
								app : {
									parent : {
										ID : st.id,
										index : i
									}
								}
							};
							if ((this.tl_tabtype == "public") || (this.tl_tabtype == "local")) {
								card_opt.app["public"] = true;
							}		
							//MYAPP.sns.getTootCard(st.body.id, st.id, i)
							MYAPP.sns.getTootCard(st.body.id, card_opt)
							.then(result=>{
								var data = result.data;
								var tt = this.getParentToot(result.options.app.parent.ID);
								//console.log("result,tt=",result,tt);

								if ((data) && ("url" in data)) {
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
											var sp = parseInt(this.statuses[tt.index].cardtypeSize["grid-row-start"].replace("span", ""));
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
									return Promise.reject({url:targeturl, toot:tt});
								}
							})
							.catch(param=>{
								//console.log("param=",param);
								loadOGP(param.url, param.toot)
								.then(result => {
									//---if image is none and url is pixiv, re-get image url
									var def = new Promise((resolve, reject) => {

										var tt = result.index; //this.getParentToot(result.index);

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
									var tt = result.index; //this.getParentToot(result.index);
									//console.log("result.getParentToot=", tt);
									//console.log(this.statuses[tt.index]);

									this.$set(tt.data.mainlink, "exists", true);
									//---if exists medias, not preview link
									if (MYAPP.session.config.notification["notpreview_onmedia"] && (MYAPP.session.config.notification["notpreview_onmedia"] === true)) {
										if (tt.data.medias.length > 0) {
											this.$set(tt.data.mainlink, "exists", false);
										}
									}
									//---if found map, hide link preview
									if (this.statuses[tt.index].geo.enabled && MYAPP.session.config.notification["notpreview_onmap"] && (MYAPP.session.config.notification["notpreview_onmap"] === true)) {
										this.$set(tt.data.mainlink, "exists", false);
									}
									if (data["og:site_name"]) this.$set(tt.data.mainlink, "site", data["og:site_name"]);
									if (data["og:url"]) this.$set(tt.data.mainlink, "url", data["og:url"]);
									if (data["og:title"]) this.$set(tt.data.mainlink, "title", data["og:title"]);
									if (data["og:description"]) this.$set(tt.data.mainlink, "description", data["og:description"]);
									if (("og:image" in data) && (data["og:image"] != "")) {
										this.$set(tt.data.mainlink, "image", data["og:image"]);
										this.$set(tt.data.mainlink, "isimage", true);

										//---final card size change
										if (tt.data.medias.length > 0) {
											var sp = parseInt(tt.data.cardtypeSize["grid-row-start"].replace("span", ""));
											if (sp < 9) {
												sp = sp + 10;
											} else {
												sp = sp + 6;
											}
											this.$set(tt.data.cardtypeSize, "grid-row-start", `span ${sp}`);
										}
									} else {
										this.$set(tt.data.mainlink, "isimage", false);
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
			}

			if (!options.app.is_nomax) {		//---direction : push (past toot)
				for (var i = 0; i < data.length; i++) {
					if (this.checkExistToot(data[i].id)) continue;
					generate_body(data[i],options,"max");
				}
			}else if (!options.app.is_nosince) {	//---direction : unshift (future toot)
				for (var i = data.length-1; i >= 0; i--) {
					if (this.checkExistToot(data[i].id)) continue;
					generate_body(data[i],options,"since");
					
				}
			}
			console.log("vm.statuses=" + this.statuses.length);
			this.is_asyncing = false;
			/*this.$nextTick(() =>{
				for (var s = 0; s < this.statuses.length; s++) {
					var onest = this.statuses[s];
					
				}

			});*/
			return Promise.resolve(retdata);
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
					//console.log(data.visibility,"include_dmsg_tl",MYAPP.session.config.notification.include_dmsg_tl);
					if (MYAPP.session.config.notification.include_dmsg_tl) {
						ret = true;
					}else{
						if (options.app["notify_direct"]) {
							ret = true;
						}else{
							ret = false;
						}
					}
				} 
			}else if (priority == "additional") {
				//---additional option
				if (options.app.exclude_reply) {
					ret = (data.in_reply_to_id == null) ? true : false;
					if (!ret && (gstatus.reblogOriginal != null)) {
						ret = true;
					}
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
			this.currentOption.api["limit"] = MYAPP.session.config.application.timeline_viewcount;
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
var vue_mixin_for_tootmenu = {
	methods: {
		get_instance_original_url : function (toote) {
			return MUtility.generate_instanceOriginalURL(MYAPP.commonvue.cur_sel_account.account,toote);
		},
		get_tagurl : function (tag) {
			return MUtility.generate_hashtagpath(tag);
		},
		onclick_vealclose : function (e) {
			this.show(false);
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
	}
}
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
			elementID : "",
			ckeditor : null,
			ckeditable : null,
			editor: "ClassicEditor",
			editorData : "",
            editorConfig: null,

			btnflags : {
                loading : false,
                mood : {
                    "red--text" : false,
				},
				pollbtn : {
					"red--text" : false,
				},
                send_disabled : false
			},
			constant : {
				version : {
					scheduled : "2.7.4",
					poll : "2.8.0"
				}
			},
			toot_valid : true,
			screentype : "toot",	//toot, direct
			is_othermenu : false,


			//---account box data
			selaccounts : [],

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
			
			isopen_mention : false,
			selmentions : [],
			mentions : [],
			mention_loading : false,
			mention_search : null,
			is_set_mention_checkbox : true,
			
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
				"red--text" : false,
			},
			
			//---tag box data
			seltags : [],
			//tags: [],
			
			//---media
			is_available_image : true,
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
			temp_gphoto_items : [],
			
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
			},

			//---control for schedule post
			is_available_sched : false,
			is_panel_sched : false,
			is_enable_schedule : false,
			menu_date : false,
			menu_time : false,
			sched : {
				date : "",
				time : "",
			},

			//---control for poll
			is_available_poll : false,
			is_enable_poll : false,
			inputpoll : {
				expire_at : "600",
				expire_type : "m",
				expire_original : "10",
				choices : [],
				multiple : false,
			}

		}
	},
	watch : {
		selaccounts : function (val) {
			//console.log(val);
			MYAPP.session.status.toot_max_character = MYAPP.appinfo.config.toot_max_character;
			MYAPP.session.status.toot_warning_number = MYAPP.appinfo.config.toot_warning_number;
			var tmparr = [];
			//---check API function for each instance
			var checkBody = (instance) => {
				var chkinst = MYAPP.acman.checkInstanceVersion(instance);
				//------for scheduled post
				if ((chkinst.service == "mastodon") && (chkinst.version >= this.constant.version.scheduled)) {
					this.is_available_sched = true;
				}else{
					this.is_available_sched = false;
				}
				//---for poll
				if ((chkinst.service == "mastodon") && (chkinst.version >= this.constant.version.poll)) {
					this.is_available_poll = true;
					if (this.medias.length > 0) {
						this.is_available_poll = false;	
					}
				}else{
					this.is_available_poll = false;
				}
			};
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
						//---additional API check
						checkBody(lim.instance);
					}else{
						var ainhit = false;
						//---if available max_toot_chars in instance information ??? (ex: Pleroma, etc...)
						for (var ain in MYAPP.acman.instances) {
							if (v.indexOf(ain) > -1) {
								//---additional API check
								checkBody(ain);
								if (MYAPP.acman.instances[ain].info.max_toot_chars) {
									MYAPP.session.status.toot_max_character = MYAPP.acman.instances[ain].info.max_toot_chars;
									MYAPP.session.status.toot_warning_number = MYAPP.acman.instances[ain].info.max_toot_chars - 10;
									tmparr.push(MYAPP.acman.instances[ain].info.max_toot_chars);
									ainhit = true;
									break;
								}
							}
							
						}
						if (!ainhit) {
							tmparr.push(MYAPP.appinfo.config.toot_max_character);
							
						}
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
			this.calc_fulltext(this.status_text,{
				counting_firstmention : this.is_set_mention_checkbox
			});
			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red--text"] = true;
			}else{
				this.strlength_class["red--text"] = false;
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
			//console.log(val,old);
			if (val.length > 4) {
				return false;
			}else{
			}
			this.calc_fulltext(this.status_text,{
				counting_firstmention : this.is_set_mention_checkbox
			});

			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red--text"] = true;
			}else{
				this.strlength_class["red--text"] = false;
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

			this.calc_fulltext(val,{
				counting_firstmention : this.is_set_mention_checkbox
			});
			//---warning near limit.
			if (this.strlength > MYAPP.session.status.toot_warning_number) {
				this.strlength_class["red--text"] = true;
			}else{
				this.strlength_class["red--text"] = false;
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
		is_set_mention_checkbox : function (val) {
			this.calc_fulltext(this.status_text,{
				counting_firstmention : this.is_set_mention_checkbox
			});
		},
		temp_gphoto_items : function (val) {
			if (val.length > 0) {

			}
		}
	},
	created(){
		this.editorConfig = CK_INPUT_TOOTBOX;
	},
	mounted() {
		//M.FormSelect.init(ID("keymaptitle"), {});
		//CKEDITOR.disableAutoInline = true;
		//CK_INPUT_TOOTBOX.mentions[0].feed = this.autocomplete_mention_func;
		//this.ckeditor = CKEDITOR.inline( 'dv_inputcontent', CK_INPUT_TOOTBOX);
		var tmpdt = new Date();
		tmpdt.setMinutes(tmpdt.getMinutes()+10);
		this.sched.date = `${tmpdt.getFullYear()}-${("0"+(tmpdt.getMonth()+1)).slice(-2)}-${("0"+tmpdt.getDate()).slice(-2)}`;
		this.sched.time = `${("0"+tmpdt.getHours()).slice(-2)}:${("0"+tmpdt.getMinutes()).slice(-2)}`;
	},
	computed: {
		poll_expire_date : function () {
			var text = "";
			if (this.inputpoll.expire_type == "m") {
				text = _T("addpoll_expire_minutes",[this.inputpoll.expire_original]);
			}else if (this.inputpoll.expire_type == "h") {
				text = _T("addpoll_expire_hours",[this.inputpoll.expire_original]);
			}else if (this.inputpoll.expire_type == "d") {
				text = _T("addpoll_expire_days",[this.inputpoll.expire_original]);
			}
			return text;
		}
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
		/**
		 * 
		 * @param {JSON} options statuses text's options
		 * counting_firstmention : Boolean
		 */
		joinStatusContent : function (options){
			var content = this.status_text;

			//---get and cut Contents-Warning word
			var cwpos = content.indexOf("-cw-");
			var post_opt = {"sp":"","main":""};	
            if (cwpos > -1) {
                post_opt.sp = content.substr(0,cwpos);
				post_opt.main = content.substr(cwpos+4,content.length);
				
				//---formed mention, prepend top of status text.
				if (this.selmentions.length > 0) {
					if (options.counting_firstmention) {
						post_opt.main = this.selmentions.join(" ") + " " + post_opt.main;
					}
				}
				//---recover to raw text
				content = post_opt.sp + "-cw-" + post_opt.main;
			}else{
				if (options.counting_firstmention) {
					if (this.selmentions.length > 0) content = this.selmentions.join(" ") + " " + content;
				}
			}
			
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
		/**
		 * 
		 * @param {String} val status text
		 * @param {JSON} options calculate options
		 *   counting_firstmention : Boolean
		 */
		calc_fulltext : function (val,options) {
			var cont = MYAPP.extractTootInfo(val);
			var textWithoutMentions = cont.text;
			var mentions = [];
			var mentionlength = 0;
			if (this.selmentions.length > 0) {
				mentions = MYAPP.calcMentionLength(this.selmentions);
				if (options.counting_firstmention) {
					mentionlength = mentions.join(" ").length;
				}
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
				+ mentionlength + tags.length + this.geouris.join(" ").length;
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
			loadGeoLoco({lat:lat,lng:lng},{})
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
			this.status_text = MUtility.getEscapeHTML(this.ckeditor.editable().getHtml());
		},
		setText : function (text) {
			//this.status_text = text;
			this.ckeditor.editable().setHtml(this.status_text.replace(/\n/g,"<br>"));
		},
		setHTML : function (text) {
			this.status_text = text;
			this.ckeditor.editable().setHtml(this.status_text);
		},
		generate_showable_mention : function () {
			var men = this.selmentions[0];
			return `${men}`;
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
			}
		},
		onkeyup_inputcontent : _.debounce(function (e,e2) {
			console.log(e,e2);
			tmpobj = e2;
			
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			//var content = MYAPP.extractTootInfo(Q(`#${this.elementID}`).innerHTML);
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

			var pollhit = content.text.indexOf("-poll-");
			var polllen = 6;
			if (pollhit == -1) {
				pollhit = content.text.indexOf("-mpoll-");
				if (pollhit > -1) this.inputpoll.multiple = true;
				polllen = 7;
			}
			if ((this.is_available_poll) && (pollhit > -1) && (this.medias.length == 0)) {
				this.inputpoll.choices.splice(0,this.inputpoll.choices.length);
				this.status_text = content.text.substr(0,pollhit);
				this.is_enable_poll = true;
				this.is_available_image = false;
				this.btnflags.pollbtn["red--text"] = true;
				var pollline = content.text.indexOf("\n",pollhit);
				if (pollline == -1) pollline = content.text.length;

				var pollexpire = content.text.substr(pollhit+polllen,pollline - pollhit - polllen);
				//---check expire date
				/*
					5, 5m - minutes
					5h - hour
					5d - day
				*/
				if (pollexpire != "") {
					var tm = 0;
					if (pollexpire.indexOf("m") > -1) {
						//---minutes
						this.inputpoll.expire_original = pollexpire.replace("m","");
						tm = parseInt(this.inputpoll.expire_original) * 60;
						this.inputpoll.expire_type = "m";
					}else if (pollexpire.indexOf("h") > -1) {
						//---hours
						this.inputpoll.expire_original = pollexpire.replace("h","");
						tm = parseInt(this.inputpoll.expire_original) * 60 * 60;
						this.inputpoll.expire_type = "h";
					}else if (pollexpire.indexOf("d") > -1) {
						//---days
						this.inputpoll.expire_original = pollexpire.replace("d","");
						tm = parseInt(this.inputpoll.expire_original) * 60 * 60 * 24;
						this.inputpoll.expire_type = "d";
					}else{
						//---default is minutes
						tm = parseInt(pollexpire) * 60;
					}
					this.inputpoll.expire_at = tm;
				}
				//---check choices
				var pollchoices = content.text.substr(pollline+1,content.text.length).split("\n");
				for (p = 0; p < pollchoices.length; p++) {
					if (pollchoices[p].trim() != "") {
						this.inputpoll.choices.push(pollchoices[p]);
					}
				}

			}else{
				this.is_enable_poll = false;
				this.is_available_image = true;
				this.btnflags.pollbtn["red--text"] = false;
			}
		},300),
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
			if (this.is_enable_poll) {
				appAlert(_T("msg_error_poll1"));
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
		onclick_addcw : function (e) {
			console.log("before:",this.status_text);
			if (this.status_text.indexOf("-cw-") > -1) {
				//this.status_text = this.status_text.replace(/-cw-/g,"");
				//this.setText(this.status_text);
			}else{
				this.insertText("-cw-");
			}
			console.log("after:",this.status_text);
		},
		onclick_addimage : function(e) {
			ID(this.movingElementID('openmedia_')).click();
		},
		onclick_imagefromdrive : function (e) {
			var gdrive_body =  () => {
				gpGLD.createPhotoPicker(MYAPP.siteinfo.ggl.act,(data)=>{
					//---get file(s) from Google Picker
					console.log(data);
					if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
						var pros = [];
						var docs = data[google.picker.Response.DOCUMENTS];
						for (var d = 0; d < docs.length; d++) {
							var doc = docs[d];
							pros.push(gpGLD.loadFullFile(doc));

						}
						Promise.all(pros)
						.then(res=>{
							console.log(res);
							//resolve(res);
							var files = [];
							for (var r = 0; r < res.length; r++) {
								//var blob = new Blob([res[r].data.body], {type: res[r].data.headers["Content-Type"]});
								//var url = window.URL.createObjectURL(blob);
								files.push({
									name : res[r].file.name,
									body : res[r].data.body,
									mimetype : res[r].data.headers["Content-Type"]
								});
							}
							this.loadMediafiles("binary",files);
						});
					}
					
				});
			}

			//---to attach a media file from Google Drive(Photos)
			if ("access_token" in MYAPP.siteinfo.ggl.act) {
				if (!gpGLD.isExpired()) {
					gdrive_body();
					return;
				}
			}
			gpGLD.handleAuth()
			.then(result=>{
				var authres = result.getAuthResponse();
				MYAPP.siteinfo.ggl.act = authres;
				MYAPP.saveSessionStorage();
				
				gdrive_body();			
			});
			
		},
		onclick_imagefromgphoto : function (e) {
			MYAPP.commonvue.photodlg.callparent = this;
			MYAPP.commonvue.photodlg.$refs.gdlg.show();
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

						//console.log(pos);
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
								//console.log("geomap=",this.geomap);
								//---re-calculate location mark
								this.geomap.on("click",(e)=>{
									//console.log(e);
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
		onclick_addpoll : function (e) {
			console.log("before:",this.status_text);
			if (this.status_text.indexOf("-poll-") > -1) {
				//this.status_text = this.status_text.replace(/-cw-/g,"");
				//this.setText(this.status_text);
			}else{
				this.insertText("-poll-");
			}
			console.log("after:",this.status_text);
		},
		onclick_mediaclose : function(index) {
			appConfirm(_T("image_confirm_msg01"),()=>{
				//console.log("index=",index);
				this.selmedias.splice(index,1);
				this.medias.splice(index,1);
				if (this.medias.length == 0) {
					this.is_available_poll = true;
				}
				this.$emit("change",{
					"is_edit" : (this.selmedias > 0) ? true : false,
					"length" : this.strlength
				});
			});
		},
		onclick_send: function (e) {
			//---re set text content
			var content = MYAPP.extractTootInfo(this.ckeditor.getData());
			this.status_text = content.text;

			if (this.toot_valid) {
				var pros = [];
				for (var i = 0; i < this.selaccounts.length; i++) {
					var account = this.getTextAccount2Object(i);
					//console.log(account);
					var mediaids = [];
					for (var m = 0; m < this.medias.length; m++) {
						mediaids.push(this.medias[m][account.acct].id);
					}
					var text = this.joinStatusContent({
						counting_firstmention : true
					});
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
					var scheduledate = null;
					if (this.is_panel_sched && this.is_available_sched && this.is_enable_schedule) {
						var tmpd = this.sched.date.split("-");
						var tmpt = this.sched.time.split(":");
						if ((tmpd.length > 2) && (tmpt.length > 1)){
							var dt = new Date(
								parseInt(tmpd[0]),parseInt(tmpd[1])-1,parseInt(tmpd[2]),
								parseInt(tmpt[0]),parseInt(tmpt[1])
							);
							//var tmzn = dt.getTimezoneOffset() / -60;
							//dt.setHours(dt.getHours() + tmzn);
							
							scheduledate = dt.toISOString();

						}
					}
					var poll = null;
					if (this.is_enable_poll) {
						poll = {
							expires_in : this.inputpoll.expire_at,
							options : this.inputpoll.choices,
							multiple : this.inputpoll.multiple
						};
					}

					var pr = MYAPP.executePost(text,{
						"account" : account,
						"scope" : this.selsharescope,
						"media" : mediaids,
						"nsfw" : this.switch_NSFW,
						"schedule" : scheduledate,
						"poll" : poll
					});
					pros.push(pr);
				}

				Promise.all(pros)
				.then(values=>{
					//---clear input and close popup
					this.clearEditor();
					/*
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
					*/

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
		clearEditor : function () {
			this.status_text = "";
			this.mainlink.exists = false;

			this.selaccounts.splice(0,this.selaccounts.length);
			this.ckeditor.editable().setText("");
			this.selmentions.splice(0,this.selmentions.length);
			if (!MYAPP.session.config.action.noclear_tag) {
				this.seltags.splice(0,this.seltags.length);
			}
			this.selmedias.splice(0,this.selmedias.length);
			this.medias.splice(0,this.medias.length);
			this.switch_NSFW = false;
			this.btnflags.loading = false;
			if (this.is_geo) {
				this.is_geo = false;
				this.css.geo.common_ui_off = true;
				this.geo.lat = 0;
				this.geo.lng = 0;
				this.geo.zoom = 1;
				this.geo.locos.splice(0,this.geo.locos.length);
				this.geouris.splice(0,this.geouris.length);
				this.geotext = "";
			}

			this.is_available_poll = false;
			this.is_enable_poll = false;
			this.inputpoll = {
				expire_at : "600",
				expire_type : "m",
				expire_original : "10",
				choices : [],
				multiple : false,
			};
			this.btnflags.pollbtn["red--text"] = false;

			this.is_enable_schedule = false;
			this.is_panel_sched = false;
			this.is_available_sched = false;

			MYAPP.commonvue.emojisheet.is_sheet = false;
		},		/**
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

			var rootdef = new Promise((rootresolve, rootreject)=>{
				var rootpros = [];

				if (filetype == "file") {
					for (var i = 0; i < files.length; i++) {
						var filedef = new Promise((resolve,reject)=>{
							var reader = new FileReader();
							reader.onload = ((fle) => {
								return (e) => {
									var imgsrc = e.target.result;
									var dat = {
										src : imgsrc,
										type : filetype,
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
						//console.log("vals=",vals);
						return vals;
					}));
				}else if (filetype == "blob") {
					var bbs = [];
					for (var i = 0; i < files.length; i++) {
						var dat = {
							src : files[i],
							type : filetype,
							comment : "",
							data : {
								name : `${new Date().valueOf()}${i}`
							}
						};
						this.selmedias.push(dat);
						bbs.push(dat);
					}
					rootresolve(bbs);
				}else if (filetype == "binary") {
					var bbs = [];
					for (var i = 0; i < files.length; i++) {
						var dat = {
							src : files[i],
							type : filetype,
							comment : "",
							data : {
								name : files[i].name
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
				//console.log("result=",result);
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
						var fl = null;
						if (re.type == "binary") {
							var base64img = re.src.body;
							var buffer = new Uint8Array(base64img.length);
							for (var b = 0; b < base64img.length; b++) {
								buffer[b] = base64img.charCodeAt(b);
							}
							fl = new Blob([buffer.buffer],{type:re.src.mimetype});
						}else {
							//=====future: image from canvas, clipboard, etc...
							var imgdata = re.src.split(";");
							imgdata[0] = imgdata[0].replace("data:","");
							var base64img = atob(imgdata[1].split(",")[1]);
							var buffer = new Uint8Array(base64img.length);
							for (var b = 0; b < base64img.length; b++) {
								buffer[b] = base64img.charCodeAt(b);
							}
							fl = new Blob([buffer.buffer],{type:imgdata[0]});
						} 
						//console.log(fl,imgdata);
						//=====================================
						var fdef = MYAPP.uploadMedia(hitac,fl,opt);
						//console.log("fdef=",fdef);
						pros.push(fdef);
					}
				}
				return Promise.all(pros);
			})
			.then(values=>{
				//---finally
				var ret = {};
				//Push media files ids of each accounts
				//console.log("values=",values);
				var loopfilename = values[0].filename;
				var loopaccoutname = values[0].account.acct;
				for (var iv = 0; iv < values.length; iv++) {
					//console.log(iv,loopfilename,values[iv]);
					if (loopfilename != values[iv].filename) {
						this.medias.push(ret);
						for (var s = 0; s < this.selmedias.length; s++) {
							if (loopfilename == this.selmedias[s].data.name) {
								this.$set(this.selmedias[s],"preview_url",ret[loopaccoutname].preview_url);
								//this.selmedias[s]["preview_url"] = ret[loopaccoutname].preview_url;
							}
						}
						ret = {};
					}

					ret[values[iv].account.acct] = values[iv].data;
					loopfilename = values[iv].filename;
					loopaccoutname = values[iv].account.acct;
				}
				//---push final item
				this.medias.push(ret);
				for (var s = 0; s < this.selmedias.length; s++) {
					if (loopfilename == this.selmedias[s].data.name) {
						this.$set(this.selmedias[s],"preview_url",ret[loopaccoutname].preview_url);
						//this.selmedias[s]["preview_url"] = ret[loopaccoutname].preview_url;
					}
				}

				//ここでうっかりmediasを上書きしてるよ、同じインスタンスの場合！
				//this.medias.push(ret);
				//console.log(this.selmedias,this.medias);
				return {"selmedias":this.selmedias,"medias":this.medias};
			})
			.then((res)=>{
				//console.log("res=",res);
			})
			.catch(err=>{
				console.log(err);
				this.btnflags.loading = false;
			})
			.finally( () => {
				MYAPP.sns.setAccount(backupAC);
				//console.log("finally=",backupAC);
				this.is_available_poll = false;

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
				black : false,
				"white--text" : true,
				"black--text" : false
			};
			if (type == "mention") {
				ret.green = true;
			}else if (type == "reblog") {
				ret.red = true;
			}else if (type == "favourite") {
				ret.yellow = true;
				ret["white--text"] = false;
				ret["black--text"] = true;
			}else if (type == "follow") {
				ret.blue = true;
			}else if (type == "poll") {
				ret.black = true;
				ret["white--text"] = true;
				ret["black--text"] = false;
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
			}else if (type == "poll") {
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
			}else if (type == "poll") {
				return "poll";
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
				//console.log(i,datas[i]);
				var data = datas[i];
				//data.account = [data.account];
				var ismerge = this.merge_notification(account,data);
				//console.log("merge=",ismerge,account,data);
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
				MYAPP.commonvue.tootecard.sizing_window();
				MYAPP.commonvue.tootecard.is_overlaying = true;

				MYAPP.sns.getConversation(this.saveitem.status.id,{
					api : {},
					app : {
						parent : {
							ID : this.saveitem.status.in_reply_to_id,
							index : ""
						}
					}
				})
				.then(parent_toot=> {
					console.log("parent_toot=",parent_toot);
					

					var ancestor = parent_toot.data.ancestors[0];
					var d;
					if (parent_toot.data.ancestors.length == 0)  {
						d = new Gpstatus(this.saveitem.status,16);
					}else{
						d = new Gpstatus(ancestor,16);
					}
					this.status = d;
					var conversa_opt = {
						api : {
		
						},
						app : {
							parent : {
								ID : this.status.body.id,
								index : ""
							}
						}
					};
					//MYAPP.sns.getConversation(this.status.body.id, this.status.body.id, "")
					MYAPP.sns.getConversation(this.status.body.id, conversa_opt)
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

							if (gcls.body.id == this.saveitem.status.id) {
								gcls.reactions.mentionsPickup["yellow"] = true;
								gcls.reactions.mentionsPickup["lighten-3"] = true;
							}
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
						MYAPP.commonvue.tootecard.$refs.tootview.$nextTick(()=>{
							var id = "ov_reply_" + this.saveitem.status.id;
							console.log("id=",id);
							var targetrefs = MYAPP.commonvue.tootecard.$refs.tootview.$refs[id];
							console.log(MYAPP.commonvue.tootecard.$refs.tootview.$refs,targetrefs);
							
							/*targetrefs.$nextTick(()=>{
								//document.getElementById(id).scrollIntoView(true);
								MYAPP.commonvue.tootecard.$refs.tootview.$vuetify.goTo(targetrefs,{});							
							});*/	
						});
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

					//---apply preview of link
					if (d.urls.length > 0) {
						if (
							(!MYAPP.session.config.notification["notpreview_onmedia"]) || 
							(MYAPP.session.config.notification["notpreview_onmedia"] && (d.medias.length == 0))
						) {
							var card_opt = {
								api : {
				
								},
								app : {
									parent : {
										ID : d.id,
										index : 0
									}
								}
							};
							//MYAPP.sns.getTootCard(d.body.id, d.id, 0)
							MYAPP.sns.getTootCard(d.body.id, card_opt)
							.then(result=>{
								var data = result.data;
								//var tt = this.getParentToot(result.parentID);
								//console.log("result,tt=",result,tt);
		
								if (("url" in data)) {
									//---if found map, hide link preview
									if (this.status.geo.enabled && MYAPP.session.config.notification["notpreview_onmap"] && (MYAPP.session.config.notification["notpreview_onmap"] === true)) {
										this.$set(this.status.mainlink, "exists", false);
									}else{
										this.$set(this.status.mainlink, "exists", true);
									}
									if ("provider_name" in data) {
										if (data.provider_name != "") {
											this.$set(this.status.mainlink, "site", data["provider_name"]);
										}else{
											var a = GEN("a");
											a.href = data.url;
											//console.log("data.url=",a.hostname);
											this.$set(this.status.mainlink, "site", a.hostname);
										}
									}
									if ("url" in data) this.$set(this.status.mainlink, "url", data["url"]);
									if ("title" in data) this.$set(this.status.mainlink, "title", data["title"]);
									if ("description" in data) this.$set(this.status.mainlink, "description", data["description"]);
									if (("image" in data) && (data["image"] != null)) {
										this.$set(this.status.mainlink, "image", data["image"]);
										this.$set(this.status.mainlink, "isimage", true);
		
										//---final card size change
										if (this.status.medias.length > 0) {
											var sp = parseInt(this.status.cardtypeSize["grid-row-end"].replace("span", ""));
											/*if (sp < 9) {
												sp = sp + 6;
											} else {
												sp = sp + 2;
											}*/
											//this.$set(this.status.cardtypeSize, "grid-row-end", `span ${sp}`);
										}
									} else {
										this.$set(this.status.mainlink, "isimage", false);
									}
								}else{
									return Promise.reject({url:targeturl, tootid:st.id});
								}
							})
							.catch(param=>{
								//console.log("param=",param);
								loadOGP(param.url, param.tootid)
								.then(result => {
									//---if image is none and url is pixiv, re-get image url
									var def = new Promise((resolve, reject) => {
		
										//var tt = this.getParentToot(result.index);
		
										//console.log("catch,param,ogp=",result);
										//console.log(tt);
										if (this.status.urls.length > 0) {
											if ((!("og:image" in result.data) || (result.data["og:image"] == "")) &&
												(this.status.urls[0].indexOf("pixiv.net/member_illust") > -1)
											) {
												if ("pixiv_cards" in this.status.body) {
													result.data["og:image"] = this.status.body.pixiv_cards[0].image_url;
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
									//var tt = this.getParentToot(result.index);
									//console.log("result.getParentToot=", tt);
									//console.log(this.status);
		
									this.$set(this.status.mainlink, "exists", true);
									//---if exists medias, not preview link
									if (MYAPP.session.config.notification["notpreview_onmedia"] && (MYAPP.session.config.notification["notpreview_onmedia"] === true)) {
										if (this.status.medias.length > 0) {
											this.$set(this.status.mainlink, "exists", false);
										}
									}
									//---if found map, hide link preview
									if (this.status.geo.enabled && MYAPP.session.config.notification["notpreview_onmap"] && (MYAPP.session.config.notification["notpreview_onmap"] === true)) {
										this.$set(this.status.mainlink, "exists", false);
									}
									if (data["og:site_name"]) this.$set(this.status.mainlink, "site", data["og:site_name"]);
									if (data["og:url"]) this.$set(this.status.mainlink, "url", data["og:url"]);
									if (data["og:title"]) this.$set(this.status.mainlink, "title", data["og:title"]);
									if (data["og:description"]) this.$set(this.status.mainlink, "description", data["og:description"]);
									if (("og:image" in data) && (data["og:image"] != "")) {
										this.$set(this.status.mainlink, "image", data["og:image"]);
										this.$set(this.status.mainlink, "isimage", true);
		
										//---final card size change
										if (this.status.medias.length > 0) {
											var sp = parseInt(this.status.cardtypeSize["grid-row-start"].replace("span", ""));
											if (sp < 9) {
												sp = sp + 10;
											} else {
												sp = sp + 6;
											}
											this.$set(this.status.cardtypeSize, "grid-row-start", `span ${sp}`);
										}
									} else {
										this.$set(this.status.mainlink, "isimage", false);
									}
								});
							});
						}
		
					}
				});

			}


			//---start nofitication execute
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

//----------------------------------------------------------------------
var vue_mixin_for_archiveoption =  {
	data : () => {
		return {
			is_show_archoption : true,
			is_inputdialog : false,
			optionpanel_index : 0,
			filterpanel_index : 0,
			options : {
				service : "g",
				refertype : "l",
			},
			filter : {
				items : {
					yymm : [], //year,month
					postacl : "",
				},
				current : {
					year : -1,
					month : -1,
					yymm : -1,
					share_only : "al",
				}
			},
			cssclass : {
				localrefer : {
					beforedrag_indicate : true,               
					dragover_indicate : false,
				}
			},
			jsdata : [],
			originaldata : [],
			logs : [],
		};
	},
	methods : {
		/**
		 * Click event of Refer button
		 * @param {Event} e event object
		 */
		onclick_refer : function (e) {
			if (this.options.refertype == "g") {
				if ("access_token" in MYAPP.siteinfo.ggl.act) {
					if (!gpGLD.isExpired()) {
						gpGLD.createPicker(MYAPP.siteinfo.ggl.act,(data)=>{
							//---get file(s) from Google Picker
							if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
								var doc = data[google.picker.Response.DOCUMENTS];
								MUtility.loadingON();
								this.load_gdrivefile(doc);
							}else{
								MUtility.loadingOFF();
							}
						});
						return;
					}
				}
				gpGLD.handleAuth()
				.then(result=>{
					var authres = result.getAuthResponse();
					MYAPP.siteinfo.ggl.act = authres;
					MYAPP.saveSessionStorage();					

					gpGLD.createPicker(authres,(data)=>{
						//---get file(s) from Google Picker
						if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
							var doc = data[google.picker.Response.DOCUMENTS];
							MUtility.loadingON();
							this.load_gdrivefile(doc);
						}else{
							MUtility.loadingOFF();
						}
					});
				});
	
			}else if (this.options.refertype == "l") {
				ID("fl_localrefer").click();
			}
		},
		onclick_inputdirect : function (e) {
			//this.is_inputdialog = true;
			//appPrompt2("URLを入力してくだされ。",(param,val)=>{
			//	console.log(val);
			//},[],"");
			if ("access_token" in MYAPP.siteinfo.ggl.act) {
				if (!gpGLD.isExpired()) {
					gpGLD.createPhotoPicker(MYAPP.siteinfo.ggl.act,(data)=>{
						//---get file(s) from Google Picker
						console.log(data);
					});
					return;
				}
			}
			gpGLD.handleAuth()
			.then(result=>{
				var authres = result.getAuthResponse();
				MYAPP.siteinfo.ggl.act = authres;
				MYAPP.saveSessionStorage();
				
				gpGLD.createPhotoPicker(MYAPP.siteinfo.ggl.act,(data)=>{
					//---get file(s) from Google Picker
					console.log(data);
				});					
			});
			
		},
		onclick_backtimeline : function (e) {
			vue_archmain.onclick_backtimeline(e);
		},
		/**
		 * Drag over event of drop here area
		 * @param {Event} e event object
		 */
		ondragover_localrefer : function(e){
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
			this.cssclass.localrefer.dragover_indicate = true;
			this.cssclass.localrefer.beforedrag_indicate = false;
		},
		ondragleave_localrefer : function(e){
			this.cssclass.localrefer.dragover_indicate = false;
			this.cssclass.localrefer.beforedrag_indicate = true;
		},
		/**
		 * Drop event of drop here area
		 * @param {Event} e event object
		 */
		ondrop_localrefer : async function(e){
			

			e.stopPropagation();
			e.preventDefault();
			MUtility.loadingON();
			this.cssclass.localrefer.dragover_indicate = false;
			this.cssclass.localrefer.beforedrag_indicate = true;
			console.log(e.dataTransfer);
			console.log(e.dataTransfer.files,e.dataTransfer.items);

			this.load_droplocalfile(e.dataTransfer.items);

		},
		/**
		 * Select event of File box
		 * @param {Event} e event object
		 */
		onchange_fl_localrefer : function (e) {
			console.log(e.target.files);
			this.load_referlocalfile(e.target.files);
		},
		/**
		 * Click event of to apply filter button
		 * @param {Event} e event object
		 */
		onclick_apply_filter : function (e) {
			console.log(this.filter.current);
			vue_archmain.clearTimeline();
			delete vue_archmain.currentOption["api"]["max_id"];
			vue_archmain.apply_filter(this.filter);
			
		},
		/**
		 * (re-)generate data of filter combobox
		 * @param {JSON} item {service:object, data:object}
		 * @return {JSON} first filter value
		 */
		reload_filterdata : function (item) {
			var ys = [];
			var ms = [];
			for (var i = 0; i < item.data.length; i++) {
				var gobj = item.data[i];
				var y = gobj.body.created_at.getFullYear().toString();
				var m = (gobj.body.created_at.getMonth()+1).toString();
				if (m.length == 1) m = "0" + m;

				if (ys.indexOf(y+","+m) == -1) {
					ys.push(y+","+m);
				}
			}
			ys.sort();
			//ms.sort();
			this.$set(this.filter.items,"yymm",ys);
			//this.$set(this.filter.items,"month",ms);
			this.filter.current.yymm = ys[0];
			return {
				current : {
					yymm : ys[0],
					share_only : this.filter.current.share_only,
				}
			}
		},
		/**
		 * finalize function for loaded files
		 * @param {Promise[]} filepromise Promise array
		 */
		finalize_loadedFile : function (filepromise) {
			Promise.all(filepromise)
			.then(values=>{
				
				this.jsdata.sort(function(a,b){
					if(a.body.created_at.valueOf() > b.body.created_at.valueOf()) return -1;
					if(a.body.created_at.valueOf() < b.body.created_at.valueOf()) return 1;
					return 0;
				});
				if (this.logs.length == 0) {
					vue_archmain.appendDatalist(this.options.service,this.jsdata,this.originaldata);
				}
			})
			.finally(()=>{
				vue_archmain.writeLog(this.logs.join("\n"));
				if (this.logs.length > 0) {
					appAlert(_T("msg_archive_error2"));
				}
				MUtility.loadingOFF();
			})
		},
		scanFiles : async function (entry, tmpObject) {
			switch (true) {
				case (entry.isDirectory) :
					const entryReader = entry.createReader();
					const entries = await new Promise(resolve => {
						entryReader.readEntries(entries => resolve(entries));
					});
					await Promise.all(entries.map(entry => scanFiles(entry, tmpObject)));
					break;
				case (entry.isFile) :
					if (entry.fullPath.indexOf(".json") > -1) {
						tmpObject.push(entry);
					}
					break;
			}
		},
		importbody_service : function (js) {
			var gobj = null;
			if (this.options.service == "g") {
				var gobj = SNSCONV.convertFromGplus(js,{});
				
			}
			console.log(gobj);
			return gobj.gpdata;
		},
		/**
		 * Main function for dropping file
		 * @param {Array} items 
		 */
		load_droplocalfile : async function (items) {
			
			var result = [];
			var pros = [];
			for (var i = 0; i < items.length; i++) {
				var it = items[i];
				console.log(it,it.webkitGetAsEntry());
				
				pros.push(this.scanFiles(it.webkitGetAsEntry(),result));
				
			}
			await Promise.all(pros);
			console.log(result);
			this.logs.splice(0,this.logs.length);
			this.jsdata.splice(0,this.jsdata.length);
			this.originaldata.splice(0,this.originaldata.length);

			var filepros = [];
			for(let rslt of result) {
				var pro = new Promise((resolve,reject)=>{
					rslt.file(file => {
						const reader = new FileReader();
						reader.readAsText(file);
						reader.onload = () => {
							var js = JSON.parse(reader.result);
							//console.log(rslt.fullPath);
							//console.log(file);
							//console.log(reader.result);
							//console.log(js);
							var garr = [];

							if (js.length) {
								for (var j = 0; j < js.length; j++) {
									var jo = js[j];
									var gobj = this.importbody_service(jo);
									if (gobj) {
										this.jsdata.push(gobj);
										this.originaldata.push(jo);
										garr.push(gobj);
									}else{
										this.logs.push(_T("msg_archive_error1")+rslt.fullPath);
									}
								}
							}else{
								var gobj = null;
								gobj = this.importbody_service(js);
								if (gobj) {
									this.jsdata.push(gobj);
									this.originaldata.push(js);
									garr.push(gobj);
								}else{
									this.logs.push(_T("msg_archive_error1")+rslt.fullPath);
								}
								
							}

							resolve(garr);
						};
					});
				});
				filepros.push(pro);
			}
			this.finalize_loadedFile(filepros);
		},
		/**
		 * Main function for selecting file
		 * @param {Array} items 
		 */
		load_referlocalfile : function (files) {
			this.logs.splice(0,this.logs.length);
			this.jsdata.splice(0,this.jsdata.length);
			this.originaldata.splice(0,this.originaldata.length);
			var filepros = [];
			for(var i = 0; i < files.length; i++) {
				var pro = new Promise((resolve,reject)=>{
					const reader = new FileReader();
					reader.readAsText(files[i]);
					reader.onload = () => {
						var js = JSON.parse(reader.result);
						//console.log(rslt.fullPath);
						//console.log(file);
						//console.log(reader.result);
						//console.log(js);
						var garr = [];

						if (js.length) {
							for (var j = 0; j < js.length; j++) {
								var jo = js[j];
								var gobj = this.importbody_service(jo);
								if (gobj) {
									this.jsdata.push(gobj);
									this.originaldata.push(jo);
									garr.push(gobj);
								}else{
									this.logs.push(_T("msg_archive_error1")+rslt.fullPath);
								}
							}
						}else{
							var gobj = null;
							gobj = this.importbody_service(js);
							if (gobj) {
								this.jsdata.push(gobj);
								this.originaldata.push(js);
								garr.push(gobj);
							}else{
								this.logs.push(_T("msg_archive_error1")+rslt.fullPath);
							}
						}

						resolve(garr);
					}
				});
				filepros.push(pro);
			}
			this.finalize_loadedFile(filepros);

		},
		/**
		 * Main function for selecting file in Google Drive
		 * @param {Array} items 
		 */
		load_gdrivefile : async function (items) {
			var result = [];
			var pros = [];
			this.logs.splice(0,this.logs.length);
			this.jsdata.splice(0,this.jsdata.length);
			this.originaldata.splice(0,this.originaldata.length);
			console.log("gitems=",items);

			var filepros = [];
			for (var i = 0; i < items.length; i++) {
				var pro = new Promise((resolve,reject)=>{
					
					gpGLD.loadFullFile(items[i])
					.then(res => {
						var js = res.data.result;

						var garr = [];

						if (js.length) {
							for (var j = 0; j < js.length; j++) {
								var jo = js[j];
								var gobj = this.importbody_service(jo);
								if (gobj) {
									this.jsdata.push(gobj);
									this.originaldata.push(jo);
									garr.push(gobj);
								}else{
									this.logs.push(_T("msg_archive_error1")+res.file.name);
								}
								
							}
						}else{
							var gobj = null;
							
							gobj = this.importbody_service(js);
							if (gobj) {
								this.jsdata.push(gobj);
								this.originaldata.push(js);
								garr.push(gobj);
							}else{
								this.logs.push(_T("msg_archive_error1")+res.file.name);
							}
							
						}
						if (this.logs.length > 0) {
							reject(this.logs);
						}else{
							resolve(garr);
						}
					});
				});
				filepros.push(pro);
			}
			this.finalize_loadedFile(filepros);
		}
	}
}