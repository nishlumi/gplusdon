const CONS_TEMPLATE_REPLYINPUT = `
<div class="template_reply_box" v-bind:id="movingElementID('replydiv_')" v-if="visibility">  
    <v-layout row wrap>
        <v-flex xs1>
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
        <v-flex xs10 style="position:relative;">
            <div 
                v-bind:id="movingElementID('replyinput_')"
                name="inputcontent" 
                class="onetoot_inputcontent" 
                contenteditable 
                v-bind:class="status_class"
                v-on:keydown="onkeydown_inputcontent"
                v-on:keyup="onkeyup_inputcontent"
                v-on:dragover="ondragover_inputcontent"
                v-on:dragleave="ondragleave_inputcontent"
                v-on:drop="ondrop_inputcontent"

                
            >{{ status_text }}</div>
            <span class="reply_input_count subheading toottext_length" v-bind:class="strlength_class" >{{ strlength }}</span>
        </v-flex>
        <v-flex xs11>
            <div class="dv_inputoperation ">
                <v-layout row wrap>
                    <v-flex xs2>
                        <a class="waves-effect waves-red btn-flat"><i class="material-icons medium">add_photo_alternate</i></a>  
                    </v-flex>
                    <v-flex x4 offset-xs4>
                        <div class="">
                            <v-spacer></v-spacer>
                            <a class="btn_reply_cancel waves-effect waves-red btn-flat" 
                                v-on:click="onclick_btn_reply_cancel"
                            >{{ translation.cons_cancel }}</a>  
                            <a class="btn_reply_post waves-effect waves-red btn-flat" 
                                v-on:click="onclick_btn_reply_post" 
                                v-bind:disabled="btnflags.send_disabled"
                            >{{ translation.cons_reply }}</a>  
                        </div> 
                    </v-flex>
                </v-layout> 
            </div>
        </v-flex>
        <v-flex xs12>
            <v-switch
                v-bind:label="translation.image_confirm_msg02"
                v-model="switch_NSFW"
                v-if="selmedias.length > 0"
            ></v-switch>
            
        </v-flex>
        <v-flex xs11 v-if="selmedias.length > 0">
            <v-container grid-list-sm fluid>
                <v-layout row wrap>
                    <v-flex xs3 v-for="(item,index) in selmedias" :key="index">
                        <v-card flat tile>
                            <v-img 
                                v-bind:src="item.src" 
                                v-bind:lazy-src="item.src" 
                                aspect-ratio="1"
                                width="64px"
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
                                <!--<div class="media_commentbox" contenteditable>{? item.comment ?}</div>
                                <v-text-field>{? item.comment ?}</v-text-field>-->
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
    <div class="dv_inputoperation common_ui_off" title="ato de kesu">
        <a class="waves-effect waves-red btn-flat"><i class="material-icons medium">add_photo_alternate</i></a>
        <v-spacer></v-spacer>
        <a class="btn_reply_cancel waves-effect waves-red btn-flat" v-on:click="onclick_btn_reply_cancel">{{ translation.cons_cancel }}</a>  
        <a class="btn_reply_post waves-effect waves-red btn-flat">{{ translation.cons_reply }}</a>  
        <!--<div class="row">
            <div class="col s2">
                  
            </div>
        
            <div class="col s4 offset-s6">  
                
            </div>  
        </div>-->
    </div>
    
</div>
`;