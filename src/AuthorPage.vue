<template>
  <div>
    <logo-header :showAccountDropDown="true" />
    <div class="container text-light p-2">
        <div class="text-center mb-3">
            <a href="/publish" class="btn btn-primary btn-sm text-right">Write New Article</a>
        </div>
        <h5 ref="msgHeaderRef" class="text-secondary text-center mt-5 mb-5 d-none">Your account is empty</h5>
        <h1 ref="loadingSpinnerRef" class="text-center"><i class="text-light fa fa-spinner fa-spin" aria-hidden="true"></i></h1>
        <div v-for="doc in docs" :key="doc.article.title" class="bg-light text-dark p-2 m-2 rounded">
            <button v-on:click="deleteArticle(doc)" type="button" class="btn btn-primary btn-sm ml-2 mr-2 pl-3 pr-3 pt-0 pb-0"><small>Delete</small></button>
            <small v-bind:class="{'text-danger': doc.publishedAt == null, 'text-success': doc.publishedAt != null}">{{doc.publishedAt == null ? 'NOT PUBLISHED' : 'PUBLISHED'}}</small>
            <br>
            <a class="text-dark font-weight-bold" v-bind:href="(doc.publishedAt == null ? '/publish?ref=' : '/page?ref=') + doc.titleId">{{doc.article.title}}</a>
            
            <div class="row text-secondary mt-1">
                <div class="col text-left">
                    <small>Created on</small><br>
                    <small>{{doc.createdAt.toDate().toDateString()}}</small>
                </div>
                <div v-if="doc.publishedAt != null" class="col text-right">
                    <small>Published on</small><br>
                    <small>{{doc.publishedAt.toDate().toDateString()}}</small>                    
                </div>
            </div>
        </div>
        <div v-if="docs.length > 0" class="text-center mb-3">
            <small ref="loadMoreMsgRef"></small><br>
            <button ref="loadMoreBtnRef" v-on:click="loadMoreArticle()" type="button" class="btn btn-primary btn-sm ml-2 mr-2">Load More <i class="d-none fa fa-circle-o-notch fa-spin" aria-hidden="true"></i></button>
        </div>
    </div>
  </div>
</template>

<script>
import EventBus from './EventBus.js'
import cloudService from './cloudService.js'
export default {
    name: 'AuthorPage',
    data () {
        return {
            docs: []
        }
    },
    methods: {
        deleteArticle: function(doc) {
            for(var i = 0; i < this.docs.length; i++) {
                if(this.docs[i].titleId == doc.titleId) {
                    this.docs.splice(i, 1);
                    break;
                }
            }
            cloudService.deleteArticle(doc.titleId);
        },
        loadMoreArticle: function() {
            this.$refs.loadMoreMsgRef.innerHTML = "";
            this.$refs.loadMoreBtnRef.setAttribute("disabled", true);
            this.$refs.loadMoreBtnRef.getElementsByTagName('i')[0].classList.remove('d-none');
            var instance = this;
            cloudService.getArticlesByAuthor(instance.docs.length == 0 ? null : instance.docs[instance.docs.length - 1].createdAt).then(function(docs){
                if(docs.length == 0) {
                   instance.$refs.loadMoreMsgRef.innerHTML = "No more article found";
                   instance.$refs.loadMoreBtnRef.classList.add('d-none');
                } else {
                    instance.docs = instance.docs.concat(docs);
                    instance.$refs.loadMoreBtnRef.removeAttribute("disabled");
                    instance.$refs.loadMoreBtnRef.getElementsByTagName('i')[0].classList.add('d-none');
                }
            }).catch(function(error){
                instance.$refs.loadMoreMsgRef.innerHTML = "Whoops! Something went wrong.";
                instance.$refs.loadMoreBtnRef.removeAttribute("disabled");
                instance.$refs.loadMoreBtnRef.getElementsByTagName('i')[0].classList.add('d-none');
                console.error("error while getting author docs", error);
            });
        }
    },
    created() {
        EventBus.$on('login-status', function(isLoggedIn){
            if (!isLoggedIn) {
                window.location.href = "/login";
            }
        });
        var instance = this;
        EventBus.$once('login-status', function(isLoggedIn){
            if (isLoggedIn) {
                cloudService.getArticlesByAuthor(instance.docs.length == 0 ? null : instance.docs[instance.docs.length - 1].createdAt).then(function(docs){
                    instance.$refs.loadingSpinnerRef.classList.add('d-none');
                    if(docs.length == 0) {
                        instance.$refs.msgHeaderRef.classList.remove('d-none');
                    } else {
                        instance.docs = instance.docs.concat(docs);
                    }
                }).catch(function(error){
                    instance.$refs.loadingSpinnerRef.classList.add('d-none');
                    console.error("error while getting author docs", error);
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped>
.container {
    font-family: 'Roboto';
}
</style>
