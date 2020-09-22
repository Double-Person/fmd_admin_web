<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
    v-if="showModal"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="属性名称">
          <a-input placeholder="请输入属性名称" v-model="model.name"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="营业时间">
          <a-time-picker :defaultValue="moment(details.defaultStartTime, 'HH:mm')" format="HH:mm"
                         @change="changeStartTime"/>
          至
          <a-time-picker :defaultValue="moment(details.defaultEndTime, 'HH:mm')" format="HH:mm"
                         @change="changeEndTime"/>
          <!--<a-time-picker @change="onChange" :defaultOpenValue="moment('00:00', 'HH:mm')" format="HH:mm"/>-->
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="店铺编码">
          <a-input placeholder="请输入店铺编码" v-model="model.shopsSn"/>
        </a-form-item>
        <a-form-item
          label="店铺图片"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
        >
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :beforeUpload="frontBeforeUpload"
            @change="frontHandleChange"
          >
            <img v-if="details.imgUrl" :src="details.imgUrl" style="height:100px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="店铺管理员">
          <!--<a-input placeholder="请输入店铺管理员" v-decorator="['createBy', {} ]"/>-->
          <!--:defaultValue="checkedStoreManager"-->
          <a-select @change="change" :defaultValue="checkedStoreManager">
            <a-select-option :value="item.id" v-for="(item, index) in storeManagers" :key="index">
              {{item.realname||'--'}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="查询经纬度">
          <a href="https://lbs.qq.com/tool/getpoint/index.html" target="_blank">https://lbs.qq.com/tool/getpoint/index.html</a>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="经度">
          <a-input-number placeholder="请输入经度" v-model="model.longitude" style="width: 100%"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="纬度">
          <a-input-number placeholder="请输入纬度" v-model="model.latitude" style="width: 100%"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="详细地址">
          <a-input placeholder="请输入详细地址" v-model="model.details"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系电话">
          <a-input placeholder="请输入联系电话" v-model="model.telephone" @blur="checkPhone(model.telephone)"/>
          <!--v-decorator="['telephone', {rules: [{ validator: checkPhone }]} ]"-->
        </a-form-item>


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
          <a-input-number v-decorator="[ 'sort', {}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item
          label="内容"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
        >
          <vue-ueditor-wrap v-model="details.content" :config="myConfig" :destroy="true"></vue-ueditor-wrap>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import VueUeditorWrap from 'vue-ueditor-wrap'
  import moment from 'moment'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'StoreList',
    inject: ['reload'],
    data() {
      return {
        showModal: false,
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
        myConfig: {
          // 编辑器不自动被内容撑高
          autoHeightEnabled: false,
          // 初始容器高度
          initialFrameHeight: 240,
          // 初始容器宽度
          initialFrameWidth: '100%',
          serverUrl: process.env.VUE_APP_BASE_API + '/system/ueditor/action'
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          shopsSn: {rules: [{required: true, message: '请输入店铺编码'}]},
          name: {rules: [{required: true, message: '请输入属性名称'}]},
        },
        url: {
          list: '/sys/user/list',//  获取店铺管理员  /sys/user/list
          add: '/ecommerce/mall/shops/save',
          edit: '/ecommerce/mall/shops/update'
        },
        type: [],
        storeManagers: [],// 店铺管理员
        checkedStoreManager: '',// 选中的管理员
        details: {
          imgUrl: '',
          content: '',
          defaultStartTime: '00:00',
          defaultEndTime: '00:00',
        },
        uploadLoading: false
      }
    },
    created() {
      this.searchType()
    },
    components: {
      VueUeditorWrap
    },

    methods: {
      moment,
      // onChange(time, timeString) {
      //   console.log(time, timeString);
      // },
      checkLongLatititude(rule, value, callback) {
        if (value.length == 0) {
          callback();
          return;
        }
        if (value < 0) {
          callback('请输入正确的经纬度!');
        }

      },
      /** 2020/5/7 by yu
       *@meathod: checkPhone
       *@param: {mod} argName - desc
       *@desc: 手機號碼檢查
       */
      checkPhone(value) {
        if (value.length == 0 || value.length == 11) {
          if (value) {
            let phoneRe = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (phoneRe.test(value)) {

              return;
            } else {
              this.$message.warning('请输入11位合法手机号码!');
            }
          }
          return;
        }
        this.$message.warning('请输入11位合法手机号码!');
      },
      change(value) {
        this.checkedStoreManager = value
      },
      /**
       * 选择开始时间
       * @param time
       * @param timeStr
       */
      changeStartTime(time, timeStr) {
        this.details.defaultStartTime = timeStr
      },
      /**
       * 选择结束时间
       * @param time
       * @param timeStr
       */
      changeEndTime(time, timeStr) {
        this.details.defaultEndTime = timeStr
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
        let that = this;
        let res = await getAction(this.url.list);
        this.storeManagers = res.result.records

        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'workTime', 'shopsSn', 'createBy', 'longitude', 'latitude', 'details', 'telephone', 'createTime', 'sort')
          )
          // this.details.imgUrl = this.model.img

          that.checkedStoreManager = that.model.createUserId
          let workTime = that.model.workTime
          that.details.defaultStartTime = workTime ? workTime.split('-')[0] : that.details.defaultStartTime;
          that.details.defaultEndTime = workTime ? workTime.split('-')[1] : that.details.defaultEndTime;
          that.details.content = that.model.shopDesc
          that.showModal = true
        })

      },
      close() {
        this.$emit('close')
        this.reload()
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = 'post'
            if (!this.model.id) {
              httpurl += this.url.add
            } else {
              httpurl += this.url.edit
            }
            let formData = Object.assign(this.model, values)
            formData.imgUrl = this.details.imgUrl
            formData.shopDesc = this.details.content

            //  营业时间
            formData.workTime = this.details.defaultStartTime + '-' + this.details.defaultEndTime;
            formData.userId = this.checkedStoreManager
            let phoneRe = /^1(3|4|5|6|7|8|9)\d{9}$/;

            console.log(formData)
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
      // 身份证正面上传 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 身份证正面上传 change
      frontHandleChange(info) {
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
</style>