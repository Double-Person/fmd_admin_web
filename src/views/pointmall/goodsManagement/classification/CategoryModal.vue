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
          <a-input placeholder="请输入分类名称" v-decorator="['name', validatorRules.name ]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="级别" class="isRequired">
          <!--<a-input placeholder="请输入分类名称" v-decorator="['name', validatorRules.name ]" />  单选按钮 :defaultValue=""  -->
          <!--<a-switch checkedChildren="一级" unCheckedChildren="二级" :defaultChecked="computedLevel" @change="changeLevel"/>-->
          <el-radio-group v-model="model.level" @change="changeLevel">
            <el-radio :label="1">一级</el-radio>
            <el-radio :label="2">二级</el-radio>
          </el-radio-group>
          <div class="tip" v-if="isTip">请选择分类名称</div>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="父节点" v-if="model.level==2"
                     class="isRequired"
                     :key="Math.random()">
          <!--<a-select v-decorator="['select',{}]" placeholder="请选择父节点"  @change="handleChange">-->
          <!--<a-select-option :value="item.id" v-for="item in allData" :key="item.id">{{item.name}}</a-select-option>-->
          <!--</a-select>-->

          <a-select :defaultValue="model.parentId" @change="handleChange" v-if="model.parentId!=0">
            <a-select-option :value="item.id" v-for="item in allData" :key="item.id">{{item.name}}</a-select-option>
          </a-select>
          <a-select v-decorator="['select',{}]" @change="handleChange" v-if="model.parentId==0">
            <a-select-option :value="item.id" v-for="item in allData" :key="item.id">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示">

          <a-switch checkedChildren="是"
                    unCheckedChildren="否"
                    :defaultChecked="Boolean(model.isShow)"
                    @change="changeIsShow"/>


        </a-form-item>

        <a-form-item
          label="图片"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
          v-if="model.level==2"
          class="isRequired"
        >
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            accept=".jpg, .jpeg, .png"
            :beforeUpload="frontBeforeUpload"
            @change="frontHandleChange"
          >
            <img v-if="model.iconUrl" :src="model.iconUrl" style="height:100px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort', {rules: [{ required: true, message: '请输入序号' }] }]" class="sortWidth"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import Vue from 'vue'
  import PubSub from 'pubsub-js'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    inject: ['reload'],
    name: 'CategoryModal',
    data() {
      return {
        isTip: false,
        title: '操作',
        visible: false,
        allData: [],
        model: {level: 1, isShow: -1},
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        showParentNode: false,
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          name: {rules: [{required: true, message: '请输入分类名称'}]},
        },
        url: {
          add: '/pointmall/mall/category/save',
          edit: '/pointmall/mall/category/update'
        },
        type: [],
        details: {
          imgUrl: '',
          content: ''
        },
        uploadLoading: false
      }
    },
    created() {

      PubSub.subscribe('allData', (msg, data) => {
        this.allData = data
        console.log('subscribe', data);

      })
    },

    methods: {
      changeLevel() {
        this.isTip = false
      },

      //  是否显示
      changeIsShow(check) {
        // this.model.isShow = e.target.value;
        this.model.isShow = check ? 1 : 0;
      },
      // 下拉框
      handleChange(value) {
        this.model.parentId = value
      },
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        if (!record.id) {
          // console.log('add');
          // this.model.level = 1
          this.model.isShow = 1
        }

        this.showParentNode = (this.model.level == 1 ? false : true);
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'level', 'sort', 'parentId', 'isShow', 'imgUrl', 'iconUrl', 'frontName')
          )
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
        this.reload()
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            if (this.model.level == null) {
              this.isTip = true;
              return false;
            }
            if (this.model.level == 2) {
              if (this.model.parentId == undefined) {
                this.$message.warning('请选择父节点')
                return false;
              }

              if (this.model.iconUrl == undefined) {
                this.$message.warning('请上传图片')
                return false;
              }
            }

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
            // formData.img = this.details.imgUrl

            console.log(formData)
            // return false;

            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('ok')
                  this.reload()
                  // PubSub.publish('categoryEdit')

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
      // 上传 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 上传 change
      frontHandleChange(info) {
        // console.log(info)
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
          // encodeURI(URIstring)
          that.axios
            .post('/common/uploadbase64img', {
              folder: 'admin/',
              base64Img: that.base64Img
            })
            .then(res => {
              that.details.imgUrl = res.result
              if (that.model.level == 1) {
                that.model.imgUrl = res.result
              }
              if (that.model.level == 2) {
                that.model.iconUrl = res.result
              }
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

  .tip {
    color: red;
    margin-bottom: -10px;
  }

  /deep/ .isRequired {
    .ant-form-item-label {
      label {
        &:before {
          content: '* ';
          margin-right: 4px;
          font-family: SimSun;
          line-height: 1;
          font-size: 14px;
          color: #f5222d;
        }
      }
    }

  }

</style>