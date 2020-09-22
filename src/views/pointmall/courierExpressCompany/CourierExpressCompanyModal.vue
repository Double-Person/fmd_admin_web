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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="快递公司名称">
          <a-input placeholder="请输入快递公司名称" v-decorator="['name', validatorRules.name ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="快递公司编码">
          <a-input placeholder="请输入快递公司编码" v-decorator="['code', validatorRules.code ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
          <a-switch checkedChildren="正常" unCheckedChildren="禁用" :defaultChecked="Boolean(model.status)" @change="changeStatus" :key="Math.random()"/>
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
    inject:["reload"],
    name: 'CourierExpressCompanyModal',
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
          name: {rules: [{required: true, message: '请输入快递公司名称'}]},
          code: {rules: [{required: true, message: '请输入快递公司编码'}]},
        },
        url: {
          add: '/ecommerce/mall/shipping/save',
          edit: '/ecommerce/mall/shipping/update'
        },
        type: []
      }
    },
    created() {
      this.searchType()
    },
    methods: {
      changeStatus(status) {
        this.model.status =status?1:0;
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
            pick(this.model, 'name', 'code', 'status')
          )
          console.log('-----',record);
          if (!record.id) {
            this.model.status = 0
            console.log('add');
          }
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
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'post'
            }
            let formData = Object.assign(this.model, values)

            console.log(formData)

            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('ok')
                  this.reload()
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