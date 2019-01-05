var MYAPP;
var vue_connections = {};
var thisform = {}

function parentCommonSearch() {
    vue_connections.search.load_search(ID("inp_search").value,{
        api : {},
        app : {}
    });
}
function load_suggestion(options) {
    console.log("suggestions");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.normalGet("suggestions",options)
    .then((result)=>{
        console.log("suggestions",result);
        if (result.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        this.accounts.splice(0,this.accounts.length);
        for (var i = 0; i < result.length; i++) {
            var tmp = GEN("a");
            tmp.href = result[i].url;
            result[i]["instance"] = tmp.hostname;
            //this.accounts.push(result[i]);
        }
        return result;        
    })
    .then(result2=>{
        console.log("before data=",result2.data);
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        return MYAPP.sns.getRelationship(users)
        .then(result3=>{
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result3.data.length; i++) {
                    if (datum.id == result3.data[i].id) {
                        datum["relationship"] = result3.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            console.log("after data=",result2.data);
            this.generate_account_detail(result2,options);
        });
    })
    .catch((xhr,status)=>{
        MUtility.loadingOFF();
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
function load_search(findtext,options) {
    console.log("getUserSearch");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getUserSearch(findtext,options)
    .then((result)=>{
        console.log("getUserSearch",result);
        if (result.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        this.accounts.splice(0,this.accounts.length);
        /*for (var i = 0; i < result.data.length; i++) {
            this.accounts.push( result.data[i]);
        }*/
        return result;
    })
    .then(result2=>{
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        return MYAPP.sns.getRelationship(users)
        .then(result3=>{
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result3.data.length; i++) {
                    if (datum.id == result3.data[i].id) {
                        datum["relationship"] = result3.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            this.generate_account_detail(result2,options);
        });
    })
    .catch((xhr,status)=>{
        MUtility.loadingOFF();
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });
}

function load_following(options) {
    console.log("getFollowing");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getFollowing("me",options)
    .then((result)=>{
        console.log("getFollowing",result,result.data.length);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        vue_connections.tabbar.following_count = result.data.length;

        return result;
    })
    .then(result2=>{
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        console.log("following users=",users);
        return MYAPP.sns.getRelationship(users)
        .then(result3=>{
            //---get the users relationship
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result3.data.length; i++) {
                    if (datum.id == result3.data[i].id) {
                        datum["relationship"] = result3.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            return result2;
            
        })
        .then(result4 => {
            this.generate_account_detail(result4,options);
            var pros = [];
            //---get the list, what the user belog to
            for (var i = 0; i < result4.data.length; i++) {
                pros.push(MYAPP.sns.getListOf(result4.data[i].id,{api:{},app:{}})
                .then(listresult=>{
                    return {
                        userid : listresult.userid,
                        lists : listresult.data
                    };
                }));
            }
            Promise.all(pros)
            .then(values => {
                for (var i = 0; i < result4.data.length; i++) {
                    var ac = result4.data[i];
                    for (var v = 0; v < values.length; v++) {
                        if (ac.id == values[v].userid) {
                            ac["lists"] = values[v].lists;
                        }
                    }
                }
                
            });
            
        });
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
function load_follower(options){
    console.log("getFollower");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getFollower("me",options)
    .then((result)=>{
        console.log("getFollower",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        vue_connections.tabbar.follower_count = result.data.length;
        
        return result;
    })
    .then(result2=>{
        var users = [];
        for (var i = 0; i < result2.data.length; i++) {
            users.push(result2.data[i].id);
        }
        console.log("follower users=",users);
        return MYAPP.sns.getRelationship(users)
        .then(result=>{
            for (var d = 0; d < result2.data.length; d++) {
                var datum = result2.data[d];
                for (var i = 0; i < result.data.length; i++) {
                    if (datum.id == result.data[i].id) {
                        datum["relationship"] = result.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            console.log("follower data=",result2.data);
            this.generate_account_detail(result2,options);
        });
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
function load_listmember(id,options) {
    console.log("getListMembers");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getListMembers(id,options)
    .then((result)=>{
        console.log("getListMembers",result,result.data.length);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        return result.data;
    })
    .then(data=>{
        var users = [];
        for (var i = 0; i < data.length; i++) {
            users.push(data[i].id);
        }
        console.log("list members=",users);
        return MYAPP.sns.getRelationship(users)
        .then(result=>{
            //---get the users relationship
            for (var d = 0; d < data.length; d++) {
                var datum = data[d];
                for (var i = 0; i < result.data.length; i++) {
                    if (datum.id == result.data[i].id) {
                        datum["relationship"] = result.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            this.generate_account_detail(data,options);
            
        })
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}
function load_followRequest(options){
    console.log("getFollowRequest");
    if (this.is_asyncing) return false;

    MUtility.loadingON();
    this.is_asyncing = true;
    MYAPP.sns.getFollowRequest(options)
    .then((result)=>{
        console.log("getFollowRequest",result);
        if (result.data.length == 0) {
            MUtility.loadingOFF();
            return;
        }
        vue_connections.tabbar.followRequest_count = result.data.length;
        
        return result.data;
    })
    .then(data=>{
        var users = [];
        for (var i = 0; i < data.length; i++) {
            users.push(data[i].id);
        }
        console.log("follow request users=",users);
        return MYAPP.sns.getRelationship(users)
        .then(result=>{
            for (var d = 0; d < data.length; d++) {
                var datum = data[d];
                for (var i = 0; i < result.data.length; i++) {
                    if (datum.id == result.data[i].id) {
                        datum["relationship"] = result.data[i];
                        datum["lists"] = [];
                        break;
                    }
                }
            }
            console.log("follower data=",data);
            this.generate_account_detail(data,options);
        });
    })
    .catch((xhr,status)=>{
        console.log(xhr,status);
    })
    .finally(()=>{
        MUtility.loadingOFF();
        this.is_asyncing = false;
    });

}


document.addEventListener('DOMContentLoaded', function() {
    console.log("2");

    //ID("lm_connections").classList.add("active");
    //ID("sm_connections").classList.add("active");

    MYAPP.setupCommonElement();
    ID("nav_sel_account").addEventListener("change",function(e){
        var a = Q(".tab.col a.active");
        if (a.href = "#following") {
            vue_connections.following.accounts.splice(0,vue_connections.following.accounts.length);
            vue_connections.following.load_following({});
        }else if (a.href = "#follower") {
            vue_connections.follower.accounts.splice(0,vue_connections.follower.accounts.length);
            vue_connections.follower.load_follower({});
        }
    });
});
(function(){
    MYAPP = new Gplusdon();
    console.log("1");

    vue_connections = {
        "tabbar" : new Vue({
            el : "#tabbar",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data : {
                currentTab : "",
                following_count : 0,
                follower_count : 0,
                followRequest_count : 0,
                locked : false
            },
            methods : {
                load_tabStates : function (ac) {
                    this.following_count = ac.rawdata.following_count;
                    this.follower_count = ac.rawdata.followers_count;
            
                    this.locked = ac.rawdata.locked;
                    if (ac.rawdata.locked) {
                        MYAPP.sns.getFollowRequest({api:{},app:{}})
                        .then((result)=>{
                            console.log("getFollowRequest",result);
                            if (result.data.length == 0) {
                                MUtility.loadingOFF();
                                return;
                            }
                            this.followRequest_count = result.data.length;
            
                        });
                    }
            
                }
            }
        }),
        "suggestion" : new Vue({
            el : "#suggestion",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "selectable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {}
                }
            },
            methods : {
                load_suggestion : load_suggestion,
            }
        }),
        "search" : new Vue({
            el : "#search",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "selectable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {}
                }
            },
            methods : {
                load_search : load_search
            }
        }),
        "list" : new Vue({
            el : "#list",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "selectable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {},
                    current_list : "0",
                    lists : [
                        {text:"---",value:"0"}
                    ],
                    selectedAccount : [],
                }
            },
            mounted() {
                M.FormSelect.init(document.querySelectorAll('select'), {});
            },
            watch : {
                current_list : function (val) {
                    if (val == "0") return;
                    this.accounts.splice(0,this.accounts.length);
                    MYAPP.setGeneralTitle(_T("list")+":"+this.getList(val).title);
                    this.load_listmember(val,{api:{},app:{}});
                }
            },
            methods: {
                load_listmember : load_listmember,
                getList : function (id) {
                    var ret = null;
                    for (var i = 0; i < this.lists.length; i++) {
                        if (id == this.lists[i].value) {
                            ret = {
                                id : this.lists[i].value,
                                title : this.lists[i].text
                            };
                            break;
                        }
                    }
                    return ret;
                },
                onscroll_tab : function(e){
                    var sa = e.target.scrollHeight - e.target.clientHeight;
                    var fnlsa = sa - Math.round(e.target.scrollTop);
                    if (fnlsa < 10) {
                        //---page max scroll down
                        console.log("scroll down max");
                        this.load_follower({
                            api : {
                                max_id : this.info.maxid,
                                //since_id : this.info.sinceid,
                            },
                            app : {
                                is_nomax : false,
                                is_nosince : true,
            
                            }
                        });
                    }
                },
                oncheck_selectable : function(e) {
                    console.log(e);
                    //this.sheet = !this.sheet;

                    if (this.sheet === true) {
                        var ishit = this.selectedAccount.filter(elem=>{
                            if (e.userid == elem.userid) {
                                return true;
                            }
                        });
                        if (ishit.length == 0) {
                            this.selectedAccount.push(e);
                        }
                    }else{
                        for (var i = this.selectedAccount.length-1; i >= 0; i--) {
                            if (e.userid == this.selectedAccount[i].userid) {
                                this.selectedAccount.splice(i,1);
                            }
                        };
                    }
                },
                oncreate_list : function (e) {
                    var msg = _T("msg_list_create");
                    appPrompt2(msg,(evt,val)=>{
                        MYAPP.sns.createList({
                            api : {
                                title : val
                            },app:{}
                        })
                        .then(result=>{
                            this.lists.push({
                                text : result.data.title,
                                value : result.data.id
                            });
                            this.$nextTick(()=>{
                                M.FormSelect.init(document.querySelectorAll('select'), {});
                            });
                        });
                    },null,"");
                },
                onupdate_list : function (e) {
                    if (this.current_list == "0") return;
                    var msg = _T("msg_list_update");
                    appPrompt2(msg,(evt,val)=>{
                        MYAPP.sns.updateList(this.current_list,{
                            api : {
                                title : val
                            },app:{}
                        })
                        .then(result=>{
                            for (var i = 0; i < this.lists.length; i++) {
                                if (this.lists[i].value == result.data.id) {
                                    this.lists[i].text = result.data.title;
                                    break;
                                }
                            }
                            this.$nextTick(()=>{
                                M.FormSelect.init(document.querySelectorAll('select'), {});
                            });
                        });
                    },null,"");
                },
                ondelete_list : function (e) {
                    if (this.current_list == "0") return;
                    var msg = _T("msg_list_delete");
                    appConfirm(msg,()=>{
                        MYAPP.sns.removeList(this.current_list)
                        .then(result=>{
                            console.log("removeList=",result);
                            var ishit = -1;
                            for (var i = 0; i < this.lists.length; i++) {
                                if (this.lists[i].value == result.data.id) {
                                    ishit = i;
                                    break;
                                }
                            }
                            if (ishit > -1) {
                                this.lists.splice(ishit,1);
                            }
                            this.$nextTick(()=>{
                                M.FormSelect.init(document.querySelectorAll('select'), {});
                            });
                        });
                    });
                }
            }
        }),
        "frequest" : new Vue({
            el : "#frequest",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "requestable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {},
                    sheet : false,
                    selectedAccount : [],
                }
            },
            methods: {
                load_followRequest : load_followRequest,
                onscroll_tab : function(e){
                    var sa = e.target.scrollHeight - e.target.clientHeight;
                    var fnlsa = sa - Math.round(e.target.scrollTop);
                    if (fnlsa < 10) {
                        //---page max scroll down
                        console.log("scroll down max");
                        this.load_followRequest({
                            api : {
                                max_id : this.info.maxid,
                                //since_id : this.info.sinceid,
                            },
                            app : {
                                is_nomax : false,
                                is_nosince : true,
            
                            }
                        });
                    }
                },
                oncheck_selectable : function(e) {
                    console.log(e);
                    if (e.checked) {
                        var ishit = this.selectedAccount.filter(elem=>{
                            if (e.userid == elem.userid) {
                                return true;
                            }
                        });
                        if (ishit.length == 0) {
                            this.selectedAccount.push(e);
                        }
                    }else{
                        for (var i = this.selectedAccount.length-1; i >= 0; i--) {
                            if (e.userid == this.selectedAccount[i].userid) {
                                this.selectedAccount.splice(i,1);
                            }
                        };
                    }

                    if (this.selectedAccount.length > 0) {
                        this.sheet = true;
                    }else{
                        this.sheet = false;
                    }
                },
                onrequest_answer : function (e) {
                    var msg = "";
                    if (e.answer) {
                        msg = _T("answer_ok",[e.user.display_name]);
                    }else{
                        msg = _T("answer_no",[e.user.display_name]);
                    }
                    appConfirm(msg,()=>{
                        MYAPP.sns.setFollowRequest(e.user.id,e.answer)
                        .then(result=>{
                            var u = this.getAlreadyAccount(e.user.id);
                            this.accounts.splice(u.index,1);
                        });
                    });
                }
            }
        }),
        "following" : new Vue({
            el : "#following",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "selectable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {},
                    sheet : false,
                    current_addlist : "0",
                    addlist : [
                        {text:"---",value:"0"}
                    ],
                    selectedAccount : [],
                }
            },
            methods: {
                load_following : load_following,
                getList : function (id) {
                    var ret = null;
                    for (var i = 0; i < this.addlist.length; i++) {
                        if (id == this.addlist[i].value) {
                            ret = {
                                id : this.addlist[i].value,
                                title : this.addlist[i].text
                            };
                            break;
                        }
                    }
                    return ret;
                },
                onscroll_tab : function(e){
                    var sa = e.target.scrollHeight - e.target.clientHeight;
                    var fnlsa = sa - Math.round(e.target.scrollTop);
                    if (fnlsa < 10) {
                        //---page max scroll down
                        console.log("scroll down max");
                        this.load_following({
                            api : {
                                max_id : this.info.maxid,
                                //since_id : this.info.sinceid,
                            },
                            app : {
                                is_nomax : false,
                                is_nosince : true,
            
                            }
                        });
                    }
                },
                oncheck_selectable : function(e) {
                    console.log(e);
                    if (e.checked) {
                        var ishit = this.selectedAccount.filter(elem=>{
                            if (e.userid == elem.userid) {
                                return true;
                            }
                        });
                        if (ishit.length == 0) {
                            this.selectedAccount.push(e);
                        }
                    }else{
                        for (var i = this.selectedAccount.length-1; i >= 0; i--) {
                            if (e.userid == this.selectedAccount[i].userid) {
                                this.selectedAccount.splice(i,1);
                            }
                        };
                    }

                    if (this.selectedAccount.length > 0) {
                        this.sheet = true;
                    }else{
                        this.sheet = false;
                    }
                },
                /**
                 * register the user to selected list
                 * @param {Event} e 
                 */
                onregister_list : function(e) {
                    var msg = _T("msg_add_to_list");
                    appConfirm(msg,() => {
                        var arr = [];
                        this.selectedAccount.forEach(elem=>{
                            arr.push(elem.userid);
                        })
                        MYAPP.sns.addMemberToList(this.current_addlist,arr)
                        .then(result=>{
                            //---add to list prop of selected accout
                            for (var i = 0; i < this.accounts.length; i++) {
                                var ac = this.accounts[i];
                                var lists = ac.lists;
                                for (var s = 0; s < this.selectedAccount.length; s++) {
                                    if (ac.id == this.selectedAccount[s].userid) {
                                        this.accounts[i].lists.push(this.getList(this.current_addlist));
                                        //this.$set(this.accounts, i, ac);
                                        break;
                                    }
                                }
                            }
                            
                        });
                    });
                }
            }
        }),
        "follower" : new Vue({
            el : "#follower",
            delimiters : ["{?","?}"],
            mixins : [vue_mixin_for_account],
            data() {
                return {
                    is_asyncing : false,
                    cardtype : "selectable",
                    info : {
                        maxid : "",
                        sinceid : "",
                    },
                    translations : {},
                    accounts : [],
                    globalInfo : {},
                    selectedAccount : [],
                }
            },
            methods: {
                load_follower : load_follower,
                onscroll_tab : function(e){
                    var sa = e.target.scrollHeight - e.target.clientHeight;
                    var fnlsa = sa - Math.round(e.target.scrollTop);
                    if (fnlsa < 10) {
                        //---page max scroll down
                        console.log("scroll down max");
                        this.load_follower({
                            api : {
                                max_id : this.info.maxid,
                                //since_id : this.info.sinceid,
                            },
                            app : {
                                is_nomax : false,
                                is_nosince : true,
            
                            }
                        });
                    }
                },
                oncheck_selectable : function(e) {
                    console.log(e);
                    //this.sheet = !this.sheet;

                    if (this.sheet === true) {
                        var ishit = this.selectedAccount.filter(elem=>{
                            if (e.userid == elem.userid) {
                                return true;
                            }
                        });
                        if (ishit.length == 0) {
                            this.selectedAccount.push(e);
                        }
                    }else{
                        for (var i = this.selectedAccount.length-1; i >= 0; i--) {
                            if (e.userid == this.selectedAccount[i].userid) {
                                this.selectedAccount.splice(i,1);
                            }
                        };
                    }
                }
            }
        })
    };

    

    thisform["tab"] = M.Tabs.init(Q(".tabs"), {
        //swipeable : true,
        onShow : function(e) {
            console.log("tab select:",e);
            console.log(e.id);
            ID("area_connections").scroll({top:0});
            if (MUtility.checkRootpath(location.pathname,MYAPP.session.status.currentLocation) == -1) {
                MUtility.returnPathToList(MYAPP.session.status.currentLocation);
            }
            var targetpath = "";
            if (e.id == "finder") {
                vue_connections.suggestion.accounts.splice(0,vue_connections.suggestion.accounts.length);
                vue_connections.suggestion.load_suggestion({api:{},app:{}});

                var targetpath = `/connections/finder`;
                vue_connections.tabbar.currentTab = "finder";
                MYAPP.setGeneralTitle(_T("con_tab_search"));

    
            }else if (e.id == "list") {
                var et = ID("following");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > 2) {
                    vue_connections.list.accounts.splice(0,vue_connections.list.accounts.length);
                    vue_connections.list.load_listmember("0",{api:{},app:{}});
                //}
                var targetpath = `/connections/list`;
                vue_connections.tabbar.currentTab = "list";
                MYAPP.setGeneralTitle(_T("list"));
                M.FormSelect.init(document.querySelectorAll('select'), {});

            }else if (e.id == "frequest") {
                var et = ID("frequest");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > 2) {
                    vue_connections.frequest.accounts.splice(0,vue_connections.frequest.accounts.length);
                    vue_connections.frequest.load_followRequest({api:{},app:{}});
                //}
                var targetpath = `/connections/frequest`;
                vue_connections.tabbar.currentTab = "frequest";
                MYAPP.setGeneralTitle(_T("con_tab_followrequest"));

            }else if (e.id == "following") {
                var et = ID("following");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > 2) {
                    vue_connections.following.accounts.splice(0,vue_connections.following.accounts.length);
                    vue_connections.following.load_following({api:{},app:{}});
                //}
                var targetpath = `/connections/following`;
                vue_connections.tabbar.currentTab = "following";
                MYAPP.setGeneralTitle(_T("con_tab_following"));


            }else if (e.id == "follower") {
                var et = ID("follower");
                var sa = et.scrollHeight - et.clientHeight;
                var fnlsa = sa - Math.round(et.scrollTop);
                console.log(sa,fnlsa);
                //if (fnlsa > -1) {
                    vue_connections.follower.accounts.splice(0,vue_connections.follower.accounts.length);
                    vue_connections.follower.load_follower({api:{},app:{}});
                //}
                var targetpath = `/connections/follower`;
                vue_connections.tabbar.currentTab = "follower";
                MYAPP.setGeneralTitle(_T("con_tab_follower"));


            }
            MUtility.enterFullpath(targetpath);

        }
    });
    var qstr = `a[href='#${ID("hid_page").value}']`;
    console.log("qstr=",qstr);
    //Q(qstr).classList.add("active");


    thisform["collapse"] = M.Collapsible.init(Qs('.collapsible'), {});

    //---when follow,follower page, scroll max is "since_id"!!!
    ID("following").addEventListener("xscroll",function(e){
        //console.log(e);
        var sa = e.target.scrollHeight - e.target.clientHeight;
        if (e.target.scrollTop == sa) {
            //---page max scroll down
            console.log("scroll down max");
            vue_connections.following.load_following({
                api : {
                    //max_id : vue_connections.following.info.maxid,
                    since_id : vue_connections.following.info.sinceid,
                },
                app : {
                    is_nomax : false,
                    is_nosince : true,

                }
            });
        }
        /*if (e.target.scrollTop == 0) {
            //---page max scroll up
            console.log("scroll up max");
            vue_connections.following.load_following({
                api : {
                    since_id : vue_connections.following.info.sinceid,
                },
                app : {}
            });
        }*/
    });
    ID("follower").addEventListener("xscroll",function(e){
        //console.log(e);
        var sa = e.target.scrollHeight - e.target.clientHeight;
        if (e.target.scrollTop == sa) {
            //---page max scroll down
            console.log("scroll down max");
            vue_connections.follower.load_follower({
                api : {
                    //max_id : vue_connections.follower.info.maxid,
                    since_id : vue_connections.follower.info.sinceid,
                },
                app : {
                    is_nomax : false,
                    is_nosince : true,

                }
            });
        }
        /*if (e.target.scrollTop == 0) {
            //---page max scroll up
            console.log("scroll up max");
            vue_connections.follower.load_follower({
                api : {
                    since_id : vue_connections.follower.info.sinceid,
                },
                app : {}
            });
        }*/
    });


    //---if no account register, redirect /start
    MYAPP.acman.load().then(function (data) {
        MYAPP.acman.checkVerify();
        
        //MYAPP.session.status.showingAccount.data = MYAPP.acman.items[0];
        //MYAPP.session.status.showingAccount.idname = MYAPP.acman.items[0].idname;
        //MYAPP.session.status.showingAccount.instance = MYAPP.acman.items[0].instance;
        MYAPP.checkSession();
        //MYAPP.sns.setAccount(MYAPP.session.status.showingAccount.data);

        vue_connections.following.translations = curLocale.messages;
        vue_connections.follower.translations = curLocale.messages;
        vue_connections.search.translations = curLocale.messages;
        vue_connections.suggestion.translations = curLocale.messages;
        vue_connections.list.translations = curLocale.messages;
        vue_connections.frequest.translations = curLocale.messages;

        vue_connections.suggestion.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_connections.search.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_connections.following.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_connections.follower.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_connections.list.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        vue_connections.frequest.globalInfo = {
            firstPath : MYAPP.appinfo.firstPath
        };
        //---if already exists hid_instance, show instance information
        /*if (ID("hid_instance").value != "") {
            vue_instances.search.load_instanceinfo_base(ID("hid_instance").value);
        }*/
        //---account load
        var ac = MYAPP.acman.get({
            "instance":MYAPP.session.status.selectedAccount.instance,
            "idname" : MYAPP.session.status.selectedAccount.idname
        });
        if (!ac) ac = data[0];
        MYAPP.selectAccount(ac);
        MYAPP.afterLoadAccounts(data);

        /*vue_connections.tabbar.locked = ac.rawdata.locked;
        if (ac.rawdata.locked) {
            MYAPP.sns.getFollowRequest({api:{},app:{}})
            .then((result)=>{
                console.log("getFollowRequest",result);
                if (result.data.length == 0) {
                    MUtility.loadingOFF();
                    return;
                }
                vue_connections.tabbar.followRequest_count = result.data.length;

            });
        }
        vue_connections.tabbar.following_count = ac.rawdata.following_count;
        vue_connections.tabbar.follower_count = ac.rawdata.followers_count;
        */
        vue_connections.tabbar.load_tabStates(ac);



        if (ID("hid_page").value == "following") {
            vue_connections.following.load_following({api:{},app:{}});
            MYAPP.setGeneralTitle(_T("con_tab_following"));
        }else if (ID("hid_page").value == "list") {
            vue_connections.list.load_listmember({api:{},app:{}});
            MYAPP.setGeneralTitle(_T("list"));
        }else if (ID("hid_page").value == "frequest") {
            vue_connections.frequest.load_followRequest({api:{},app:{}});
            MYAPP.setGeneralTitle(_T("con_tab_followrequest"));
        }else if (ID("hid_page").value == "follower") {
            vue_connections.follower.load_follower({api:{},app:{}});
            MYAPP.setGeneralTitle(_T("con_tab_follower"));
        }else if (ID("hid_page").value == "finder") {
            vue_connections.suggestion.load_suggestion({api:{},app:{}});
            MYAPP.setGeneralTitle(_T("con_tab_search"));
        }
        ID(ID("hid_page").value).classList.add("active");

        MYAPP.sns.getLists({api:{},app:{}})
        .then(result=>{
            for (var i = 0; i < result.data.length; i++) {
                vue_connections.following.addlist.push({
                    text : result.data[i].title,
                    value : result.data[i].id
                });
                vue_connections.list.lists.push({
                    text : result.data[i].title,
                    value : result.data[i].id
                });
            }
            vue_connections.list.$nextTick(()=>{
                M.FormSelect.init(document.querySelectorAll('select'), {});
            });
            
            //vue_connections.following.current_addlist = result.data[0].id;
        });
        vue_connections.tabbar.currentTab = ID("hid_page").value;
        
        
        MYAPP.session.status.currentLocation = location.pathname;

    }, function (flag) {
        appAlert("Mastodonインスタンスのアカウントが存在しません。最初にログインしてください。", function () {
            var newurl = window.location.origin + MYAPP.appinfo.firstPath + "/";
            window.location.replace(newurl);
        });
        //=== can use, if no logined===
        //---if already exists hid_instance, show instance information

    });
    
})();
