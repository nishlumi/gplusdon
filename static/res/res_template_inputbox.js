const CONS_TEMPLATE_INPUT_BOX = `
<div>
    <v-toolbar class="grey lighten-5 elevation-2"  
        full-width
    >
        <v-tooltip bottom>
            <v-btn icon slot="activator" v-if="toolbtn.close" @click="onclick_close" >
                <v-icon>close</v-icon>
            </v-btn>
            <span>{{translation.toolbtn_close}}</span>    
        </v-tooltip>
        
        <template  v-if="toolbtn.open_in_new">
            <v-tooltip bottom>
                <v-btn icon slot="activator" hidden-sm-and-down v-on:click="onclick_openInNew">
                    <v-icon>open_in_new</v-icon>
                </v-btn>
                <span>{{translation.toolbtn_openinnew}}</span>    
            </v-tooltip>
        </template>
        <v-tooltip bottom>
            <v-btn icon slot="activator" v-if="toolbtn.help" v-on:click="onclick_help">
                <v-icon>help</v-icon>
            </v-btn>
            <span>{{translation.toolbtn_help}}</span>   
        </v-tooltip>
        <v-progress-circular v-show="btnflags.loading" indeterminate color="red"></v-progress-circular>
        <!--<v-btn icon  hidden-sm-and-down v-on:click="onclick_openInNew" v-if="!show_openInNew">
            <v-icon>open_in_browser</v-icon>
        </v-btn>-->
        <span class="headline">{{title}}</span>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
            <v-btn id="btn_addimage" slot="activator" icon v-if="toolbtn.addimage" v-on:click="onclick_addimage"><v-icon>add_to_photos</v-icon></v-btn><input type="file" id="dmy_openmdia" class="common_ui_off" v-on:change="onchange_openmedia">
            <span>{{translation.toolbtn_addimage}}</span>  
        </v-tooltip>
        <v-tooltip bottom>
            <v-btn id="btn_addgeo" slot="activator" icon v-if="toolbtn.addgeo" v-on:click="onclick_addgeo"><v-icon>map</v-icon></v-btn>
            <span>{{translation.toolbtn_addgeo}}</span>  
        </v-tooltip>
        <v-tooltip bottom>
            <v-btn icon slot="activator" v-bind:class="btnflags.mood" v-if="toolbtn.emoji" v-on:click="onclick_moodbtn"><v-icon>mood</v-icon></v-btn>
            <span>{{translation.toolbtn_addemoji}}</span>  
        </v-tooltip>
        <v-tooltip bottom>
            <v-btn icon slot="activator" dark color="red" v-if="toolbtn.send" v-on:click="onclick_send" v-bind:disabled="btnflags.send_disabled"><v-icon>send</v-icon></v-btn>
            <span>{{translation.toots}}</span>  
        </v-tooltip>
    </v-toolbar>
    <div id="toot_dlg_container" class="scroll-y" v-if="accounts.length > 0" style="height:100%">
        <v-card class="grey lighten-5" style="height:100%">
            <v-form v-model="toot_valid">
                <v-container  fluid fill-height class="grey lighten-5" style="padding:12px">
                    <v-layout wrap align-center>
                        <v-flex xs12 sm5 md5 class="contentbottomstyle">
                            <v-autocomplete v-model="selaccounts" v-bind:items="accounts" 
                                box chips small-chips deletable-chips
                                color="red lighten-1" :label="translation.accounts"
                                background-color="grey lighten-5"
                                name="account-box"
                                append-icon=""
                                :counter="max_account"
                                :messages="account_errmsg"
                                v-bind:rules="account_rules"
                                item-text="display_name" item-value="acct" 
                                multiple required
                            >
                                <template slot="selection" slot-scope="data" >
                                    <v-chip small v-bind:selected="data.selected" class="chip--select-multi primary white-text truncate" close  v-on:input="remove(data.item)">
                                        <v-avatar><img :src="data.item.rawdata.avatar"></v-avatar>
                                        <span v-html='chip_user_name(data.item)'></span>
                                    </v-chip>
                                </template>
                                <template slot="item" slot-scope="data">
                                    <template v-if="typeof data.item !== 'object'">
                                        <v-list-tile-content v-text="data.item"></v-list-tile-content>
                                    </template>
                                    <template v-else>
                                        <v-list-tile-avatar>
                                            <img :src="data.item.rawdata.avatar" slot="activator">    
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-html="data.item.display_name"></v-list-tile-title>
                                            <v-list-tile-sub-title v-html="'@' + data.item.idname + '@' + data.item.instance"></v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </template>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs1 class="contentbottomstyle">
                            <!--<v-icon class="red-text">arrow_right</v-icon>-->
                            <v-menu offset-y>
                                <v-btn flat icon small color="red" dark slot="activator" v-bind:title="selsharescope.text">
                                    <v-icon>{{selsharescope.avatar}}</v-icon>
                                </v-btn>
                                <v-list>
                                    <v-list-tile 
                                        v-for="(scope,scoindex) in sharescopes" 
                                        :key="scoindex"
                                        v-bind:class="scope.selected"
                                        v-on:click="select_scope(scope)"
                                    >
                                        <v-list-tile-avatar>
                                            <v-icon v-bind:class="scope.selected">{{ scope.avatar }}</v-icon>
                                        </v-list-tile-avatar>
                                        <v-list-tile-title>{{ scope.text }}</v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                
                        </v-flex>
                        
                        <v-flex xs11 sm6 md6 v-if="isopen_mention"  class="headerbottomstyle">
                            <v-autocomplete id="mention_box" v-model="selmentions" v-bind:items="mentions"
                                color="red lighten-1" 
                                background-color="grey lighten-5"
                                name="mention-box"
                                box chips small-chips
                                append-icon=""
                                hide-details 
                                v-bind:loading="mention_loading"
                                v-bind:search-input.sync="mention_search"
                                item-avatar="avatar" item-text="acct" item-value="acct" 
                                multiple solo
                            >
                            <template slot="no-data">
                                    <v-list-tile>
                                        <v-list-tile-title>No hit...</v-list-tile-title>
                                    </v-list-tile>
                                </template>
                                <template slot="selection" slot-scope="data" >
                                    <v-chip small v-bind:selected="data.selected" class="chip--select-multi primary white-text" close v-on:input="remove_mention(data.item)">
                                        <v-avatar><img :src="data.item.avatar"></v-avatar>
                                        <span v-html='data.item.display_name + "@" + data.item.instance'></span>
                                    </v-chip>
                                </template>
                                <template slot="item" slot-scope="data">
                                    <v-list-tile-avatar>
                                        <v-img :src="data.item.avatar"></v-img>
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title v-html="data.item.display_name"></v-list-tile-title>
                                        <v-list-tile-sub-title >{{ data.item.acct }}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 class="contentbottomstyle" style="position:relative;">
                            <span class="subheading toottext_length" v-bind:class="strlength_class" >{{ strlength }}</span>
                            <!--<template v-if="(firsttext != '')&&(!is_editfirsttext)">
                                <v-layout row wrap>
                                    <v-flex xs12>
                                        <div class="onetoot_inputcontent">{{firsttext}}</div>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-btn color="primary" v-on:click="onclick_starteditfirst">編集する</v-btn>
                                    </v-flex>
                                </v-layout>
                            </template>-->
                           
                            <div :id="movingElementID('newinput_')" 
                                name="inputcontent" 
                                class="onetoot_inputcontent" 
                                contenteditable 
                                v-bind:class="status_class"
                                v-on:keydown="onkeydown_inputcontent"
                                v-on:keyup="onkeyup_inputcontent"
                                v-on:dragover="ondragover_inputcontent"
                                v-on:dragleave="ondragleave_inputcontent"
                                v-on:drop="ondrop_inputcontent"

                            >{{ status_text || firsttext }}</div>
                        
                        
                            <p id="toot_input_help" class="common_ui_off">
                                <span class="body-1 red-text">{{ translation.accounts }}:</span><br>
                                {{ translation.mn_accountbox_placeHolder }}<br>
                                <span class="body-1 red-text">本文の特殊な使い方：</span><br>
                                <b class="red-text">-cw-</b> 本文中に入れると、その前までの行がCWの文章になります。<br>
                                <b class="red-text">-end-</b> 本文中に入れると、本アプリを使う相手からはその行以降が見えなくなります。（注！他のアプリからは見えます！）<br>
                            </p>
                        </v-flex>
                        <v-flex xs12 class="tagbottomstyle1">
                            
                            <v-combobox v-model="seltags" v-bind:items="tags" box chips
                                color="red lighten-1" :label="translation.tags"
                                background-color="grey lighten-5"
                                name="tag-box"
                                small-chips
                                append-icon=""
                                multiple deletable-chips
                                item-text="text" item-value="text"
                            >
                            </v-combobox>
                        </v-flex>
                        <v-flex xs12 v-bind:class="css.geo">
                            <v-layout row wrap>
                                <v-flex xs12 sm12 md6>
                                    <div class="toot_content_geo elevation-1">
                                        <input type="hidden" name="geo_lat" v-bind:value="geo.lat"/>
                                        <input type="hidden" name="geo_lng" v-bind:value="geo.lng"/>
                                        <div class="here_map"></div>
                                    </div>
                                </v-flex>
                                <v-flex xs12 sm12 md6>
                                    <div class="toot_content_locos">
                                        <v-list>
                                            <v-list-tile v-for="item in geo.locos" :key="item.Id" v-on:click="onclick_selloco(item)">
                                                <v-list-tile-action>
                                                    <v-checkbox v-model="geouris" :rules="geouris_rules" :disabled="geochk_error" :value="generate_geouri(item)"></v-checkbox>
                                                </v-list-tile-action>
                                                <v-list-tile-content :title="item.Property.Address">
                                                    {{item.Name}}
                                                </v-list-tile-content>
                                                <v-divider></v-divider>
                                            </v-list-tile>
                                        </v-list>
                                    </div>
                                </v-flex>
                            </v-layout>
                            
                        </v-flex>
                        <v-flex xs12 v-if="mainlink.exists">
                            <div class="card-link" >
                                <div class="card"> 
                                <a v-bind:href="mainlink.url" target="_blank" rel="noopener"> 
                                    <div class="image-area card-image"> 
                                    <v-img v-if="mainlink.isimage" class="v-img" v-bind:src="mainlink.image" v-bind:alt="mainlink.description" v-bind:title="mainlink.description" ></v-img>
                                    <span class="link-title truncate"><i class="material-icons">link</i> 
                                        <span class="link-site" v-html="mainlink.site"></span> 
                                    </span> 
                                    </div> 
                                    <div class="card-content link-content grey-text text-darken-1">
                                    <b class="site-title truncate">{{ mainlink.title }}</b> 
                                    <p class="description-truncate">{{ mainlink.description }}</p> 
                                    </div> 
                                </a> 
                                </div>
                            </div> 

                        </v-flex>
                        <v-flex xs2 class="mediabottomstyle common_ui_off">
                            <v-btn id="btn_addimage" icon color="primary" v-on:click="onclick_addimage"><v-icon>add_to_photos</v-icon></v-btn>
                            <input type="file" id="dmy_openmdia" class="common_ui_off" v-on:change="onchange_openmedia">
                        </v-flex>
                        <v-flex xs2 class="mediabottomstyle common_ui_off">
                            <v-btn id="btn_addgeo" icon color="primary" v-on:click="onclick_addgeo"><v-icon>map</v-icon></v-btn>
                        </v-flex>
                            
                        </v-flex>
                        <v-flex xs10 class="mediabottomstyle">
                            <v-switch
                                :label="translation.image_confirm_msg02"
                                v-model="switch_NSFW"
                                v-if="selmedias.length > 0"
                            ></v-switch>
                        </v-flex>
                        <v-flex xs12 class="mediabottomstyle">
                            <v-container grid-list-sm fluid>
                                <v-layout row wrap>
                                    <v-flex xs3 v-for="(item,index) in selmedias" :key="index">
                                        <v-card flat tile>
                                            <v-img 
                                                v-bind:src="item.src" 
                                                v-bind:lazy-src="item.src" 
                                                aspect-ratio="1"
                                            >
                                                <v-layout align-center justify-center>
                                                    <v-flex xs12 align-start justify-start>
                                                        <v-btn flat icon dark class="black-half" v-on:click="onclick_mediaclose(index)"><v-icon>close</v-icon></v-btn>
                                                    </v-flex>
                                                </v-layout>
                                                <v-layout
                                                slot="placeholder"
                                                fill-height
                                                align-center
                                                justify-center
                                                ma-0
                                                >
                                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>  
                                                </v-layout>
                                            </v-img>
                                            <v-card-title style="padding:1px;">
                                                <!--<div class="media_commentbox" contenteditable>{{ item.comment }}</div>
                                                <v-text-field>{{ item.comment }}</v-text-field>-->
                                                <form v-on:submit.prevent="onsubmit_comment(index)">
                                                    <div class="input-field col s12">
                                                        <input type="text" class="validate" v-model="item.comment">
                                                    </div>
                                                </form>
                                            </v-card-title>
                                        </v-card>       
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                        <v-flex xs12>
                            
                            
                        </v-flex> 
                    </v-layout>
                </v-container>
                
            </v-form>
        </v-card>
    </div>
</div>
`;