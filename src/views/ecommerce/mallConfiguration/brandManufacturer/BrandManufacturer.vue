<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="属性名称">
              <a-input placeholder="请输入属性名称" v-model="queryParam.name"></a-input>
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
          <img :src="text" style="width: 100px;"/>
        </span>
        <span slot="appListPicUrl" slot-scope="text, record">
          <img :src="text" style="width: 100px;"/>
        </span>
        <div slot="isShow" slot-scope="text, record">
          <a-switch :defaultChecked="Boolean(text)" disabled/>
        </div>
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
    <BrandManufacturerModal ref="modalForm" @ok="modalFormOk"></BrandManufacturerModal>

  </a-card>
</template>

<script>
  import BrandManufacturerModal from './BrandManufacturerModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import { getAction, deleteAction, postAction } from '@/api/manage'
  import { brandList } from "@/api/api";

  export default {
    name: "BrandManufacturer",
    mixins: [JeecgListMixin],
    components: {
      BrandManufacturerModal,
      JDate
    },
    data() {
      return {
        viewData: {},
        feedBackImg: [],
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '品牌名称',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: '品牌大图',
            align: 'center',
            dataIndex: 'listPicUrl',
            scopedSlots: { customRender: 'listPicUrl' }
          },
          {
            title: '品牌小图',
            align: 'center',
            dataIndex: 'appListPicUrl',
            scopedSlots: { customRender: 'appListPicUrl' }
          },
          {
            title: '商品描述',
            align: 'center',
            width: 400,
            dataIndex: 'simpleDesc'
          },
          {
            title: '底价',
            align: 'center',
            dataIndex: 'floorPrice'
          },
          {
            title: '显示',
            align: 'center',
            dataIndex: 'isShow',
            scopedSlots: { customRender: 'isShow' }
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
          list: '/ecommerce/mall/brand/list',
          delete: '/ecommerce/mall/brand/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        type: [],
      }
    },
    methods: {

      // 删除还是恢复
      delOrResClick(id) {
        const url = '/ecommerce/mall/brand/delete'
        const params = {}
        let ids = [id];
        return postAction(url, ids).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>