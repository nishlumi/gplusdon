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
                <v-btn icon slot="activator" class="hidden-sm-and-down" v-on:click="onclick_openInNew">
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
        <v-menu v-model="is_othermenu" offset-y>
            <v-btn icon slot="activator" >
                <v-icon>more_horiz</v-icon>
            </v-btn>
            <v-list>
                
            </v-list>
        </v-menu>
        
        
        <v-progress-circular v-show="btnflags.loading" indeterminate color="red"></v-progress-circular>
        <!--<v-btn icon  hidden-sm-and-down v-on:click="onclick_openInNew" v-if="!show_openInNew">
            <v-icon>open_in_browser</v-icon>
        </v-btn>-->
        <span class="headline">{{title}}</span>
        <v-spacer></v-spacer>
        
        <template v-if="inputtoot_win == 0">
            <v-btn class="input-toot-textbtn" @click="onclick_turn_win" v-if="is_available_sched">
                {{translation.lab_turn_to_scheduled}}
            </v-btn>
            <v-tooltip bottom>
                <v-btn icon slot="activator" color="white" v-if="is_available_sched" v-on:click="onclick_sched"><v-icon>alarm_on</v-icon></v-btn>
                <span>{{translation.toolbtn_addscheduled}}</span>  
            </v-tooltip>
            <v-tooltip bottom>
                <v-btn icon slot="activator" dark color="red" v-if="toolbtn.send" v-on:click="onclick_send" v-bind:disabled="btnflags.send_disabled"><v-icon>send</v-icon></v-btn>
                <span>{{translation.toots}}</span>  
            </v-tooltip>
        </template>
        <template v-if="inputtoot_win == 1">
            <v-btn class="input-toot-textbtn" @click="onclick_turn_win" v-if="is_available_sched">
                {{translation.lab_turn_to_input}}
            </v-btn>
            <v-tooltip bottom>
                <v-btn icon slot="activator" dark color="blue" v-on:click="onclick_reloadsched"><v-icon>refresh</v-icon></v-btn>
                <span>{{translation.acc_toolbar_reload}}</span>
            </v-tooltip>
        </template>
        
    </v-toolbar>
    <v-window v-model="inputtoot_win">
        <v-window-item :value="0">
            <div id="toot_dlg_container" class="scroll-y" v-if="accounts.length > 0" style="height:100%">
                <v-card class="grey lighten-5" style="height:100%">
                    <v-form v-model="toot_valid">
                        <v-container  fluid fill-height class="grey lighten-5" style="padding:12px">
                            <v-layout wrap align-center>
                                <v-flex xs8 sm4 md4 class="contentbottomstyle" style="overflow:hidden;">
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
                                        multiple required v-on:change="onchange_autocomp"
                                    >
                                        <template slot="selection" slot-scope="data" >
                                            <v-chip small v-bind:selected="data.selected" class="chip--select-multi primary white-text truncate" close  v-on:input="remove(data.item)">
                                                <v-avatar><img :src="data.item.rawdata.avatar"></v-avatar>
                                                <span v-html='ch2seh(chip_user_name(data.item))'></span>
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
                                                    <v-list-tile-title v-html="ch2seh(data.item.display_name)"></v-list-tile-title>
                                                    <v-list-tile-sub-title v-html="ch2seh('@' + data.item.idname + '@' + data.item.instance)"></v-list-tile-sub-title>
                                                </v-list-tile-content>
                                            </template>
                                        </template>
                                    </v-autocomplete>
                                </v-flex>
                                <v-flex xs2 sm1 md1 class="contentbottomstyle">
                                    <!--<v-icon class="red--text">arrow_right</v-icon>-->
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
                                
                                <v-flex xs11 sm7 md7 v-if="isopen_mention"  class="headerbottomstyle">
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
                                                <span v-html='ch2seh(data.item.display_name + "@" + data.item.instance)'></span>
                                            </v-chip>
                                        </template>
                                        <template slot="item" slot-scope="data">
                                            <v-list-tile-avatar>
                                                <v-img :src="data.item.avatar"></v-img>
                                            </v-list-tile-avatar>
                                            <v-list-tile-content>
                                                <v-list-tile-title v-html="ch2seh(data.item.display_name)"></v-list-tile-title>
                                                <v-list-tile-sub-title >{{ data.item.acct }}</v-list-tile-sub-title>
                                            </v-list-tile-content>
                                        </template>
                                    </v-autocomplete>
                                </v-flex>
                                <!-- scheduled post panel -->
                                <v-flex xs12 v-if="is_panel_sched&&is_available_sched" class="contentbottomstyle" style="position:relative;">
                                    <v-layout row wrap>
                                        <v-flex xs2>
                                            <v-switch  v-model="is_enable_schedule"></v-switch>
                                            
                                        </v-flex>
                                        <v-flex xs4>
                                            <v-text-field
                                                v-model="sched.date"
                                                type="date"
                                                :label="translation.cons_date"
                                                hint="YYYY/MM/DD"
                                                persistent-hint
                                                :disabled="!is_enable_schedule"
                                            ></v-text-field>
                                        </v-flex>
                                        <v-flex xs4 offset-xs1>
                                            <v-text-field
                                                v-model="sched.time"
                                                type="time" 
                                                :label="translation.cons_time"
                                                hint="HH:MM"
                                                persistent-hint
                                                :disabled="!is_enable_schedule"
                                            ></v-text-field>
                                        </v-flex>
                                        <v-flex xs12>
                                            <span>{{translation.msg_warning_scheduled}}</span>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-flex xs12 class="contentbottomstyle" style="position:relative;">
                                    
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
                                
                                    <p id="toot_input_help" class="common_ui_off">
                                        <span class="body-1 red--text">{{ translation.accounts }}:</span><br>
                                        {{ translation.mn_accountbox_placeHolder }}<br>
                                        <span class="body-1 red--text">{{translation.msg_help_statushelp01}}</span><br>
                                        <b class="red--text">-cw-</b> <span>{{translation.msg_help_status_cw}}</span><br>
                                        <b class="red--text">-poll-, -mpoll-</b> <span>{{translation.msg_help_status_poll}}</span><br>
                                    </p>
                                    <v-card>
                                        <v-card-title primary-title>
                                            <span class="subheading toottext_length" v-bind:class="strlength_class" >{{ strlength }}</span>
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
        
                                            >{{ status_text  }}</div>
                                            <!--<v-layout row wrap>
                                                <v-flex xs12 class="editor-realparts">
                                                    <ckeditor :id="movingElementID('newinput_')" :editor="editor"  class="onetoot_inputcontent" 
                                                        v-model="status_text" 
                                                        tag-name="textarea"
                                                        :config="editorConfig"
                                                        :value="editorData"
                                                        v-bind:class="status_class"
                                                        v-on:keydown="onkeydown_inputcontent"
                                                        v-on:input="onkeyup_inputcontent"
                                                        v-on:dragover="ondragover_inputcontent"
                                                        v-on:dragleave="ondragleave_inputcontent"
                                                        v-on:drop="ondrop_inputcontent"
                                                    ></ckeditor>
                                                </v-flex>
                                            </v-layout>-->
                                            
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-tooltip bottom >
                                                <v-btn id="btn_addimage" slot="activator" icon v-if="toolbtn.addimage" :disabled="!is_available_image" v-on:click="onclick_addimage"><v-icon>add_photo_alternate</v-icon></v-btn>
                                                <input type="file" :id="movingElementID('openmedia_')" class="common_ui_off" v-on:change="onchange_openmedia">
                                                <span>{{translation.toolbtn_addimage}}</span>  
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <v-btn id="btn_imagefromdrive" slot="activator" icon v-if="toolbtn.addimage" :disabled="!is_available_image"  v-on:click="onclick_imagefromdrive"><v-icon>mdi-google-drive</v-icon></v-btn>
                                                <span>{{translation.toolbtn_imagefromdrive}}</span>  
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <v-btn id="btn_imagefromgphoto" slot="activator" icon v-if="toolbtn.addimage" :disabled="!is_available_image"  v-on:click="onclick_imagefromgphoto"><v-icon>mdi-google-photos</v-icon></v-btn>
                                                <span>{{translation.toolbtn_imagefromgphoto}}</span>  
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <v-btn id="btn_addgeo" slot="activator" icon v-if="toolbtn.addgeo" v-on:click="onclick_addgeo"><v-icon>gps_fixed</v-icon></v-btn>
                                                <span>{{translation.toolbtn_addgeo}}</span>  
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <v-btn id="btn_addpoll" slot="activator" :class="btnflags.pollbtn" icon v-if="toolbtn.addpoll" :disabled="!is_available_poll" v-on:click="onclick_addpoll"><v-icon>how_to_vote</v-icon></v-btn>
                                                <span>{{translation.toolbtn_addpoll}}</span>  
                                            </v-tooltip>
                                            <div v-if="is_available_poll&&is_enable_poll">
                                                <v-layout row wrap style="margin-bottom:0;">
                                                    <v-flex xs12>
                                                        <v-input prepend-icon="alarm">{{poll_expire_date}}</v-input>
                                                    </v-flex>
                                                </v-layout>
                                            </div>
                                            <v-tooltip bottom>
                                                <v-btn icon slot="activator" v-bind:class="btnflags.mood" v-if="toolbtn.emoji" v-on:click="onclick_moodbtn"><v-icon>mood</v-icon></v-btn>
                                                <span>{{translation.toolbtn_addemoji}}</span>  
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <v-btn id="btn_addcw" slot="activator" icon v-if="toolbtn.addcw" v-on:click="onclick_addcw"><v-icon>visibility</v-icon></v-btn>
                                                <span>{{translation.toolbtn_addcw}}</span>  
                                            </v-tooltip>
                                        </v-card-actions>
                                    </v-card>
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
                                                    <v-list-tile v-for="(item,index) in geo.locos" :key="index" v-on:click="onclick_selloco(item)">
                                                        <v-list-tile-action>
                                                            <v-checkbox v-model="geouris" :rules="geouris_rules" :disabled="geochk_error" :value="generate_geouri(item)"></v-checkbox>
                                                        </v-list-tile-action>
                                                        <v-list-tile-content :title="generate_geouri(item)">
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
                                                <span class="link-site" v-html="ch2seh(mainlink.site)"></span> 
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
                                                        v-bind:src="item.preview_url" 
                                                        v-bind:lazy-src="item.preview_url" 
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
        </v-window-item>
        <v-window-item :value="1">
            <v-list v-for="(item,index) in schedules" :key="index">
                <v-list-tile three-line>
                    <v-list-tile-content @click="onclick_schedline(item)">
                        <v-list-tile-title>
                            {{ item.params.text.substr(0,50) }}
                        </v-list-tile-title>
                        <v-list-tile-sub-title>
                            <b>投稿予定：</b><span>{{new Date(item.scheduled_at).toLocaleString()}}</span>
                        </v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn flat icon >
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-window-item>
    </v-window>
    
    
</div>
`;

const CONS_TEMPLATE_GPHOTO_DIALOG = `
<div >
    
    <v-dialog v-model="is_show" 
        :fullscreen="isfull"
        :max-width="maxwidth"
        transition="dialog-bottom-transition" 
        :overlay="false"
        scrollable
    >
        
        <v-card>
            <v-toolbar >
                <v-text-field
                    label="Search photos..."
                    v-model="findtext"
                    @keydown.enter="onenter_searchfield"
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn flat icon color="primary" @click="onclick_clearstream"><v-icon>autorenew</v-icon></v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <v-container grid-list-xs fluid >
                    
                    <v-item-group multiple v-model="selectitems">
                        <v-layout row wrap>
                            <template v-for="(item,index) in items" >
                                
                                
                                <v-item :key="index" :value="item">
                                    <v-flex xs6 sm4 md3 slot-scope="{ active, toggle }" :class="onselect_css(active)">
                                        <v-card flat tile 
                                            
                                            
                                            class="d-flex mb-1"
                                            
                                            height="200"
                                            @click="toggle"
                                        >
                                            <v-layout row wrap>
                                                <v-flex xs12>
                                                    <v-img
                                                        :src="item.baseUrl"
                                                        
                                                        aspect-ratio="1"
                                                        class="grey lighten-2"
                                                    >
                                                        <template v-slot:placeholder>
                                                            <v-layout
                                                                fill-height
                                                                align-center
                                                                justify-center
                                                                ma-0
                                                            >
                                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                                            </v-layout>
                                                        </template>
                                                    </v-img>
                                                </v-flex>
                                                <v-flex xs12>
                                                    <span v-text="item.filename"></span>
                                                </v-flex>
                                            </v-layout>
                                            
                                            
                                                
                                            
                                        </v-card>
                                    </v-flex>
                                </v-item>
                                
                                
                            </template>
                        </v-layout>
                    </v-item-group>
                    <v-layout row wrap v-if="(nextPageToken)">
                        <v-flex xs12>
                            <v-btn text style="width:100%;" @click="onclick_more">more...</v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-layout row justify-end>
                    <v-btn @click="onclick_cancel">キャンセル</v-btn>
                    <v-btn color="primary" @click="onclick_ok">OK</v-btn>
                </v-layout>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
</div>
`;