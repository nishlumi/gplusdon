var SCOPES = ['https://www.googleapis.com/auth/drive',"https://www.googleapis.com/auth/drive.appfolder", "https://www.googleapis.com/auth/drive.appdata"];
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];


function gapi_onload() {
    gpGLD.handleClientLoad();
}
function gapi_ready() {
    if (this.readyState === 'complete') this.onload();
}
var gpGLD = {
    localset : "_gp_gd_id",
    setname : "_gp_gd_ac_m",
    nextPageToken : "",
    k : {
        ap : "",
        pic_ap : "",
        cl : "",
    },
    is_authorize : false,
    is_pickerAuth : false,
    createFolder : function (name) {
        var fdata = AppStorage.get(MYAPP.acman.setting.NAME, null);

        var def = new Promise((resolve,reject)=>{
            var fileMetadata = {
                'name': this.setname,
                'parents': ['appDataFolder'] //
            };
            var base64txt = (JSON.stringify(fdata));
            var buffer = new Uint8Array(base64txt.length);
            for (var b = 0; b < base64txt.length; b++) {
                buffer[b] = base64txt.charCodeAt(b);
            }
            var fl = new Blob([buffer.buffer],{type:"text/plain"});
            var media = {
                mimeType: 'text/plain',
                //body: fl
            };
            gapi.client.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
                body : fdata
            })
            .then( (file) => {
                if (file) {
                    console.log('Folder Id:', file);
                    resolve(file.result);
                }
            },(err)=>{
                console.error(err);
                reject(err);
            });
            
        });
        return def;
    },
    loadFromFolder : function (id) {
        var def = new Promise((resolve,reject)=>{
            gapi.client.drive.files.list({
                spaces: 'appDataFolder',
                fields: 'nextPageToken, files(id, name)',
                pageSize: 100
            })
            .then((res) => {
                /*res.result.files.forEach(function (file) {
                    console.log('Found file:', file.name, file.id);
                    if (gpGLD.setname == file.name) {
                        resolve({id: file.id, name: file.name});
                    }
                });*/
                resolve(res.result.files);
            },(err)=>{
                // Handle error
                console.error(err);
            });
        });
        return def;

    },
    listFolderFiles : function (id, pageToken) {
        var def = new Promise((resolve,reject)=>{
            var param = {
                q : `'${id}' in parents`,
                orderBy: 'folder,modifiedTime',
                fields: 'nextPageToken, files(id, name, owners, mimeType, modifiedTime, iconLink)',
                pageSize: 100
            };
            if (pageToken) {
                param["pageToken"] = pageToken;
            }
            gapi.client.drive.files.list(param)
            .then((res) => {
                /*res.result.files.forEach(function (file) {
                    console.log('Found file:', file.name, file.id);
                    if (gpGLD.setname == file.name) {
                        resolve({id: file.id, name: file.name});
                    }
                });*/
                this.nextPageToken = res.result.nextPageToken ? res.result.nextPageToken : "";
                resolve(res.result.files);
            },(err)=>{
                // Handle error
                console.error(err);
            });
        });
        return def;
    },

    //sample from: https://qiita.com/kjunichi/items/552f13b48685021966e4
    /**
     * Print files.
    */
   loadFileBase : function (id,alt) {
    var def = new Promise((resolve,reject)=>{
        gapi.client.drive.files.get({
            fileId: id,
            alt : alt,
        })
        .then((res) => {
            resolve(res);
        },(err)=>{
            console.log(err);
            reject(err);
        });
    });
    return def;
    },
    loadFile : function (id) {
        return this.loadFileBase(id,"media");
        /*var def = new Promise((resolve,reject)=>{
            gapi.client.drive.files.get({
                fileId: id,
                alt : "media"
            })
            .then((res) => {
                resolve(res);
            },(err)=>{
                console.log(err);
                reject(err);
            });
        });
        return def;*/
    },
    loadFullFile : function (file) {
        var def = new Promise((resolve,reject)=>{
            gapi.client.drive.files.get({
                fileId: file.id,
                alt : "media"
            })
            .then((res) => {
                resolve({
                    file : file,
                    data : res
                });
            },(err)=>{
                console.log(err);
                reject(err);
            });
        });
        return def;
    },

    /**
     * Start the file upload.
     *
     * @param {Object} evt Arguments from the file selector.
     */
    writeFile : function (evt) {
        /*gapi.client.load('drive', 'v3', function () {
            //var file = evt.target.files[0];
            var fileName = document.getElementById("fileName").value;
            var content = document.getElementById("content").value;
            console.log("fileName = "+fileName);
            console.log("content = "+content);
            this.insertFile(fileName,content);
        });*/

        var fdata = AppStorage.get(MYAPP.acman.setting.NAME, null);

        this.insertFile(this.setname,JSON.stringify(fdata),
        (file)=>{
            console.log(file);
            //localStorage.setItem(this.localset,file.id);
        });
    },

    /**
     * Insert new file.
     *
     * @param {fileName} 保存するファイル名
     * @param {content} 保存するファイルの内容
     * @param {Function} callback Function to call when the request is complete.
     */
    insertFile : function (fileName,content, callback) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var contentType = 'text/plain';
        var metadata = {
                'name': fileName,
                'mimeType': contentType,
                'description' : `${MYAPP.appinfo.name} setting file 1`,
                'parents': ['appDataFolder'] //
        };

        var base64Data = this.utf8_to_b64(content);
        var multipartRequestBody = delimiter +
                'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' + base64Data + close_delim;

        var request = gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': {
                    'uploadType': 'multipart'
                 },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
        });
        /*if(!callback) {
            callback = function (file) {
                //alert("保存しました。");
                console.log(file);
            };
        }*/
        request.execute(callback);

    },
/**
     * Update new file.
     *
     * @param {String} id 保存するファイル名
     * @param {String} content 保存するファイルの内容
     * @param {Function} callback Function to call when the request is complete.
     */
    updateFile : function (id,content, callback) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var contentType = 'text/plain';
        var metadata = {
                //'name': fileName,

                'mimeType': contentType,
                'description' : `${MYAPP.appinfo.name} setting file 1`,
                //'parents': ['appDataFolder'] //
        };

        var base64Data = this.utf8_to_b64(content);
        var multipartRequestBody = delimiter +
                'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' + base64Data + close_delim;

        var request = gapi.client.request({
                'path': '/upload/drive/v3/files/'+id,
                'method': 'PATCH',
                'params': {
                    'uploadType': 'multipart'
                 },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
        });
        /*if(!callback) {
            callback = function (file) {
                //alert("保存しました。");
                console.log(file);
            };
        }*/
        request.execute(callback);

    },
    // from http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
    utf8_to_b64 : function (str) {
        return window.btoa( unescape(encodeURIComponent( str )) );
    },

    handleClientLoad : function () {
        var hidinfo = ID("hid_appinfo").value.split(",");
        //console.log(hidinfo);
        gpGLD.k.ap = hidinfo[4];
        gpGLD.k.cl = hidinfo[5];
        gpGLD.k.pic_ap = hidinfo[8];
        gapi.load('client:auth2', this.initClient);
        gapi.load('picker', this.initPicker);
        
    },
    initClient : function () {
        gapi.client.init({
            apiKey: gpGLD.k.ap,
            clientId: gpGLD.k.cl,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES.join(" ")
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(gpGLD.updateSigninStatus);
    
            // Handle the initial sign-in state.
            gpGLD.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            //authorizeButton.onclick = handleAuthClick;
            //signoutButton.onclick = handleSignoutClick;
        }, function (error) {
            console.log(error);
        });
    },
    // Create and render a Picker object for searching images.
    createPicker : function (authres,usercallback) {
        if (gpGLD.is_pickerAuth && gpGLD.is_authorize) {
            var view = new google.picker.View(google.picker.ViewId.DOCS);
            view.setMimeTypes("application/json");
            var vuemode = MYAPP.commonvue.cur_sel_account.$vuetify.breakpoint;

            var picker = new google.picker.PickerBuilder();
            picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
            picker.setOAuthToken(authres.access_token);
            picker.addView(view);
            if (docCookies.hasItem(MYAPP.siteinfo.lancke)) {
                picker.setLocale(docCookies.getItem(MYAPP.siteinfo.lancke));
            }
            //picker.addViewGroup(group);
            picker.hideTitleBar();
            picker.setDeveloperKey(this.k.pic_ap);
            picker.setCallback(usercallback);
            if (vuemode.smAndDown) {
                picker.setSize(vuemode.height*0.8,vuemode.width);
                if (vuemode.xs) {
                    picker.setSize(vuemode.height,vuemode.width);
                }
            }
            var mypicker = picker.build();
            mypicker.setVisible(true);
        }
    },
    createPhotoPicker : function (authres,usercallback) {
        if (gpGLD.is_pickerAuth && gpGLD.is_authorize) {
            var group = new google.picker.ViewGroup(google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS);
            group.addView(new google.picker.PhotoAlbumsView());
            group.addView(new google.picker.ImageSearchView()
                .setLicense(google.picker.ImageSearchView.License.NONE)
            );
            
            var view = new google.picker.View(google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS);
            //view.setMimeTypes("application/json");
            var vuemode = MYAPP.commonvue.cur_sel_account.$vuetify.breakpoint;
            var picker = new google.picker.PickerBuilder();
            picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
            picker.setOAuthToken(authres.access_token);
            picker.addView(view)
            //    .addView(new google.picker.PhotoAlbumsView())
                .addView(new google.picker.ImageSearchView());
            //picker.addViewGroup(group);
            if (docCookies.hasItem(MYAPP.siteinfo.lancke)) {
                picker.setLocale(docCookies.getItem(MYAPP.siteinfo.lancke));
            }
            picker.hideTitleBar();
            picker.setDeveloperKey(this.k.pic_ap);
            picker.setCallback(usercallback);
            if (vuemode.smAndDown) {
                picker.setSize(vuemode.height*0.8,vuemode.width);
                if (vuemode.xs) {
                    picker.setSize(vuemode.height,vuemode.width);
                }
            }
            var mypicker = picker.build();
            mypicker.setVisible(true);
        }
    },
    initPicker : function () {
        gpGLD.is_pickerAuth = true;
        gpGLD.createPicker();
        ID("hid_appinfo").value = "";
    },
    pickerCallback : function (data) {  //---not use 
        var url = 'nothing';
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            var doc = data[google.picker.Response.DOCUMENTS][0];
            url = doc[google.picker.Document.URL];
            var def = new Promise(resolve=>{
                gpGLD.loadFile(doc[google.picker.Document.ID])
                .then(res=>{
                    console.log(res);
                    resolve(res);
                });
            });
        }else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
            console.log("picker canceled...");
        }
        var message = 'You picked: ' + url;
        console.log(message,data);

    },
    updateSigninStatus : function (isSignedIn) {
        if (isSignedIn) {
            gpGLD.is_authorize = true;
            if ("vue_settings" in window) vue_settings.is_gdrive_authorize = true;
            if ("vue_initial" in window) vue_initial.is_gdrive_authorize = true;
            //authorizeButton.style.display = 'none';
            //signoutButton.style.display = 'block';
            //listFiles();
        } else {
            gpGLD.is_authorize = false;
            if ("vue_settings" in window) vue_settings.is_gdrive_authorize = false;
            if ("vue_initial" in window) vue_initial.is_gdrive_authorize = false;
            //authorizeButton.style.display = 'block';
            //signoutButton.style.display = 'none';
        }
    },
    isExpired : function () {
        var expiredate = new Date(MYAPP.siteinfo.ggl.act.expires_at);
        var curdate = new Date();
        var sa = expiredate.valueOf() - curdate.valueOf();
        return (sa <= 0);

    },
    /**
     *  Sign in the user upon button click.
     */
    handleAuth: function (event) {
        return gapi.auth2.getAuthInstance().signIn();
    },

    /**
     *  Sign out the user upon button click.
     */
    handleSignout: function (event) {
        gapi.auth2.getAuthInstance().signOut();
        gpGLD.is_authorize = false;
        gpGLD.is_pickerAuth = true;
        if (vue_settings != undefined) vue_settings.is_gdrive_authorize = false;
    }

}



