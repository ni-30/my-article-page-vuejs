<template>
  <div>
    <div v-if="showAccountDropDown" class="dropdown text-right p-2 text-secondary">
      <small class="dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown">Your Account</small>
      <div class="dropdown-menu text-center" aria-labelledby="dropdownMenuButton">
        <div class="dropdown-item">
          <button ref="loginLogoutBtnRef" v-on:click="loginLogout()" type="button" class="btn btn-primary btn-sm btn-block">{{isLoggedIn ? 'Logout' : 'Login'}}</button>
        </div>
        <a v-if="isLoggedIn" class="dropdown-item mt-2" href="/author">Your Articles</a>
      </div>
    </div>
    <div id="logo-header" class="jumbotron-fluid text-center mb-5 pb-5 pt-2">
      <a href="/" class="btn text-white">{{logoName}}</a><br>
      <small class="text-white">Write. Publish. Share</small>
    </div>
  </div>
</template>

<script>
import EventBus from './EventBus.js'
import cloudService from './cloudService.js'

export default {
  name: 'logoHeader',
  props: {showAccountDropDown: {type: Boolean, default: false}},
  data () {
    return {
      logoName: "My Article Page",
      isLoggedIn: false
    }
  },
  methods: {
    loginLogout: function() {
      if (this.isLoggedIn) {
        var instance = this;
        instance.$refs.loginLogoutBtnRef.setAttribute("disabled", true);
        cloudService.logout().then(function(){
          instance.$refs.loginLogoutBtnRef.removeAttribute("disabled");
        }).catch(function(error){
          instance.$refs.loginLogoutBtnRef.removeAttribute("disabled");
          console.error("failed to logout", error);
        });
      } else {
        window.location.href = "/login";
      }
    }
  },
  created() {
    var instance = this;
    EventBus.$on('login-status', function(isLoggedIn){
      instance.isLoggedIn = isLoggedIn;
    });
  }
}
</script>

<style lang="scss">
.dropdown {
  font-family: 'Roboto';
}
#logo-header a {
  font-family: 'Monoton', sans-serif;
  font-size: 50px;
  font-weight: bold;
}
#logo-header small {
  font-family: 'Great Vibes', sans-serif;
}
body {
  background-image: linear-gradient(90deg, #000, #262626);
}
</style>
