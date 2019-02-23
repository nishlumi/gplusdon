/**===========================================================================
 * App session class
 =============================================================================*/
class Gpsession {
    constructor(){
        this.data = {
            status : {
                pickupToote : null,
                pickupDir : "next",
                pickupObjectToot : null,
                showingAccount : {
                    instance : "",
                    idname : "",
                    data : ""
                },
                selectedAccount : {
                    instance : "",
                    idname : ""
                },
                currentLocation : "",
                urlquery : "",
                urlqueryObject : null,
                toot_max_character : 500,
                toot_warning_number : 490,
            },
            config : {
                application : {
                    showMode : "mastodon",   //mastodon, twitter, gplus
                    timeline_view : "auto", //auto, 1(column), 2(column), 3(column)
                    timeline_viewcount : 20,
                    applogin : {
                        type : "google", //google, twitter
                    },
                    show_menutext : true,
                    gallery_type : "slide", //slide, grid
                    skip_startpage : false,
                    map_type : "yahoo",
                },
                action : {
                    confirmBefore : true,
                    image_everyNsfw : false,
                    add_nsfw_force_instance : false,
                    nsfw_force_instances : [],
                    enable_nsfw_time : false,
                    force_nsfw_time : {
                        begin : null,
                        end : null
                    },
                    popupNewtoot_always : false,
                    close_aftertoot : false,
                    tags : [],
                    noclear_tag : false,
                    open_url_after_remove_account : true,
                },
                notification : {
                    enable_browser_notification : true,
                    include_dmsg_tl : false,
                    tell_newtoot : false,
                    tell_newtoot_scroll : 300,
                    toot_limit_instance : [],
                    notpreview_onmap : false,
                    notpreview_onmedia : false,
                    minimumize_media_onlink : false,
                }
            },
            gadgets : []
        };
        this.streams = {};
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
    createStream(name,timeline,notification) {
        var ac = MYAPP.acman.get(this.status.selectedAccount);
        if (ac) {
            var strm = new Gpstream(name,ac,timeline,notification);
            this.stream[name];
        }else{
            return false;
        }
    }
    addStream(name,account,stream) {
        this.streams[name] = stream;
        this.streams[name].start();
    }
    removeStream(name) {
        if (this.streams[name]) {
            this.streams[name].stop();
            delete this.streams[name];
        }
    }
    uninstall(is_eternal) {
        if (is_eternal) {
            localStorage.removeItem("gp_eternal_ses");
        }else{
            sessionStorage.removeItem(`gp_${this._key}_ses`);
        }
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
            var textdata = localStorage.getItem("gp_eternal_ses");
            if (textdata) {
                var tmp = JSON.parse(textdata);
                //---status
                this.data.status = tmp.status;
                //---config (probably add after)
                for (var obj in this.data.config) {
                    if (obj in tmp.config) {
                        for (var setone in tmp.config[obj]) {
                            var so = tmp.config[obj][setone];
                            this.data.config[obj][setone] = so;
                        }
                    }
                }
                this.data = tmp;
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