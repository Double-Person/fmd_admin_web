<template>
  <div>
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
          <!-- 商品，眾籌，直播，短視頻，其他 -->
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="类型">
            <!--<a-select placeholder="请选择广告类型" v-decorator="[ 'typeCode', validatorRules.typeCode]">-->
            <!--<a-select-option v-for="(item, index) in type" :value="item.value" :key="index">{{item.label}}-->
            <!--</a-select-option>-->
            <!--</a-select>-->

            <j-dict-select-tag v-model="model.typeCode" placeholder="请选择"
                               dictCode="advertise"/>
          </a-form-item>

          <!-- 在类型为商品/众筹/直播/短视频时显示 -->
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="目标页面"
            v-if="(model.typeCode == 'pointGoods') || (model.typeCode == 'goods') || (model.typeCode == 'zhongchou') || (model.typeCode == 'zhibo') || (model.typeCode == 'shortVideo')">
            <a-select placeholder="请选择广告类型" v-decorator="[ 'typeCode', {}]" @change="changeTargetPage">
              <a-select-option v-for="(item, index) in type" :value="item.value" :key="index"
                               @click="clickChange(item.value)">
                {{item.label}}
              </a-select-option>
            </a-select>
          </a-form-item>


          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="选择名称"
                       v-if="model.typeCode != 'other' && this.changeData && (this.changeData.name || this.changeData.title)">
            {{this.changeData.name ? this.changeData.name : (this.changeData.title ? this.changeData.title: '')}}
          </a-form-item>


          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="URL" v-if="model.typeCode == 'other'">
            <a-input placeholder="请输入目标页面链接" v-decorator="['url', {} ]"/>
          </a-form-item>

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="图片" required>
            <a-upload
              listType="picture-card"
              class="avatar-uploader"
              :showUploadList="false"
              accept=".jpg, .jpeg, .png"
              :beforeUpload="frontBeforeUpload"
              @change="frontHandleChange"
            >
              <img v-if="details.imgUrl" :src="details.imgUrl" style="height:104px;max-width:300px"/>
              <div v-else>
                <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </a-form-item>

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input-number v-decorator="[ 'sortNum', {}]" class="sortWidth"/>
          </a-form-item>


          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间" v-if="model.endTime">
            <el-date-picker
              v-model="model.endTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间">
            </el-date-picker>
            <!--<a-date-picker placeholder="选择日期"-->
            <!--show-time-->
            <!--:allowClear="false"-->
            <!--:defaultValue="moment(model.endTime, 'YYYY-MM-DD HH:mm:ss')"-->
            <!--@change="changeEndTime"/>-->
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间" v-else>
            <a-date-picker
              v-decorator="['endTime', validatorRules.config]"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>

          <!--<a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="有效性">-->
            <!--&lt;!&ndash;<a-radio-group v-decorator="[ 'status', {}]">&ndash;&gt;-->
            <!--&lt;!&ndash;<a-radio :value="1">有效</a-radio>&ndash;&gt;-->
            <!--&lt;!&ndash;<a-radio :value="0">无效</a-radio>&ndash;&gt;-->
            <!--&lt;!&ndash;</a-radio-group>&ndash;&gt;-->
            <!--<j-dict-select-tag v-model="model.status" placeholder="请选择"-->
                               <!--dictCode="valid_status" @change="changeState" :key="Math.random()" :triggerChange="true"/>-->
          <!--</a-form-item>-->


          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="简单描述">
            <!--<a-input placeholder="请输入简单描述" v-decorator="['description' ]"/>-->
            <a-textarea placeholder="请输入简单描述" allowClear v-decorator="['description', {}]"/>
             <!--/>-->
          </a-form-item>


        </a-form>
      </a-spin>
    </a-modal>


    <div class="target-model" v-if="target">
      <div class="title">
        <div>目标页面</div>
        <div style="cursor: pointer" @click="closeTarget">
          <a-icon type="close"/>
        </div>
      </div>
      <div class="content">
        <a-table bordered :columns="columns" :data-source="dataSource" rowKey="id" :pagination="ipagination"
                 @change="onChange">
          <!-- 短视频封面 直播 商品 start -->
          <span slot="cover" slot-scope="text, record">
            <img :src="text" style="width: 50px;"/>
          </span>
          <!-- 短视频封面 直播 商品 end -->

          <span slot="action" slot-scope="text, record">
            <a @click="handleChange(record)">选择</a>
          </span>
        </a-table>

      </div>
    </div>

  </div>

</template>

<script>
  import pick from 'lodash.pick'
  import moment from 'moment'
  import 'moment/locale/zh-cn'

  moment.locale('zh-cn');
  import {getAction, httpAction} from '@/api/manage'

  export default {
    name: 'SysAdvertiseModal',
    inject: ['reload'],
    data() {
      return {
        targetUrl: '',
        target: null,
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
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          title: {rules: [{required: true, message: '请输入标题'}]},
          url: {rules: [{required: true, message: '请输入跳转的url'}]},
          config: {
            rules: [{type: 'object', required: true, message: '请选择结束时间!'}],
          },
        },
        url: {
          add: '/system/sysAdvertise/add',
          edit: '/system/sysAdvertise/edit',
          info: '/system/sysAdvertise/queryById'
        },
        type: [
          {label: '商品', value: 'goods'},
          {label: '众筹项目', value: 'zhongchou'},
          {label: '直播', value: 'zhibo'},
          {label: '短视频', value: 'shortVideo'},
          {label: '积分商城', value: 'pointGoods'}
        ],
        details: {
          imgUrl: ''
        },
        uploadLoading: false,
        columns: [
          {
            title: '轮播图',
            align: 'center',
            dataIndex: 'img'
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'typeCode',
          },
          {
            title: '结束时间',
            align: 'center',
            dataIndex: 'endTime'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        // 众筹
        raiseProject: [
          {
            title: '项目编号',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: '项目名称',
            align: 'center',
            width: 200,
            dataIndex: 'name'
          },
          {
            title: '当前资金',
            align: 'center',
            dataIndex: 'currentAmount'
          },
          {
            title: '目标资金',
            align: 'center',
            dataIndex: 'targetAmount'
          },

          {
            title: '筹款日期数',
            align: "center",
            customRender: (text, record) => {
              const time = `${record.beginTime && record.beginTime.length > 11 && record.beginTime.substring(0, 11)}至${record.endTime && record.endTime.length > 11 && record.endTime.substring(0, 11)}`;
              return time;
            },
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否显示',
            align: 'center',
            dataIndex: 'showStatus',
            customRender: (text, record) => {
              if (record.status == 1) {
                return '显示'
              } else if (record.status == 2) {
                return '不显示'
              }
              return record.status
            },

          },
          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'isRecommend',
            customRender: (text, record) => {
              return text ? '是' : '否'
            }
          },
          {
            title: '筹款进度',
            align: 'center',
            customRender: (text, record) => {
              if (record.status == 1) {
                return '筹款中'
              } else if (record.status == 10) {
                return '筹款失败'
              } else if (record.status == 20) {
                return '筹款成功'
              }
              return record.status
            },
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        // 直播间
        liveRome: [
          {
            title: '房间名称',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: '封面',
            align: 'center',
            dataIndex: 'cover',//createBy
            scopedSlots: {customRender: 'cover'}
          },
          {
            title: '主播',
            align: 'center',
            dataIndex: 'userName'
          },
          {
            title: '基础人气',
            align: 'center',
            dataIndex: 'basicsViewCount'
          },
          {
            title: '点赞数',
            align: 'center',
            dataIndex: 'likeCount'
          },
          {
            title: '关注人数',
            align: 'center',
            dataIndex: 'collectCount'
          },

          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'recommend',
            customRender: (text, record) => {
              return !!+record.recommend ? '推荐' : '不推荐'
            }
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'status',
            customRender: (text, record) => {
              return record.status == 1 ? '未开始' : '直播中'
            }
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        // 短视频
        shortVideo: [
          {
            title: '封面',
            align: 'center',
            dataIndex: 'cover',
            scopedSlots: {customRender: 'cover'}
          },
          {
            title: '标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'videoType',
            customRender: (text, record) => {
              if (record.videoType == 1) {
                return '短视频'
              } else if (record.videoType == 2) {
                return '广告'
              } else {
                return record.videoType
              }
            }
          },
          {
            title: '分类',
            align: 'center',
            dataIndex: 'categoryName'
          },

          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'recommend',
            customRender: (text, record) => {
              if (record.recommend == 1) {
                return '是'
              } else if (record.recommend == 2) {
                return '否'
              } else {
                return record.status
              }
            }
          },

          {
            title: '是否显示',
            align: 'center',
            dataIndex: 'status',
            customRender: (text, record) => {
              if (record.status == 1) {
                return '是'
              } else if (record.status == 2) {
                return '否'
              } else {
                return record.status
              }
            }
          },
          {
            title: '置顶',
            align: 'center',
            dataIndex: 'sort',
            customRender: (text, record) => {
              return (record.sort > 0 ? '是' : '否')
            }
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        // 商品
        goods: [

          {
            title: '商品名称',
            align: 'center',
            width: 200,
            dataIndex: 'name',
          },
          {
            title: '商品编码',
            align: 'center',
            dataIndex: 'goodsSn'
          },
          {
            title: '商品分类',
            align: 'center',
            dataIndex: 'categoryName'
          },
          {
            title: '是否上架',
            align: 'center',
            dataIndex: 'isOnSale',
            customRender: (text, record) => {
              return text ? '上架' : '下架'
            }
          },
          {
            title: '属性',
            align: 'center',
            customRender: (text, record) => {
              return record.type == 1 ? '普通商品' : (record.type == 2 ? '拼单商品' : record.type == 3 ? '砍价商品' : '')
            }
          },
          {
            title: '商品库存',
            align: 'center',
            dataIndex: 'goodsNumber'
          },
          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'isHot',
            customRender: (text, record) => {
              return record.isHot ? '是' : '否'
            }
          },

          {
            title: '商品封面',
            align: 'center',
            width: 200,
            dataIndex: 'listPicUrl',//createBy
            scopedSlots: {customRender: 'cover'}
          },

          {
            title: '零售价格',
            align: 'center',
            dataIndex: 'retailPrice'
          },

          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',

            scopedSlots: {customRender: 'action'}
          }
        ],
        pointGoods: [

          {
            title: 'jifen商品名称',
            align: 'center',
            width: 200,
            dataIndex: 'name',
          },
          {
            title: '商品编码',
            align: 'center',
            dataIndex: 'goodsSn'
          },
          {
            title: '商品分类',
            align: 'center',
            dataIndex: 'categoryName'
          },
          {
            title: '是否上架',
            align: 'center',
            dataIndex: 'isOnSale',
            customRender: (text, record) => {
              return text ? '上架' : '下架'
            }
          },
          {
            title: '属性',
            align: 'center',
            customRender: (text, record) => {
              return record.type == 1 ? '普通商品' : (record.type == 2 ? '拼单商品' : record.type == 3 ? '砍价商品' : '')
            }
          },
          {
            title: '商品库存',
            align: 'center',
            dataIndex: 'goodsNumber'
          },
          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'isHot',
            customRender: (text, record) => {
              return record.isHot ? '是' : '否'
            }
          },

          {
            title: '商品封面',
            align: 'center',
            width: 200,
            dataIndex: 'listPicUrl',//createBy
            scopedSlots: {customRender: 'cover'}
          },

          {
            title: '零售价格',
            align: 'center',
            dataIndex: 'retailPrice'
          },

          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',

            scopedSlots: {customRender: 'action'}
          }
        ],

        //  表格數據
        dataSource: [],
        changeData: {},//選擇的對象數據

        ipagination: {
          current: 1,
          pageSize: 5,
          pageSizeOptions: ['5'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          // showQuickJumper: true,
          total: 50
        },

      }
    },
    created() {
      // this.searchType()
      //  獲取廣告類型
      this.getTypeCode()
    },
    methods: {
      moment,
      // 選擇結束時間
      changeEndTime(value, dateString) {
        console.log(value, dateString);
      },
      //分頁
      onChange(pageNumber) {
        this.ipagination.current = pageNumber.current;
        this.getTableData(this.targetUrl, pageNumber.current);
      },

      /** 2020/4/26 by yu
       *@meathod: clickChange
       *@param: {mod} argName - desc
       *@desc: 目標頁面選擇callbackFn,解決下拉框沒有改變選中值不能觸發選擇函數問題
       */
      clickChange(val) {
        if (val === this.model.typeCode) {
          this.changeTargetPage(val)
        }
      },

      /**
       * 目标页面选择callbackFn
       * @param val 选中的值
       */
      async changeTargetPage(val) {
        // 在类型为商品/众筹/直播/短视频时显示
        //商品
        if (val == 'goods') {
          this.columns = this.goods;
          this.targetUrl = '/ecommerce/mall/goods/list'
        } else if (val == 'zhongchou') {//众筹
          this.columns = this.raiseProject;
          this.targetUrl = '/ecommerce/mall/ecCrowdfundin/list'
        } else if (val == 'zhibo') {//直播
          this.columns = this.liveRome;
          this.targetUrl = '/live/liveRoom/list'
        } else if (val == 'shortVideo') {//短视频
          this.columns = this.shortVideo;
          this.targetUrl = '/shortvideo/list'
        } else if (val == 'pointGoods') {//積分商城 商品
          console.log('積分商城');
          this.columns = this.pointGoods;
          this.targetUrl = '/pointmall/mall/goods/list'
        }
        await this.getTableData(this.targetUrl, 1);
        this.target = document.getElementsByClassName('ant-modal')[0]
        this.target.style.display = 'none'
      },

      //  獲取選中商品名稱
      async getChangeDataName() {
        let url = '';
        if (!this.model.id) {
          return false
        }
        //商品
        if (this.model.typeCode == 'goods') {
          url = '/ecommerce/mall/goods/info/' + this.model.dataId //-
        } else if (this.model.typeCode == 'zhongchou') {//众筹 -
          url = '/ecommerce/mall/ecCrowdfundin/detail?id=' + this.model.dataId
        } else if (this.model.typeCode == 'zhibo') {//直播 -
          url = '/live/liveRoom/queryById?id=' + this.model.dataId
        } else if (this.model.typeCode == 'shortVideo') {//短视频
          url = '/shortvideo/queryById?id=' + this.model.dataId
        } else if (this.model.typeCode == 'pointGoods') {//積分商城 商品
          url = '/pointmall/mall/goods/info/' + this.model.dataId
        }
        let {result, success} = await getAction(url);
        if (success) {
          this.changeData = result
        }

      },

      async getTableData(url, page) {
        let params = {
          pageNo: page,
          pageSize: 5,
          page: page,
          limit: 5
        };
        let {result: {records, total}} = await getAction(url, params);
        this.dataSource = records;
        this.ipagination.total = total;
      },
      //  目标页面右上角关闭按钮
      closeTarget() {
        this.target.style.display = 'block'
        this.target = null
      },

      // 目标页面行选择
      handleChange(record) {
        this.changeData = record;
        // 商品  name   众筹name 直播name  短视频 title
        this.closeTarget()
      },

      // 獲取廣告類型
      getTypeCode() {
        const url = '/sys/dictItem/list'
        const params = {}
        params.dictId = 'a3d1b1ee6706c63271b5637bea47dd67'
        params.field = 'id,,itemText,itemValue,action'
        params.pageNo = '1'
        params.pageSize = '50'
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            // this.type = result.records
          }
        })
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

      changeState(val) {
        this.model.status = val + '';
      },
      add() {
        this.edit({})
      },
      async edit(record) {
        this.form.resetFields()
        let {result} = await getAction(this.url.info, {id: record.id});
        this.model = Object.assign({}, result);
        if (record.id) {
          this.model.status = result.status + ''; // 轉化成字符串，在有效性選件中需要是字符串類型
        }

        this.getChangeDataName();
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'moduleCode', 'typeCode', 'title', 'status', 'img', 'description', 'url', 'sortNum', 'endTime', 'description', 'moduleCode', 'id')
          )
          this.details.imgUrl = this.model.img;
          this.changeData.id = this.model.dataId;

          //时间格式化
        })
      },
      close() {
        this.$emit('close');
        this.changeData = {};
        this.visible = false
      },
      handleOk() {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            if (this.details.imgUrl == '') {
              that.$message.warning('图片必须上传')
              return false
            }
            if (this.model.typeCode === '') {
              that.$message.warning('请选择类型')
            }
            if (this.model.typeCode != 'other') {
              if (!this.changeData.id) {
                that.$message.warning('请选择目标页面数据')
                return false
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
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            formData.img = this.details.imgUrl
            //  日期格式转换
            if ((typeof formData.endTime) == 'object') {
              formData.endTime = formData.endTime.format('YYYY-MM-DD HH:mm:ss');
            }
            if (this.changeData && this.changeData.id) {
              formData.dataId = this.changeData.id
            }
            formData.moduleCode = 'index';
            if(!formData.id){
              formData.status = 1
            }

            // console.log(formData);
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
                that.confirmLoading = false;
                this.reload();
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
  .ant-modal-wrap {

  }

  .target-model {
    width: 80%;
    position: fixed;
    top: 10%;
    left: 10%;
    right: 10%;
    z-index: 2001;
    .title {
      padding: 16px 24px;
      border-radius: 4px 4px 0 0;
      background: #fff;
      color: rgba(0, 0, 0, 0.65);
      border-bottom: 1px solid #e8e8e8;

      font-size: 16px;
      line-height: 22px;

      display: flex;
      justify-content: space-between;
    }
    .content {
      background: #fff;
      & > div {
        width: 95%;
        margin: 0px auto;
        padding-top: 25px;
      }
    }

  }
</style>