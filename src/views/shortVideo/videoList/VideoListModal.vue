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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="类型">
          <a-radio-group v-decorator="['videoType',{ rules: [{ required: true, message: '请输入属性名称'}]},]">
            <a-radio :value="1">短视频</a-radio>
            <a-radio :value="2">广告</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="标题">
          <a-input placeholder="请输入属性名称" v-decorator="['title',{ rules: [{ required: true, message: '请输入属性名称'}]},]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="分类">
          <a-select
            v-decorator="[
          'categoryId',
          { rules: [{ required: true, message: '请选择分类' }] },
        ]"
            placeholder="请选择分类">
            <a-select-option :value="item.id" v-for="item in category" :key="item.id">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="视频简介">
          <a-textarea placeholder="视频简介" :rows="4"
                      v-decorator="['introduce',{ rules: [{ required: true, message: '请输入属性名称'}]},]"/>
        </a-form-item>


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="['sort',{}]" class="sortWidth"/>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封面" class="isRequired">
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

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="视频" class="isRequired">
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            accept=".mp4"
            :beforeUpload="frontBeforeUploadVideo"
            @change="frontHandleChangeVideo"
          >
            <div v-if="details.url" style="width: 200px">
              <video controls loop ref="video" id="video" width="200">
                <source :src="details.url" type="video/mp4">
                您的浏览器不支持 HTML5 video 标签。
              </video>
            </div>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="视频时长">
          <a-input placeholder="请输入视频时长" v-decorator="['duration',{ rules: [{ required: true, message: '请输入视频时长'}]},]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="视频宽度">
          <a-input placeholder="请输入视频宽度" v-decorator="['w',{ rules: [{ required: true, message: '请输入视频宽度'}]},]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="视频高度">
          <a-input placeholder="请输入视频高度" v-decorator="['h',{ rules: [{ required: true, message: '请输入视频高度'}]},]"/>
        </a-form-item>



        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="播放量">
          <a-input-number v-decorator="[ 'viewCount',{}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="点赞数">
          <a-input-number v-decorator="[ 'likeCount',{}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否推荐" v-if="false">
          <!-- 1显示 2不显示   model.status -->
          <a-switch checkedChildren="是" unCheckedChildren="否" :defaultChecked="(model.recommend==1)?true:false"
                    @change="changeRecommend" :key="Math.random()"/>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示">
          <!-- 1显示 2不显示   model.status -->
          <a-switch checkedChildren="是" unCheckedChildren="否" :defaultChecked="(model.status==1)?true:false"
                    @change="changeStatus" :key="Math.random()"/>
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
        w:0,//视频宽度
        h:0,//视频高度
        fileSize:0,// 文件大小
        sorts: null,
        timeLength: 0,// 视频时长
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
          category: '/shortvideo/category/list',
          add: '/shortvideo/add',
          edit: '/shortvideo/edit'
        },
        category: [],// 分类
        details: {
          imgUrl: '',
          url: ''
        }

      }
    },
    created() {

    },
    methods: {
      //  是否显示
      changeStatus(val) {
        this.model.status = val
      },
      // 是否推荐
      changeRecommend(val) {
        this.model.recommend = val
      },

      add() {
        this.edit({})
      },
      async edit(row) {
        this.form.resetFields()
        let {result, success} = await getAction(this.url.category);
        if (success) {
          this.category = result.records
        }
        this.model = Object.assign({}, row)
        this.details.imgUrl = row.cover;
        this.details.url = row.path;
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'videoType', 'categoryId', 'title', 'introduce', 'duration', 'sort', 'viewCount', 'likeCount', 'recommend', 'status', 'w', 'h')
          )
          if (!row.id) {
            this.model.status = false
          }
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
            if(!this.details.imgUrl){
              that.$message.warning('封面图片不能为空');
              return false;
            }
            if(!this.details.url){
              that.$message.warning('视频不能为空');
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
            let formData = Object.assign(this.model, values);
            formData.status = formData.status ? 1 : 2; //是否显示
            formData.recommend = formData.recommend ? 1 : 2;  //是否推荐

            formData.baseLikeCount = formData.likeCount || 0;//基础点赞数-新增编辑时传
            formData.baseViewCount = formData.viewCount || 0;//基础访问量-新增编辑时传
            formData.duration = this.timeLength;//视频时长
            // formData.sort = this.sorts;//排序
            formData.cover = this.details.imgUrl;// 封面
            formData.path = this.details.url;// 视频
            formData.fileSize = this.fileSize;// 文件大小
            // console.log(formData);
            // return false;
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
        // this.reload()
      },
      frontBeforeUpload: function (file) {
        return false
      },
      // 图片 上传 change
      frontHandleChange(info) {
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
              if (res.success) {
                that.details[name] = res.result
              }
            })
            .catch(err => {
              console.log({err})
            })
        }
      },
      // 视频上传 bofore
      frontBeforeUploadVideo: function (file) {
        return false;
      },
      // 上传 change
      frontHandleChangeVideo(info) {
        const formData = new FormData()
        formData.append('file', info.file)
        formData.append('token', "token");
        this.saveFile(formData)

      },
      saveFile(formData) {
        this.confirmLoading = true
        this.axios({
          method: 'post',
          url: '/common/upload_file',
          headers: {},
          onUploadProgress(e){
            if(e.lengthComputable){
              //console.log('上传进度',e.loaded / e.total); //已上传的比例
            }
          },
          params: {},
          data: formData
        }).then((response) => {
          let that = this;
          this.details.url = response.result.url;
          this.fileSize = response.result.size;
          // 添加定时器解决 that.$refs.video.duration无法获取 NaN
          setTimeout(() => {
            that.$nextTick(() => {
              if (that.details.url) {
                that.timeLength = that.$refs.video.duration;
                that.videoWiths = (that.$refs.video.videoWidth) || (that.$refs.video.clientWidth) || (that.$refs.video.width);
                that.videoHeights = (that.$refs.video.videoHeight) || (that.$refs.video.clientHeight);
                this.form.setFieldsValue({
                  duration: that.timeLength,
                  w: that.videoWiths,
                  h: that.videoHeights,
                });
                that.$refs.video.src = response.result.url;
                that.$refs.video.style.width = '200px';
                that.$refs.video.setAttribute('width','200')
                this.$message.success("上传成功");
              }
            })
          }, 800)


          this.confirmLoading = false
        }).catch((error) => {
          this.$message.error("上传失败，请重试");
          this.confirmLoading = false
        })

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