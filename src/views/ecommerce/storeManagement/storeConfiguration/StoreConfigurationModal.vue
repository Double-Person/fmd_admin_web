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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="店铺名称">
          <a-input placeholder="请输入店铺名称" v-decorator="['shopsName', {} ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品分类">
          <a-input placeholder="请输入商品分类" v-decorator="['shopsCategoryName', {} ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品名称">
          <a-input placeholder="请输入商品名称" v-decorator="['goodsName', {} ]"/>
        </a-form-item>
        <a-form-item
          label="图片"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
        >
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :beforeUpload="frontBeforeUpload"
            accept=".jpg, .jpeg, .png"
            @change="frontHandleChange"
          >
            <img v-if="details.imgUrl" :src="details.imgUrl" style="height:100px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="零售价格">
          <a-input-number placeholder="请输入零售价格" v-decorator="['retailPrice', {rules: [{ validator: checkPrice }]} ]" style="width: 100%"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="店铺商品库存">
          <a-input-number placeholder="请输入店铺商品库存" v-decorator="['goodsNumber', {rules: [{ validator: checkGoodsNumber }]} ]" style="width: 100%"/>
        </a-form-item>


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort', {}]"/>
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
    name: 'StoreConfigurationModal',
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
          // name: {rules: [{required: true, message: '请输入店铺名称'}]},
        },
        url: {//
          add: '/ecommerce/mall/shopsgoods/save',
          edit: '/ecommerce/mall/shopsgoods/update'
        },
        type: [],
        details: {
          imgUrl: ''
        },
        uploadLoading: false
      }
    },
    created() {
      this.searchType()
    },
    methods: {
      checkPrice(rule, value, callback) {
        if (value > 0) {
          callback();
          return;
        }
        callback('价格必须大于0!');
      },
      checkGoodsNumber(rule, value, callback) {
        if (value >= 0) {
          callback();
          return;
        }
        callback('库存必须大于等于0!');
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
            console.log(result)
            this.type = result.records
          }
        })
      },
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'shopsName', 'shopsCategoryName', 'goodsName', 'retailPrice', 'goodsNumber', 'sort','listPicUrl')
          )
          // this.details.imgUrl = this.model.img

          //时间格式化
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = 'post'
            if (!this.model.id) {
              httpurl += this.url.add
            } else {
              httpurl += this.url.edit
            }
            let formData = Object.assign(this.model, values)
            formData.listPicUrl = this.details.imgUrl

            console.log(formData)

            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('ok')
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
      // 文件上上传 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 文件上上传 change
      frontHandleChange(info) {
        // console.log(info)
        this.upload(info, 'imgUrl')
      },
      // upload
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
              console.log(res)
              this.modal.listPicUrl = res.result;
              that.details[name] = res.result
            })
            .catch(err => {
              console.log(err)
            })
        }
      }
    }
  }
</script>

<style lang="less" scoped>
</style>