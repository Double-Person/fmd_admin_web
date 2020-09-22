<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
      <img src="../../assets/logo.png" alt="logo" width="40">
      <span class="logo-tit" v-if="showTitle">{{ title }}</span>
    </router-link>
  </div>
</template>

<script>
  export default {
    name: 'Logo',
    props: {
      title: {
        type: String,
        // default: 'Jeecg-Boot Pro',
        default: '福满多',
        required: false
      },
      showTitle: {
        type: Boolean,
        default: true,
        required: false
      }
    }
  }
</script>
<style lang="scss" scoped>
  /*缩小首页布 局顶部的高度*/
  $height: 59px;

  .sider {
    box-shadow: none !important;
    .logo {
      padding: 0 0 0 26px;
      height: $height !important;
      line-height: $height !important;
      box-shadow: none !important;
      transition: background 300ms;

      a {
        display: inline-block;
        width: 100%;
        color: white;
        img{
          width: 40px;
          height: 40px;
        }
        .logo-tit{
          margin: 0 0 0 9px;
          display: inline-block;
          font-size: 18px;
        }
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    &.light .logo {
      background-color: #1890ff;
    }
  }
</style>