//This is the service worker with the Cache-first network

//Add this below content to your HTML page, or add the js file to your page at the very top to register service worker
if (navigator.serviceWorker.controller) {
    console.log(
        "[PWA Builder] active service worker found, no need to register"
    );
} else {
    //Register the ServiceWorker
    navigator.serviceWorker
        .register("pwabuilder-sw.js", {
            scope: "./"
        })
        .then(function(reg) {
            console.log(
                "Service worker has been registered for scope:" + reg.scope
            );
        });
}

Notification.requestPermission().then(permission => {
    switch (permission) {
        case "granted":
            // 許可された場合
            console.log("notification permission OK");
            break;
        case "denied":
            // ブロックされた場合
            console.log("notification permission NG...");
            break;
        case "default":
            // 無視された場合
            console.log("notification permission nothing. re-challenge");
            break;
        default:
            break;
    }
});
function encodeBase64(buffer) {
    return window
        .btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
function decodeBase64(string) {
    return new Uint8Array(
        [].map.call(
            window.atob(
                (string + "=".repeat((4 - (string.length % 4)) % 4))
                    .replace(/\-/g, "+")
                    .replace(/_/g, "/")
            ),
            function(c) {
                return c.charCodeAt(0);
            }
        )
    );
}

navigator.serviceWorker.ready.then(function(registration) {
    registration.pushManager
        .subscribe({
            userVisibleOnly: true,
            applicationServerKey: decodeBase64(document.head.querySelector("meta[name='applicationServerKey']").content)
        })
        .then(function(subscription) {
            var endpoint = subscription.endpoint;
            var publicKey = encodeBase64(subscription.getKey("p256dh"));
            var authSecret = encodeBase64(subscription.getKey("auth"));

            sessionStorage.setItem("wp_endpoint",endpoint);
            sessionStorage.setItem("wp_publickey",publicKey);
            sessionStorage.setItem("wp_authsecret",authSecret);
            console.log("registration.pushManager=",endpoint,publicKey,authSecret);
            /*var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open(
                "POST",
                "https://インスタンス名/api/v1/push/subscription?access_token=アクセストークン"
            );
            xmlHttpRequest.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded; charset=UTF-8"
            );
            xmlHttpRequest.send(
                "subscription[endpoint]=" +
                    endpoint +
                    "&subscription[keys][p256dh]=" +
                    publicKey +
                    "&subscription[keys][auth]=" +
                    authSecret +
                    "&data[alerts][follow]=true&data[alerts][favourite]=true" +
                    "&data[alerts][reblog]=true&data[alerts][mention]=true"
            );*/
        });
});
