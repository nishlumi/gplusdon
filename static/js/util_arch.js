const SNSCONV = {
    convertFromGplus : function (js) {
        if (!js["activityId"] && !js["commentActivityId"]) {
            return null;
        }
        var ret = {};
		ret["emojis"] = [];
        ret["reblog"] = null;

        
        
        //---Sender account
        var a = GEN("a");
        a.href = js.author.profilePageUrl;
        ret["account"] = {
			"display_name" : js.author.displayName,
			"url" : js.author.profilePageUrl,
			"uri" : js.author.profilePageUrl,
			"username" : a.pathname.replace("/","").replace("+",""),
            "instance" : "plus.google.com",
            "note" : "",
			"avatar" : js.author.avatarImageUrl
        };
        //---Main content
        ret["id"] = js.activityId || js.commentActivityId;
        ret["is_archive"] = true;
        ret["sensitive"] = false;
        ret["spoiler_text"] = "";

        ret["created_at"] = js.creationTime;
        ret["uri"] = js.url;
        ret["url"] = js.url;

        ret["content"] = js.content;
        ret["visibility_str"] = "";
        ret["visibility_desc"] = "";
        if (js.postAcl) {
            if (js.postAcl.visibleToStandardAcl && js.postAcl.visibleToStandardAcl["circles"]) {
                var circles = js.postAcl.visibleToStandardAcl.circles;
                var cirdisparr = [];
                for (var c = 0; c < circles.length; c++) {
                    var cir = circles[c];
                    if (cir.type == "CIRCLE_TYPE_PUBLIC") {
                        ret["visibility"] = "public";
                    }else if (cir.type == "CIRCLE_TYPE_YOUR_CIRCLES") {
                        ret["visibility"] = "private";
                        cirdisparr.push("Your circle");
                    }else if (cir.type == "CIRCLE_TYPE_USER_CIRCLE") {
                        ret["visibility"] = "private";
                        cirdisparr.push(cir.displayName);
                    }else{
                        ret["visibility"] = "private";
                    }
                }
                if (cirdisparr.length > 0) {
                    ret["visibility_str"] = "(G+ circle: " + cirdisparr[0] + ",etc...)";
                    ret["visibility_desc"] = cirdisparr.join(",");
                }
            }
            if (js.postAcl.communityAcl && js.postAcl.communityAcl["community"]) {
                var community = js.postAcl.communityAcl.community;
                ret["visibility_str"] = "(G+ community: " + community.displayName + ")";
                ret["visibility_desc"] = "";
            }
            if (js.postAcl.collectionAcl && js.postAcl.collectionAcl["collection"]) {
                var collection = js.postAcl.collectionAcl.collection;
                ret["visibility_str"] = "(G+ collection: " + collection.displayName + ")";
                ret["visibility_desc"] = "";
            }
            //---if isPublic, forcely public.
            if (js.postAcl.isPublic) {
                ret["visibility"] = "public";
            }
        }else{
            ret["visibility"] = "public";
        }

        //---medias
        ret["media_attachments"] = [];
        var retrieveMedia = function (original) {
            var media = original;

            //--- /s0-d/ is download image url. convert /s0-/ (for normal image url)
            media.url = media.url.replace("/s0-d/","/s0-/");

            var img = {
                id : media.resouceName,
                type : typearr[0],
                url : media.url,
                preview_url : media.url,
                remote_url : media.url,
                description : (media.description ? media.description : ""),
                meta : {
                    original : {
                        width : media.width,
                        height : media.height,
                        size : `${media.width}x${media.height}`,
                    },
                    small : {
                        width : media.width * 0.25,
                        height : media.height * 0.25,
                        size : `${media.width * 0.25}x${media.height * 0.25}`,
                    }
                }
            };
            return img;
        }
        if (js.media) {
            var typearr = js.media.contentType.split("/");
            var img = retrieveMedia(js.media); 
            ret.media_attachments.push(img);
        }
        if (js.album) {
            for (var i = 0; i < js.album.media.length; i++) {
                var media = js.album.media[i];
                var typearr = media.contentType.split("/");
                var img = retrieveMedia(media);
                ret.media_attachments.push(img);
            }
        }

        //---post activity
        ret["favourites_count"] = 0;
        if (js.plusOnes) {
            ret["favourite_users"] = [];
            for (var i = 0; i < js.plusOnes.length; i++) {
                var one = js.plusOnes[i].plusOner;
                var oa = GEN("a");
                oa.href = one.profilePageUrl;
                ret.favourite_users.push({
					"username" : oa.pathname.replace("/","").replace("+",""),
                    "display_name" : one.displayName,
                    "url" : one.profilePageUrl,
                    "uri" : one.profilePageUrl,
                    "instance" : "plus.google.com",
                    "avatar" : one.avatarImageUrl

				});
            }
            ret["favourites_count"] = ret.favourite_users.length;
        }
        ret["reblogs_count"] = 0;
        if (js.reshares) {
            ret["reblog_users"] = [];
            for (var i = 0; i < js.reshares.length; i++) {
                var one = js.reshares[i].resharer;
                var oa = GEN("a");
                oa.href = one.profilePageUrl;
                ret.reblog_users.push({
					"username" : oa.pathname.replace("/","").replace("+",""),
                    "display_name" : one.displayName,
                    "url" : one.profilePageUrl,
                    "uri" : one.profilePageUrl,
                    "instance" : "plus.google.com",
                    "avatar" : one.avatarImageUrl
				});
            }
            ret["reblogs_count"] = ret.reblog_users.length;
        }

        //---first converting...
        var gobj = new Gpstatus(ret,14);

        //---comment
        if (js.comments) {
            //ret["descendants"] = [];
            for (var i = 0; i < js.comments.length; i++) {
                var com = SNSCONV.convertFromGplus(js.comments[i]);
                gobj.descendants.push(com);
            }
            gobj.body["replies_count"] = js.comments.length;
        }

        //---link
        if (js.link) {
            gobj.mainlink.title = js.link.title;
            gobj.mainlink.url = js.link.url;
            var la = GEN("a");
            la.href = js.link.url;
            gobj.mainlink.site = la.hostname;
            gobj.mainlink.exists = true;
            if (js.link.imageUrl) {
                gobj.mainlink.image = js.link.imageUrl;
                gobj.mainlink.isimage = true;
            }
            gobj.mainlink.description = js.link.description || "";

        }

        return gobj;
    },
    convertG2G : function (html) {
		var div = GEN("div");
		div.innerHTML = html;
		var ret = {};
		ret["emojis"] = [];
		ret["reblog"] = null;

		//var doc = div.querySelector("body");
		var body = div.querySelector("div");

		//---Sender Account
		var divuser = body.children.item(0);
		var divuser_author = divuser.querySelector("a.author");
		ret["account"] = {
			"display_name" : divuser_author.textContent,
			"url" : divuser_author.href,
			"uri" : divuser_author.href,
			"username" : divuser_author.pathname.replace("/","").replace("+",""),
			"instance" : divuser_author.hostname,
			"avatar" : divuser.querySelector("img.author-photo").src,
		};

		//---Main content
		var as = divuser.querySelectorAll("a");
		for (var i = 0; i < as.length; i++) {
			if (as[i].href.indexOf("/posts") > -1) {
				ret["created_at"] = as[i].textContent.replace(" ","T");
				ret["uri"] = as[i].href;
				ret["url"] = as[i].href;
				break;
			}
		}
		var main = body.querySelector("div.main-content");
		ret["content"] = main.innerHTML;

        var visi = div.querySelector("div.visibility");

		ret["visibility_str"] = visi.textContent;
		ret["visibility"] = "";

		ret["media_attachments"] = [];

		//---post-activity
		var postact = div.querySelector("div.post-activity");
		if (postact) {
			var plusone = postact.querySelector("div.plus-oners");
			var oners = plusone.querySelectorAll("a");
			ret["favourite_users"] = [];
			for (var i = 0; i < oners.length; i++) {
				ret.favourite_users.push({
					"username" : oners[i].pathname.replace("/","").replace("+",""),
					"display_name" : oners[i].textContent
				});
			}
			ret["favourites_count"] = ret.favourite_users.length;

			var reshare = postact.querySelector("div.resharers");
			var reshares = reshare.querySelectorAll("a");
			ret["reblog_users"] = [];
			for (var i = 0; i < reshares.length; i++) {
				ret.reblog_users.push({
					"username" : reshares[i].pathname.replace("/","").replace("+",""),
					"display_name" : reshares[i].textContent
				});
			}
			ret["reblogs_count"] = ret.reblog_users.length;
		}

		//---comment
		var comments = div.querySelector("div.comments");
		if (comments) {
			var comment = comments.querySelectorAll("div.comment");
			ret["descendants"] = [];
			for (var i = 0; i < comment.length; i++) {
				var combody = comment[i];
				var coma = combody.querySelector("a.author");
				var comtime = combody.querySelector("span.time");
				var comcont = combody.querySelector("div.comment-content");

				var desc = {
					"account" : {
						"username" : coma.pathname.replace("/","").replace("+",""),
						"display_name" : coma.textContent,
						"instance" : coma.hostname,
					},
					"created_at" : comtime.textContent.replace(" ","T"),
					"content" : comcont.innerHTML
				};
				ret.descendants.push(desc);
			}
			ret["replies_count"] = comment.length;
		}

		return ret;
    },
    convertFromMastodon : function (js,context) {

    }
};