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
            },
            config : {
                application : {
                    showMode : "mastodon",   //mastodon, twitter, gplus
                    timeline_view : "auto", //auto, 1(column), 2(column), 3(column)
                    timeline_viewcount : 20,
                    applogin : {
                        type : "google", //google, twitter
                    }
                },
                action : {
                    confirmBefore : true,
                    image_everyNsfw : false,
                    popupNewtoot_always : false,
                    close_aftertoot : false,
                    tags : [
                        {id:1,text:"mastodon"},
                        {id:2,text:"twitter"},
                        {id:3,text:"googleplus"}
                    ],
                }
            }
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