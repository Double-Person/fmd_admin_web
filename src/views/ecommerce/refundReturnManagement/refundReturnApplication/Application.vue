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
          <a-col :md="6" :sm="8">
            <a-form-item label="退款编号">
              <a-input placeholder="退款编号" v-model="queryParam.refundId"></a-input>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="申请时间">
                <j-date
                  v-model="queryParam.applyBeginTime"
                  :showTime="false"
                  style="width:45%"
                  placeholder="开始时间"
                ></j-date>
                <span style="width: 10px;">~</span>
                <j-date
                  v-model="queryParam.applyEndTime"
                  :showTime="false"
                  style="width:45%"
                  placeholder="结束时间"
                ></j-date>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="类型">
                <a-select v-model="queryParam.type" allowClear placeholder="请选择">
                  <a-select-option :value="1">退款</a-select-option>
                  <a-select-option :value="2">退款退货</a-select-option>
                  <a-select-option :value="3" v-if="false">退款退货</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="申请人账号">
                <a-input placeholder="申请人账号" v-model="queryParam.applyMobile"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="退款状态">
                <a-select v-model="queryParam.refundAmountStatus" allowClear placeholder="请选择">
                  <a-select-option :value="0">待退款</a-select-option>
                  <a-select-option :value="1">已提交</a-select-option>
                  <a-select-option :value="2">退款失败</a-select-option>
                  <a-select-option :value="3">退款成功</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="6" :sm="8">
              <a-form-item label="处理状态">
                <a-select v-model="queryParam.status" allowClear placeholder="请选择">
                  <a-select-option value="1|2">待处理</a-select-option>
                  <a-select-option value="3|4|6">已同意</a-select-option>
                  <a-select-option value="5">已拒绝</a-select-option>
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
        <!--:scroll="{ x: 2450 }"-->
        <!-- 商品名称 -->
        <span slot="name" slot-scope="text, record">{{ text }}</span>
        <!-- 是否上架 -->
        <span slot="isOnSale" slot-scope="text, record">
          <a-switch checkedChildren="上架" unCheckedChildren="下架" @change="changeStandUp($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>

        <span slot="isHot" slot-scope="text, record">
          <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeRecommended($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>

        <!-- 列表图 -->
        <span slot="listPicUrl" slot-scope="text, record">
          <img :src="text" style="width: 50%;"/>
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">查看</a>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 退款 -->
    <ProductListModal ref="modalForm" @ok="modalFormOk"></ProductListModal>
    <ReturnGoodsModal ref="ReturnGoodsModal" @ok="modalFormOk"></ReturnGoodsModal>


  </a-card>
</template>

<script>
  import ProductListModal from './refund/ApplicationModal'
  import ReturnGoodsModal from './refund/ReturnGoodsModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, postAction} from '@/api/manage'


  export default {
    name: "ProductList",
    mixins: [JeecgListMixin],
    components: {
      ProductListModal,
      ReturnGoodsModal,
      JDate
    },
    data() {
      return {
        viewData: {},
        feedBackImg: [],
        viewVisible: false,
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '退款编号',
            align: 'center',
            // width: 100,
            dataIndex: 'id'
          },
          {
            title: '订单编号',
            align: 'center',
            // width: 150,
            dataIndex: 'orderSn',
          },
          {
            title: '申请人账号',
            align: 'center',
            // width: 100,
            dataIndex: 'customerMobile'
            // dataIndex: 'mobile'
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'type',
            customRender: (text, record) => {
              if (text == 1) {
                return '退款'
              } else if (text == 2 || text == 3){
                return '退款退货'
              }
              //   if (text == 2) {
              //   return '退货'
              // } else if (text == 3) {
              //   return '退款退货'
              // }
              return text
            }
          },
          {
            title: '退款金额',
            align: 'center',
            dataIndex: 'refundAmount',
            customRender: (text, record) => {
              return '￥ ' + text
            }
          },
          {
            title: '申请时间',
            align: 'center',
            dataIndex: 'createTime',
          },
          {
            title: '处理状态',
            align: 'center',
            // dataIndex: 'isHot'
            //
            // <!--修改商品属性  2.拼单  3.砍价  1.普通-->
            customRender: (text, record) => {
              if (record.status == 1) {
                return '待处理'//'未进行'
              } else if (record.status == 2) {
                return '待处理'//'已申请已提交'
              } else if (record.status == 3) {
                return '已同意'//'已确认'
              } else if (record.status == 4) {
                return '已同意'//'已完成'
              } else if (record.status == 5) {
                return '已拒绝'
              } else if (record.status == 6) {
                return '已同意'//'确认收货'
              }
              return record.status
            }
          },

          {
            title: '退款状态',
            align: 'center',
            width: 100,
            dataIndex: 'refundAmountStatus',
            customRender: (text, record) => {
              if (text == 0) {
                return '待退款'
              } else if (text == 1) {
                return '已提交'
              }
              else if (text == 2) {
                return '退款失败'
              }
              else if (text == 3) {
                return '退款成功'
              }
              return record.refundAmountStatus
            }
          },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/ecommerce/mall/ecOrderRefund/list',//
          // delete: '/ecommerce/mall/ecOrderRefund/delete',
          delete: '/ecommerce/mall/goods/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        type: [],

      }
    },

    created() {
      this.searchType()
    },
    methods: {
      handleEdit(record) {
        //同意退货进入退款
        // if ((record.type == 2) && (record.status == 3)) {
        //   console.log('同意退货进入退款流程');
        //   this.$refs.modalForm.edit(record);
        //   this.$refs.modalForm.title = "编辑";
        //   this.$refs.modalForm.disableSubmit = false;
        // }else
          if (record.type == 1) {// 退款
          this.$refs.modalForm.edit(record);
          this.$refs.modalForm.title = "编辑";
          this.$refs.modalForm.disableSubmit = false;
        } else if (record.type == 2) { //退货

          this.$refs.ReturnGoodsModal.edit(record);
          this.$refs.ReturnGoodsModal.title = "编辑";
          this.$refs.ReturnGoodsModal.disableSubmit = false;

        } else if (record.type == 3) { //退款退货

        }

      },

      /**
       * 改变上下架状态
       * @param e  当前event 参数
       * @param row  列数据 object
       */
      async changeStandUp(e, row) {
        let url = '/ecommerce/mall/goods/changeSale';
        let parma = [row.id];
        let res = await postAction(url, parma)
        let responseMsg = e ? '上架成功' : '下架成功'
        if (res.code === 200) {
          this.$message.success(responseMsg)
        }
      },
      /**
       * 是否推荐
       * @param e  当前event 参数
       * @param row  列数据 object
       * @returns {Promise<void>}
       */
      async changeRecommended(e, row) {
        let url = '/ecommerce/mall/goods/update';
        let parma = row;
        parma.isHot = Number(e);
        let {success, message} = await postAction(url, parma)
        if (success) {
          this.$message.success(message)
        }
      },

      // 查询广告类型
      searchType() {
        const url = '/sys/dictItem/list'
        const params = {}
        params.dictId = 'a3d1b1ee6706c63271b5637bea47dd67'
        params.field = 'id,,itemText,itemValue,action'
        params.page = '1'
        params.limit = '50'
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            // console.log(result)
            this.type = result.records
          }
        })
      },
      // 删除还是恢复
      delOrResClick(id) {
        const params = [id];
        return postAction(this.url.delete, params).then(res => {
          if (res.success) {
            this.$message.success(res.message)
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },
      //点击SKU配置
      //  关闭查看弹窗
      handleOk() {
        this.viewVisible = false
      },


      // 表单提交
      dataFormSubmit() {
        this.$http({
          url: `/ecommerce/mall/goodssku/saveGoodsProduct`,
          method: 'post',
          data: this.productEntityList
        }).then(res => {
          console.log(res);
          if (res && res.code === 200) {
            this.$message.success('提交成功!')
            this.visible = false
            this.$emit('refreshDataList')
          }
        })
      }

    }
  }
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';

  .el-dialog {
    width: 70%;
    min-width: 920px;
  }

  /deep/ .ant-modal-content {
    position: relative;
    background: skyblue !important;
    z-index: 2300 !important;
  }

  /* 输入框上的标签 */
  .sku-config-lable {
    display: flex;
    text-align: center;
    div {
      width: 20%;
    }
  }

  /* 每排输入框的下边距 */
  /deep/ .ant-form-item {
    margin-bottom: 0px;
  }

  .modal-footer {
    /*width: 100%;*/
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e8e8e8;
    margin-top: 10px;
    padding-top: 15px;
    margin-left: -24px;
    margin-right: -24px;
    .ant-row {
      margin-right: 48px;
    }
    .ant-row:nth-of-type(1) {
      margin-right: 8px;
    }
  }

</style>