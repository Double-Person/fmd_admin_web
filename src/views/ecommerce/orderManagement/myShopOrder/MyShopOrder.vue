<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="商品名称">
              <a-input placeholder="请输入商品名称" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="商品编码">
              <a-input placeholder="请输入商品编码" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>

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
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('广告')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>-->
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
        :scroll="{ x: 1800, y: 300 }"
      >
        <span slot="img" slot-scope="text, record">
          <img :src="text" style="width: 50%;"/>
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => delOrResClick(record.id)">
                  <a>删除</a>
                </a-popconfirm>
                 <a class="view ant-dropdown-link" @click="viewClick(record.id)">查看</a>

              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <MyShopOrderModal ref="modalForm" @ok="modalFormOk"></MyShopOrderModal>

    <!-- model区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" @ok="handleOk">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">属性名称：</div>
            <div class="viewDialog-content">{{viewData.userName}}属性名称</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">排序：</div>
            <div class="viewDialog-content">{{viewData.createTime}}排序</div>
          </div>

        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
  import MyShopOrderModal from './MyShopOrderModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import { getAction, deleteAction } from '@/api/manage'

  export default {
    name: "MyShopOrder",
    mixins: [JeecgListMixin],
    components: {
      MyShopOrderModal,
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
            title: '会员昵称',
            align: 'center',
            width: 100,
            dataIndex: 'nickname'
          },
          {
            title: '订单编号',
            align: 'center',
            width: 100,
            dataIndex: 'orderSn'
          },
          {
            title: '订单类型',
            align: 'center',
            width: 100,
            dataIndex: 'orderType'
          },
          {
            title: '发货状态',
            align: 'center',
            width: 100,
            dataIndex: 'shippingStatus'
            //   1 未发货 -》按钮发货    2 已发货 3 已收货 4退货
          },
          {
            title: '订单状态',
            align: 'center',
            width: 100,
            dataIndex: 'orderStatus'
          //  100 已过期  101 已取消  102已删除  201待发货  300已发货
          //     <el-button v-if="isAuth('mall:order:confirmReceive') && scope.row.orderStatus === 300" type="primary"
          //   size="mini" @click="confirmReceive(scope.row.id)">确认收货
            //  301确认收货  401退款  402售后退款
          },
          {
            title: '付款状态',
            align: 'center',
            width: 100,
            dataIndex: 'shippingStatus'
          //  1-4  未付款 付款中 已付款 退款
          },
          {
            title: '收货人',
            align: 'center',
            width: 100,
            dataIndex: 'consignee'
          },
          {
            title: '详细地址',
            align: 'center',
            width: 100,
            dataIndex: 'address'
          //  scope.row.province+scope.row.city+scope.row.district+scope.row.address
          },
          {
            title: '手机号',
            align: 'center',
            width: 100,
            dataIndex: 'mobile'
          },
          {
            title: '快递公司',
            align: 'center',
            width: 100,
            dataIndex: 'shippingName'
          },
          {
            title: '快递单号',
            align: 'center',
            width: 100,
            dataIndex: 'shippingNo',//createBy
          },
          {
            title: '实际支付金额',
            align: 'center',
            width: 150,
            dataIndex: 'actualPrice'
          },
          {
            title: '积分抵扣金额',
            align: 'center',
            width: 150,
            dataIndex: 'integralMoney'
          },
          {
            title: '下单时间',
            align: 'center',
            width: 100,
            dataIndex: 'addTime'
          },
          {
            title: '付款时间',
            align: 'center',
            width: 100,
            dataIndex: 'payTime'
          },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',
            fixed: 'right',
            width: 200,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/ecommerce/mall/order/myOrder',
          delete: '/system/sysAdvertise/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        type: [],
        effective: Constant.EFFECTIVE
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    created() {
      this.searchType()
    },
    methods: {
      // 查询广告类型
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
            // console.log(result)
            this.type = result.records
          }
        })
      },
      // 删除还是恢复
      delOrResClick(id) {
        const url = '/system/sysAdvertise/delete'
        const params = {}
        params.id = id
        return deleteAction(url, params).then(res => {
          if (res.success) {
            // console.log(res)
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },
      // 查看点击
      viewClick(id) {
        console.log(id);
        this.feedBackImg = []
        this.viewVisible = true
        let url = '/system/sysFeedback/queryById'
        let params = {
          id: id
        }
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.viewData = result
            this.feedBackImg = JSON.parse(result.img)
          }
        })

      },
      //  关闭查看弹窗
      handleOk(){
        this.viewVisible = false
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>