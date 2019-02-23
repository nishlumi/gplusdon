var MYAPP;
var vue_instances;
var chart_json = {
    chart: {
        type: 'area'
    },
    title: {
        text: 'activity'
    },
    tooltip: {
        pointFormat: `
            <span style="color:{series.color}">{series.name}</span>: 
            <b>{point.y}</b><br/>
        `,
        split: true
    },
    xAxis: {
        categories: [],
        tickmarkPlacement: 'on',
        title: {
            enabled: false
        }
    },
    yAxis: {
        title: {
            text: ''
        }
    },
    plotOptions: {
        area: {
            //stacking: 'percent',
            lineColor: '#ffffff',
            lineWidth: 1,
            marker: {
                lineWidth: 1,
                lineColor: '#ffffff'
            }
        }
    },
    series: [{
        name: 'statuses',
        data: []
    }, {
        name: 'logins',
        data: []
    }, {
        name: 'registration',
        data: []
    }]
};

function parentCommonSearch() {
    vue_instances.search.onsubmit_search(ID("inp_search").value);
}
function extract_searchOption(text) {
    var arr = text.split(/\s/g);
    var options = {
        app : {},
        api : {}
    };
    var retapi = {}, retapp = {};
    for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        if (t.indexOf("lang:") == 0) {
            retapp["language"] = t.replace("lang:","");
        }else if (t.indexOf("cnt:") == 0) {
            var v = t.replace("cnt:","");
            if (!isNaN(parseInt(v))) {
                retapp["count"] = Number(v);
            }
        }else if (t.indexOf("down:") == 0) {
            retapp["include_down"] = true;
        }else if (t.indexOf("dead:") == 0) {
            retapp["include_dead"] = true;
        }else if (t.indexOf("cate:") == 0) {
            var v = t.replace("cate:","");
            retapp["category"] = v;
        }else if (t.indexOf("ord.asc:") == 0) {
            var v = t.replace("ord.asc:","");
            retapp["sort_by"] = v;
            retapp["sort_order"] = "asc";
        }else if (t.indexOf("ord.desc:") == 0) {
            var v = t.replace("ord.desc:","");
            retapp["sort_by"] = v;
            retapp["sort_order"] = "desc";
        }else if (t.indexOf("mver:") == 0) {
            var v = t.replace("mver:","");
            retapp["min_version"] = v;
        }else if (t.indexOf("mactive:") == 0) {
            var v = t.replace("mactive:","");
            retapp["min_active_users"] = v;
        }else if (t.indexOf("user_ge:") == 0) {
            var v = t.replace("user_ge:","");
            if (!isNaN(parseInt(v))) {
                retapp["user_ge"] = Number(v);
            }
        }else if (t.indexOf("user_le:") == 0) {
            var v = t.replace("user_le:","");
            if (!isNaN(parseInt(v))) {
                retapp["user_le"] = Number(v);
            }
        }else if (t.indexOf("score_ge") == 0) {
            var v = t.replace("score_ge","");
            if (!isNaN(parseInt(v))) {
                retapp["score_ge"] = Number(v);
            }
        }else if (t.indexOf("score_le") == 0) {
            var v = t.replace("score_le","");
            if (!isNaN(parseInt(v))) {
                retapp["score_le"] = Number(v);
            }
        }else if (t.indexOf("name:") == 0) {
            retapi["name"] = t.replace("name:","");
        }else{
            retapi["name"] = t;
        }
    }
    options.api = retapp;
    options.app = retapi;
    return options;
}
function onsubmit_search(text) {
    var cond = text; //ID("txt_instance").value;
    if (cond == "") return false;
    MUtility.loadingON();
    var findopt = this.extract_searchOption(cond);
    
    MYAPP.sns.getInstancePeers(findopt)
    .then((result)=>{
        console.log("condition=",findopt);
        console.log(result);
        var data = result;
        this.resulturis.splice(0,this.resulturis.length);
        var ret = [];
        const LIMIT = MYAPP.appinfo.config.limit_search_instance;
        var addcnt = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].indexOf(cond) > -1) {
                ret.push(data[i]);
                //getInstanceInfo(vue_instances.search,data[i]);
                console.log(i, LIMIT, data[i]);
                if (addcnt < LIMIT) {
                    MYAPP.sns.showInstanceInfo({
                        api : { name : data[i]}
                    }).then((result2)=>{
                        if ((Number(result2.data.statuses) == 0) &&
                            (Number(result2.data.users) == 0) &&
                            (Number(result2.data.connections) == 0) &&
                            (Number(result2.data.up) == false)
                        ){

                        }else{
                            //---add instance.social data
                            this.resulturis.push(result2.data);
                            addcnt++;
                        }
                    })
                    .catch((error)=>{
                        console.log("error: not found [",error.options.api.name,"]");
                        console.log(error.xhr);
                        //---add each instance own data
                        this.resulturis.push({
                            "name" : error.options.api.name,
                            "id" : error.options.api.name,
                            "obs_rank" : "-",
                        });
                        addcnt++;
                    });
                }else{
                    console.log(`instances.socialに参照する限界を超えました。${LIMIT}件以上のデータは読み込みません。件数を減らして再実行してください。`);
                }
                
            }
        }
        //console.log(ret,ret.length);
        MUtility.loadingOFF();
    });
}
function load_instance(type,instance) {
    MUtility.loadingON();
    console.log(instance);
    MYAPP.sns.getInstanceInfo(instance)
    .then((data)=>{
        this.selected = data;
        if (type != "initial") {
            var basedata = this.getResultItem(type,instance);
            console.log("basedata=",basedata);
            this.selected_base = basedata;
        }

        var inst = MUtility.getInstanceFromAccount(this.selected.contact_account.url);
        var tmpname = this.selected.contact_account.display_name == "" ? this.selected.contact_account.username : this.selected.contact_account.display_name;
        tmpname = MUtility.replaceEmoji(tmpname,inst,this.selected.contact_account.emojis,18);
        this.selected.contact_account.display_name = tmpname;
        if (!("header" in this.selected.contact_account)) {
            this.selected.contact_account["header"] = "";
        }
        this.selected.contact_account["instance"] = inst;
        
        if (MUtility.checkRootpath(location.pathname,"server") == -1) {
            MUtility.returnPathToList("server");
        }
        MUtility.enterPathInDetail(location.pathname,instance);
        if (data["contact_account"]) {
            this.exists_contact_account = true;
        }else{
            this.exists_contact_account = false;
        }
        this.is_selected = true;
        /*this.translation = {
            stat_statuses : _T("stat_statuses"),
            stat_following : _T("stat_following"),
            stat_follower : _T("stat_follower"),
        };*/
        if (data.activity.length > 0) {
            var weeks = [];
            var statuses = [];
            var logins = [];
            var registrations = [];
            for (var i = data.activity.length-1; i >= 0; i--) {
                data.activity[i].week = new Date(Number(data.activity[i].week) * 1000);
                weeks.push(data.activity[i].week.toLocaleDateString());
                statuses.push(Number(data.activity[i].statuses));
                logins.push(Number(data.activity[i].logins));
                registrations.push(Number(data.activity[i].registrations));
            }
            chart_json.title.text = _T("stat_weekly_activity",[this.selected.uri]);
            chart_json.xAxis.categories = weeks;
            chart_json.series[0].name = _T("stat_allstatuses");
            chart_json.series[0].data = statuses;
            chart_json.series[1].name = _T("stat_login");
            chart_json.series[1].data = logins;
            chart_json.series[2].name = _T("stat_registration");
            chart_json.series[2].data = registrations;
            console.log(chart_json,ID("act_chart"));
            this.$nextTick(function(){
                Highcharts.chart('act_chart',chart_json);
            });
        }
        
        MUtility.loadingOFF();
    })
    .catch((res)=>{
        console.log("error:",res);
        appAlert(instance+"に接続できませんでした。");
        
        MUtility.loadingOFF();
    });
}
function onclick_chip(e) {
    console.log(e);
    if (e.target) {
        if (e.target.classList.contains("type-random")) {
            this.load_instanceinfo_base("random",e.target.textContent);
        }else if (e.target.classList.contains("type-search")) {
            this.load_instanceinfo_base("search",e.target.textContent);
        }
        
    }
}
function load_random_instance(){
    MYAPP.sns.getRandomInstances({})
    .then((result)=>{
        for (var i = 0; i < result.instances.length; i++) {
            var inst = result.instances[i];
            if ((Number(inst.up) == false)
            ){

            }else{
                this.randomInstance.push(inst);
            }
            
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("2");
    //ID("lm_instances").classList.add("active");
    //ID("sm_instances").classList.add("active");
    MYAPP.showPostCtrl(false);
    MYAPP.showBottomCtrl(true);

    MYAPP.setupCommonElement();
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    vue_instances = {
        "search" : new Vue({
            el : "#search",
            mixins : [vue_mixin_base],
            delimiters : ["{?","?}"],
            data : {
                resulturis : [],
                randomInstance : [],
                is_selected : false,
                exists_contact_account : true,
                //translation : {},
                selected : {},
                selected_base : {},
                globalInfo : {}
            },
            methods: {
                load_instanceinfo_base : load_instance,
                load_random_instance : load_random_instance,
                onsubmit_search : onsubmit_search,
                onclick_chip : onclick_chip,
                extract_searchOption : extract_searchOption,
                /**
                 * 
                 * @param {string} type "random" - random instance, "search" - search instance
                 * @param {string} name instance name
                 */
                getResultItem : function (type,name) {
                    if (type == "search") {
                        for (var i = 0; i < this.resulturis.length; i++) {
                            if (name == this.resulturis[i].name) {
                                return this.resulturis[i];
                            }
                        }
                    }else if (type == "random") {
                        for (var i = 0; i < this.randomInstance.length; i++) {
                            if (name == this.randomInstance[i].name) {
                                return this.randomInstance[i];
                            }
                        }
                    }
                    return null;
                }
            }
        })
    };

    ID("area_instance").addEventListener("scroll",function(e){
        //console.log(e);
        var sa = e.target.scrollHeight - e.target.clientHeight;
        var fnlsa = sa - Math.round(e.target.scrollTop);

        if (fnlsa < 10) {
            //---page max scroll down
            console.log("scroll down max");
        }
        if (e.target.scrollTop == 0) {
            //---page max scroll up
            console.log("scroll up max");
        }
        MYAPP.commonvue.bottomnav.checkScroll(fnlsa);

    });

    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        //MYAPP.acman.checkVerify();
        MYAPP.checkSession();
        //MYAPP.sns.setAccount(MYAPP.session.status.showingAccount.data);

        vue_instances.search.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        //---account load
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });

        MYAPP.session.status.currentLocation = location.pathname;
        
        if (!ac) ac = data[0];
        MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        loadIAPI()
        .then(flag=>{
            vue_instances.search.load_random_instance();
            //---if already exists hid_instance, show instance information
            if (ID("hid_instance").value != "") {
                MYAPP.sns.showInstanceInfo({
                    api : {
                        name : ID("hid_instance").value
                    }
                }).then(result => {
                    vue_instances.search.selected_base = result.data;
                    vue_instances.search.load_instanceinfo_base("initial",ID("hid_instance").value);
                });
            }
        });


    }, function (flag) {
        /*appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/start";
            window.location.replace(newurl);
        });*/
        //=== can use, if no logined===
        //---if already exists hid_instance, show instance information
        loadIAPI()
        .then(flag=>{
            vue_instances.search.load_random_instance();
            //---if already exists hid_instance, show instance information
            if (ID("hid_instance").value != "") {
                MYAPP.sns.showInstanceInfo({
                    api : {
                        name : ID("hid_instance").value
                    }
                }).then(result => {
                    vue_instances.search.selected_base = result.data;
                    vue_instances.search.load_instanceinfo_base("initial",ID("hid_instance").value);
                });
            }
        });
    });

})();
