<template>
  <a-modal
    :title="title"
    width="80%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-tabs defaultActiveKey="1" tabPosition="left">
          <a-tab-pane tab="通用信息" key="1">

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="项目名称">
              <a-input placeholder="项目名称" v-decorator="['name',{ rules: [{ required: true, message: '请输入项目名称'}]},]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="项目编码">
              <a-input placeholder="项目编码" v-decorator="['code',{ rules: [{ required: true, message: '请输入项目编码'}]},]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="目标资金">
              <a-input-number
                v-decorator="[ 'targetAmount',{ rules: [{ validator: checkPrice },{ required: true, message: '请输入筹款资金'}]}]" class="sortWidth"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="筹款日期" class="isRequired">
              <!--:rules="[ {type: 'date', required: true, message: '请选择日期', trigger: 'change'} ]"-->
              <el-date-picker
                v-model="fundraisingDate"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示">
              <!--1:显示2:不显示-->
              <a-switch checkedChildren="是" unCheckedChildren="否"
                        :defaultChecked="model.showStatus==1?true:model.showStatus==2?false:false" @change="changeStatus"
                        :key="Math.random()"/>
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="前端排序">
              <a-input-number v-decorator="[ 'sort',{ rules: [{ required: true, message: '请输入序号'}]}]" class="sortWidth"/>
            </a-form-item>

          </a-tab-pane>
          <a-tab-pane tab="项目封面" key="2">
            <div class="coverPhotoAndVideo">
              <a-form-item label="封面图片" class="isRequired">
                <ul class="coverPhoto">
                  <li v-for="(item, index) in one">
                    <!--<img :src="item.path"/>-->
                    <el-image
                      style="width: 200px; height: 125px"
                      :src="item.path"
                      :preview-src-list="previewList">
                    </el-image>

                    <div>
                      <div :class="{activeClick:index}" @click="setMainFigure(index)">{{item.master?'商品主图':'设为主图'}}
                      </div>
                      <div class="activeClick" @click="deleteCover(index)">删除图片</div>
                    </div>
                  </li>
                </ul>
                <a-upload
                  listType="picture-card"
                  class="avatar-uploader"
                  :showUploadList="false"
                  accept=".jpg, .jpeg, .png"
                  :beforeUpload="frontBeforeUpload"
                  @change="frontHandleChange"
                >
                  <div>
                    <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
              </a-form-item>

              <a-form-item label="封面视频">
                <ul style="display: flex;list-style: none;padding: 0">
                  <li v-for="(item, index) in two">
                    <video width="200" controls loop style="margin-right: 15px">
                      <source :src="item.path" type="video/mp4">
                      您的浏览器不支持 HTML5 video 标签。
                    </video>
                    <div class="activeClick" @click="deleteVideo(index)">删除视频</div>
                  </li>
                </ul>

                <a-upload
                  listType="picture-card"
                  class="avatar-uploader"
                  :showUploadList="false"
                  accept=".mp4"
                  :beforeUpload="frontBeforeUploadVideo"
                  @change="frontHandleChangeVideo"
                >
                  <div>
                    <a-icon :type="uploadLoadingVideo ? 'loading' : 'plus'"/>
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
              </a-form-item>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="详细描述" key="3">
            <a-form-item
              label="内容"
              :labelCol="labelCol" :wrapperCol="wrapperCol"
            >
              <vue-ueditor-wrap v-model="details.content" :config="myConfig" :destroy="true"></vue-ueditor-wrap>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import VueUeditorWrap from 'vue-ueditor-wrap'
  import moment from 'moment'
  import JDate from '@/components/jeecg/JDate'
  import pick from 'lodash.pick'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'RaiseProjectModal',
    inject: ['reload'],
    data() {
      return {
        previewList:[],// 预览图片
        one: [],
        two: [],
        fundraisingDate: [],//筹款日期
        covers: [],
        videos: [],
        title: '操作',
        visible: false,
        model: {},
        imageList: [],
        uploadLoading: false,
        uploadLoadingVideo: false,
        rules: {

        },
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
          add: '/ecommerce/mall/ecCrowdfundin/add',
          edit: '/ecommerce/mall/ecCrowdfundin/edit'
        },
        details: {
          imgUrl: '',
          content: ''
        },
        myConfig: {
          // 编辑器不自动被内容撑高
          autoHeightEnabled: false,
          // 初始容器高度
          initialFrameHeight: 240,
          // 初始容器宽度
          initialFrameWidth: '100%',
          serverUrl: process.env.VUE_APP_BASE_API + '/system/ueditor/action'
        },

      }
    },
    created() {
      this.searchType()
    },
    components: {
      VueUeditorWrap,
      JDate
    },
    methods: {
      // 過濾圖片路徑預覽
      filterImgUrl(){
        this.previewList = this.one && this.one.map(item=>item.path);
      },
      /**
       * 检查价格
       * @param rule
       * @param value
       * @param callback
       */
      checkPrice(rule, value, callback) {
        if (value >= 0) {
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
        this.model.showStatus = (val ? 1 : 2)
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
            this.type = result.records
          }
        })
      },
      add() {
        this.edit({})
      },
      async edit(record) {
        this.form.resetFields()
        this.model = {};
        if (record.id) {
          let { result, success } = await getAction('/ecommerce/mall/ecCrowdfundin/detail', {id: record.id});
          if(success){
            this.model = Object.assign({}, result)
            this.details.content = result && result.introduce || '';
            this.fundraisingDate = [];
            this.fundraisingDate[0] = result.beginTime;
            this.fundraisingDate[1] = result.endTime;
            this.one = [...result.covers];
            this.two = [...result.videos];
            await this.filterImgUrl()
          }

        }
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'sort', 'code', 'price', 'inventory', 'currentAmount', 'introduce', 'targetAmount')
          )
          if (record.id && record.imageList) {
            this.details.imgUrl = record.imageList[0].path;
          }
        })
      },
      close() {
        this.$emit('close')
        // this.reload()
        this.form.resetFields();
        this.fundraisingDate = [];
        this.one = [];
        this.two = [];
        this.details.content = '';
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            if (this.fundraisingDate.length < 1) {
              that.$message.warning('请选择筹款日期');
              return false;
            }
            if (!this.one.length) {
              that.$message.warning('请上传封面图片');
              return false;
            }
            that.confirmLoading = true;
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
            formData.beginTime = this.fundraisingDate[0];
            formData.endTime = this.fundraisingDate[1];
            formData.introduce = this.details.content;
            formData.covers = this.one;
            if (formData.covers && formData.covers.length) {
              formData.covers.forEach(item => {
                item.master = false;
              })
              formData.covers[0].master = true
            }
            formData.videos = this.two;


            if (!that.model.showStatus) {
              formData.showStatus = 1;
            } else {
              formData.showStatus = that.model.showStatus;
            }

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
        this.close()
      },
      /**
       * 设置项目封面主图
       * @param index {number} 下标
       */
      setMainFigure(index) {
        if (index) {
          let change = this.one.splice(index, 1);
          this.one.unshift(...change)
        }
      },
      /**
       * 删除项目封面图片
       * @param index {number} 下标
       */
      deleteCover(index) {
        this.one.splice(index, 1);
      },
      /**
       * 删除项目封面视频
       * @param index {number} 下标
       */
      deleteVideo(index) {
        this.two.splice(index, 1);
      },
      deleteImgUrl() {
        this.details.imgUrl = '';
      },
      // 图片 上传 bofore
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
              // that.details[name] = res.result
              if (res.success) {
                let obj = {
                  path: res.result,
                  type: 1,
                  master: false
                };
                // that.imageList.push(obj)
                that.one.push(obj)
                that.filterImgUrl()
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
        formData.append('token', "token")
        this.saveFile(formData)
      },
      saveFile(formData) {
        this.spinning = true
        this.axios({
          method: 'post',
          url: '/common/upload_file',
          headers: {},
          params: {},
          data: formData
        }).then((response) => {
          //  response.result.url
          if (!response.result.url.endsWith('.mp4')) {
            this.$message.error("请上传mp4格式的视频");
            return false;
          }
          let obj = {
            path: response.result.url,
            type: 2
          };
          // this.imageList.push(obj)
          this.two.push(obj)
          this.spinning = false
        }).catch((error) => {
          this.$message.error("新增失败，请重试");
          this.spinning = false
        })

      },

    }
  }
</script>

<style lang="less" scoped>
  .coverPhotoAndVideo {
    margin-left: 10%;
    .coverPhoto {
      display: flex;
      padding: 0;
      width: 100%;
      justify-content: start;

      flex-wrap: wrap;
      li {
        width: 200px;
        margin-right: 15px;
        list-style: none;
        & > div {
          display: flex;
          justify-content: space-around;

          &:hover {
            cursor: pointer;
          }
        }
        img {
          width: 200px;
          height: 125px;
        }
      }
    }
  }

  .activeClick {
    color: #40a9ff;
    text-align: center;
    cursor: pointer;
  }

  /deep/ .isRequired {
    label {
      &:before {
        content: '* ';
        color: red;
      }
    }
  }
</style>