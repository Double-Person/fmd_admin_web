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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="原因描述">
          <!--<a-input placeholder="请输入原因描述" v-decorator="['reason', { rules: [{ required: true, message: '请输入原因描述' }] }]"/>-->
          <a-textarea placeholder="请输入原因描述" allowClear v-decorator="['reason', { rules: [{ required: true, message: '请输入原因描述' }] }]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="原因类型">
          <a-radio-group v-decorator="['type', { rules: [{ required: true, message: '请选择原因类型' }] }]">
            <a-radio :value="1">
              退款
            </a-radio>
            <a-radio :value="2">
              退货
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否启用">
          <a-switch checkedChildren="是" unCheckedChildren="否" v-decorator="['enable', { valuePropName: 'checked' }]"/>

        </a-form-item>


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort', {rules: [{ required: true, message: '请输入序号' }]}]" class="sortWidth"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'

  import {getAction, httpAction} from '@/api/manage'

  export default {
    inject:['reload'],
    name: 'ReturnWhyModal',
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

        },
        url: {
          add: '/ecommerce/mall/ecRefundReason/add',
          edit: '/ecommerce/mall/ecRefundReason/edit'
        },
      }
    },

    methods: {

      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        record.enable = Boolean(record.enable)
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'type', 'reason', 'enable', 'sort')
          )

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
            let formData = Object.assign(this.model, values);
            formData.enable = Number(formData.enable)

            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.reload(0)
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

    }
  }
</script>

<style lang="less" scoped>
</style>