/*
	evt.data format
	{
        account : Account data,
        endpoint : API name to call
        options : API and APP options
	}
*/
onmessage = function (evt){
    importScripts(
        //"/static/lib/jquery.min.js",
        "/static/lib/mastodon.js",
        "/static/js/cls_accounts.js",
        "/static/js/cls_sns.js"
    );
    
    let account = evt.data.account;
    let endpoint = evt.data.endpoint;
    var options = evt.data.options;

    console.log("evt=",evt);

    var ac = new Account();
    
    ac.api = new MastodonAPI({
        instance: account.url,
        api_user_token: account.token
    });
    let sns = new Gpsns();
    sns.setAccount(ac);

    var ret = {
        "cd" : 0,
        "msg" : "",
        "data" : null,
    };
    options.app["fetch"] = true;
    
    sns.getTimeline(endpoint,options)
    .then((data)=>{
        ret.data = data;
        postMessage(ret);
        
    })
    .catch((error)=>{
        ret.cd = "9";
        ret.msg = error;
    })
    .finally(()=>{
        
    });

}