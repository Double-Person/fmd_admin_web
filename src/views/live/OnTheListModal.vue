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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="房间名称">
          <a-input placeholder="请输入属性名称" v-decorator="['name', {rules: [{ required: true, message: '请输入房间名称' }]} ]"/>
        </a-form-item>
        <a-form-item
          label="封面"
          :labelCol="labelCol" :wrapperCol="wrapperCol"
          class="isRequired"
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


        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="主播" class="isRequired">
          <a-select @change="change" v-model="model.userId">
            <a-select-option :value="item.id" v-for="(item, index) in host" :key="index" :disabled="item.disable">
              {{item.nickname}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="基础人气">
          <a-input-number v-decorator="[ 'basicsViewCount', {}]" class="sortWidth"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="点赞数" v-if="false">
          <a-input-number v-decorator="[ 'likeCount', {}]" class="sortWidth"/>
        </a-form-item>

        <a-form-item
          v-for="(k, index) in form.getFieldValue('keys')"
          :key="k"
          v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? '绑定商品' : ''"
          :required="true"
        >

          <a-input
            v-model="accountIds[index]"
            @change="computedIsShow(index)"
            placeholder='请输入商品编码'
            style="width: 60%; margin-right: 8px"
          />
          <a-icon
            v-if="(form.getFieldValue('keys').length > 1) && (index == form.getFieldValue('keys').length-1)"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="form.getFieldValue('keys').length === 1"
            @click="() => remove(k, index)"
          />
          <span v-if="computedIsShow(index)" class="tig">该商品编码不存在</span>
          <!--<span v-if="computedIsRepeat(index)" class="tig">该商品id重复</span>-->
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
          <a-button type="dashed" style="width: 60%" @click="addInput">
            <a-icon type="plus"/>
            添加
          </a-button>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import {getAction, httpAction} from '@/api/manage'

  let id = 0;
  export default {
    name: 'GoodsListModal',
    data() {
      return {
        flag: true,
        goodsList: [],// 商品列表
        host: [],//主播
        accountIds: [],//所有商品id
        title: '操作',
        visible: false,
        model: {},
        storeManagers: [],//管理员
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        confirmLoading: false,
        // form: this.$form.createForm(this),
        validatorRules: {
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          title: {rules: [{required: true, message: '请输入标题'}]},
        },
        url: {
          list: '/sys/role/list',//  获取店铺管理员
          userList: '/user/list',//  获取主播
          goodsList: '/ecommerce/mall/goods/list',//  商品列表
          // goodsList: '/live/liveRoomGoods/list',//  商品列表

          // add: '/ecommerce/mall/shops/save',
          add: '/live/liveRoom/add',
          edit: '/live/liveRoom/edit'
        },
        type: [],
        details: {
          imgUrl: '',
          headPortrait: '',//头像
          content: ''
        },
        uploadLoading: false,
        uploadLoadingHeadPortrait: false,
        formItemLayout: {
          labelCol: {
            xs: {span: 24},
            sm: {span: 5}
          },
          wrapperCol: {
            xs: {span: 24},
            sm: {span: 16}
          },
        },
        formItemLayoutWithOutLabel: {
          wrapperCol: {
            xs: {span: 24, offset: 0},
            sm: {span: 16, offset: 5},
          },
        },
      }
    },
    computed: {},
    beforeCreate() {
      this.form = this.$form.createForm(this, {name: 'dynamic_form_item'});
      this.form.getFieldDecorator('keys', {initialValue: [], preserve: true});
    },

    methods: {
      /**
       * 控制绑定商品后的提示是否显示
       * @param index  绑定商品的下标
       * @returns {boolean}
       */
      computedIsShow(index) {
        let hasInput = [...this.accountIds];
        if (this.accountIds[index] !== undefined) {
          if (hasInput[index].trim() != '') {
            return !(this.goodsList.includes(hasInput[index]))
          }
          return false
        }
      },

      computedIsRepeat(index) {
        let hasInput = [...this.accountIds];
        if (this.accountIds[index] !== undefined) {
          if (hasInput[index].trim() != '') {

            let uniqueArr = [...new Set(hasInput)];
            if (uniqueArr.length != hasInput.length) {
              return true
            }
            return false
          }
          return false
        }
      },
      change(value) {
        // console.log(value);
      },

      add() {
        this.edit({})
      },

      // 获取商品列表
      async getGoodSList() {
        this.goodsList = [];
        let params = {
          pageNo: 1,
          pageSize: 9999,
          page: 1,
          limit: 9999
        }
        let {result: {records}} = await getAction(this.url.goodsList, params);
        let temp = records;
        await temp.filter(m => m);
        await temp.forEach(item => {
          if (item.goodsSn) {
            this.goodsList.push(item.goodsSn);
          }
        })
      },

      async edit(record) {
        if (record.status == 2) {
          this.$message.warning('主播直播中不能修改资料')
          return false;
        }
        this.visible = true
        this.confirmLoading = true
        let that = this;
        this.form.resetFields()
        await this.getGoodSList();
        let allUserParmas = {
          userType: 2,
          pageNo: 1,
          pageSize: 9999,
          page: 1,
          limit: 9999
        }
        let {success, result} = await getAction(this.url.userList, allUserParmas);// 全部用户
        let all = await getAction('/live/liveRoom/list');// 已经存在开启直播间的用户
        if (success) {
          let hostData = [];
          let allUser = [];
          let temp = [];
          //  筛选是主播的
          if (result.records && result.records.length) {
            hostData = result.records.filter(item => item.userType == 2);// 主播

          }

          // 筛选已经存在房间的主播
          if (all.success && all.result && all.result.records) {
            allUser = all.result.records;
            for (let i = 0; i < hostData.length; i++) {
              let hostDataObj = hostData[i];
              let hostDataId = hostDataObj.id;
              let flag = false;
              for (let j = 0; j < allUser.length; j++) {
                let allUserObj = allUser[j];
                let allUserId = allUserObj.userId;
                if (allUserId == hostDataId) {
                  flag = true;
                  break;
                }
              }
              if (!flag) {
                hostDataObj.disable = false;
                temp.push(hostDataObj)
              } else {
                hostDataObj.disable = true;
                temp.push(hostDataObj)
              }
            }
            this.host = temp;
          }


        }


        if (record.id) {
          let {success, result} = await getAction('/live/liveRoom/queryById', {id: record.id});
          if (success) {
            this.model = Object.assign({}, result);
            this.accountIds = result.goodsSns || []
          }
        } else {
          this.model = Object.assign({}, record);
          this.accountIds = this.model.goodsSns || []
        }
        this.details.imgUrl = this.model.cover;
        this.confirmLoading = false
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'basicsViewCount', 'likeCount', 'accountId')
          )
          this.addInput()
          let len = this.model.goodsSns && this.model.goodsSns.length;
          for (let i = 0; i < len; i++) {
            this.addInput()
          }

          //时间格式化
        })
      },
      close() {
        this.$emit('close')
        this.form.resetFields();
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            let httpurl = ''
            let method = 'post'
            if (!this.model.id) {
              httpurl += this.url.add
            } else {
              httpurl += this.url.edit;
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            this.accountIds = this.accountIds.filter(d => d);
            this.accountIds = [...new Set(this.accountIds)];
            formData.goodsSns = this.accountIds;
            //  过滤空串等假数据


            formData.cover = this.details.imgUrl;
            if (!formData.cover) {
              this.$message.warning('请上传封面图片');
              return false;
            }
            if (!formData.userId || formData.userId == '') {
              this.$message.warning('请选择主播');
              return false;
            }

            let control = true;
            if (this.accountIds && this.accountIds.length) {
              for (let i = 0; i < this.accountIds.length; i++) {
                let result = this.goodsList.includes(this.accountIds[i]);
                if (!result) {
                  control = false
                  break;
                }
              }
            }
            if (!control) {
              console.log('商品编码不符合条件');
              return false;
            }


            //  修改用户名
            let fil = this.host.filter(item => item.id == formData.userId)
            if (fil.length) {
              formData.userName = fil.length > 0 && fil[0].nickname;
            }
            // return false;

            that.confirmLoading = true;
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

      remove(k, index) {
        const {form} = this;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
          return;
        }

        // can use data-binding to set
        form.setFieldsValue({
          keys: keys.filter(key => key !== k),
        });
        this.accountIds = this.accountIds.splice(0,index)
      },
      addInput() {
        const {form} = this;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');

        const nextKeys = keys.concat(id++);

        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
          keys: nextKeys,
        });
      },


      // 封面上传 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 封面上传 change
      frontHandleChange(info) {
        this.upload(info, 'imgUrl')
      },
      // 封面上传
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
              that.details[name] = res.result
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
  .tig {
    color: red;
    margin-left: 15px;
    font-size: 14px;
  }

  /deep/ .isRequired {
    .ant-form-item-label {
      label {
        &:before {
          content: "* ";
          color: red;
        }
      }
    }
  }

  /* 动态添加输入框start */
  .dynamic-delete-button {
    cursor: pointer;
    position: relative;
    top: 4px;
    font-size: 24px;
    color: #999;
    transition: all 0.3s;
  }

  .dynamic-delete-button:hover {
    color: #777;
  }

  .dynamic-delete-button[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* 动态添加输入框end */
</style>