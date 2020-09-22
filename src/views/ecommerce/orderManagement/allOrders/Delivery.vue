<template>
  <a-modal
    title="订单发货"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="物流单号">
          <a-input placeholder="请输入物流单号"
                   v-decorator="['shippingNo', { rules: [{ required: true, message: '请输入物流单号' }] }]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="物流公司" v-if="courierCompany.length">
          <a-select
            v-decorator="[ 'shippingId', { rules: [{ required: true, message: '请选择物流公司' }] }, ]"
            placeholder="请选择物流公司">
            <a-select-option :value="item.id" v-for="item in courierCompany" :key="item.id">
              {{item.name}}
            </a-select-option>

          </a-select>


        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import PubSub from 'pubsub-js'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: "Delivery",
    inject:['reload'],
    data() {
      return {
        courierCompany: [],//快递公司
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
          shippingNo: {rules: [{required: true, message: '请输入物流单号'}]},
          shippingComplete: {rules: [{required: true, message: '请选择物流公司'}]},
        },
        url: {
          send: '/ecommerce/mall/order/sendGoods',
          edit: '/system/sysAdvertise/edit'
        },
        uploadLoading: false
      }
    },
    created() {
      PubSub.subscribe('sendDeliveryInfo', (msg, data) => {
        console.log(msg, data, this.visible);
        this.edit(data)
      })
    },
    methods: {
      async edit(record) {
        this.form.resetFields()

        let {success, result} = await getAction('/ecommerce/mall/shipping/list?status=1&pageNo=1&pageSize=9999&page=1&limit=9999');
        if (success) {
          this.courierCompany = result.records;
          this.model = Object.assign({}, record)
          this.visible = true
        }

      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          console.log('this', values);

          if (!err) {
            that.confirmLoading = true
            let httpurl = this.url.send;
            let method = 'post'
            let order = {
              id: this.model.id,
              shippingId: values.shippingId,//快递公司
              shippingNo: values.shippingNo//快递单号
            }

            httpAction(httpurl, order, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                } else {
                  that.$message.warning(res.message)
                }
              })
              .finally(() => {
                that.confirmLoading = false
                that.close()
                that.reload()
              })
          }
        })
      },
      handleCancel() {
        this.close()
        // this.reload()
      },
      // 发货
      // 发货提交
      dataFormSubmit() {
        this.$refs['order']
          .validate((valid) => {
            if (valid) {
              this.$http({
                url: '/mall/order/sendGoods',
                method: 'post',
                data: this.order
              }).then(({data}) => {
                if (data && data.code === 0) {

                }
              })
            }
          })
      },
    }
  }
</script>

<style scoped>

</style>