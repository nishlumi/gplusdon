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
    is_authorize : false,
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

    //sample from: https://qiita.com/kjunichi/items/552f13b48685021966e4
    /**
     * Print files.
    */
    loadFile : function (id) {
        var def = new Promise((resolve,reject)=>{
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
        gapi.load('client:auth2', this.initClient);
        
    },
    initClient : function () {
        var hidinfo = ID("hid_appinfo").value.split(",");
        var API_KEY = hidinfo[4]; //MYAPP.siteinfo.ggl.ak;
        var CLIENT_ID = hidinfo[5]; //MYAPP.siteinfo.ggl.ci;

        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES.join(" ")
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(gpGLD.updateSigninStatus);
    
            // Handle the initial sign-in state.
            gpGLD.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            //authorizeButton.onclick = handleAuthClick;
            //signoutButton.onclick = handleSignoutClick;
            ID("hid_appinfo").value = "";
        }, function (error) {
            console.log(error);
        });
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
        if (vue_settings != undefined) vue_settings.is_gdrive_authorize = false;
    }

}



