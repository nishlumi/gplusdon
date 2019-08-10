var packagejson = require('../package.json');

var sysconst = {
    server_token: function () {
        return "FQOBCaZyaA5PC0Tx0QyPjjboGL8qm5dpULnhzUCFDc8q8i1eD2I9Dq4S2NM6GpMVgMrfUF1o8fCBfkt5cUAGjCY2XPwQj2fbGGqFXM02IFIQuSbcbZdNcfE7jxXZ4Zkw";
    },
    server_mastodon_cloud: function (type) {
        if (type == 0) { //---mastodon.cloud
            return "4120a614b712c302ed87d9426a31c63ec0ddf0438c9da0b226404341313a01bd";
        }else if(type == 1) {
            return "a118d8b3aaa8582deea9a617336dc458bc30c17f9704163a2c56f757a78be5ce";
        }
    },
    vap_id: function () {
        return "BCGiOKTrNfAFmIPybyacC2UcM2y9zJlDCtacpZoX44U4QjkY1HtaLla0leTn5HWXUevOrSFwb3xunrHHffdPaek=";
    },
    yh_id: "dj00aiZpPU5XTlBsejNzTEdRayZzPWNvbnN1bWVyc2VjcmV0Jng9MmQ-",
    mab_id: "pk.eyJ1Ijoia2VtaWthbXBvIiwiYSI6ImNqcm5ldnhqMjBzZnU0M3V1ZGhlZGFvNHUifQ.lyMRD6teP7N6Iw4T1H5Aeg",
    package_info: packagejson,
    gdrive: {
        "web": {
            "api_key": 'AIzaSyD_aIoxUlbrEKnuA_PFMLXEKZpIIZBxU-E',
            "picker_api_key": "AIzaSyAIupeXvWgv7R8I8HxlhOVg6Liq1eyeK2o",
            "place_api_key": "AIzaSyBHu1tNzOJp1R5qaP8SNiItQig5iIq5gC4",
            "photo_api_key" : "AIzaSyD_L7NRTDfgRtyAQthyfhhAuBvHzpwx3dg",
            "client_id": "381240031419-oi971gq2cq6jd4o446o6lvothhesdp84.apps.googleusercontent.com",
            "project_id": "gplus-mastodon-webclient",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": "PDp9SXyLAUFDUpKCiAvvw8yx",
            "javascript_origins": ["http://localhost:1337", "http://localhost:3000", "https://gplusdon.net", "https://gplusdon.azurewebsites.net", "https://gpdontest.azurewebsites.net"]
        }
    }
};

module.exports = sysconst;