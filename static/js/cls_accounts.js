/**===========================================================================
 * Mastodon account class
 =============================================================================*/
class Account {
    constructor() {
        this.id = "";
        this.idname = "";
        this.display_name = "";
        this.token = {
            "token_type": "",
            "expires_in": "",
            "refresh_token": "",
            "scope": "",
            "access_token": "",
            "access_secret": ""
        };
        this.instance = "";
        this.acct = "";
        this.api = null;
        this.rawdata = null;
        this.status = "";
        this.stream = null;
        this.streams = {
            list : null,
            tag : null,
            taglocal : null,
            local : null,
            public : null
        };
        this.direct = null;
        this.directlst = [];    //---{id:""}
        this.notifications = [];
        this.others = {};
    }
    dispose() {
        if (this.stream) this.stream.stop();
        for (var obj in this.streams) {
            if (this.streams[obj]) this.streams[obj].stop();
        }
        if (this.direct) this.direct.stop();
        if (this.direct) this.direct.stop();
    }
    getBaseURL() {
        return "https://" + this.instance;
    }
    getRaw() {
        return {
            id : this.id,
            idname : this.idname,
            display_name : this.display_name,
            token : this.token,
            instance : this.instance,
            acct : this.acct,
            rawdata : this.rawdata,
            notifications : this.notifications,
            directlst : this.directlst,
            others : this.others,
        };
    }
    getRawdata() {
        return [
            this.id,
            this.idname,
            this.display_name,
            JSON.stringify(this.token),
            this.instance,
            JSON.stringify(this.rawdata),
            JSON.stringify(this.notifications),
            JSON.stringify(this.directlst),
            JSON.stringify(this.others)
        ].join("\t");
    }
    load(data) {
        this.id = data.id;
        this.idname = data.idname;
        this.display_name = data.display_name;
            
        this.token = data.token;
        this.instance = data.instance;
        this.rawdata = data.rawdata;
        this.acct = this.idname + "@" + this.instance;

        var tmpname = data.display_name;
        tmpname = MUtility.replaceEmoji(tmpname,data.instance,data.rawdata.emojis,14);
        this.display_name = tmpname;

        this.api = new MastodonAPI({
            instance: this.getBaseURL(),
            api_user_token: this.token.access_token
        });
        this.notifications = data["notifications"] || [];
        this.directlst = data["directlst"] || [];

        this.others = data["others"] || {};
        try {
        this.stream = new Gpstream("user",this,null,null);
        //this.stream.start();
        this.streams.list = new Gpstream("list",this,null,null);
        this.streams.tag = new Gpstream("hashtag",this,null,null);
        this.streams.taglocal = new Gpstream("hashtag:local",this,null,null);
        this.streams.public = new Gpstream("public",this,null,null);
        this.streams.local = new Gpstream("public:local",this,null,null);
        this.direct = new Gpstream("direct",this,null,null);
        }catch(e){
            console.log(e);
        }
        //this.direct.start();
    }
};
/**===========================================================================
 * Notification class for Mastodon account
 =============================================================================*/
class AccountNotification {
    constructor(account) {
        this.account = account;
        this.notifications = [];
        this.info = {
            maxid : "",
            sinceid : "",
            is_nomax : false,
            is_nosince : false, 
        };

    }
}
/**===========================================================================
 * Mastodon account manager class
 =============================================================================*/
class AccountManager {
    constructor() {
        this.items = [];
        this.backupItems = [];
        this.setting = {
            NAME: "_gp_ac_m",
            INSTANCEEMOJI : "gp_ac_inst_emj"
        };
        /**
         * {
         *   emoji : {}
         * }
         */
        this.instances = {};


    }
    /**
     * 
     * @param {Promise} instance_name name of the instance of Mastodon
     */
    addInstance(instance_name) {
        /* At this function, created Account object is not meaning.
         effective register point is afterAddInstance
        */
        var acc = new Account();
        var arr = instance_name.toLowerCase().split("@");
        if (arr.length == 1) { //---only instance name
            acc.instance = arr[0];
        }else{ //---if it includes username (ex: hoge@mstdn.jp )
            //---split @, indicate last index element.
            acc.instance = arr[arr.length-1];
        }
        //acc.instance = instance_name;

        acc.api = new MastodonAPI({
            instance: acc.getBaseURL()
        });
        var tmpaccount = {
            "instance": acc.instance,
            "siteinfo": {}
        };
        var callbackurl = window.location.origin + MYAPP.appinfo.firstPath + MYAPP.siteinfo.redirect_uri;

        var def = new Promise((resolve, reject) => {
            MYAPP.sns.getInstanceInfo(acc.instance)
            .then(result=>{
                console.log("instance info=",result);
            });
            acc.api.registerApplication(
                MYAPP.appinfo.name,
                callbackurl,
                MYAPP.siteinfo.scopes,
                MYAPP.siteinfo.appurl,
                function (data) {
                    tmpaccount.siteinfo["key"] = data.client_id;
                    tmpaccount.siteinfo["secret"] = data.client_secret;
                    tmpaccount.siteinfo["redirect_uri"] = data.redirect_uri;
                    localStorage.setItem("tmpaccount", JSON.stringify(tmpaccount));
                    var url = acc.api.generateAuthLink(
                        tmpaccount.siteinfo.key,
                        tmpaccount.siteinfo.redirect_uri,
                        "code",
                        MYAPP.siteinfo.scopes
                    );
                    window.location.href = url;
                    //resolve(url);
                    /*
                        Next step is redirected step in window.onload
                    */
                }
            );
        });
        return def;
    }
    afterAddInstance(code) {
        var def = new Promise((resolve,reject)=>{
            var istest = localStorage.getItem("tmpaccount");
            if (istest && code) {
                var tmpdata = JSON.parse(istest);
                var acc = new Account();
                acc.instance = tmpdata.instance;
                acc.api = new MastodonAPI({
                    instance: acc.getBaseURL()
                });
                acc.api.getAccessTokenFromAuthCode(
                    tmpdata.siteinfo.key,
                    tmpdata.siteinfo.secret,
                    tmpdata.siteinfo.redirect_uri,
                    code,
                    function (data) {
                        acc.api.setConfig("api_user_token", data.access_token);
                        acc.rawdata = data;
                        acc.token = {
                            "token_type": data.token_type,
                            "expires_in": "",
                            "refresh_token": "",
                            "scope": data.scope,
                            "access_token": data.access_token,
                            "access_secret": ""
                        };
                        localStorage.removeItem("tmpaccount");

                        acc.api.get("accounts/verify_credentials", function (data) {
                            MYAPP.sns.getInstanceInfo(acc.instance)
                            .then(result=>{
                                acc.id = data.id;
                                acc.idname = data.username;
                                acc.display_name = data.display_name;
                                acc.rawdata = data;
                                acc.token["stream_url"] = result.urls.streaming_api;
                                acc.api.setConfig("stream_url",result.urls.streaming_api);
                                acc.stream = new Gpstream("user",acc,null,null);
                                var key = {
                                    idname : acc.idname,
                                    instance : acc.instance
                                };
                                var isexist = MYAPP.acman.getIndex(key);
                                if (isexist == -1) {
                                    //---first register
                                    MYAPP.acman.items.push(acc);
                                }else{
                                    //---if exists, not register but update.
                                    MYAPP.acman.set(key,acc);
                                }

                                MYAPP.acman.instances[result.uri] = {
                                    info : result,
                                    instance : result.uri
                                };
                                docCookies.setItem(MYAPP.siteinfo.cke,"1");

                                return ({
                                    users : MYAPP.acman.items,
                                    instancedata:MYAPP.acman.instances[result.uri],
                                    instance : result.uri
                                });
                            })
                            .then(result2=> {
                                return MYAPP.sns.getInstanceEmoji(result2.instance)
                                .then(emojiresult => {
                                    result2.instancedata["emoji"] = emojiresult;
                                    resolve(result2);
                                });
                            })
                            .finally(()=>{
                                MYAPP.acman.save();    
                            });
                        }, function (xhr) {
                            alert("authorization error.");
                            console.log(xhr);
                        });
                    }
                );
            }
        });
        return def;
    }
    getIndex(key) {
        var keylen = 0;
        var ret = -1;
        for (var obj in key) {
            keylen++;
        }
        for (var i = 0; i < this.items.length; i++) {
            var hit = 0;
            /*if (key["servicename"] && (key["servicename"] === this.items[i].servicename)) {
                hit++;
            }*/
            if (key["id"] && (key["id"] === this.items[i].id)) {
                hit++;
            }
            if (key["idname"] && (key["idname"] === this.items[i].idname)) {
                hit++;
            }
            if (key["display_name"] && (key["display_name"] === this.items[i].display_name)) {
                hit++;
            }
            if (key["instance"] && (key["instance"] === this.items[i].instance)) {
                hit++;
            }
            if (hit == keylen) {
                ret = i;
                break;
            }
        }
        return ret;
    }
    get(key) {
        var i = this.getIndex(key);
        if (i > -1) {
            return this.items[i];
        } else {
            return null;
        }

    }
    set(key,item) {
        var olditem = this.getIndex(key);
        this.items[olditem] = item;
        this.backupItems[olditem] = Object.assign({},item);
    }
    remove(key) {
        var i = this.getIndex(key);
        //console.log(i);
        if (i > -1) {
            var old = this.items[i].instance;
            this.items[i].dispose();
            this.items.splice(i, 1);
            var ishit = 0;
            //---check if same instance exists
            for (var j = 0; j < this.items.length; j++) {
                if (this.items[j].instance == old) {
                    ishit++;
                }
            }
            if (ishit == 0) {
                delete this.instances[old];
            }
            return true;
        } else {
            return false;
        }
    }
    uninstall(){
        localStorage.removeItem(this.setting.NAME);
        localStorage.removeItem(this.setting.INSTANCEEMOJI);
    }
    /**
     * save Account data (Account to JSON)
     * 
     * */
    save() {
        if (curLocale.environment.platform == "windowsapp") {
            var folder = Windows.Storage.ApplicationData.current.localFolder;
            folder.getFileAsync(this.setting.NAME)
                .then(function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(this.items[i]));
                }, function (data) {
                    folder.createFileAsync(this.setting.NAME)
                        .then(function (file) {
                            Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(this.items[i]));
                        });
                });
        } else {
            var tmparr = [];
            for (var i = 0; i < this.items.length; i++) {
                tmparr.push(this.items[i].getRaw());
            }
            AppStorage.set(this.setting.NAME, tmparr);

            var tmpinst = {};
            for (var obj in  this.instances) {
                tmpinst[obj] = Object.assign(this.instances[obj]);
                delete tmpinst[obj].emoji;
            }
            AppStorage.set(this.setting.INSTANCEEMOJI,tmpinst);
        }
    }
    checkVerify() {
        var pros = [];
        for (var i = 0; i < this.items.length; i++) {
            var acc = this.items[i];
            MYAPP.sns.setAccount(acc);
            var def = new Promise((resolve,reject)=>{
                MYAPP.sns.updateCredential(acc)
                .then(result=>{
                    //console.log("verify data=>",result);
                    result.account.id = result.data.id;
                    result.account.idname = result.data.username;
                    result.account.display_name = result.data.display_name;
                    result.account.rawdata = result.data;
                    var aci = this.getIndex({
                        "idname":acc.idname, 
                        "instance":acc.instance
                    });
                    this.set({"idname":acc.idname, "instance":acc.instance},acc);
                    this.save();
                    resolve({index: aci, data:acc});
                })
                .catch((error,status,xhr)=>{
                    console.log("NG:",error,status,xhr);

                    //alertify.error("load error:" + acc.idname);
                    var tmpi = this.getIndex({
                        instance : acc.instance,
                        idname : acc.idname
                    });
                    this.items[tmpi].status = "err";
                    this.backupItems[tmpi].status = "err";
                    //---if error, remove current session user data (NO permanent!!)
                    //this.items.splice(i,1);
                    resolve({index : tmpi, data: this.items[tmpi]});
                });
            });
            pros.push(def);

            
        }
        return Promise.all(pros)
        .then(values=>{
            /*for (var i = values.length-1; i >= 0; i--) {
                if (values[i].data.status == "err") {
                    this.items.splice(values.index,1);
                }
            }*/
            if (gpGLD.is_authorize) {
                //---save to google drive
                //---count config file in google drive
                gpGLD.loadFromFolder()
                .then(files=>{
                    var ret = null;
                    for (var i = 0; i < files.length; i++) {
                        ret = files[i];
                    }
                    return ret;
                })
                .then(file=>{
                    if (file) {
                        var tmparr = [];
                        for (var i = 0; i < this.items.length; i++) {
                            tmparr.push(this.items[i].getRaw());
                        }
                        //---overwrite existing config file (because it already exists at here!!) 
                        gpGLD.updateFile(file.id,JSON.stringify(tmparr));
                    }
                });

            }
            return this.items;
        });
    }
    /**
     * load Account data  (JSON to Account)
     * */
    load() {
        var def = new Promise((resolve, reject) => {
            this.items.splice(0, this.items.length);
            if (curLocale.environment.platform == "windowsapp") {
                var folder = Windows.Storage.ApplicationData.current.localFolder;
                folder.getFileAsync(this.setting.NAME)
                    .then((file) => {
                        var reader = new FileReader();
                        reader.onload =  (e) => {
                            var text = reader.result;
                            this.items = JSON.parse(text);
                            resolve(this.items);
                        };
                        reader.onerror =  (e) => {
                            appAlert("not valid file!!");
                            reject("error");
                        };
                        reader.readAsText(file);
                    }, function (data) {
                        console.log("AccountManager.load: not found ini file.");
                    });
            } else {
                var fdata = AppStorage.get(this.setting.NAME, null);
                if (fdata && (fdata.length > 0)) {
                    if (!docCookies.getItem(MYAPP.siteinfo.cke)) {
                        docCookies.setItem(MYAPP.siteinfo.cke,"1");
                    }
                    var promises = [];
                    var emojitest = AppStorage.get(this.setting.INSTANCEEMOJI, null);
                    if (emojitest) {
                        var values = (emojitest);
                        this.instances = values;
                        for (var i = 0; i < fdata.length; i++) {
                            var ac = new Account();
                            ac.load(fdata[i]);
                            //console.log("ac.api=",ac.api,values[ac.instance]);
                            ac.api.setConfig("stream_url",values[ac.instance].info.urls.streaming_api);
                            if ((location.pathname != "/toot/new") && (location.pathname != "/") && (location.pathname != "/arch")) {
                                ac.stream.start();
                                ac.direct.start();
                            }
                            this.items.push(ac);
                            this.backupItems.push(ac);
                            //console.log(ac.instance);                            
                        }
                        /*for (var iv = 0; iv < values.length; iv++) {
                            this.instances[values[iv].instance] = {
                                emoji : values[iv]
                            };
                        }*/
                        
                        resolve(this.items);
                    }else{
                        for (var i = 0; i < fdata.length; i++) {
                            var ac = new Account();
                            ac.load(fdata[i]);
                            this.items.push(ac);
                            this.backupItems.push(ac);
                            //console.log(ac.instance);
                            
                            //var pro = MYAPP.sns.getInstanceEmoji(ac.instance);
                            //promises.push(pro);
                            
                        
                            promises.push(
                                MYAPP.sns.getInstanceInfo(ac.instance)
                                .then(result=> {
                                    this.instances[result.uri] = {
                                        info : result,
                                        instance : result.uri
                                    };
                                    for (var ainx = 0; ainx < this.items.length; ainx++) {
                                        if (this.items[ainx].instance == result.uri) {
                                            this.items[ainx].token["stream_url"] = result.urls.streaming_api;
                                            this.items[ainx].api.setConfig("stream_url",result.urls.streaming_api);
                                        }
                                    }
                                    return {data:this.instances[result.uri],
                                        instance : result.uri
                                    };
                                })
                                .then(result2=> {
                                    return MYAPP.sns.getInstanceEmoji(result2.instance)
                                    .then(emojiresult => {
                                        return result2.data["emoji"] = emojiresult;
                                        
                                    });
                                })
                            );

                        }
                        //resolve(this.items);
                        Promise.all(promises)
                        .then(values => {
                            //console.log("values=",values);
                            /*for (var iv = 0; iv < values.length; iv++) {
                                this.instances[values[iv].instance] = {
                                    emoji : values[iv]
                                };
                            }*/
                            AppStorage.set(this.setting.INSTANCEEMOJI,this.instances);
                            
                        })
                        .finally(()=>{
                            this.items.forEach(e=>{
                                e.stream.start();
                                e.direct.start();
                            });
                            resolve(this.items);
                        });
                        
                    }
                } else {
                    reject(false);
                }
            }
        });
        return def;
    }
    loadEmoji() {
        var pros = [];
        var def = new Promise((resolve,reject)=>{
            resolve(true);

            /*for (var i = 0; i < this.items.length; i++) {
                var ac = this.items[i];
                var pro = 
                MYAPP.sns.getInstanceEmoji(ac.instance)
                .then(emojiresult => {
                    this.instances[emojiresult.instance]["emoji"] = emojiresult;
                    return emojiresult; 
                    //(this.instances[emojiresult.instance]);
                    //this.instances = values;
                    //AppStorage.remove(this.setting.INSTANCEEMOJI);
                    
                })
                .catch(e=>{
                    console.log(e);
                });
                
                pros.push(pro);
            }
            return Promise.all(pros)
            .then(values=>{
                for (var obj in this.instances) {
                    for (var j = 0; j < values.length; j++) {
                        if (obj == values[j].instance) {
                            this.instances[obj]["emoji"] = values;
                        }
                    }
                }
                resolve(this.instances);
            });*/
        });
        return def;
    }
}
class Gsuserstore {
    constructor(){
        /*
          {
              account : Object,
              relationship : Object
          }
        */
        this.items = [];
    }
    getIndex(key) {
        var keylen = 0;
        var ret = -1;
        for (var obj in key) {
            keylen++;
        }
        for (var i = 0; i < this.items.length; i++) {
            var hit = 0;
            /*if (key["servicename"] && (key["servicename"] === this.items[i].servicename)) {
                hit++;
            }*/
            if (key["id"] && (key["id"] === this.items[i].account.id)) {
                hit++;
            }
            if (key["username"] && (key["username"] === this.items[i].account.username)) {
                hit++;
            }
            if (key["display_name"] && (key["display_name"] === this.items[i].account.display_name)) {
                hit++;
            }
            if (key["instance"] && (key["instance"] === this.items[i].account.instance)) {
                hit++;
            }
            if (hit == keylen) {
                ret = i;
                break;
            }
        }
        return ret;
    }
    add(user) {
        var i = this.getIndex({
            username : user.username,
            instance : user.instance
        });
        if (i < 0) {
            this.items.push(Object.assign({},user));
        }
    }
    get(key) {
        var i = this.getIndex(key);
        if (i > -1) {
            return this.items[i];
        } else {
            return null;
        }

    }
    set(key,item) {
        var olditem = this.getIndex(key);
        this.items[olditem] = item;
    }
    remove(key) {
        var i = this.getIndex(key);
        console.log(i);
        if (i > -1) {
            this.items.splice(i, 1);
            return true;
        } else {
            return false;
        }
    }

}