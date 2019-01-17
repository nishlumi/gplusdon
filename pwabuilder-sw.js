//This is the service worker with the Cache-first network

var CACHE = "G+Don-100-20190118-01";
var precacheFiles = [
    /* Add an array of files to precache for your app */
    /*"/",
    
    "/static/css/accounts.css",
    "/static/css/index.css",
    "/static/css/toot-timeline.css",
    "/static/css/vue-index.css",
    "/static/images/app_icon.png",
    "/static/images/gp_initial_01.jpg",
    "/static/images/gp_og_image.png",
    "/static/images/gp_sensitive_image.png",
    "/static/images/QR_gplusdon.png",
    "/static/images/start_image01.jpg",
    "/static/images/start_image02.jpg",
    "/static/images/start_image03.jpg",
    "/static/images/start_image04.jpg",
    "/static/images/start_image05.jpg",
    "/static/images/start_image06.jpg",
    "/static/images/Sticker1.png",
    "/static/js/appaccount.js",
    "/static/js/appaccounts.js",
    "/static/js/appconnections.js",
    "/static/js/apphashtag.js",
    "/static/js/appinstances.js",
    "/static/js/appnotifications.js",
    "/static/js/appsearch.js",
    "/static/js/appsettings.js",
    "/static/js/apptimeline.js",
    "/static/js/appuser.js",
    "/static/js/clientclass.js",
    "/static/js/cls_accounts.js",
    "/static/js/cls_ck_inputbox.js",
    "/static/js/cls_main_add1.js",
    "/static/js/cls_main_add2.js",
    "/static/js/cls_session.js",
    "/static/js/cls_sns.js",
    "/static/js/cls_stream.js",
    "/static/js/cls_vue.js",
    "/static/js/index.js",
    "/static/js/initial.js",
    "/static/js/mixins_vue.js",
    "/static/js/util.js",
    "/static/js/vue-clientclass.js",
    "/static/js/vue-index.js",
    "/static/js/win_toot.js",
    "/static/js/wkr_sns.js",
    "/static/lib/alertify/alertify.min.js",
    "/static/lib/alertify/css/alertify.css",
    "/static/lib/alertify/css/alertify.min.css",
    "/static/lib/alertify/css/alertify.rtl.css",
    "/static/lib/alertify/css/alertify.rtl.min.css",
    "/static/lib/alertify/css/themes/bootstrap.css",
    "/static/lib/alertify/css/themes/bootstrap.min.css",
    "/static/lib/alertify/css/themes/bootstrap.rtl.css",
    "/static/lib/alertify/css/themes/bootstrap.rtl.min.css",
    "/static/lib/alertify/css/themes/default.css",
    "/static/lib/alertify/css/themes/default.min.css",
    "/static/lib/alertify/css/themes/default.rtl.css",
    "/static/lib/alertify/css/themes/default.rtl.min.css",
    "/static/lib/alertify/css/themes/semantic.css",
    "/static/lib/alertify/css/themes/semantic.min.css",
    "/static/lib/alertify/css/themes/semantic.rtl.css",
    "/static/lib/alertify/css/themes/semantic.rtl.min.css",
    "/static/lib/cke/build-config.js",
    "/static/lib/cke/ckeditor.js",
    "/static/lib/cke/config.js",
    "/static/lib/cke/contents.css",
    "/static/lib/cke/lang/en.js",
    "/static/lib/cke/lang/ja.js",
    "/static/lib/cke/plugins/about/dialogs/about.js",
    "/static/lib/cke/plugins/about/dialogs/hidpi",
    "/static/lib/cke/plugins/about/dialogs/hidpi/logo_ckeditor.png",
    "/static/lib/cke/plugins/about/dialogs/logo_ckeditor.png",
    "/static/lib/cke/plugins/autocomplete/skins/default.css",
    "/static/lib/cke/plugins/clipboard/dialogs/paste.js",
    "/static/lib/cke/plugins/dialog/dialogDefinition.js",
    "/static/lib/cke/plugins/emoji/assets/iconsall.png",
    "/static/lib/cke/plugins/emoji/assets/iconsall.svg",
    "/static/lib/cke/plugins/emoji/emoji.json",
    "/static/lib/cke/plugins/emoji/skins/default.css",
    "/static/lib/cke/plugins/emojione/.bower.json",
    "/static/lib/cke/plugins/emojione/bower.json",
    "/static/lib/cke/plugins/emojione/dialogs/emojione.js",
    "/static/lib/cke/plugins/emojione/libs/emojione/emojione.min.js",
    "/static/lib/cke/plugins/emojione/styles/emojione-awesome.css",
    "/static/lib/cke/plugins/emojione/styles/emojione.css",
    "/static/lib/cke/plugins/icons.png",
    "/static/lib/cke/plugins/icons_hidpi.png",
    "/static/lib/cke/plugins/link/dialogs/anchor.js",
    "/static/lib/cke/plugins/link/dialogs/link.js",
    "/static/lib/cke/plugins/link/images/anchor.png",
    "/static/lib/cke/plugins/link/images/hidpi/anchor.png",
    "/static/lib/cke/plugins/onchange/docs/install.html",
    "/static/lib/cke/plugins/onchange/docs/styles.css",
    "/static/lib/cke/skins/kama/dialog.css",
    "/static/lib/cke/skins/kama/dialog_ie.css",
    "/static/lib/cke/skins/kama/dialog_ie7.css",
    "/static/lib/cke/skins/kama/dialog_ie8.css",
    "/static/lib/cke/skins/kama/dialog_iequirks.css",
    "/static/lib/cke/skins/kama/editor.css",
    "/static/lib/cke/skins/kama/editor_ie.css",
    "/static/lib/cke/skins/kama/editor_ie7.css",
    "/static/lib/cke/skins/kama/editor_ie8.css",
    "/static/lib/cke/skins/kama/editor_iequirks.css",
    "/static/lib/cke/skins/kama/icons.png",
    "/static/lib/cke/skins/kama/icons_hidpi.png",
    "/static/lib/cke/skins/kama/images/dialog_sides.gif",
    "/static/lib/cke/skins/kama/images/dialog_sides.png",
    "/static/lib/cke/skins/kama/images/dialog_sides_rtl.png",
    "/static/lib/cke/skins/kama/images/mini.gif",
    "/static/lib/cke/skins/kama/images/spinner.gif",
    "/static/lib/cke/skins/kama/images/sprites.png",
    "/static/lib/cke/skins/kama/images/sprites_ie6.png",
    "/static/lib/cke/skins/kama/images/toolbar_start.gif",
    "/static/lib/cke/styles.js",
    "/static/lib/cookies.js",
    "/static/lib/highcharts",
    "/static/lib/highcharts/export-data.js",
    "/static/lib/highcharts/exporting.js",
    "/static/lib/highcharts/highcharts.js",
    "/static/lib/highcharts/series-label.js",
    "/static/lib/jquery.min.js",
    "/static/lib/jtimeago/jquery.timeago.js",
    "/static/lib/jtimeago/locales/jquery.timeago.af.js",
    "/static/lib/jtimeago/locales/jquery.timeago.am.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ar.js",
    "/static/lib/jtimeago/locales/jquery.timeago.az-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.az.js",
    "/static/lib/jtimeago/locales/jquery.timeago.be.js",
    "/static/lib/jtimeago/locales/jquery.timeago.bg.js",
    "/static/lib/jtimeago/locales/jquery.timeago.bs.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ca.js",
    "/static/lib/jtimeago/locales/jquery.timeago.cs.js",
    "/static/lib/jtimeago/locales/jquery.timeago.cy.js",
    "/static/lib/jtimeago/locales/jquery.timeago.da.js",
    "/static/lib/jtimeago/locales/jquery.timeago.de-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.de.js",
    "/static/lib/jtimeago/locales/jquery.timeago.dv.js",
    "/static/lib/jtimeago/locales/jquery.timeago.el.js",
    "/static/lib/jtimeago/locales/jquery.timeago.en-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.en.js",
    "/static/lib/jtimeago/locales/jquery.timeago.es-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.es.js",
    "/static/lib/jtimeago/locales/jquery.timeago.et.js",
    "/static/lib/jtimeago/locales/jquery.timeago.eu.js",
    "/static/lib/jtimeago/locales/jquery.timeago.fa-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.fa.js",
    "/static/lib/jtimeago/locales/jquery.timeago.fi.js",
    "/static/lib/jtimeago/locales/jquery.timeago.fr-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.fr.js",
    "/static/lib/jtimeago/locales/jquery.timeago.gl.js",
    "/static/lib/jtimeago/locales/jquery.timeago.he.js",
    "/static/lib/jtimeago/locales/jquery.timeago.hr.js",
    "/static/lib/jtimeago/locales/jquery.timeago.hu.js",
    "/static/lib/jtimeago/locales/jquery.timeago.hy.js",
    "/static/lib/jtimeago/locales/jquery.timeago.id.js",
    "/static/lib/jtimeago/locales/jquery.timeago.is.js",
    "/static/lib/jtimeago/locales/jquery.timeago.it-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.it.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ja.js",
    "/static/lib/jtimeago/locales/jquery.timeago.jv.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ko.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ky.js",
    "/static/lib/jtimeago/locales/jquery.timeago.lt.js",
    "/static/lib/jtimeago/locales/jquery.timeago.lv.js",
    "/static/lib/jtimeago/locales/jquery.timeago.mk.js",
    "/static/lib/jtimeago/locales/jquery.timeago.nl.js",
    "/static/lib/jtimeago/locales/jquery.timeago.no.js",
    "/static/lib/jtimeago/locales/jquery.timeago.pl.js",
    "/static/lib/jtimeago/locales/jquery.timeago.pt-br-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.pt-br.js",
    "/static/lib/jtimeago/locales/jquery.timeago.pt-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.pt.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ro.js",
    "/static/lib/jtimeago/locales/jquery.timeago.rs.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ru.js",
    "/static/lib/jtimeago/locales/jquery.timeago.rw.js",
    "/static/lib/jtimeago/locales/jquery.timeago.si.js",
    "/static/lib/jtimeago/locales/jquery.timeago.sk.js",
    "/static/lib/jtimeago/locales/jquery.timeago.sl.js",
    "/static/lib/jtimeago/locales/jquery.timeago.sq.js",
    "/static/lib/jtimeago/locales/jquery.timeago.sr.js",
    "/static/lib/jtimeago/locales/jquery.timeago.sv.js",
    "/static/lib/jtimeago/locales/jquery.timeago.th.js",
    "/static/lib/jtimeago/locales/jquery.timeago.tr-short.js",
    "/static/lib/jtimeago/locales/jquery.timeago.tr.js",
    "/static/lib/jtimeago/locales/jquery.timeago.uk.js",
    "/static/lib/jtimeago/locales/jquery.timeago.ur.js",
    "/static/lib/jtimeago/locales/jquery.timeago.uz.js",
    "/static/lib/jtimeago/locales/jquery.timeago.vi.js",
    "/static/lib/jtimeago/locales/jquery.timeago.zh-CN.js",
    "/static/lib/jtimeago/locales/jquery.timeago.zh-TW.js",
    "/static/lib/mastodon-text.js",
    "/static/lib/mastodon.js",
    "/static/lib/materialize/css/materialize-user.css",
    "/static/lib/materialize/js/materialize.js",
    "/static/lib/materialize/js/materialize.min.js",
    "/static/lib/paste.js",
    "/static/lib/vue-carousel.min.js",
    "/static/res/manifest.json",
    "/static/res/res_template_replyinput.js",
    "/static/res/res_template_tootbody.js",
    "/static/res/res_template_tootgallery-cal.js",
    "/static/res/res_template_userpop.js",
    "/static/strings/en.json",
    "/static/strings/ja.json"*/
];
//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener("install", function(evt) {
    console.log("[PWA Builder] The service worker is being installed.");
    evt.waitUntil(
        precache().then(function() {
            console.log("[PWA Builder] Skip waiting on install");
            return self.skipWaiting();
        })
    );
});

//allow sw to control of current page
self.addEventListener("activate", function(evt) {
    console.log("[PWA Builder] Claiming clients for current page");
    //return self.clients.claim();
    var cacheWhitelist = [CACHE];

    evt.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // ホワイトリストにないキャッシュ(古いキャッシュ)は削除する
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", function(evt) {
    //console.log("[PWA Builder] The service worker is serving the asset.",evt.request.url);
    evt.respondWith(
        caches.match(evt.request)
        .then((response) => {
            if (response) {
                return response;
            }
    
            // 重要：リクエストを clone する。リクエストは Stream なので
            // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
            // 必要なので、リクエストは clone しないといけない
            let fetchRequest = evt.request.clone();
    
            return fetch(fetchRequest)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
        
                // 重要：レスポンスを clone する。レスポンスは Stream で
                // ブラウザ用とキャッシュ用の2回必要。なので clone して
                // 2つの Stream があるようにする
                let responseToCache = response.clone();
        
                caches.open(CACHE)
                    .then((cache) => {
                        cache.put(evt.request, responseToCache);
                    });
        
                return response;
            });
        })
    );
});
self.addEventListener("push", function(event) {
    console.log("Received a push message", event, event.data.json());
    var js = event.data.json();

    event.waitUntil(
        self.registration.showNotification(js.title, {
            body: js.body,
            icon: js.icon,
        })
    );
});
self.addEventListener("notificationclick",
    function(event) {
        console.log("n click=",event);
        event.notification.close();
        clients.openWindow("/notifications");
    },
    false
);

function precache() {
    return caches.open(CACHE).then(function(cache) {
        return cache.addAll(precacheFiles);
    });
}

function fromCache(request) {
    //we pull files from the cache first thing so we can show them fast
    return caches.open(CACHE).then(function(cache) {
        return cache.match(request).then(function(matching) {
            return matching || Promise.reject("no-match");
        });
    });
}

function update(request) {
    //this is where we call the server to get the newest version of the
    //file to use the next time we show view
    return caches.open(CACHE).then(function(cache) {
        return fetch(request).then(function(response) {
            return cache.put(request, response);
        });
    });
}

function fromServer(request) {
    //this is the fallback if it is not in the cache to go to the server and get it
    return fetch(request).then(function(response) {
        return response;
    });
}
