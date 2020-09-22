<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="店铺名称">
              <a-input placeholder="请输入商品名称" v-model="queryParam.shopsName"></a-input>
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
      >
        <span slot="listPicUrl" slot-scope="text, record">
          <img :src="text" style="width: 50px;"/>
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

              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <StoreConfigurationModal ref="modalForm" @ok="modalFormOk"></StoreConfigurationModal>

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
  import StoreConfigurationModal from './StoreConfigurationModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import { getAction, deleteAction, postAction } from '@/api/manage'

  export default {
    name: "StoreConfiguration",
    mixins: [JeecgListMixin],
    components: {
      StoreConfigurationModal,
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
            title: '店铺名称',
            align: 'center',
            dataIndex: 'shopsName'
          },
          {
            title: '商品分类',
            align: 'center',
            dataIndex: 'shopsCategoryName'
          },
          {
            title: '商品名称',
            align: 'center',
            dataIndex: 'goodsName'
          },
          {
            title: '商品图片',
            align: 'center',
            dataIndex: 'listPicUrl',//createBy
            scopedSlots: { customRender: 'listPicUrl' }
          },
          {
            title: '零售价格',
            align: 'center',
            dataIndex: 'retailPrice'
          },
          {
            title: '店铺商品库存',
            align: 'center',
            dataIndex: 'goodsNumber'
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
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/ecommerce/mall/shopsgoods/list',
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
        const url = '/ecommerce/mall/shopsgoods/list'
        const params = {}
        //  page=1&limit=10&shopsCategoryId=&shopsId=
        params.dictId = 'a3d1b1ee6706c63271b5637bea47dd67'
        params.field = 'id,,itemText,itemValue,action'
        params.page = '1'
        params.limit = '10'
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            // console.log(result)
            this.type = result.records
          }
        })
      },
      // 删除还是恢复
      delOrResClick(id) {//
        const url = '/ecommerce/mall/shopsgoods/delete'
        const params = [id]

        return postAction(url, params).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
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