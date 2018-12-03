import Vue from 'vue'
import LogoHeader from './LogoHeader.vue'
import ArticlePage from './ArticlePage.vue'
import CreateArticlePage from './CreateArticlePage.vue'
import LoginPage from './LoginPage.vue'
import HomePage from './HomePage.vue'
import AuthorPage from './AuthorPage.vue'
import PageNotFound from './PageNotFound.vue'

Vue.component('logo-header', LogoHeader);


const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/author': AuthorPage,
  '/page': ArticlePage,
  '/publish': CreateArticlePage
};

new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || PageNotFound
    }
  },
  render (h) { return h(this.ViewComponent) }
});