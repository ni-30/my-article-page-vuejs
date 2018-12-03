<template>
  <div>
    <logo-header :showAccountDropDown="true"/>
    <div class="container text-light mb-5 mt-5 pt-5 text-center">
      <p style="font-family:'Pacifico'">Write and publish your own article and share within your social circle.</p>
      <a href="/publish" class="btn btn-primary btn-lg mt-2">Write Article</a>
    </div>
  </div>
</template>

<script>
import cloudService from './cloudService.js'
export default {
    name: 'homePage',
    data () {
        return {
            
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
  font-family: 'Roboto';
}
</style>
