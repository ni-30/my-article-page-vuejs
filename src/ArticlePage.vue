<template>
  <div>
    <logo-header/>
    <h1 ref="articleLoadingSpinnerRef" class="text-center"><i class="text-light fa fa-spinner fa-spin" aria-hidden="true"></i></h1>
    <h4 ref="errorMsgHeaderRef" class="text-secondary text-center d-none"></h4>
    <div v-if="doc != null">
        <div id="article-container" class="container text-light mb-5 p-2 pb-5 mt-5">
            <h4 id="article-title" class="text-light">{{doc.article.title}}</h4>
            <div id="article-author-container" class="mb-4 text-secondary">
                <img v-if="doc.author.photoURL != null" width="30" height="30" class="rounded-circle mr-1" v-bind:src="doc.author.photoURL"/>
                <small v-if="doc.author.displayName != null">{{doc.author.displayName}} | </small>
                <small>{{doc.publishedAt.toDate().toDateString()}}</small>
            </div>
            <template v-for="content in doc.article.contents">
                <p v-if="content.type == 'header'" :key="content.id" class="content-header font-weight-bold pt-2 mb-2">{{content.header}}</p>
                <p v-else-if="content.type == 'paragraph'" :key="content.id" class="content-paragraph">{{content.paragraph}}</p>
                <div v-else-if="content.type == 'html'" :key="content.id" v-html="content.html" class="content-html"></div>
                
                <div v-else-if="content.type == 'image'" :key="content.id" class="w-100 mb-3">
                    <img  :src="content.src" class="rounded shadow w-100" />
                    <small v-if="content.source != null" class="text-secondary mt-0">Photo Credit: {{content.source}}</small>
                </div>

                <ul v-else-if="content.type == 'list'" :key="content.id" class="content content-list">
                    <li v-for="i in content.list.length" :key="i">{{content.list[i-1]}}</li>
                </ul>
            </template>
        </div>
        <div id="article-bottom-container" class="container text-light text-center mt-5">
            <div class="border-dark border-top ml-2 mr-2 mb-2"></div>
            <a href="/publish" class="btn btn-primary pl-3 pr-3" style="font-family:'Pacifico'">Write Your Own Article</a>
        </div>
        <div id="article-footer" class="container-fluid text-light p-2 text-center">
            <div class="row">
                <div class="col">
                    <i v-on:click="whatsappShare()" class="btn fa fa-whatsapp fa-2x" aria-hidden="true" style="color:#25D366"></i>
                </div>
                <div class="col">
                    <i v-on:click="facebookShare()" class="btn fa fa-facebook-square fa-2x" aria-hidden="true" style="color:#3b5998"></i>  
                </div>
                <div class="col">
                    <i v-on:click="twitterShare()" class="btn fa fa-twitter-square fa-2x" aria-hidden="true" style="color:#38A1F3"></i>        
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import cloudService from './cloudService.js'

export default {
    name: 'articlePage',
    data () {
        return {
            doc: null
        }
    },
    methods: {
        setMetaTags: function(article) {
            try {
                var head = document.getElementsByTagName('head')[0];

                var metaDescription = document.createElement('meta');
                metaDescription.name = "description";
                metaDescription.content = article.title;
                head.appendChild(metaDescription);
                for (var i=0; i < article.contents.length; i++) {
                    if (article.contents[i].type == "image") {
                        var metaImage = document.createElement('meta');
                        metaImage.name = "og:image";
                        metaImage.content = article.contents[i].src;
                        head.appendChild(metaImage);
                        break;
                    }
                }
                
                var metaType = document.createElement('meta');
                metaType.name = "og:type";
                metaType.content = "article";
                head.appendChild(metaType);
            } catch(error) {
                console.error("error while setting meta tag", error);
            }
        },
        whatsappShare: function() {
            window.location.href = "whatsapp://send?text="+ window.encodeURIComponent(this.doc.article.title + "\r\n\r\n" + this.shareLink);
        },
        facebookShare: function() {
            window.location.href = "https://www.facebook.com/sharer/sharer.php?u=" + window.encodeURIComponent(this.shareLink);
        },
        twitterShare: function() {
            window.location.href = "http://twitter.com/share?text=" + window.encodeURIComponent(this.doc.article.title + "\r\n\r\n" + this.shareLink);
        },
        getUrlParam: function(param){
            var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
            if (results==null) {
                return null;
            }
            var param = decodeURI(results[1]) || 0;
            if (param == ""){return null};
            if (param != null && param.endsWith("#")) {
                param = param.slice(0, param.length-1);
            }
            return param;
        }
    },
    computed: {
        articleId: function() {
            return this.getUrlParam("ref");
        },
        shareLink: function() {
            return window.location.href;
        }
    },
    mounted() {
        this.$nextTick(function(){
            if (this.articleId == null) {
                window.location.href = "/";
                return;
            }

            var instance = this;
            cloudService.getArticleDoc(this.articleId, true).then(function(doc) {
                instance.$refs.articleLoadingSpinnerRef.classList.add('d-none');
                if (doc == null) {
                    instance.doc = null;
                    instance.$refs.errorMsgHeaderRef.innerHTML = "Not Found!";
                    instance.$refs.errorMsgHeaderRef.classList.remove('d-none');
                } else {
                    instance.doc = doc;
                    instance.setMetaTags(doc.article);
                }
            }).catch(function(error) {
                console.log("error while - ", error);
                instance.$refs.articleLoadingSpinnerRef.classList.add('d-none');
                instance.$refs.errorMsgHeaderRef.innerHTML = "Whoops! Something went wrong.";
                instance.$refs.errorMsgHeaderRef.classList.remove('d-none');
            })
        });
        
    }
}
</script>

<style lang="scss" scoped>
#article-container {
    font-family: 'Roboto';
}
#article-container .content-header {
    font-size: 16px;
}
#article-container .content-paragraph {
    font-size: 14px;
}
#article-container .content-list {
    font-size: 14px;
}
#article-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #000;
}
#article-bottom-container {
    margin-bottom: 100px;
}
</style>
