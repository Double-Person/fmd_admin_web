<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="订单编号">
              <a-input placeholder="订单编号" v-model="queryParam.orderSn"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8" v-if="false">
            <a-form-item label="下单者账号">
              <a-input placeholder="下单者账号" v-model="queryParam.mobile"></a-input>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">

            <a-col :md="6" :sm="8" v-if="false">
              <a-form-item label="付款状态">
                <a-select v-model="queryParam.payStatus" allowClear placeholder="请选择">
                  <a-select-option :value="1">未付款</a-select-option>
                  <a-select-option :value="2">付款中</a-select-option>
                  <a-select-option :value="3">已付款</a-select-option>
                  <a-select-option :value="4">退款</a-select-option>

                </a-select>
              </a-form-item>
            </a-col>


            <a-col :md="6" :sm="8">
              <a-form-item label="订单状态">
                <a-select v-model="queryParam.orderStatus" allowClear placeholder="请选择">
                  <!--<a-select-option :value="item.value" :key="item.value" v-for="item in status">{{item.label}}-->
                  <!--</a-select-option>-->

                  <a-select-option value="201">待发货</a-select-option>
                  <a-select-option value="300">已发货</a-select-option>
                  <a-select-option value="301">确认收货</a-select-option>

                </a-select>
              </a-form-item>
            </a-col>
          </template>


          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button
                type="primary"
                @click="searchReset"
                icon="reload"
                style="margin-left: 8px"
              >重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="img" slot-scope="text, record">
          <img :src="text" style="width: 50%;"/>
        </span>

        <span slot="action" slot-scope="text, record">
          <a class="view ant-dropdown-link"
             @click="viewClick(record)">查看</a>
          <a-divider type="vertical"
                     v-if="(record.orderStatus == 201) || (record.orderStatus == 202) || (record.orderStatus == 203) || (record.orderStatus == 300)"/>
          <a-dropdown
            v-if="(record.orderStatus == 201) || (record.orderStatus == 202) || (record.orderStatus == 203) || (record.orderStatus == 300)">
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.orderStatus == 201">
                <a @click="sendDelivery(record)">发货</a>
              </a-menu-item>
              <a-menu-item
                v-if="(record.orderStatus == 201) || (record.orderStatus == 202) || (record.orderStatus == 203)">
                <!-- 待发货，待分享，筹款中， -->
                <a @click="handleEdit(record)">编辑收货人</a>
              </a-menu-item>
              <!--待收货（确认收货按钮）-->
              <a-menu-item v-if="record.orderStatus == 300">
                <a @click="ConfirmGoods(record)">确认收货</a>
              </a-menu-item>

            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <AllOrdersModal ref="modalForm" @ok="modalFormOk"></AllOrdersModal>

    <!-- 发货 -->
    <delivery ref="delivery"/>

    <!-- 查看model区 -->
    <div class="opinion-modal">
      <a-modal title="订单详情" v-model="viewVisible" class="viewModal" @ok="handleOk" width="65%" :footer="null">
        <div class="viewDialog-cont">
          <!--收货人信息-->
          <div class="viewDialog-item">
            <div class="viewDialog-title">收货人信息</div>
            <div class="viewDialog-content viewDialog-content-border">
              <a-row>
                <a-col :span="6">收货人：{{viewData.consignee}}</a-col>
                <a-col :span="12">收货地址：{{viewData.province + viewData.city + viewData.district +viewData.address}}
                </a-col>
                <a-col :span="6">联系电话：{{viewData.mobile}}</a-col>
              </a-row>
            </div>
          </div>
          <!--商品信息-->
          <div class="viewDialog-item">
            <div class="viewDialog-title">商品信息</div>
            <el-table
              :data="viewData.orderGoodsEntityList"
              border
              style="width: 100%">
              <el-table-column
                prop="goodsName"
                label="商品名称"
                header-align="center"
                align="center">
              </el-table-column>
              <el-table-column
                prop="goodsSn"
                label="商品编码"
                header-align="center"
                align="center">
              </el-table-column>
              <el-table-column
                prop="number"
                label="商品数量"
                header-align="center"
                align="center">
              </el-table-column>
              <el-table-column
                prop="buyPoints"
                label="成交价格"
                header-align="center"
                align="center">
              </el-table-column>
              <el-table-column
                prop="listPicUrl"
                label="图片"
                header-align="center"
                align="center">
                <template slot-scope="scope">
                  <!--<img style="height: 50%;width: 50%" :src="scope.row.listPicUrl"/>-->
                  <el-image
                    style="height: 50%;width: 50%"
                    :src="scope.row.listPicUrl"
                    :preview-src-list="[scope.row.listPicUrl]">
                  </el-image>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--订单信息-->
          <div class="viewDialog-item">
            <div class="viewDialog-title">订单信息</div>
            <div class="viewDialog-content viewDialog-content-border">
              <div style="margin-bottom: 15px">
                <span class="title">订单状态：</span>
                <el-radio-group v-model="viewData.orderStatus" disabled>
                  <el-radio :label="201">待发货</el-radio>
                  <el-radio :label="300">已发货</el-radio>
                  <el-radio :label="301">确认收货</el-radio>
                </el-radio-group>
              </div>
              <div style="margin-bottom: 15px">
                <span class="title">付款状态：</span>
                <el-radio-group v-model="viewData.payStatus" disabled>
                  <el-radio :label="1">未付款</el-radio>
                  <el-radio :label="2">付款中</el-radio>
                  <el-radio :label="3">已付款</el-radio>
                </el-radio-group>
              </div>
              <div style="margin-bottom: 15px">
                <span class="title">商品总价：</span>
                <span v-if="viewData.orderGoodsEntityList && viewData.orderGoodsEntityList[0].number">
                  {{ (viewData.orderGoodsEntityList[0].number)*(viewData.orderGoodsEntityList[0].buyPoints) }} 积分
                </span>
              </div>
              <div style="margin-bottom: 15px">
                <span class="title">订单金额：</span>{{viewData.usePoints}} 积分
              </div>
              <div style="margin-bottom: 15px">
                <span class="title">订单编号：</span>{{viewData.orderSn}}
              </div>
              <div style="margin-bottom: 15px">
                <a-row>
                  <a-col :span="8"><span class="title">下单时间：</span>{{viewData.addTime}}</a-col>
                  <a-col :span="8">付款时间：{{viewData.payTime || viewData.addTime}}
                  </a-col>
                  <a-col :span="8"
                         v-if="computedShowGuoqi(viewData.orderStatus)">
                    订单过期时间：{{viewData.expireTime }}
                  </a-col>
                </a-row>
              </div>
              <!--<div style="margin-bottom: 15px">-->
              <!--订单完成时间：{{viewData.consignee}}-->
              <!--</div>-->
            </div>
          </div>
          <!--物流信息-->
          <div class="viewDialog-item" v-if="viewData.orderStatus!=201">
            <div class="viewDialog-title">物流信息</div>
            <div class="viewDialog-content viewDialog-content-border">
              <a-row>
                <a-col :span="6">快递公司名称：{{viewData.shippingName}}</a-col>
                <a-col :span="12">快递公司编码：{{viewData.shippingCode }}
                </a-col>
                <a-col :span="6">快递单号：{{viewData.shippingNo}}</a-col>
              </a-row>
            </div>
          </div>


        </div>
      </a-modal>
    </div>


  </a-card>
</template>

<script>
  import {orderStatusEmum, paymentStatusEmum} from "@/assets/enumeration"
  import AllOrdersModal from './AllOrdersModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction} from '@/api/manage'
  import Delivery from "./Delivery";
  import PubSub from 'pubsub-js'

  export default {
    name: "AllOrders",
    mixins: [JeecgListMixin],
    inject: ['reload'],
    components: {
      Delivery,
      AllOrdersModal,
      JDate
    },
    data() {
      return {
        status: [],//订单状态
        comments: null,//评价信息
        viewData: {},
        viewVisible: false,
        description: '所有订单',
        // 表头
        columns: [
          {
            title: '订单编号',
            align: 'center',
            dataIndex: 'orderSn'
          },
          {
            title: '下单者账号',
            align: 'center',
            dataIndex: 'userPhone'
          },
          {
            title: '订单积分',
            align: 'center',
            dataIndex: 'usePoints' // orderPrice
          },
          {
            title: '付款状态',
            align: 'center',
            dataIndex: 'payStatus',
            customRender: (text, record) => {
              if (text == 1) {
                return '未付款'
              } else if (text == 2) {
                return '付款中'
              } else if (text == 3) {
                return '已付款'
              } else if (text == 4) {
                return '退款'
              }
            }
          },
          {
            title: '订单状态',
            align: 'center',
            // dataIndex: 'orderStatus'
            customRender: (text, record) => {
              if (text.orderStatus == 0) {
                return '待付款'
              } else if (text.orderStatus == 100) {
                return '已过期'
              } else if (text.orderStatus == 101) {
                return '已取消'
              } else if (text.orderStatus == 102) {
                return '已删除'
              } else if (text.orderStatus == 103) {
                return '付款失败'
              } else if (text.orderStatus == 201) {
                return '待发货'
              } else if (text.orderStatus == 300) {
                return '已发货'
              } else if (text.orderStatus == 301) {
                return '确认收货'
              } else if (text.orderStatus == 302) {
                return '已完成'
              } else if (text.orderStatus == 401) {
                return '退款'
              } else if (text.orderStatus == 402) {
                return '退款退货'
              } else if (text.orderStatus == 202) {
                return '待分享'
              } else if (text.orderStatus == 203) {
                return ' 众筹中'
              }
              return text.orderStatus
            }
          },
          {
            title: '下单时间',
            align: 'center',
            dataIndex: 'addTime'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',
            fixed: 'right',
            width: 200,
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/pointmall/mall/order/list',
          delete: '/system/sysAdvertise/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch'
        },
        type: [],
        effective: Constant.EFFECTIVE
      }
    },
    created() {
      this.status = orderStatusEmum

    },
    methods: {
      // 计算过期时间
      computedShowGuoqi(ststus) {
        let arr = [201, 300, 301];
        return !arr.includes(ststus)

      },
      /**
       * 发货 20200413153447465874402
       * @param record { object } 行信息
       */
      sendDelivery(record) {
        PubSub.publish('sendDeliveryPointInfo', record)
      },
      ConfirmGoods(record) {
        let url = '/pointmall/mall/order/confirmReceive';
        getAction(url, {id: record.id}).then(res => {
          if (res.success) {
            this.$message.success('收货成功')
          } else {
            this.$message.warning(res.message)
          }
          this.reload()
        })
      },

      // 查看点击
      async viewClick(record) {
        let {result, success} = await getAction('/ecommerce/mall/comment/forOrderUser?orderId=' + record.id + '&userId=' + record.userId);
        if (success) {
          this.comments = result;
        }
        this.viewVisible = true;
        // 订单信息
        let url = `/pointmall/mall/order/info/${record.id}`;
        return getAction(url).then(res => {
          if (res.success) {
            let result = res.result;
            this.viewData = result
          }
        })

      },
      //  关闭查看弹窗
      handleOk() {
        this.viewVisible = false
      }

    }
  }
</script>
<style lang="scss" scoped>
  @import '~@assets/less/common.less';
  /* 查看订单详情start */
  .viewDialog-cont {
    .viewDialog-item {
      display: block;
      .viewDialog-title {
        color: #303133;
        margin: 15px 0;
      }
      .viewDialog-content {
        display: block;
      }
      .viewDialog-content-border {
        border: 1px solid #EBEEF5;
        padding: 10px 20px;
        .title {
          display: inline-block;
          width: 80px;
          text-align: right;
        }
      }

    }
  }

  /* 查看订单详情end */
</style>