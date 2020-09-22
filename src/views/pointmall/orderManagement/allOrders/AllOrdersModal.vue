<template>
  <a-modal
    title="编辑收货人"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="收货人">
          <a-input placeholder="请输入收货人" v-decorator="['consignee', validatorRules.consignee ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系电话">
          <a-input placeholder="请输入联系电话" v-decorator="['mobile', validatorRules.mobile ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="所在区域">
          <!--<a-input placeholder="请选择所在区域" v-decorator="['city', validatorRules.title ]"/>-->
          <el-cascader
            v-model="userAddressArr"
            :options="userAddress"
            placeholder="请选择"
            @change="handleChange"
            :props="{ value: 'name', label: 'name'}">
          </el-cascader>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="详细地址">
          <a-input placeholder="请输入详细地址" v-decorator="['address', validatorRules.address ]"/>
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
    name: 'AllOrdersModal',
    data() {
      return {
        province: '',
        city: '',
        district: '',
        userAddressArr: [],
        userAddress: [],
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
          consignee: {rules: [{required: true, message: '请输入收货人'}]},
          mobile: {rules: [{required: true, message: '请输入联系电话'}]},
          address: {rules: [{required: true, message: '请输入详细地址'}]},
        },
        url: {
          add: '/pointmall/mall/address/save',
          edit: '/pointmall/mall/order/updateConsignee'
        },
        type: [],
        details: {
          imgUrl: ''
        },
        uploadLoading: false
      }
    },
    created() {

    },
    methods: {
      handleChange(value) {
        this.userAddressArr = [...value]
      },

      add() {
        this.edit({})
      },
      async edit(record) {
        this.form.resetFields()
        //  province   city    district
        let {records, success} = await getAction('/common/sys_area/all');
        if (success) {
          this.userAddress = records;
        }
        // 用户地址
        if (record) {
          let province = record.province || '';
          let city = record.city || '';
          let district = record.district || '';
          this.userAddressArr = [province, city, district]
        }

        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'mobile', 'consignee', 'address', 'description', 'url', 'sortNum', 'delFlag', 'province', 'city', 'district')
          )
          this.details.imgUrl = this.model.img

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
            // that.confirmLoading = true
            let httpurl = ''
            let method = 'post'
            if (!this.model.id) {
              httpurl += this.url.add

            } else {
              httpurl += this.url.edit

            }
            let formData = Object.assign(this.model, values)
            formData.province = this.userAddressArr[0];
            formData.city = this.userAddressArr[1];
            formData.district = this.userAddressArr[2]

            console.log(formData)
            // return false;  /ecommerce/mall/order/updateConsignee

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
      frontBeforeUpload: function (file) {
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
  /deep/ .el-cascader{
    width: 100%;
  }
</style>