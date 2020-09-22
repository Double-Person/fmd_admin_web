Ant Design Jeecg Vue
====



    積分商城點擊查看獲取 評價 信息使用商城的接口 ecommerce
    積分商城條件搜素  下單者賬號，付款狀態無效被隱藏

    眾籌項目 id: 1b3d47e22d37ae117095cd2a83f85c9c  500
    眾籌商品列表  500  列表無數據


        积分商城   Delivery  发货提交函数  dataFormSubmit



        退货详情弹窗---查看详情

表格中的成交价
  retailPrice -  couponPrice   拼单商品，砍价商品
retailPrice 普通商品，众筹商品

拼单商品

  视频列表查看













  众筹列表：商品编号，商品项目字段
  商品列表弹窗商品属性默认选中
用户user	用户登录注册、微信登录等	/user/
公共common	文章接口、广告接口、短信验证码接口、意见反馈、消息管理等	/common/
电商ecommerce	商品分类、公司、门店、商品维护、订单、物流公司、商品评价、砍价、众筹、拼单、资金流水、商品评价等	/ecommerce/
积分商城pointmall	商品分类、公司、门店、商品维护、订单、物流公司、商品评价、增减积分暴露为外部接口能力、积分流水等	/pointmall/
直播live	房间管理、直播能力对接等	/live/
短视频shortvideo	短视频、评价等	/shortvideo/


当前最新版本： 2.0.2（发布日期：20190708）

Overview
----

基于 [Ant Design of Vue](https://vuecomponent.github.io/ant-design-vue/docs/vue/introduce-cn/) 实现的 Ant Design Pro  Vue 版
Jeecg-boot 的前段UI框架，采用前后端分离方案，提供强大代码生成器的快速开发平台。
前端页面代码和后端功能代码一键生成，不需要写任何代码，保持jeecg一贯的强大！！

-
-

-

#### 前端技术

- 基础框架：[ant-design-vue](https://github.com/vueComponent/ant-design-vue) - Ant Design Of Vue 实现
- JavaScript框架：Vue
- Webpack
- node
- yarn
- eslint
- @vue/cli 3.2.1
- [vue-cropper](https://github.com/xyxiao001/vue-cropper) - 头像裁剪组件
- [@antv/g2](https://antv.alipay.com/zh-cn/index.html) - Alipay AntV 数据可视化图表
- [Viser-vue](https://viserjs.github.io/docs.html#/viser/guide/installation)  - antv/g2 封装实现



项目下载和运行
----

- 拉取项目代码
```bash
git clone https://github.com/zhangdaiscott/jeecg-boot.git
cd  jeecg-boot/ant-design-jeecg-vue
```

- 安装依赖
```
yarn install
```

- 开发模式运行
```
yarn run serve
```

- 编译项目
```
yarn run build
```

- Lints and fixes files
```
yarn run lint
```

- 下载最新版本的webpack
```
npm add webpack@latest
```



其他说明
----

- 项目使用的 [vue-cli3](https://cli.vuejs.org/guide/), 请更新您的 cli

- 关闭 Eslint (不推荐) 移除 `package.json` 中 `eslintConfig` 整个节点代码

- 修改 Ant Design 配色，在文件 `vue.config.js` 中，其他 less 变量覆盖参考 [ant design](https://ant.design/docs/react/customize-theme-cn) 官方说明
```ecmascript 6
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */

          'primary-color': '#F5222D',
          'link-color': '#F5222D',
          'border-radius-base': '4px',
        },
        javascriptEnabled: true,
      }
    }
  }
```



附属文档
----
- [Ant Design Vue](https://vuecomponent.github.io/ant-design-vue/docs/vue/introduce-cn)

- [报表 viser-vue](https://viserjs.github.io/demo.html#/viser/bar/basic-bar)

- [Vue](https://cn.vuejs.org/v2/guide)

- [路由/菜单说明](https://github.com/zhangdaiscott/jeecg-boot/tree/master/ant-design-jeecg-vue/src/router/README.md)

- [ANTD 默认配置项](https://github.com/zhangdaiscott/jeecg-boot/tree/master/ant-design-jeecg-vue/src/defaultSettings.js)

- 其他待补充...


备注
----

> @vue/cli 升级后，eslint 规则更新了。由于影响到全部 .vue 文件，需要逐个验证。既暂时关闭部分原本不验证的规则，后期维护时，在逐步修正这些 rules

---