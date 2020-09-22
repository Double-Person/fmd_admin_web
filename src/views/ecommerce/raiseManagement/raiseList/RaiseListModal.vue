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
      <a-form :form="form" ref="formName">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品名称">
          <a-input placeholder="请输入属性名称" v-decorator="['name',{ rules: [{ required: true, message: '请输入商品名称'}]},]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品编码">
          <a-input placeholder="请输入属性名称" v-decorator="['code',{ rules: [{ required: true, message: '请输入商品编码'}]},]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品项目" class="is-required"
                     prop="crowdfundingId">
          <a-select v-model="model.crowdfundingId" @change="handleChange" placeholder="请选择">
            <a-select-option :value="item.id" v-for="(item, index) in details.projectArr" :key="index">{{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="零售价">
          <a-input-number
            v-decorator="[ 'price',{ rules: [{ validator: checkPrice },{ required: true, message: '请输入零售价'}]}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品库存">
          <a-input-number
            v-decorator="[ 'inventory',{ rules: [{ validator: checkInventory },{ required: true, message: '请输入商品库存'}]}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="市场价格">
          <a-input-number
            v-decorator="[ 'marketPrice',{ rules: [{ validator: checkPrice },{ required: true, message: '请输入市场价格'}]}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort',{ rules: [{ required: true, message: '请输入序号'}]}]" class="sortWidth"/>
        </a-form-item>
        <!--imageList[0].path  -->
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封面图片" class="is-required">
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            accept=".jpg, .jpeg, .png"
            :beforeUpload="frontBeforeUpload"
            @change="frontHandleChange"
          >

            <div v-if="details.imgUrl" style="width: 120px">
              <img :src="details.imgUrl" style="height:100px;max-width:120px"/>
              <div style="display: flex;justify-content: space-between">
                <span @click.prevent.stop="">商品主图</span>
                <!---->
                <span style="color: #1890ff;cursor: pointer;" @click.prevent.stop="deleteImgUrl">删除图片</span>
              </div>
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
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'RaiseList',
    inject: ['reload'],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        details: {
          imgUrl: '',
          projectArr: []
        },
        uploadLoading: false,
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
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          title: {rules: [{required: true, message: '请输入标题'}]},
        },
        url: {
          projectList: '/ecommerce/mall/ecCrowdfundin/list',// 下拉框商品项目列表
          add: '/ecommerce/mall/ecCrowdfundingGoods/add',
          edit: '/ecommerce/mall/ecCrowdfundingGoods/edit'
        },

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
      checkInventory(rule, value, callback) {
        if (value >= 0) {
          callback();
          return;
        }
        callback('库存必须大于0!');
      },
      changeStatus(val) {
        this.model.status = val
      },
      //商品列表下拉框
      handleChange(value) {
        this.model.crowdfundingId = value
      },
      /**
       * 获取商品列表
       * @returns {Promise<void>}
       */
      async getProductList() {
        let {result} = await getAction(this.url.projectList, {pageSize: 1000});
        this.details.projectArr = result.records
      },

      add() {
        this.edit({})
      },
      async edit(record) {
        this.form = this.$form.createForm(this)
        this.form.resetFields()
        this.model = {};
        this.model = Object.assign({}, record)
        this.getProductList()
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'sort', 'code', 'price', 'inventory', 'marketPrice', 'crowdfundingId')
          )
          if (record.id) {
            this.details.imgUrl = record.imageList[0].path;
          }
        })
      },
      close() {
        this.$emit('close')
        // this.reload()
        this.form.resetFields()
        this.details.imgUrl = ''
        this.visible = false
      },
      handleOk() {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            if (!that.model.crowdfundingId || that.model.crowdfundingId == '') {
              that.$message.warning('请选择商品项目')
              return false;
            }
            if (this.details.imgUrl == '') {
              that.$message.warning('请上传封面图')
              return false;
            }
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add;
              method = 'post'
            } else {
              httpurl += this.url.edit;
              method = 'put'
            }

            let formData = Object.assign(this.model, values)
            formData.crowdfundingId = that.model.crowdfundingId;
            formData.imageList = [{path: that.details.imgUrl}];

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
                that.details.imgUrl = ''
                that.close()
                this.deleteImgUrl();
              })
          }
        })
      },
      handleCancel() {
        this.close()
      },
      // 删除图片
      deleteImgUrl() {
        this.details.imgUrl = '';
      },
      //  bofore
      frontBeforeUpload: function (file) {
        return false
      },
      //  change
      frontHandleChange(info) {
        this.upload(info, 'img')
      },
      // upload
      upload(info, name) {
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
              that.details.imgUrl = res.result
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
  /deep/ .is-required label:before {
    content: '* ';
    color: #f5222d;
  }

</style>