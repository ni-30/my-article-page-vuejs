<template>
  <div>
    <logo-header :showAccountDropDown="true"/>
    <h1 ref="articleLoadingSpinnerRef" class="text-center"><i class="text-light fa fa-spinner fa-spin" aria-hidden="true"></i></h1>

    <div ref="titleContainerRef" v-if="articleId == null" class="container text-light p-3 text-center d-none">
      <input v-model="article.title" type="input" class="form-control" placeholder="Write title..." maxlength="150">
      <small ref="titleValidationMsgRef" class="text-danger"></small><br>
      <button ref="submitTitleBtnRef" v-on:click="submitTitle()" type="button" class="btn btn-primary mt-3">Next <i class="d-none fa fa-circle-o-notch fa-spin" aria-hidden="true"></i></button>
    </div>

    <div v-else>
      <div id="article-container" class="container text-light mb-5 p-2 mt-5">
        <h4 id="article-title" class="text-light text-center mb-5">{{article.title}}</h4>
        <template v-for="content in article.contents">
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

      <div v-if="article.contents.length > 0" class="container p-2 text-center" style="margin-bottom:600px;">
        <small ref="undoAndPublishMsgRef" class="text-danger"></small><br><br>
        <button v-on:click="undoArticleContents()" type="button" class="btn btn-primary btn-sm ml-2 mr-2">Undo <i class="d-none fa fa-circle-o-notch fa-spin" aria-hidden="true"></i></button>
        <button v-on:click="publishArticle()" type="button" class="btn btn-primary btn-sm ml-2 mr-2">Publish <i class="d-none fa fa-circle-o-notch fa-spin" aria-hidden="true"></i></button>
      </div>
      <div id="create-article-tool" class="container-fluid p-2 pt-1 text-center">
        <i v-if="isUpdatingContent" class="fa fa-circle-o-notch fa-spin fa-2x text-white p-2" aria-hidden="true"></i><br>
        
        <small v-if="selectedEditorType == null" class="text-dark">select editor below to add content</small>
        
        <div v-else-if="selectedEditorType == 'header'" class="row text-center">
          <input v-model="editor.header" type="input" class="form-control pl-3 pr-3 mb-2" placeholder="Write header here..." maxlength="150">
          <div class="col">
            <button v-on:click="headerDone()" v-bind:disabled="editor.header == null || editor.header == ''" type="button" class="btn btn-primary btn-sm btn-block">Done</button>
          </div>
          <div class="col">
            <button v-on:click="editor.header = null" type="button" class="btn btn-primary btn-sm btn-block">Clear</button>
          </div>
        </div>

        <div v-else-if="selectedEditorType == 'paragraph'" class="row text-center">
          <textarea v-model="editor.paragraph" class="form-control pl-3 pr-3 mb-2" placeholder="Write paragraph here..." rows=5></textarea>
          <div class="col">
            <button v-on:click="paragraphDone()" v-bind:disabled="editor.paragraph == null || editor.paragraph == ''" type="button" class="btn btn-primary btn-sm btn-block">Done</button>
          </div>
          <div class="col">
            <button v-on:click="editor.paragraph = null" type="button" class="btn btn-primary btn-sm btn-block">Clear</button>
          </div>
        </div>

        <div v-else-if="selectedEditorType == 'list'" class="row text-center">
          <ul class="text-secondary text-left">
            <li v-for="e in editor.list.items" :key="e">{{e}}</li>
          </ul>
          <input v-model="editor.list.current" type="input" class="form-control pl-3 pr-3 mb-2" v-bind:placeholder="'Write Item '+(editor.list.items.length + 1)" maxlength="150">
          <div class="col">
            <div class="row mb-2">
              <div class="col">
                <button v-on:click="editor.list.items.push(editor.list.current); editor.list.current = null;" v-bind:disabled="editor.list.current == null || editor.list.current == ''" type="button" class="btn btn-primary btn-sm btn-block">Add Last</button>
              </div>
              <div class="col">
                <button v-on:click="editor.list.items.pop()" v-bind:disabled="editor.list.items.length == 0" type="button" class="btn btn-primary btn-sm btn-block">Remove Last</button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <button v-on:click="listDone()" v-bind:disabled="editor.list.items.length == 0" type="button" class="btn btn-primary btn-sm btn-block">Done</button>
              </div>
              <div class="col">
                <button v-on:click="editor.list = {items: [], current : null}" type="button" class="btn btn-primary btn-sm btn-block">Clear</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedEditorType == 'image'" class="row text-center">
          <input v-model="editor.image.src" type="input" class="form-control pl-3 pr-3 mb-1" placeholder="Enter image url here...">
          <input v-model="editor.image.source" type="input" class="form-control pl-3 pr-3 mb-2" placeholder="Write source of image here...">
          <div class="col">
            <button v-on:click="imageDone()" v-bind:disabled="editor.image.src == null || editor.image.src == ''" type="button" class="btn btn-primary btn-sm btn-block">Done</button>
          </div>
          <div class="col">
            <button v-bind:disabled="isUpdatingContent" type="button" class="btn btn-primary btn-sm btn-block btn-file">
              Choose File
              <input v-bind:disabled="isUpdatingContent" ref="imageFileInputRef" @change="imageFileAdded($event)" class="form-control" type="file" accept="image/*">            
            </button>
          </div>
          <div class="col">
            <button v-on:click="editor.image = {src: null, source: null}" type="button" class="btn btn-primary btn-sm btn-block">Clear</button>
          </div>
        </div>

        <div class="row mt-2">
            <div v-on:click="selectedEditorType = 'header'" class="col btn">
              <span v-bind:class="{'font-weight-bold': selectedEditorType == 'header', 'text-white': selectedEditorType == 'header', 'text-secondary': selectedEditorType != 'header'}">Header</span>
            </div>
            <div v-on:click="selectedEditorType = 'paragraph'" class="col btn">
              <span v-bind:class="{'font-weight-bold': selectedEditorType == 'paragraph', 'text-white': selectedEditorType == 'paragraph', 'text-secondary': selectedEditorType != 'paragraph'}">Paragraph</span>
            </div>
            <div v-on:click="selectedEditorType = 'image'" class="col btn">
              <span v-bind:class="{'font-weight-bold': selectedEditorType == 'image', 'text-white': selectedEditorType == 'image', 'text-secondary': selectedEditorType != 'image'}">Image</span>
            </div>
            <div v-on:click="selectedEditorType = 'list'" class="col btn">
              <span v-bind:class="{'font-weight-bold': selectedEditorType == 'list', 'text-white': selectedEditorType == 'list', 'text-secondary': selectedEditorType != 'list'}">List</span>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cloudService from './cloudService.js'
import EventBus from './EventBus.js'

export default {
  name: 'createArticlePage',
  data () {
    return {
      isUpdatingContent: false,
      selectedEditorType: null,
      articleId: null,
      article: {
        title: null,
        contents: []
      },
      editor: {
        header: null,
        paragraph: null,
        list: {
          items: [],
          current: null
        },
        image: {
          src: null,
          source: null
        }
      }
    }
  },
  methods: {
    validateTitle: function(title) {
      for (var i=0; i < title.length; i++) {
        var code = title.charCodeAt(i);
        if (!(code == 32
            || (code >= 48 && code <= 57)
            || (code >= 48 && code <= 57)
            || (code >= 65 && code <= 90)
            || (code >= 97 && code <= 122))) {
          return false;
        }
      }

      return true;
    },
    getUrlParam: function(param){
        var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
        if (results==null) {
            return null;
        }
        var param = decodeURI(results[1]) || 0;
        if (param != null && param.endsWith("#")) {
            param = param.slice(0, param.length-1);
        }
        return param;
    },
    imageFileAdded: function(event) {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;

      this.editor.image.src = null;
      var instance = this;
      var file = event.target.files[0];
      cloudService.putArticleImage(file).then(function(url){
        instance.editor.image.src = url;
        instance.isUpdatingContent = false;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        console.error("failed to upload image", error);
      });
    },
    headerDone: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      var content = {
        id: new Date().getTime().toString(),
        type: "header",
        header: this.editor.header
      };
      var instance = this;
      cloudService.addLastArticleContent(this.articleId, content).then(function(){
        instance.editor.header = null;
        instance.article.contents.push(content);
        instance.isUpdatingContent = false;
        instance.selectedEditorType = null;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        console.error("error while appending header content", error);
      });
    },
    paragraphDone: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      var content = {
        id: new Date().getTime().toString(),
        type: "paragraph",
        paragraph: this.editor.paragraph
      };
      var instance = this;
      cloudService.addLastArticleContent(this.articleId, content).then(function(){
        instance.editor.paragraph = null;
        instance.article.contents.push(content);
        instance.isUpdatingContent = false;
        instance.selectedEditorType = null;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        console.error("error while appending paragraph content", error);
      });
    },
    listDone: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      var content = {
        id: new Date().getTime().toString(),
        type: "list",
        list: this.editor.list.items
      };
      var instance = this;
      cloudService.addLastArticleContent(this.articleId, content).then(function(){
        instance.editor.list.items = [];
        instance.editor.list.current = null;
        instance.article.contents.push(content);
        instance.isUpdatingContent = false;
        instance.selectedEditorType = null;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        console.error("error while appending list content", error);
      });
    },
    imageDone: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      var content = {
        id: new Date().getTime().toString(),
        type: "image",
        src: this.editor.image.src,
        source: this.editor.image.source,
      };
      var instance = this;
      cloudService.addLastArticleContent(this.articleId, content).then(function(){
        instance.editor.image.src = null;
        instance.editor.image.source = null;
        instance.article.contents.push(content);
        instance.isUpdatingContent = false;
        instance.selectedEditorType = null;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        console.error("error while appending image content", error);
      });
    },
    undoArticleContents: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      this.$refs.undoAndPublishMsgRef.innerHTML = "";
      var content = this.article.contents[this.article.contents.length - 1];
      var instance = this;
      cloudService.removeArticleContent(this.articleId, content).then(function(){
        instance.article.contents.pop();
        instance.isUpdatingContent = false;
      }).catch(function(error){
        instance.isUpdatingContent = false;
        instance.$refs.undoAndPublishMsgRef.innerHTML = "Whoops! Something went wrong.";
        console.log("error in popping content from article.", error);
      });
    },
    publishArticle: function() {
      if (this.isUpdatingContent) {return;}
      this.isUpdatingContent = true;
      this.$refs.undoAndPublishMsgRef.innerHTML = "";
      var instance = this;
      cloudService.publishArticle(this.articleId).then(function(){
        window.location.href = ('/page?ref=' + instance.articleId);
        instance.isUpdatingContent = false;
      }).catch(function(error){
        instance.$refs.undoAndPublishMsgRef.innerHTML = "Whoops! Something went wrong.";
        instance.isUpdatingContent = false;
        console.log("error in publishing content article.", error);
      });
    },
    submitTitle: function() {
      this.$refs.titleValidationMsgRef.innerHTML = "";
      this.$refs.submitTitleBtnRef.getElementsByTagName('i')[0].classList.remove('d-none');
      this.$refs.submitTitleBtnRef.setAttribute("disabled", true);
      var isValid = true;

      if (this.article.title == null || this.article.title == "") {
        this.$refs.titleValidationMsgRef.innerHTML = "Title can not be empty";
        isValid = false;
      }else if (this.article.title.length < 30) {
        this.$refs.titleValidationMsgRef.innerHTML = "Minimum 30 characters are required";
        isValid = false;
      } else if (!this.validateTitle(this.article.title)) {
        this.$refs.titleValidationMsgRef.innerHTML = "Title should not contain any special character. It can contain only 'A-Z', 'a-z' & '0-9' characters.";
        isValid = false;
      }

      if (!isValid) {
        this.$refs.submitTitleBtnRef.getElementsByTagName('i')[0].classList.add('d-none');
        this.$refs.submitTitleBtnRef.removeAttribute("disabled");
        return;
      }

      var instance = this;
      cloudService.createArticleDoc(this.article.title).then(function(articleId){
        window.location.href = "/publish?ref=" + articleId;

        instance.articleId = articleId;
        instance.$refs.submitTitleBtnRef.getElementsByTagName('i')[0].classList.add('d-none');
        instance.$refs.submitTitleBtnRef.removeAttribute("disabled");
      }).catch(function(error) {
        instance.$refs.submitTitleBtnRef.getElementsByTagName('i')[0].classList.add('d-none');
        instance.$refs.submitTitleBtnRef.removeAttribute("disabled");
        if (error.code == "duplicate-title") {
          instance.$refs.titleValidationMsgRef.innerHTML = "Duplicate title! Try another title.";
        } else {
          instance.$refs.titleValidationMsgRef.innerHTML = "Whoops! Something went wrong.";
          console.error("error while creating article doc", error);
        }
      });
    }
  },
  mounted() {
    this.$nextTick(function(){
      var articleId = this.getUrlParam("ref");
      if (articleId != null && articleId != "") {
        var instance = this;
        cloudService.getArticleDoc(articleId, false).then(function(doc) {
          instance.$refs.articleLoadingSpinnerRef.classList.add('d-none');
          if (doc == null) {
            window.location.href = "/publish";
          } else {
            instance.article = doc.article;
            instance.articleId = articleId;
          }
          instance.$refs.titleContainerRef.classList.remove('d-none');
        }).catch(function(error) {
          instance.$refs.articleLoadingSpinnerRef.innerHTML = "Whoops! Something went wrong.";
          console.error("error while getting article for article id - %s", articleId, error);
        });
      } else {
        this.$refs.articleLoadingSpinnerRef.classList.add('d-none');
        this.$refs.titleContainerRef.classList.remove('d-none');
      }
    });
  },
  created() {
    EventBus.$on('login-status', function(isLoggedIn){
      if (!isLoggedIn) {
        window.location.href = "/login";
      }
    });
  }
}
</script>

<style lang="scss" scoped>
#create-article-tool {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #000;
}
.content-header {
    font-size: 16px;
}
.content-paragraph {
    font-size: 14px;
}
.content-list {
    font-size: 14px;
}
#article-container {
  font-family: 'Roboto';
}
.container {
  font-family: 'Roboto';
}
.btn-file {
    position: relative;
    overflow: hidden;
}
.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    font-size: 100px;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    background: white;
    cursor: inherit;
    display: block;
}
</style>
