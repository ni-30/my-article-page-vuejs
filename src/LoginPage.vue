<template>
  <div>
    <logo-header :showAccountDropDown="false"/>
    <div id='firebaseui-auth-container' class="mt-5 pt-5"></div>
  </div>
</template>

<script>
import cloudService from './cloudService.js'
import EventBus from './EventBus.js'
var firebaseui = require('firebaseui');
export default {
    name: 'loginPage',
    data () {
        return {
            
        }
    },
    created() {
        var instance = this;
        EventBus.$once('login-status', function(isLoggedIn){
            if (isLoggedIn) {
                instance.$nextTick(function(){
                    window.location.href = "/author";
                });
            }
        });
    },
    mounted(){
        this.$nextTick(function(){
            var signInSuccessUrlRef = this.signInSuccessUrl;
            var ui = new firebaseui.auth.AuthUI(cloudService.getFirebase().auth()).start('#firebaseui-auth-container', {
                signInSuccessUrl: "/author",
                signInOptions: [
                    // List of OAuth providers supported.
                    cloudService.getFirebase().auth.GoogleAuthProvider.PROVIDER_ID,
                    // cloudService.getFirebase().auth.FacebookAuthProvider.PROVIDER_ID,
                    // cloudService.getFirebase().auth.TwitterAuthProvider.PROVIDER_ID,
                    // cloudService.getFirebase().auth.GithubAuthProvider.PROVIDER_ID
                ],
                // Other config options...
            });
        });
    }
}
</script>

<style lang="scss" scoped>

</style>
