var MYAPP;
var vue_initial;

function btn_reg_account_clicked(e) {
    MYAPP.acman.addInstance(this.initial_instance);

/*
    console.log(ID("txt_initial_instance").value);
    MYAPP.acman.addInstance(ID("txt_initial_instance").value);
    */
}
document.addEventListener('DOMContentLoaded', function () {
    console.log("2");

    
});
(function () {
    MYAPP = new Gplusdon();
    console.log("1");

    vue_initial = new Vue({
        el : "#initialpanel",
        delimiters : ["{?","?}"],
        data()  {
            return {
                is_use : false,
                initial_instance : "",
                is_gdrive_authorize : false,
                available_languages : [],
                langvalue : {"name":"日本語","code":"ja"},
            }
        },
        created() {
        },
        beforeMount() {
            if (MYAPP.session.config.application.skip_startpage) {
                location.replace("/tl");
            }
            
        },
        mounted() {
            //this.is_gdrive_authorize = gpGLD.is_authorize;
            this.available_languages = JSON.parse(ID("hid_avalangs").value);
        },
        methods : {
            btn_reg_account_clicked : btn_reg_account_clicked,
            onclick_authorize_drive_btn : function (e) {
                gpGLD.handleAuth()
                .then(flag=>{
                    //---count config file in google drive
                    gpGLD.loadFromFolder()
                    .then(files=>{
                        var ret = null;
                        for (var i = 0; i < files.length; i++) {
                            if (gpGLD.setname == files[i].name) {
                                ret = files[i];
                            }
                        }
                        return ret;
                    })
                    .then(file=>{
                        if (file) {
                            //---load config from google drive
                            return gpGLD.loadFile(file.id)
                            .then(result=>{
                                localStorage.removeItem(MYAPP.acman.setting.INSTANCEEMOJI);
                                localStorage.setItem(MYAPP.acman.setting.NAME,result.body);
                                return result.result;
                            });
                        }
                    })
                    .finally(()=>{
                        alertify.message(_T("msg_login_service",["Google"]));
                    });
                });
            },
            onclick_clearcache_btn : function(e) {
                navigator.serviceWorker.getRegistration()
                .then(registration => {
                    registration.unregister();
                });
                caches.keys().then(function(keys) {
                    var promises = [];
                    // clear all cache
                    keys.forEach(function(cacheName) {
                        if (cacheName) {
                            promises.push(caches.delete(cacheName));
                        }
                    });
                });
            },
            onclick_applyLang : function (e) {
                docCookies.setItem(MYAPP.siteinfo.lancke,e.code);
                var msg = _T("msg_lang_reloadplease");
                appAlert(msg,()=>{
                    this.onclick_clearcache_btn();
                });
            }
        }
    });

    console.log(location.search);
    //ID("btn_reg_account").addEventListener("click", btn_reg_account_clicked, false);
    /*ID("txt_initial_instance").addEventListener("keydown", function (e) {
        //console.log(e.keyCode);
        if ((e.keyCode == 13) ) {
            btn_reg_account_clicked();
        }
    });*/
    var search = location.search.replace("?","");
    if (search != "") {
        var ret = MUtility.extractPathParams(search);
        if ("in" in ret) {
            MYAPP.acman.addInstance(ret["in"]);
        }
    }
    MYAPP.acman.load().then(function (data) {
        vue_initial.is_use = true;
        MYAPP.acman.loadEmoji();
    }, function (flag) {
    });

})();
