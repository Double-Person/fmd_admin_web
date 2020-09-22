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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="分类名称">
          <a-input placeholder="请输入分类名称" v-decorator="['name', validatorRules.name ]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="店铺ID">
          <!--<a-input placeholder="请输入店铺" v-decorator="['shopsName', {} ]" />-->
          <el-select v-model="model.shopsId" clearable filterable placeholder="请选择">
            <el-option
              v-for="shop in shops"
              :key="shop.id"
              :label="shop.name"
              :value="shop.id">
            </el-option>
          </el-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
          <a-switch checkedChildren="显示" unCheckedChildren="隐藏" :defaultChecked="Boolean(model.status)" @change="changeStatus" :key="Math.random()"/>
          <!--<a-select :defaultValue="defaultCheck" style="width: 120px" @change="change">-->
            <!--<a-select-option :value="1">显示</a-select-option>-->
            <!--<a-select-option :value="0">隐藏</a-select-option>-->
          <!--</a-select>-->
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number type=digit v-decorator="[ 'sort', {}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import moment from 'moment'
import { getAction, httpAction } from '@/api/manage'
import { GOODSCLASSIFICATION } from "@/utils/mallManagement";

export default {
  name: 'GoodsClassificationModal',
  data() {
    return {
      types:[],
      title: '操作',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      shops:[],
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        typeCode: { rules: [{ required: true, message: '请选择广告类型' }] },
        name: { rules: [{ required: true, message: '请输入标题' }] },
      },
      url: {
        add: '/ecommerce/mall/shopscategory/save',
        edit: '/ecommerce/mall/shopscategory/update',
        info: '/ecommerce/mall/shops/queryMyShop',//  获取我的店铺
      },
      type: [],
      details: {
        imgUrl: ''
      },
      uploadLoading: false
    }
  },
  beforeCreate(){
    this.types =  GOODSCLASSIFICATION;
    console.log(this.types );
  },
  created() {
    this.searchType()

  },
  methods: {
    changeStatus(val){
      console.log(val);
      this.model.status = val?1:0;
      // this.model.status = val
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
   async getShop(){
      let res = await getAction(this.url.info)
     console.log(res);
      this.shops = res.result.records
   },
    edit(record) {
      this.getShop()
      let that = this;
      this.form.resetFields()

      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(this.model, 'name', 'shopsName', 'status', 'sort','shopsId')
        )
        // this.details.imgUrl = this.model.img
        that.defaultCheck = record.status

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