<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="属性名称">
          <a-input placeholder="请输入属性名称" v-decorator="['name', validatorRules.name ]" ref="names"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品描述">
          <!--<a-input placeholder="请输入商品描述" v-decorator="['simpleDesc', validatorRules.simpleDesc ]"/>-->
          <!--<a-input placeholder="请输入商品描述" v-model="model.simpleDesc"/>-->
          <a-textarea placeholder="请输入商品描述" allowClear v-decorator="['simpleDesc', validatorRules.simpleDesc ]" :autosize="true"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示">
          <a-switch checkedChildren="是" unCheckedChildren="否" :defaultChecked="isShow" @change="changeIsShow"
                    :key="Math.random()"/>
        </a-form-item>
        <a-form-item
          label="品牌大图"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png"
            :showUploadList="false"
            :beforeUpload="frontBeforeUpload"
            @change="frontHandleChange"
          >
            <img v-if="details.imgUrl" :src="details.imgUrl" style="height:100px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item
          label="品牌小图"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            accept=".jpg, .jpeg, .png"
            :beforeUpload="frontBeforeUploadSmall"
            @change="frontHandleChangeSmall"
          >
            <img v-if="detailsSmall.imgUrl" :src="detailsSmall.imgUrl" style="height:100px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoadingSmall ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="底价">
          <a-input-number placeholder="请输入底价" v-decorator="['floorPrice', {rules: [{ validator: checkPrice }]} ]"
                          style="width: 100%"/>

        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort', {}]" class="sortWidth"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import moment from 'moment'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'BrandManufacturerModal',
    inject: ['reload'],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          name: {rules: [{required: true, message: '请选择广告类型'}]},
          floorPrice: {rules: [{required: true, message: '请输入标题'}]},
        },
        url: {
          add: '/ecommerce/mall/brand/save',//  /mall/brand/update
          edit: '/ecommerce/mall/brand/update'
        },
        type: [],
        isShow: true,
        details: {
          imgUrl: '',
          content: ''
        },
        detailsSmall: {
          imgUrl: '',
          content: ''
        },
        uploadLoading: false,
        uploadLoadingSmall: false
      }
    },

    methods: {
      /**
       * 检查价格
       * @param rule
       * @param value
       * @param callback
       */
      checkPrice(rule, value, callback) {
        if (value > 0) {
          callback();
          return;
        }
        callback('价格必须大于0!');
      },
      changeIsShow(check) {
        this.isShow = check;
      },
      // 查询类型
      searchType() {
        const url = '/sys/dictItem/list'
        const params = {}
        params.dictId = 'a3d1b1ee6706c63271b5637bea47dd67'
        params.field = 'id,,itemText,itemValue,action'
        params.pageNo = '1'
        params.pageSize = '50'
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.type = result.records
          }
        })
      },
      add() {
        this.edit({})
      },
      edit(record) {
        let that = this;
        this.form.resetFields()

        this.model = Object.assign({}, record)
        that.visible = true;
        that.$nextTick(() => {
          that.form.setFieldsValue(
            pick(that.model, 'name', 'simpleDesc', 'floorPrice', 'isShow', 'sort', 'listPicUrl', 'appListPicUrl')
          )
          that.isShow = Boolean(that.model.isShow);
          that.detailsSmall.imgUrl = that.model.appListPicUrl;
          that.details.imgUrl = that.model.listPicUrl;
        })


      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      // 表单提交
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            formData.img = this.details.imgUrl
            formData.isShow = (this.isShow ? 1 : 0);
            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('ok')
                  that.reload()
                } else {
                  that.$message.warning(res.message)
                }
              })
              .finally(() => {
                that.confirmLoading = false
                that.close()
              })
          }
        })
      },
      handleCancel() {
        this.close()
      },
      // 上传大图 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 上传大图 change
      frontHandleChange(info) {
        this.upload(info, 'img')
      },
      // upload大图
      upload(info, name) {
        let that = this
        let reader = new FileReader()
        reader.readAsDataURL(info.file)
        reader.onload = function () {
          that.base64Img = reader.result
          that.base64Img = encodeURI(that.base64Img)
          // encodeURI(URIstring)
          that.axios
            .post('/common/uploadbase64img', {
              folder: 'admin/',
              base64Img: that.base64Img
            })
            .then(res => {
              that.details.imgUrl = res.result
              that.model.listPicUrl = res.result

            })
            .catch(err => {
              console.log(err)
            })
        }
      },

      // 上传小图 bofore
      frontBeforeUploadSmall: function (file) {
        return false
      },
      // 上传小图 change
      frontHandleChangeSmall(info) {
        this.uploadSmall(info, 'img')
      },
      // upload 小图
      uploadSmall(info, name) {
        let that = this
        let reader = new FileReader()
        reader.readAsDataURL(info.file)
        reader.onload = function () {
          that.base64Img = reader.result
          that.base64Img = encodeURI(that.base64Img)
          that.axios
            .post('/common/uploadbase64img', {
              folder: 'admin/',
              base64Img: that.base64Img
            })
            .then(res => {
              that.detailsSmall.imgUrl = res.result
              that.model.appListPicUrl = res.result

            })
            .catch(err => {
              console.log(err)
            })
        }
      },
    }
  }
</script>

<style lang="less" scoped>
</style>