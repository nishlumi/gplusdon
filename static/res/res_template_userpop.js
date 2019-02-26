const CONS_TEMPLATE_USERPOPUP = `
<div class="card white " v-if="account">
    <div class="card-image">
        <div class="background">
            <v-img v-bind:src="account.header"></v-img>
        </div>
        <v-checkbox v-if="cardtype == 'selectable'" style="position:absolute;top:0px;left:1rem;" v-model="stat.selected" v-on:change="oncheck_selectable"></v-checkbox>
        <div class="col s12" v-if="relationship.followed_by === true">
            <span class="new badge blue" v-bind:data-badge-caption="showRelationshpText()"></span>
        </div>
    </div>
    <div class="card-account-info">
        <a v-bind:href="generate_userlink(account)">
            <v-img v-bind:src="account.avatar" class="btn-floating halfway-fab2 userrectangle" width="32" height="32"></v-img>
            <span class="truncate" v-bind:title="account.acct" v-html="ch2seh(generate_userDisplayName(account))"></span><br>
            <i class="truncate" v-bind:title="account.acct"> @{{ account.acct }}</i>
        </a>
        <input type="hidden" name="sender_id" v-bind:value="account.id">
    </div>
    <div class="card-content card-account-content truncate blue-grey-text text-darken-4" 
        v-html="ch2seh(generate_userNote(account))"
        v-if="cardtype != 'xselectable'"
    ></div>
    <div class="card-account-stats row">
        <div class="col s4">
            <dl>
                <dt>{{ translation.stat_statuses }}</dt>
                <dd><span class="poup-stat-number blue-text">{{ account.statuses_count }}</span></dd>
            </dl>
        </div>
        <div class="col s4">
            <dl>
                <dt>{{ translation.stat_following }}</dt>
                <dd><span class="poup-stat-number blue-text">{{ account.following_count }}</span></dd>
            </dl>
        </div>
        <div class="col s4">
            <dl>
                <dt>{{ translation.stat_follower }}</dt>
                <dd><span class="poup-stat-number blue-text">{{ account.followers_count }}</span></dd>
            </dl>
        </div>
        <div class="col s12" v-if="cardtype == 'xselectable'">
            
                <b v-on:mouseenter="onhover_b" class="poup-stat-number" v-if="account.lists.length > 0">{{ _T("msg_belong_list",[account.lists.length]) }}</b>
                <v-menu open-on-hover v-model="stat.isshow_listmenu"
                    v-bind:position-x="listmenu.x"
                    v-bind:position-y="listmenu.y"
                    
                >
                <v-list>
                    <v-list-tile
                        v-for="(listitem, index) in account.lists"
                        v-bind:key="index"
                        v-on:click="onclick_removelist(index)"
                    >
                        <v-list-tile-title v-bind:id="listitem.id">{{ listitem.title }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </div>
    </div>
    <div class="card-action" style="width:100%;padding-top:4px;">
        <v-layout row wrap>
            <template v-if="cardtype == 'requestable'">
                <v-flex xs10>
                    <v-tooltip bottom>
                        <v-btn fab dark small color="success" slot="activator" v-on:click="onclick_requestOK">
                            <v-icon dark>check</v-icon>
                        </v-btn>
                        <span>{{translation.request_ok}}</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <v-btn fab dark small color="error" slot="activator" v-on:click="onclick_requestNO">
                            <v-icon dark>cancel</v-icon>
                        </v-btn>
                        <span>{{translation.request_no}}</span>
                    </v-tooltip>
                    
                    <!--<v-btn color="success" v-on:click="onclick_requestOK">{{translation.request_ok}}</v-btn>
                    <v-btn color="error" v-on:click="onclick_requestNO">{{translation.request_no}}</v-btn>
                    -->
                </v-flex>
                <v-flex xs2>
                    <i v-if="account.locked === true" class="material-icons">lock</i> 
                </v-flex>
            </template>
            <template v-else>
                <v-flex xs9>
                    <div class="switch">
                        <label>
                            <i class="material-icons tooltipped" data-position="bottom" data-tooltip="unfollow">person_outline</i>
                            <input type="checkbox" v-model="relationship.following" v-on:change="oncheck_following">
                            <span class="lever"></span>
                            <i class="material-icons tooltipped red-text" data-position="bottom" data-tooltip="follow">person_add</i>
                        </label>
                    </div>
                </v-flex>
                <v-flex xs3>
                    <i v-if="account.locked === true" class="material-icons">lock</i>
                </v-flex>
            </template>
        </v-layout>
        <div class="row">
            
            <!--<div class="col s6" v-if="relationship.followed_by === true">
                <span class="new badge blue" v-bind:data-badge-caption="showRelationshpText()"></span>
            </div>-->

        </div>
    </div>

</div>
`;
/*
        

        <a v-bind:href="account.url" target="_blank" rel="noopener" class="waves-effect waves-red"><i class="material-icons red-text">email</i></a>

*/