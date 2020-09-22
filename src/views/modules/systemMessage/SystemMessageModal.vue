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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="标题">
          <a-input placeholder="请输入属性名称" v-decorator="['title',{ rules: [{ required: true, message: '请输入属性名称'}]},]"/>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="类型">
          <a-select
            v-decorator="[
          'type',
          { rules: [{ required: true, message: '请选择类型' }] },
        ]"
            placeholder="请选择类型">
            <a-select-option :value="1" >系统公告</a-select-option>
            <a-select-option :value="2" >服务消息</a-select-option>
            <a-select-option :value="3" >直播消息</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封面">
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
            </div>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否滚动通知">
          <a-radio-group v-decorator="['scroll',{ rules: [{ required: true, message: '请输入属性名称'}]},]">
            <a-radio :value="1">是</a-radio>
            <a-radio :value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="滚动通知时限">
          <el-date-picker
            v-model="scrollTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="详情内容">
          <a-textarea placeholder="视频简介" :rows="4"
                      v-decorator="['content',{ rules: [{ required: true, message: '请输入详情内容'}]},]"/>
        </a-form-item>


      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'VideoListModal',
    inject:['reload'],
    data() {
      return {
        scrollTime:[],
        sorts: null,
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
        uploadLoading: false,
        uploadLoadingVideo: false,
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          title: {rules: [{required: true, message: '请输入标题'}]},
        },
        url: {
          add: '/admin/sysMessage/add',
          edit: '/admin/sysMessage/edit'
        },
        details: {
          imgUrl: '',
          url: ''
        }

      }
    },
    methods: {
      changeStatus(val) {
        this.model.status = val
      },
      changeRecommend(val) {
        this.model.recommend = val
      },

      add() {
        this.edit({})
      },
      async edit(row) {
        this.form.resetFields()
        this.model = Object.assign({}, row)
        this.details.imgUrl = row.cover;
        // 滚动开始结束时间
        this.scrollTime = [];
        this.scrollTime[0] = row.scrollBeginTime ? (new Date(row.scrollBeginTime)) : '' ;
        this.scrollTime[1] = row.scrollEndTime ? (new Date(row.scrollEndTime)) : '' ;
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'title', 'type', 'scroll', 'content')
          )

          if (!row.id) {
            this.model.status = false
          }
        })
      },
      close() {
        this.$emit('close');
        this.scrollTime = [];
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
              httpurl += this.url.add;
              method = 'post'
            } else {
              httpurl += this.url.edit;
              method = 'put'
            }
            let formData = Object.assign(this.model, values);

            formData.cover = this.details.imgUrl;// 封面
            if(this.scrollTime.length === 2){
              let [ start, end ] = this.scrollTime;
              formData.scrollBeginTime = start;
              formData.scrollEndTime = end;
            }
            console.log(formData);
            // return false;
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
        console.log('取消');
        this.close()
        // this.reload()
      },
      frontBeforeUpload: function (file) {
        return false
      },
      // 图片 上传 change
      frontHandleChange(info) {
        // console.log(info)
        this.upload(info, 'imgUrl')
      },
      // 图片 upload
      upload(info, name) {
        let that = this;
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
              console.log(res);
              if (res.success) {
                that.details[name] = res.result
              }
            })
            .catch(err => {
              console.log({err})
            })
        }
      },

    }
  }
</script>

<style lang="less" scoped>
  /deep/ .isRequired{
    label{
      &:before{
        content: '* ';
        color: red;
      }
    }
  }

</style>