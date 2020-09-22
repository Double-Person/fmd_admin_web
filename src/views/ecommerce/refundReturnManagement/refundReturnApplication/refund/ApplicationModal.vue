<template>
  <a-modal
    title="退款详情"
    width="80%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
    :footer="null"
  >
    <a-spin :spinning="confirmLoading">
      <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="name"
          align="center"
          label="商品名称">
        </el-table-column>
        <el-table-column
          prop="goodsSn"
          align="center"
          label="商品编码">
        </el-table-column>
        <el-table-column
          prop="goodsNumber"
          align="center"
          label="商品数量">
        </el-table-column>
        <el-table-column
          prop="retailPrice"
          align="center"
          label="成交价格">
        </el-table-column>
        <el-table-column label="商品图片" align="center">
          <template slot-scope="scope">
            <!--<img :src="scope.row.listPicUrl" alt="" width="100px" v-if="scope.row && scope.row.listPicUrl">-->
            <el-image
              style="width: 100px"
              :src="scope.row.listPicUrl"
              :preview-src-list="[scope.row.listPicUrl]"
              v-if="scope.row && scope.row.listPicUrl">
            </el-image>
          </template>
        </el-table-column>
      </el-table>

      <!-- 退款信息部分 -->
      <div class="center">
        <div class="item">
          <div class="item-title">退款编码：</div>
          <div class="item-content">{{model.id}}</div>
        </div>
        <div class="item">
          <div class="item-title">申请用户：</div>
          <div class="item-content">{{model.customerNickName}}</div>
        </div>
        <div class="item">
          <div class="item-title">申请时间：</div>
          <div class="item-content">{{model.createTime}}</div>
        </div>
        <div class="item">
          <div class="item-title">退款原因：</div>
          <div class="item-content">{{model.reasonText}}</div>
        </div>
        <div class="item">
          <div class="item-title">退款金额：</div>
          <div class="item-content">{{model.refundAmount}}</div>
        </div>
        <div class="item">
          <div class="item-title">问题描述：</div>
          <div class="item-content">{{model.reamrk}}</div>
        </div>
        <div class="item">
          <div class="item-title">图片凭证：</div>
          <div class="item-content">
            <div style="display: flex;">
              <div v-for="item in imgJson" style="width: 150px;margin-right: 15px">
                <!--<img :src="item.path" alt="" style="width: 100%">-->

                <el-image
                  style="width: 100%"
                  :src="item.path"
                  :preview-src-list="imgJsonPreview">
                </el-image>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!--底部退款状态-->
      <!--
      status
      /**
      * 未进行   1
      * 已申请，已提交   2
      * 已同意，已确认  3
      * 已完成   4
      * 已拒绝  5
      * 确认收货 6
      refundAmountStatus  退款状态 0:待处理1:已提交2:退款失败3:退款成功

      -->

      <!-- 待处理 0ae1a064bf3f0c8a15b3f262481ccc9f -->
      <div class="bottom" v-if="model.status == 1">
        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">待处理</div>
        </div>
        <div class="item">
          <div class="title">处理结果备注</div>
          <div class="content">
            <el-input
              :required="true"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8}"
              placeholder="请输入"
              v-model="remark">
            </el-input>
          </div>
        </div>

        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">待退款</div>
        </div>

        <div class="item">
          <div class="content" style="margin-left: 13%">
            <a-button @click="dealRefund(3)" type="primary">同意退款</a-button>
            <a-button @click="dealRefund(5)">拒绝退款</a-button>
          </div>

        </div>


      </div>


      <!-- 已同意 - 退款成功 -->
      <!-- 已同意 - 退款失败 -->
      <div class="bottom" v-if="model.status == 3">
        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">已同意</div>
        </div>
        <div class="item">
          <div class="title">处理结果备注</div>
          <div class="content">{{model.auditRemark}}</div>
        </div>
        <div class="item">
          <div class="title">退款状态</div>
          <div class="content" v-if="model.refundAmountStatus ==3">退款成功</div>
          <div class="content" v-if="model.refundAmountStatus ==2">退款失败</div>
        </div>
        <div class="item" v-if="model.refundAmountStatus ==2">
          <div class="title">失败原因</div>
          <div class="content">{{ model.refundFailReason }}</div>
        </div>
        <div class="item">
          <div class="title">处理人</div>
          <div class="content">{{model.updateBy}}</div>
        </div>
        <div class="item">
          <div class="title">处理时间</div>
          <div class="content">{{model.updateTime}}</div>
        </div>

        <div class="item" v-if="model.refundAmountStatus ==2">

          <a-button @click="tryAgainRefund" type="primary" style="margin-left: 13%;">重新退款</a-button>
        </div>

      </div>


      <!-- 已拒绝 -->
      <div class="bottom" v-if="model.status == 5">
        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">已拒绝</div>
        </div>

        <div class="item">
          <div class="title">处理结果备注</div>
          <div class="content">{{model.auditRemark}}</div>
        </div>

        <div class="item">
          <div class="title">退款状态</div>
          <div class="content">
            {{model.refundAmountStatus ==0 ?'待处理': model.refundAmountStatus ==1?'已提交':model.refundAmountStatus
            ==2?'退款失败':model.refundAmountStatus ==3?"退款成功":model.refundAmountStatus}}
          </div>
        </div>

        <div class="item">
          <div class="title">处理人</div>
          <div class="content">{{model.updateBy}}</div>
        </div>
        <div class="item">
          <div class="title">处理时间</div>
          <div class="content">{{model.updateTime}}</div>
        </div>

      </div>


    </a-spin>
  </a-modal>
</template>

<script>

  import JDate from '@/components/jeecg/JDate'
  import pick from 'lodash.pick'
  import {getAction, httpAction, putAction} from '@/api/manage'

  export default {
    inject: ['reload'],
    name: 'ApplicationModal',// 退款
    data() {
      return {
        imgJson: [],// 图片凭证数据
        imgJsonPreview:[],
        remark: '',// 备注   待处理
        //  通用信息
        tableData: [],
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
        url: {
          queryById: '/ecommerce/mall/ecOrderRefund/detail',
          tryRefund: '/ecommerce/mall/ecOrderRefund/tryRefund',//  重新退款
          add: '/ecommerce/mall/goods/save',
          edit: '/ecommerce/mall/goods/update',
          info: '/ecommerce/mall/goods/info/',
        },
        details: {
          imgUrl: '',
          content: ''
        },

      }
    },

    components: {
      JDate
    },
    methods: {
      // 重新退款
      async tryAgainRefund() {
        let {success, message} = await putAction(this.url.tryRefund, {refundId: this.model.id});  //
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.error(message)
        }
        this.visible = false;
        this.reload()
      },

      /**
       * 订单退款申请
       * @param targetStatus {3：同意，5：拒绝}
       * @returns {void 0}
       */
      dealRefund(targetStatus) {
        if(targetStatus == 5){
          if (this.remark == '') {
            this.$message.error('处理结果备注必须输入')
            return false;
          }
        }
        let url = '/ecommerce/mall/ecOrderRefund/audit';
        let params = {
          targetStatus,
          remark: this.remark,
          refundId: this.model.id
        }
        //  id  orderId   userId
        putAction(url, params).then(({message, success}) => {
          if (success) {
            this.$message.success(message)
          } else {
            this.$message.warning(message)
          }
        })
      },
      add() {
        this.edit({})
      },
      async edit(record) {
        await this.form.resetFields();
        if (record.id) {
          let query = {id: record.id}
          let {success, result} = await getAction(this.url.queryById, query);
          if (success) {
            this.model = Object.assign({}, result)
            this.imgJson = (this.model.imagesjson ? (JSON.parse(this.model.imagesjson)) : []);  // 详情附件转json数据
            this.imgJsonPreview = this.imgJson.map(item=>item.path);
            if (this.model.goods) {
              this.tableData = [this.model.goods];  //  获取详情goods数据
            } else {
              this.tableData = [];  //  获取详情goods数据
            }

          }

        }
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'goodsSn', 'retailPrice', 'goodsNumber', 'currentAmount', 'introduce', 'sort')
          )

        })
      },

      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        // return false;
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
            let formData = Object.assign(this.model, values)
            formData.goodsDesc = this.details.content;


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
      }
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

    .coverVideo {
      display: flex;
      list-style: none;
      padding: 0;
      li {
        display: inline-block;
        width: 200px;
        margin-right: 15px;
        span {
          display: block;
          text-align: center;
          color: #40a9ff;
          &:hover {
            cursor: pointer;
          }

        }
      }
    }
  }

  .activeClick {
    color: #40a9ff;
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

  .center {
    margin-top: 20px;
    border: 1px solid #EBEEF5;
    .item {
      padding: 15px 0;
      display: flex;
      .item-title {
        width: 13%;
        text-align: right;
      }
      .item-content {

      }
    }
  }

  .bottom {
    margin-top: 20px;
    border: 1px solid #EBEEF5;
    .item {
      padding: 15px 0;
      display: flex;
      .title {
        width: 13%;
        text-align: right;
        &:after {
          content: "：";
        }
      }
      .content {
        width: 50%;
      }

      button {
        margin-right: 15px;
      }
    }

  }

</style>