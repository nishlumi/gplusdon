/*

*/
const CONS_TEMPLATE_TLCONDITION = `
<div class="item-content card-content">
    <v-layout>
        <v-flex xs9 md8>
            <v-tooltip bottom>
                <v-btn fab  small color="white" slot="activator" v-on:click="onclick_clearclose(true)">
                    <v-icon dark>clear</v-icon>
                </v-btn>
                <span>{{translation.lab_clearcontidion}}</span>
            </v-tooltip>
            <v-btn fab dark small color="primary" v-on:click="dialog=!dialog">
                <v-icon dark>settings</v-icon>
            </v-btn>
            <v-btn fab dark small color="primary" v-on:click="datedialog=!datedialog">
                <v-icon dark>event</v-icon>
            </v-btn>
        </v-flex>
        <v-flex xs3 md4>
            <v-tooltip bottom>
                <v-text-field slot="activator"
                v-bind:label="translation.lab_posttext" v-on:focus="onfocus_posttext" readonly
                ></v-text-field>
                <span>{{translation.toots}}</span>
            </v-tooltip>
        </v-flex>

    </v-layout>
    <v-dialog
        v-model="dialog"
        max-width="500px"
        transition="dialog-transition"
    >
        <v-card>
            <v-card-text v-if="condition">
                <v-layout row wrap>
                    <!-- list option -->
                    <v-flex xs12 v-if="condition.type == 'list'">
                        <b>{{translation.acc_tab_list}}</b>
                        <select v-model="sel_listtype">
                            <option v-for="(item,index) in condition.lists" v-bind:key="index" v-bind:value="item.value" v-bind:selected=item.selected>{{ item.text }}</option>
                        </select>
                    </v-flex>
                    <!-- common options -->
                    <v-flex xs12>
                        <v-text-field :label="translation.filter_condition" v-model="condition.filter.text"
                        ></v-text-field>
                        <p>{{translation.msg_filter_condition1}}<br>
                            {{translation.msg_filter_condition2}}
                        </p>
                    </v-flex>
                    <v-flex xs6>
                        <b>{{translation.sel_sharescope}}</b>
                        <v-radio-group v-model="sel_tlshare">
                            <template v-for="item in condition.tlshare_options">
                                <v-radio :label="item.text" :value="item.value" :checked="item.selected"></v-radio>
                            </template>
                        </v-radio-group>
                    </v-flex>
                    <v-flex xs6>
                        <b>{{translation.sel_toottype}}</b>
                        <template v-for="item in condition.tlview_options">
                            <v-checkbox :label="item.text" hide-details v-model="sel_tltype" :value="item.value"></v-checkbox>
                        </template>
                    </v-flex>
                    
                    <!--<v-flex xs6>
                        <select id="sel_tlshare" v-model="selshare_current">
                            <template v-for="item in condition.tlshare_options">
                                <option v-bind:value="item.value" v-bind:selected=item.selected>{? item.text ?}</option>
                            </template>
                        </select>
                    </v-flex>
                    <v-flex xs6>
                        <select id="sel_tltype" v-model="seltype_current">
                            <template v-for="item in condition.tlshare_options">
                                <option v-bind:value="item.value" v-bind:selected=item.selected>{? item.text ?}</option>
                            </template>
                        </select> 
                    </v-flex>
                    -->
                </v-layout>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat small color="primary" v-on:click="onclick_close(false)">{{translation.cons_cancel}}</v-btn>
                <v-btn flat small color="primary" v-on:click="onclick_close(true)">{{translation.cons_apply}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog
        v-model="datedialog"
        max-width="500px" 
        transition="dialog-transition"
    >
        <v-card>
            <v-card-title primary-title>
                <v-icon>event</v-icon><span>{{translation.lab_timecondition1}}</span>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <p>{{translation.msg_timecondition1}}</p>
                    </v-flex>
                </v-layout>
                <v-tabs
                    v-model="timetab"
                    slider-color="primary"
                >
                    <v-tab key="0">{{translation.lab_timecondition2}}</v-tab>
                    <v-tab key="1">{{translation.lab_timecondition3}}</v-tab>
                    <v-tabs-items>
                        <v-tab-item key="0">
                            <v-layout row wrap>
                                <v-flex xs5 offset-xs1>
                                    <v-radio-group v-model="datecolumn" column>
                                            <v-radio :label="translation.lab_timecondition_hour" value="0"></v-radio>
                                            <v-radio :label="translation.lab_timecondition_day" value="1"></v-radio>
                                            <v-radio :label="translation.lab_timecondition_week" value="2"></v-radio>
                                        <v-radio :label="translation.lab_timecondition_month" value="3"></v-radio>
                                    </v-radio-group>
                                </v-flex>
                                <v-flex xs2 offset-xs1>
                                    <br>
                                    <v-text-field
                                        v-model="date_simple"
                                        type="number" min="1"
                                        :label="translation.lab_timecondition_value"
                                    ></v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-tab-item>
                        <v-tab-item key="1">
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <span>{{translation.lab_timecondition4}}</span>
                                </v-flex>
                                <v-flex xs2>
                                    <v-tooltip bottom>
                                        <v-btn fab small icon slot="activator" :color="colorcls.beginbtn" v-on:click="onclick_beginarrow">
                                            <v-icon>arrow_forward</v-icon>
                                        </v-btn>
                                        <span>Start</span>
                                    </v-tooltip>
                                    
                                </v-flex>
                                <v-flex xs4>
                                    <v-text-field
                                        v-model="condition.daterange.begin.date"
                                        type="date"
                                        :label="translation.cons_date"
                                        hint="YYYY/MM/DD"
                                        persistent-hint
                                        :disabled="disablecls.begin.date"
                                        ></v-text-field>
                                </v-flex>
                                <v-flex xs4 offset-xs1>
                                        <v-text-field
                                        v-model="condition.daterange.begin.time"
                                        type="time"
                                        :label="translation.cons_time"
                                        hint="HH:MM"
                                        persistent-hint
                                        :disabled="disablecls.begin.time"
                                        ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap>
                                <v-flex xs2>
                                    <v-tooltip bottom>
                                        <v-btn fab small icon slot="activator" :color="colorcls.endbtn" v-on:click="onclick_endarrow">
                                            <v-icon>arrow_back</v-icon>
                                        </v-btn>
                                        <span>End</span>
                                    </v-tooltip>
                                    
                                </v-flex>
                                <v-flex xs4>
                                    <v-text-field
                                        v-model="condition.daterange.end.date"
                                        type="date"
                                        :label="translation.cons_date"
                                        hint="YYYY/MM/DD"
                                        persistent-hint
                                        :disabled="disablecls.end.date"
                                        ></v-text-field>
                                </v-flex>
                                <v-flex xs4 offset-xs1>
                                        <v-text-field
                                        v-model="condition.daterange.end.time"
                                        type="time"
                                        :label="translation.cons_time"
                                        hint="HH:MM"
                                        persistent-hint
                                        :disabled="disablecls.end.time"
                                        ></v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-tab-item>
                    </v-tabs-items>

                </v-tabs>
                
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat small color="primary" v-on:click="onclick_dateclose(false)">{{translation.cons_cancel}}</v-btn>
                <v-btn small color="primary" v-on:click="onclick_dateclose(true)">{{translation.cons_apply}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
`;


const CONS_TEMPLATE_TOOTBODY = `
<div v-bind:id="tootElementId" class="card fitcontent toot_card_base sizing" v-if="toote != null" v-bind:style="toote.cardtypeSize"><!-- v-if="'body' in toote"-->
    <div class="toot_boost_original share-color-boosted" v-if="toote.ancestors.length>0">
        <i class="material-icons">arrow_drop_down</i>  
        <span v-html="ch2seh(toote.ancestors[toote.ancestors.length-1].visibility)" style="float:left;"></span>
        <v-img v-if="toote.ancestors.length > 0" v-bind:src="toote.ancestors[toote.ancestors.length-1].account.avatar" class="toot_prof userrectangle" v-on:mouseenter="onenter_avatar" v-bind:width="elementStyle.toot_avatar_imgsize" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
        <span v-html="ch2seh(toote.ancestors[toote.ancestors.length-1].translateText.visibility3)" class="waves-effect waves-light" v-on:click="onclick_toot_ancestor"></span> 
        <input v-if="toote.ancestors.length > 0" type="hidden" name="sender_id" alt="parent" v-bind:value="toote.ancestors[toote.ancestors.length-1].account.id">
    </div>
    <div class="toot_content_grid">  
<!-----toot sender infomation
        <div class="chip_box" v-if="toote.reblogOriginal">
        <i class="material-icons">arrow_drop_down</i>
        <b v-bind:title="toote.reblogOriginal.account.acct" v-html="toote.reblogOriginal.account.display_name"></b><span>@{{ toote.reblogOriginal.account.acct }}</span>
        </div>-->
        <div class="toot_sender truncate">  
            <v-img v-bind:src="toote.account.avatar" class="toot_prof userrectangle" v-on:mouseenter="onenter_avatar" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
            <b v-bind:title="toote.account.acct" v-html="ch2seh(toote.account.display_name)"></b>
            <b class="toot_sender_id">@{{ toote.account.username }}<b class="red-text">@{{ toote.account.instance }}</b></b>
            <input type="hidden" name="sender_id" alt="thistoot" v-bind:value="toote.account.id">
        </div>
<!----toot date and time-->
        <div class="toot_datetime">
            <!--
            <a href="#!" class="tt_datetime" v-bind:title="toote.body.created_at.toLocaleString()"v-on:click="onclick_tt_datetime">{{ toote.body.diff_created_at.text }}</a>  
            -->
            <a class="tt_datetime"><time class="timeago" v-bind:datetime="toote.body.created_at.toISOString()" v-on:click="onclick_tt_datetime">{{toote.body.created_at.toLocaleString()}}</time></a>
            <a class="tt_menubtn waves-effect waves-grey1 btn-flat " v-on:click="onclick_morevert"><i class="material-icons">more_vert</i></a> 
        </div>  
<!----toot share range-->
        <div class="toot_share_range truncate" v-bind:class="toote.shareColor">
            <i class="material-icons">arrow_drop_down</i>  
            <v-img v-if="toote.reblogOriginal" v-bind:src="toote.reblogOriginal.account.avatar" class="toot_prof userrectangle" v-on:mouseenter="onenter_avatar" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
            <span v-html="ch2seh(toote.translateText.visibility)" style="float:left;"></span>
            <span v-html="ch2seh(toote.translateText.visibility2)"></span> 
            <input v-if="toote.reblogOriginal" type="hidden" name="sender_id" alt="boost" v-bind:value="toote.reblogOriginal.account.id">
        </div> 
<!-----toot main content (spoiler or content)-->
        <div class="toot_content_body" v-bind:class="toot_body_stat">
            <pre class="toote_spoiler_or_main" v-html="ch2seh(toote.body.spoilered ? toote.body.spoiler_text : toote.body.html)"></pre>
            <div class="area_spoiler" v-if="toote.body.spoilered">  
                <!--<label class="button_spoiler">
                    <input type="checkbox">
                    <pre class="toote_main " v-html="toote.body.html"></pre>
                </label>-->
                <details>
                    <summary>...</summary>
                    <pre class="toote_main " v-html="ch2seh(toote.body.html)"></pre>
                </details>
            </div>
        </div>  
    </div>
    <!-----toot with geo-->
    <div class="toot_content_geo" v-if="toote.geo.enabled">
        <v-layout row wrap>
            <!--<v-flex xs12>
                <img :src="geoyolp(toote.geo.location[0])" width="100%"></img>
            </v-flex>-->
            <v-flex xs12 sm12 md7>
                <!--<template v-if="popuping == 'ov_'">
                    <div id="heremap_ov" class="here_map"></div>
                </template>
                <template v-else>
                    <div :id="'heremap'+toote.id" class="here_map"></div>
                </template>-->
                <img :src="geomap" width="100%" style="cursor:pointer;" v-on:click="onclick_map"></img>
            </v-flex>
            <v-flex xs12 sm12 md5>
                <div class="toot_content_locos">
                    <v-list>
                        <v-list-tile v-for="(item,index) in toote.geo.location" :key="index" v-on:click="onclick_selloco(item,index)">
                            <v-list-tile-content>
                                {{item.name}}
                            </v-list-tile-content>
                            <v-divider></v-divider>
                        </v-list-tile>
                    </v-list>
                </div>
            </v-flex>
        </v-layout>
    </div>
    <!-----toot with link-->
    <div class=" card-link" v-if="toote.mainlink.exists">
        <div class="card"> 
        <a v-bind:href="toote.mainlink.url" target="_blank" rel="noopener"> 
            <div class="image-area card-image"> 
            <v-img v-if="toote.mainlink.isimage" class="v-img" v-bind:src="toote.mainlink.image" v-bind:alt="toote.mainlink.description" v-bind:title="toote.mainlink.description" ></v-img>
            <span class="link-title truncate" :title="toote.mainlink.site"><i class="material-icons">link</i> 
                <span class="link-site" v-html="ch2seh(toote.mainlink.site)"></span> 
            </span> 
            </div> 
            <div class="card-content link-content grey-text text-darken-1">
            <b class="site-title truncate">{{ toote.mainlink.title }}</b> 
            <p class="description-truncate">{{ toote.mainlink.description }}</p> 
            </div> 
        </a> 
        </div>
    </div> 
<!-----toot media -->
    <div class="card-image" v-if="toote.medias.length > 0">
        <div class="xcarousel xcarousel-slider center"> 
            <tootgallery-carousel
                v-bind:medias="toote.medias"
                v-bind:sensitive="toote.body.sensitive"
                v-bind:translation="translation"
                v-bind:viewmode="gal_viewmode"
            ></tootgallery-carousel>
        </div> 
    </div>  
<!-----reaction for the toot-->
    <div class="toot_content_action toot_action bottom" v-if="hide_on_noauth"> 
        <v-tooltip bottom>
            <v-btn icon slot="activator" v-on:click="onclick_ttbtn_reply">
                <v-icon>reply</v-icon>
            </v-btn>
            <!--<button slot="activator" class="ttbtn_reply btn-floating btn waves-effect waves-grey1 grey lighten-3" ><i class="material-icons black-text" v-on:click="onclick_ttbtn_reply">reply</i></button>  

                -->
            <span>{{ translation.cons_reply}}</span>
        </v-tooltip>
        <span class="reaction-count" v-show="toote.body.replies_count > 0" v-bind:class="{zero:(toote.descendants.length==0)}">{{ toote.body.replies_count }}</span>  
        
        <div class="right">  
            <i class="material-icons black-text" v-show="toote.body.muted">volume_off</i>
            <v-tooltip bottom>
                <button slot="activator" class="ttbtn_fav btn-floating btn waves-effect waves-grey1 grey" v-bind:class="toote.reactions.fav" v-on:click="onclick_ttbtn_fav"><i class="material-icons black-text">{{ favourite_icon }}</i></button>  
                <span>{{ favourite_type }}</span>
            </v-tooltip>
            <a v-on:click="onclick_reaction_fav(toote)"><span class="reaction-count" v-bind:class="{zero:(toote.body.favourites_count==0)}">{{ toote.body.favourites_count }}</span></a>
            <v-tooltip bottom>
                <button slot="activator" class="ttbtn_bst btn-floating btn waves-effect waves-grey1 grey" v-bind:class="toote.reactions.reb" v-on:click="onclick_ttbtn_bst" v-bind:disabled="isBoostable"><i class="material-icons black-text">share</i></button>
                <span>{{ reblog_type }}</span>
            </v-tooltip>
            <a v-on:click="onclick_reaction_bst(toote)"><span class="reaction-count" v-bind:class="{zero:(toote.body.reblogs_count==0)}">{{ toote.body.reblogs_count }}</span></a>
        </div>
        <v-dialog v-model="is_reactiondialog" scrollable max-width="340px">
            <v-card>
                <v-card-title>{{ reaction_dialog_title }}</v-card-title>
                <v-divider></v-divider>
                <v-card-text >
                    <v-list two-line>
                        <v-list-tile avatar v-for="(reactitem,reactindex) in reaction_accounts" :key="reactindex">
                            <v-list-tile-avatar>
                                <img v-bind:src="reactitem.avatar" class="toot_prof userrectangle" v-on:mouseenter="onenter_avatar">
                                <input type="hidden" name="sender_id" alt="reaction" v-bind:value="reactitem.id">
                                <input type="hidden" name="sender_index" v-bind:value="reactindex">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="ch2seh(reactitem.display_name)"></v-list-tile-title>
                                <v-list-tile-sub-title>
                                    <b>@{{ reactitem.username }}<b class="red-text">@{{ reactitem.instance }}</b></b>
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="blue darken-1" flat @click="is_reactiondialog = false">{{ translation.cons_close }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> 
    </div> 
<!-----reply area for the toot-->
    <div class="toot_comment" v-bind:class="comment_stat">
<!-----reply commennt list -->
        <div class="comment-list-area" v-bind:class="comment_list_area_stat">
            <ul class="collection comment-list" v-bind:class="elementStyle.commentList"> 
                <li class="collection-item avatar" v-bind:id="replyElementId(reply.body)" v-bind:key="replyElementId(reply.body)" v-for="(reply,index) in toote.descendants">  
                    <v-img v-bind:src="reply.account.avatar" class="userrectangle replycircle"  v-on:mouseenter="onenter_avatar" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
                    <input type="hidden" name="sender_id" alt="reply" v-bind:title="index" v-bind:value="reply.account.id">
                    <span class="subtitle reply_usertitle truncate" v-html='ch2seh(reply_usertitle(reply))'></span>  
                    <!--<p style="width:90%" v-html="reply.body.html">-->
                    <pre class="toote_spoiler_or_main"  style="width:90%;margin-top:5px;" v-html="ch2seh(reply.body.spoilered ? reply.body.spoiler_text : reply.body.html)"></pre>  
                    <div class="area_spoiler" v-if="reply.body.spoilered">  
                        <!--<label class="button_spoiler"><input type="checkbox"><p class="toote_main " v-html="reply.body.html"></p></label>-->
                        <details>
                            <summary>...</summary>
                            <pre class="toote_main " v-html="ch2seh(reply.body.html)"></pre>
                        </details>
                    </div>
                    
                    <br>
                    <div class="xcarousel xcarousel-slider center" v-if="reply.medias.length > 0"> 
                        <!--<template v-if="reply.body.sensitive">
                            <div class="carousel-item grey lighten-4 white-text">
                                <h4 class="sensitive-image-text">{{ _T(translation.sensitive_imagetext,[reply.body.media_attachments.length]) }}</h4>
                                <img v-bind:src="globalinfo.staticpath+'/images/gp_sensitive_image.png'" class="landscape">
                            </div>
                        </template>
                        <div class="carousel-item grey lighten-4 white-text" v-bind:key="item.id" v-for="item in reply.body.media_attachments">  
                            <template v-if="item.type=='video'">
                                <a v-bind:href="item.url" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                                <video controls v-bind:src="item.url" class="landscape" v-if="item.meta.small.width > item.meta.small.height" >Video: {{ item.description }}</video>
                                <video controls v-bind:src="item.url" class="portrait" v-else>Video: {{ item.description }}</video>
                            </template>
                            <template v-else-if="item.type=='gifv'">
                                <a v-bind:href="item.url" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                                <video loop v-bind:src="item.url" class="landscape" v-on:mouseover="onmouseenter_gifv" v-on:mouseout="onmouseleave_gifv" v-if="item.meta.small.width > item.meta.small.height" >Video: {{ item.description }}</video>
                                <video loop v-bind:src="item.url" class="portrait" v-on:mouseover="onmouseenter_gifv" v-on:mouseout="onmouseleave_gifv" v-else>Video: {{ item.description }}</video>
                            </template>
                            <template v-else>
                                <a v-bind:href="item.url" target="_blank" rel="noopener" class="waves-effect waves-light image-popup-btn"><i class="material-icons">open_in_new</i></a>
                                <img v-bind:src="item.preview_url" class="landscape" v-if="item.meta.small.width > item.meta.small.height"   v-bind:alt="item.description">  
                                <img v-bind:src="item.preview_url" class="portrait" v-else v-bind:alt="item.description">  
                            </template>
                        </div> -->
                        <tootgallery-carousel
                            v-bind:medias="reply.medias"
                            v-bind:sensitive="reply.body.sensitive"
                            v-bind:translation="translation"
                            v-bind:viewmode="gal_viewmode"
                        ></tootgallery-carousel>
                    </div> 
                    </p>
                    <div class="secondary-content-ex">
                        <!--<a href="#!" class="tt_datetime" v-bind:title="reply.body.created_at.toLocaleString()" v-on:click="onclick_tt_datetime">{{ reply.body.diff_created_at.text }}</a>-->
                        <a href="#" class="tt_datetime"><time class="timeago" v-bind:datetime="reply.body.created_at.toISOString()" v-on:click="onclick_tt_datetime">{{reply.body.created_at.toLocaleString()}}</time></a>
                        <!--<a class="waves-effect waves-grey1 btn-flat " v-on:click="onclick_morevert"><i class="material-icons">more_vert</i></a>-->
                        <v-menu offset-y left>
                            <v-btn flat icon slot="activator"><v-icon>more_vert</v-icon></v-btn>
                            <v-list>
                                    <v-divider></v-divider>
                                <v-list-tile>
                                    <v-list-tile-title><a v-bind:href="reply.body.url" target="_blank" rel="noopener" class="collection-item">{{ translation.thistoot_original }}</a></v-list-tile-title>
                                </v-list-tile>
                                    <v-divider></v-divider>
                                <v-list-tile v-on:click="onclick_copytext(reply)">
                                    <v-list-tile-title>{{translation.thistoot_copy}}</v-list-tile-title>
                                </v-list-tile>
                                    <v-divider></v-divider>
                                <template v-if="reply.relationship.isme">
                                    <v-list-tile v-on:click="onclick_toote_pinn(reply)">
                                        <v-list-tile-title>{{ reply.body.pinned ? translation.thistoot_unpinned : translation.thistoot_pinned }}</v-list-tile-title>
                                    </v-list-tile>
                                        <v-divider></v-divider>
                                    <v-list-tile v-on:click="onclick_toote_delete(reply,index)">
                                            <v-list-tile-title>{{ translation.thistoot_delete }}</v-list-tile-title>
                                    </v-list-tile>
                                        <v-divider></v-divider>
                                </template>
                    
                                <!--<v-list-tile v-on:click="">
                                    <v-list-tile-title>{{ reply.body.muted ? translation.thistoot_unmute : translation.thistoot_mute }}</v-list-tile-title>
                                </v-list-tile>
                                    <v-divider></v-divider>-->
                                <template v-if="!reply.relationship.isme">
                                    <v-list-tile v-on:click="">
                                        <v-list-tile-title v-html="ch2seh(reply.relationship.muting ? reply.translateText.thisuser_unmute : reply.translateText.thisuser_mute)"></v-list-tile-title>
                                    </v-list-tile>
                                        <v-divider></v-divider>
                                    <v-list-tile v-on:click="">
                                        <v-list-tile-title v-html="ch2seh(reply.relationship.blocking ? reply.translateText.thisuser_unblock : reply.translateText.thisuser_block)"></v-list-tile-title>
                                    </v-list-tile>
                                        <v-divider></v-divider>
                                    <v-list-tile v-on:click="">
                                            <v-list-tile-title v-html="ch2seh(reply.body.pinned ? reply.translateText.thisuser_unendorse : reply.translateText.thisuser_endorse)"></v-list-tile-title>
                                    </v-list-tile>
                                        <v-divider></v-divider>
                                    <v-list-tile v-on:click="">
                                        <v-list-tile-title v-html="ch2seh(reply.translateText.thisuser_report)"></v-list-tile-title>
                                    </v-list-tile>
                                </template>
                            </v-list>
                        </v-menu>
                    </div>
                    <div class="third-content">
                        <v-btn icon v-on:click="onclick_comment_to_reply(index)">
                            <v-icon>reply</v-icon>
                        </v-btn>
                        <!--<a class="btn-flat btn_reply_each waves-effect" v-bind:click.stop="onclick_comment_to_reply(index)"><i class="material-icons">reply</i></a>-->
                        <a class="btn-flat btn_reply_each waves-effect" v-bind:class="reply.reactions.fav" v-bind:data-index="index" v-on:click="onclick_fav_to_reply"><i class="material-icons">{{ favourite_icon }}</i></a>
                        <a v-on:click="onclick_reaction_fav(reply)"><span class="reaction-count" v-bind:class="{zero:(reply.body.favourites_count==0)}">{{ reply.body.favourites_count }}</span></a>
                        <a class="btn-flat btn_reply_each waves-effect" v-bind:class="reply.reactions.reb" v-bind:data-index="index" v-on:click="onclick_bst_to_reply"><i class="material-icons">share</i></a>
                        <span class="reaction-count(reply)" v-bind:class="{zero:(reply.body.reblogs_count==0)}">{{ reply.body.reblogs_count }}</span>  
                    </div>
                </li> 
            </ul>
        </div>
        <!-----reply input box-->
        <div class="toot_comment root_reply" v-if="hide_on_noauth">
            <reply-inputbox ref="replyinput"
                v-bind:popuping="popuping"
                v-bind:id="toote.id"
                v-bind:selaccounts="[]"
                v-bind:visibility="isshow_replyinput"
                v-bind:translation="translation"
                v-bind:globalinfo="globalinfo"
                v-bind:replydata="reply_data"
                v-bind:first_sharescope="toote.body.visibility"
                v-on:replied="onreplied_post"
            ></reply-inputbox>
        </div>      
    </div>  
<!-----reveal menu for the toot-->
    <div class="card-userreveal un-veal">  
        <span class="card-title grey-text text-darken-4">{{ translation.detail }}<span class="right" v-on:click="onclick_vealclose"><i class="material-icons btn_vealclose">close</i></span></span>  
        <div>  
        <v-list>
                <v-divider></v-divider>
            <v-list-tile>
                <v-list-tile-title><a v-bind:href="toote.body.url" target="_blank" rel="noopener" class="collection-item">{{ translation.thistoot_original }}</a></v-list-tile-title>
            </v-list-tile>
                <v-divider></v-divider>
            <v-list-tile v-on:click="onclick_copytext(toote)">
                <v-list-tile-title>{{translation.thistoot_copy}}</v-list-tile-title>
            </v-list-tile>
                <v-divider></v-divider>
            <template v-if="toote.relationship.isme">
                <v-list-tile v-on:click="onclick_toote_pinn(toote)">
                        <v-list-tile-title>{{ toote.body.pinned ? translation.thistoot_unpinned : translation.thistoot_pinned }}</v-list-tile-title>
                </v-list-tile>
                    <v-divider></v-divider>
                <v-list-tile v-on:click="onclick_toote_delete(toote,-1)">
                        <v-list-tile-title>{{ translation.thistoot_delete }}</v-list-tile-title>
                </v-list-tile>
                    <v-divider></v-divider>
            </template>
            <v-list-tile v-on:click="onclick_toote_mute(toote,-1)">
                <v-list-tile-title>{{ toote.body.muted ? translation.thistoot_unmute : translation.thistoot_mute }}</v-list-tile-title>
            </v-list-tile>
                <v-divider></v-divider>
            <template v-if="!toote.relationship.isme">
                <v-list-tile v-on:click="onclick_user_mute(toote.account,-1)">
                    <v-list-tile-title v-html="ch2seh(toote.relationship.muting ? toote.translateText.thisuser_unmute : toote.translateText.thisuser_mute)"></v-list-tile-title>
                </v-list-tile>
                    <v-divider></v-divider>
                <v-list-tile v-on:click="onclick_user_block(toote.account,-1)">
                    <v-list-tile-title v-html="ch2seh(toote.relationship.blocking ? toote.translateText.thisuser_unblock : toote.translateText.thisuser_block)"></v-list-tile-title>
                </v-list-tile>
                    <v-divider></v-divider>
                <v-list-tile v-on:click="onclick_user_endorse(toote.account,-1)">
                    <v-list-tile-title v-html="ch2seh(toote.body.pinned ? toote.translateText.thisuser_unendorse : toote.translateText.thisuser_endorse)"></v-list-tile-title>
                </v-list-tile>
                    <v-divider></v-divider>
                <v-list-tile v-on:click="onclick_user_report(toote.account, toote, -1)">
                    <v-list-tile-title v-html="ch2seh(toote.translateText.thisuser_report)"></v-list-tile-title>
                </v-list-tile>
                <v-divider></v-divider>
            </template>
            <v-list-tile v-on:click="onclick_any_link(toote)">
                <v-list-tile-title>{{ translation.to_show_their_instance }}</v-list-tile-title>
            </v-list-tile>

        </v-list>
        <!--<div class="collection">
            <a v-bind:href="toote.body.url" target="_blank" rel="noopener" class="collection-item">{{ translation.thistoot_original }}</a>  
            <a href="#" class="collection-item" v-if="'pinned' in toote.body">{{ toote.body.pinned ? translation.thistoot_unpinned : translation.thistoot_pinned }}</a>  
            <a href="#" class="collection-item">{{ toote.body.muted ? translation.thistoot_unmute : translation.thistoot_mute }}</a>  
            <template v-if="!toote.relationship.isme">
            <a href="#" class="collection-item">{{ toote.relationship.muting ? toote.translateText.thisuser_unmute : toote.translateText.thisuser_mute }}</a>
            <a href="#" class="collection-item">{{ toote.relationship.blocking ? toote.translateText.thisuser_unblock : toote.translateText.thisuser_block }}</a>
            <a href="#" class="collection-item">{{ toote.translateText.thisuser_report }}</a>
            </template>
        </div>  -->
        <dl>
            <dt>{{translation.lab_each_info}}</dt>
            <dd>
                <v-layout row wrap>
                    <v-flex xs12>
                        <a :href="get_instance_original_url(toote)" target="_blank">{{translation.lab_instance_original}}</a>
                    </v-flex>
                    <v-flex xs4>
                            {{translation.lab_original_postdate}}
                        </v-flex>
                        <v-flex xs8>
                            <span>{{toote.body.created_at}}</span>
                        </v-flex>
                        <v-flex xs4>
                            {{translation.lab_language}}
                        </v-flex>
                        <v-flex xs8>
                            <span>{{toote.body.language}}</span>
                        </v-flex>
                        <v-flex xs4>
                            {{translation.lab_source_app}}
                        </v-flex>
                        <v-flex xs8>
                            <template v-if="toote.body.application">
                                <template v-if="toote.body.application.website != ''">
                                    <a :href="toote.body.application.website" target="_blank">{{toote.body.application.name}}</a>
                                </template>
                                <template v-else>
                                    <span>{{toote.body.application.name}}</span>
                                </template>
                            </template>
                            <template v-else>
                                {{translation.lab_unknown}}
                            </template>
                        </v-flex>
                    </v-layout>
            </dd>
            <dt>{{ translation.mentions }}</dt>  
            <dd>  
            <a class="chip" v-for="men in toote.body.mentions" :href="men.url" rel="noopener" target="_blank">{{ men.acct }}</a>  
            </dd>  
            <dt>{{ translation.tags }}</dt>  
            <dd>
            <a class="chip" v-for="tag in toote.body.tags" :href="tag.url" rel="noopener">{{ tag.name }}</a>
            </dd>  
        </dl>  
        </div>  
    </div>
    <input type="hidden" name="tootid" v-bind:value="toote.body.id">
    <input type="hidden" name="userid" v-bind:value="toote.account.id">
</div>
`;


const CONS_TEMPLATE_DMSGBODY = `
<v-layout justify-space-between>
    <!--<v-flex xs1 >
        <template v-if="user_direction.type == 'me'">
            <v-tooltip bottom>
                <v-img v-bind:src="toote.account.avatar" slot="activator" class="toot_prof userrectangle" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
                <span v-html="full_display_name(toote.account)"></span>    
            </v-tooltip>
        </template>
    </v-flex>-->
    <v-flex xs11 style="border-top:1px solid rgba(0,0,0,0.2)">
        <div class="dmsg_onebody">
            <div class="toot_content_body">
                <pre class="toote_spoiler_or_main" v-html="ch2seh(toote.body.spoilered ? toote.body.spoiler_text : toote.body.html)"></pre>  
                <div class="area_spoiler" v-if="toote.body.spoilered">  
                    <!--<label class="button_spoiler">
                        <input type="checkbox">
                        <pre class="toote_main " v-html="toote.body.html"></pre>
                    </label>-->
                    <details>
                        <summary>...</summary>
                        <pre class="toote_main " v-html="ch2seh(toote.body.html)"></pre>
                    </details>
                </div>
            </div>
            <!-----toot with link-->
            <div class=" card-link" v-if="toote.mainlink.exists">
                <div class="card"> 
                <a v-bind:href="toote.mainlink.url" target="_blank" rel="noopener"> 
                    <div class="image-area card-image"> 
                    <v-img v-if="toote.mainlink.isimage" class="v-img" v-bind:src="toote.mainlink.image" v-bind:alt="toote.mainlink.description" v-bind:title="toote.mainlink.description" ></v-img>
                    <span class="link-title truncate"><i class="material-icons">link</i> 
                        <span class="link-site" v-html="ch2seh(toote.mainlink.site)"></span> 
                    </span> 
                    </div> 
                    <div class="card-content link-content grey-text text-darken-1">
                    <b class="site-title truncate">{{ toote.mainlink.title }}</b> 
                    <p class="description-truncate">{{ toote.mainlink.description }}</p> 
                    </div> 
                </a> 
                </div>
            </div> 
        <!-----toot media -->
            <div class=" card-image" v-if="toote.medias.length > 0">  
                <div class="xcarousel xcarousel-slider center"> 
                    <tootgallery-carousel
                        v-bind:medias="toote.medias"
                        v-bind:sensitive="toote.body.sensitive"
                        v-bind:translation="translation"
                        v-bind:viewmode="gal_viewmode"
                    ></tootgallery-carousel>
                </div> 
            </div>  
    
        </div>
        <span>
            <a v-bind:href="toote.body.url" target="_blank">
                <time class="timeago" v-bind:datetime="toote.body.created_at.toISOString()">{{ toote.body.created_at.toLocaleString() }}</time>
            </a>
            <v-tooltip bottom v-if="user_direction.type == 'me'">
                <v-btn flat icon color="primary" slot="activator"
                    v-on:click="onclick_toote_delete(toote,-1)"
                >
                    <v-icon>delete</v-icon>
                </v-btn>
                <span>{{translation.acc_toolbar_remove}}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <v-btn flat icon color="primary" slot="activator" 
                    v-bind:class="toote.reactions.fav" 
                    v-on:click="onclick_ttbtn_fav">
                    <v-icon>{{ favourite_icon }}</v-icon>
                </v-btn>
                <span>{{ favourite_type }}</span>
            </v-tooltip>
            <a v-on:click="onclick_reaction_fav(toote)"><span class="reaction-count" v-bind:class="{zero:(toote.body.favourites_count==0)}">{{ toote.body.favourites_count }}</span></a>
        </span>
        <v-dialog v-model="is_reactiondialog" scrollable max-width="340px">
            <v-card>
                <v-card-title>{{ reaction_dialog_title }}</v-card-title>
                <v-divider></v-divider>
                <v-card-text >
                    <v-list two-line>
                        <v-list-tile avatar v-for="(reactitem,reactindex) in reaction_accounts" :key="reactindex">
                            <v-list-tile-avatar>
                                <img v-bind:src="reactitem.avatar" class="toot_prof userrectangle" v-on:mouseenter="onenter_avatar">
                                <input type="hidden" name="sender_id" alt="reaction" v-bind:value="reactitem.id">
                                <input type="hidden" name="sender_index" v-bind:value="reactindex">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="ch2seh(reactitem.display_name)"></v-list-tile-title>
                                <v-list-tile-sub-title>
                                    <b>@{{ reactitem.username }}<b class="red-text">@{{ reactitem.instance }}</b></b>
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="blue darken-1" flat @click="is_reactiondialog = false">{{ translation.cons_close }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> 
            
    </v-flex>
    <v-flex xs1>
        <template v-if="user_direction.type == 'they'">
            <v-tooltip bottom>
                <v-img v-bind:src="toote.account.avatar" slot="activator" class="toot_prof userrectangle" v-bind:height="elementStyle.toot_avatar_imgsize"></v-img>
                <span v-html="ch2seh(full_display_name(toote.account))"></span>    
            </v-tooltip>
        </template>
    </v-flex>
</v-layout>
`;