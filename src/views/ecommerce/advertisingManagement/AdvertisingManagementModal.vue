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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="用户昵称">
          <a-input placeholder="请输入用户昵称" v-decorator="['nickname', validatorRules.nickname ]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="头像">
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :beforeUpload="frontBeforeUpload"
            @change="frontHandleChange"
          >
            <div v-if="details.imgUrl" style="width: 120px">
              <img :src="details.imgUrl" style="height:100px;max-width:120px"/>

            </div>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import moment from 'moment'
import { getAction, httpAction } from '@/api/manage'

export default {
  name: 'UserListModal',
  data() {
    return {
      title: '操作',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },

      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        typeCode: { rules: [{ required: true, message: '请选择广告类型' }] },
        name: { rules: [{ required: true, message: '请输入属性名称' }] },
      },
      url: {
        add: '/user/update',
        edit: '/user/update'
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
          // console.log(result)
          this.type = result.records
        }
      })
    },
    add() {
      this.edit({})
    },
    edit(record) {
      console.log(record);
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(this.model, 'id', 'nickname', 'headImgUrl')
        )
        this.details.imgUrl = record.headImgUrl

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
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          let formData = Object.assign(this.model, values)
          formData.headImgUrl = this.details.imgUrl

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
    // 身份证正面上传 bofore
    frontBeforeUpload: function(file) {
      return false
    },
    // 身份证正面上传 change
    frontHandleChange(info) {
      // console.log(info)
      this.upload(info, 'imgUrl')
    },
    // upload
    upload(info, name) {
      let that = this
      let reader = new FileReader()
      reader.readAsDataURL(info.file)
      reader.onload = function() {
        that.base64Img = reader.result
        that.base64Img = encodeURI(that.base64Img)
        // encodeURI(URIstring)
        that.axios
          .post('/common/uploadbase64img', {
            folder: 'admin/',
            base64Img: that.base64Img
          })
          .then(res => {
            // console.log(res)
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