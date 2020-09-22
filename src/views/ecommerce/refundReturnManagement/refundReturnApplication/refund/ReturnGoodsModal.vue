<template>
  <a-modal
    title="退货详情"
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
          align="center"
          label="商品数量">
          <template slot-scope="scope">
            <span>{{model.refundGoodsNumber}}</span>
          </template>
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
                <img :src="item.path" alt="" style="width: 100%">
              </div>
            </div>

          </div>
        </div>
      </div>


      <!-- 退款信息部分 待处理 -->
      <div class="center" v-if="model.status == 1">
        <el-form label-position="right" label-width="13%" :model="model" ref="consigneeInformation">
          <!--:rules="{required: true, message: '姓名不能为空', trigger: 'blur' }"-->
          <el-form-item label="收货人姓名" prop="consignee" >
            <el-input v-model="model.consignee" style="width:60%; "></el-input>
          </el-form-item>

          <!--:rules="{required: true, message: '所在区域不能为空', trigger: 'change' }"-->
          <el-form-item label="所在区域" prop="provinces">
            <el-cascader
              v-model="model.provinces"
              :options="userAddress"
              @change="handleChange"
              style="width:60%; "></el-cascader>
          </el-form-item>
          <!--:rules="{required: true, message: '地址不能为空', trigger: 'change' }"-->
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="model.address" style="width:60%; "></el-input>
          </el-form-item>
          <!--:rules="{required: true, message: '电话不能为空', trigger: 'change' }"-->
          <el-form-item label="联系电话" prop="mobile">
            <el-input v-model="model.mobile" style="width:60%; "></el-input>
          </el-form-item>

        </el-form>
      </div>

      <!-- 待处理 -->
      <div class="bottom" v-if="model.status == 1">
        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">待处理</div>
        </div>
        <div class="item">
          <div class="title is__required">处理结果备注</div>
          <div class="content">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2 , maxRows: 4}"
              placeholder="请输入"
              v-model="remark">
            </el-input>
          </div>
        </div>

        <div class="item">
          <div class="title">处理状态</div>
          <div class="content">待退款</div>
        </div>

        <div class="item" style="margin-left: 13%">
          <a-button @click="agreeReturn(3)" type="primary" style="margin-right: 15px">同意退货</a-button>
          <a-button @click="agreeReturn(5)">拒绝退货</a-button>
        </div>


      </div>

      <!--status /**
            * 未进行   1
            * 已申请，已提交   2
            * 已同意，已确认  3
            * 已完成   4
            * 已拒绝  5
            * 确认收货 6
            refundGoodsStatus  退货状态 0:待处理1:已提交2:已完成
            -->

      <!-- 退款信息部分 其他状态 -->
      <!-- 同意 待收货状态 -->
      <div class="center" v-if=" model.refundGoodsStatus == 0 ">
        <div class="item">
          <div class="item-title">收货人姓名：</div>
          <div class="item-content">{{model.consignee}}</div>
        </div>
        <div class="item">
          <div class="item-title">所在区域：</div>
          <div class="item-content">{{ model.province + model.city + model.district }}</div>
        </div>
        <div class="item">
          <div class="item-title">详细地址：</div>
          <div class="item-content">{{model.address}}</div>
        </div>
        <div class="item">
          <div class="item-title">联系电话：</div>
          <div class="item-content">{{model.mobile}}</div>
        </div>

        <!--<div class="item" style="margin-left: 13%">-->
        <!--<a-button @click="confirmGoods" type="primary">确认收货</a-button>-->
        <!--</div>-->

      </div>

      <!--底部退款状态-->


      <!-- 已同意 - 退款失败 refundAmountStatus==3 -->
      <!-- 已同意 - 退款成功 refundAmountStatus==2 -->
      <div class="bottom" v-if="model.status == 4">
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
          <div class="content" v-if="model.refundAmountStatus ==0">待处理</div>
          <div class="content" v-if="model.refundAmountStatus ==1">已提交</div>
          <div class="content" v-if="model.refundAmountStatus ==2">退款失败</div>
          <div class="content" v-if="model.refundAmountStatus ==3">退款成功</div>
        </div>
        <div class="item" v-if="model.refundAmountStatus ==2">
          <div class="title">失败原因</div>
          <div class="content">你的付款账号余额不足或资金未到账</div>
        </div>
        <div class="item">
          <div class="title">处理人</div>
          <div class="content">{{model.updateBy}}</div>
        </div>
        <div class="item">
          <div class="title">处理时间</div>
          <div class="content">{{model.updateTime}}</div>
        </div>

        <div class="item" style="margin-left: 13%" v-if="model.refundAmountStatus ==2">
          <a-button @click="tryAgainRefund" type="primary">重新退款</a-button>
        </div>

      </div>


      <div style="margin:15px 0 0 13%;" v-if=" (model.status != 1) && (model.refundGoodsStatus == 0) ">
        <a-button @click="confirmGoods" type="primary">确认收货</a-button>
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
    name: 'ReturnGoodsModal',// 退货
    data() {
      return {
        imgJson: [],//
        remark: '',// 备注   待处理
        //  退货待处理 收货人信息
        consigneeInformation: {
          consignee: '',//收货人姓名
          provinces: [],//省市区
          address: '',//详细地址
          mobile: ''//
        },
        //  通用信息
        tableData: [],
        userAddress: [],//地址
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
          // queryById: '/ecommerce/mall/ecRefundReason/queryById',
          queryById: '/ecommerce/mall/ecOrderRefund/detail',
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
    created() {
    },
    components: {
      JDate
    },
    methods: {
      handleChange(value) {
        console.log(value);
      },
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

      /** 2020/4/16 by yu
       *@meathod: agreeReturn
       *@param: {mod} targetStatus - desc {3:同意，5：拒绝}
       *@desc: 订单审核(是否同意退貨)
       */

      agreeReturn(targetStatus) {
        // this.$refs.consigneeInformation.validate((valid) => {
          if (targetStatus == 3) {
            if(!this.model.consignee){
              this.$message.error('收货人姓名不能为空')
              return false
            }
            if(this.model.provinces.length == 0){
              this.$message.error('所在区域不能为空')
              return false
            }
            if(!this.model.address){
              this.$message.error('地址不能为空')
              return false
            }
            if(!this.model.mobile){
              this.$message.error('收货人电话不能为空')
              return false
            }
            this.sendAudit(targetStatus)

          }else {
            if(this.remark == ''){
              this.$message.error('处理结果备注不能为空')
              return false
            }
            this.sendAudit(targetStatus)
          }




        // });

      },

      sendAudit(type){
        let url = '/ecommerce/mall/ecOrderRefund/audit';
        let params = {
          targetStatus:type,
          consignee: this.model.consignee,//收货人姓名 审核退货同意必填
          mobile: this.model.mobile,//收货人电话 审核退货同意必填
          province: this.model.provinces[0],
          city: this.model.provinces[1],
          district: this.model.provinces[2],
          address: this.model.address,
          remark: this.remark,
          refundId: this.model.id  //  orderId   userId
        }
        putAction(url, params).then(({success, message}) => {
          if (success) {
            this.$message.success(message)
          } else {
            this.$message.warning(message)
          }
          this.visible = false
          this.reload()
        })
      },

      /** 2020/4/16 by yu
       *@meathod: confirmGoods
       *@desc:  确认收货
       */
      async confirmGoods() {
        let url = '/ecommerce/mall/ecOrderRefund/confirmGoods';
        let {message, success} = await putAction(url, {refundId: this.model.id});  //  orderId   userId
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.error(message)
        }
        this.close()
        this.reload()
      },

      /**
       * 获取地址
       * @returns {Promise<void>}
       */
      async getAddress() {
        let {records, success} = await getAction('/common/sys_area/all');
        if (success) {
          records.forEach(province => {
            province.value = province.name;
            province.label = province.name;
            if (province.children) {
              province.children.forEach(city => {
                city.value = city.name;
                city.label = city.name;
                if (city.children) {
                  city.children.forEach(district => {
                    district.value = district.name;
                    district.label = district.name;
                  })
                }
              })
            }
          })
          this.userAddress = records;
        }
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
            this.model.provinces = [this.model.province, this.model.city, this.model.district];
            this.imgJson = (this.model.imagesjson ? (JSON.parse(this.model.imagesjson)) : []);  // 详情附件转json数据
            if (this.model.goods) {
              this.tableData = [this.model.goods];  //  获取详情goods数据
            } else {
              this.tableData = [];  //  获取详情goods数据
            }

          }
          await this.getAddress();
          console.log(result);
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
        return false;
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
            console.log(formData);
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
                this.reload()
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
 /deep/ .el-form-item__label{
    &:before{
      content: '* ';
      color: red;
    }
  }
 .is__required{
    &:before{
      content: '* ';
      color: red;
    }
  }

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
    padding: 15px 0;
    border: 1px solid #EBEEF5;
    .item {
      padding: 15px 0;
      display: flex;
      .item-title {
        display: inline-block;
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
          content: '：';
        }
      }
      .content {
        width: 50%;
      }
    }

  }

</style>