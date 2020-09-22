<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="分类名">
              <a-input placeholder="请输入分类名" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery();switchTable()" icon="search">查询</a-button>
              <a-button
                type="primary"
                @click="searchReset();resetTable()"
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

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
    </div>

    <!-- table区域-begin -->
    <div v-if="!showSearchTable">
      <j-tree-table
        :url="url.list"
        topValue="0"
        queryKey="id"
        :columns="columns"
        :dataSource="tableData">
      <span slot="imgUrl" slot-scope="text, record">
      <img :src="text.text" style="width: 100px;"/>
      </span>
        <span slot="iconUrl" slot-scope="text, record">
      <img :src="text.text" style="width: 100px;"/>
      </span>
        <template v-slot:action="props">
          <a @click="handleEdit(props.record)">编辑</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => delOrResClick(props.record.id)">
                  <a>删除</a>
                </a-popconfirm>
                <!--<a class="view ant-dropdown-link" @click="viewClick(props.record.id)">查看</a>-->
              </a-menu-item>
            </a-menu>
          </a-dropdown>

        </template>

      </j-tree-table>


    </div>


    <div v-if="showSearchTable">
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columnsSearch"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="imgUrl" slot-scope="text, record">
          <img :src="text" style="width: 100px;"/>
        </span>
        <span slot="iconUrl" slot-scope="text, record">
          <img :src="text" style="width: 100px;"/>
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
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
    <!-- model区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" @ok="handleOk">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">分类名称：</div>
            <div class="viewDialog-content">{{viewData.name}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">简介：</div>
            <div class="viewDialog-content">{{viewData.frontName}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">排序：</div>
            <div class="viewDialog-content">{{viewData.sort}}</div>
          </div>

        </div>
      </a-modal>
    </div>
    <!-- 表单区域 -->
    <CategoryModal ref="modalForm" @ok="modalFormOk"></CategoryModal>
  </a-card>
</template>

<script>
  import PubSub from 'pubsub-js'
  import CategoryModal from './CategoryModal'
  import JTreeTable from '@/components/jeecg/JTreeTable'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, postAction} from '@/api/manage'


  export default {
    name: "Category",
    mixins: [JeecgListMixin],
    inject: ['reload'],
    components: {
      JDate, JTreeTable, CategoryModal
    },
    data() {
      return {
        viewData: {},
        viewVisible: false,
        tableData: [],//  表格数据
        description: '文章管理页面',
        selectedRowKeys: [],
        showSearchTable: false, //显示搜索表格
        // 表头
        columns: [
          {
            title: '分类名称',
            align: 'left',
            dataIndex: 'name'
          },
          {
            title: '上级分类',
            align: 'center',
            dataIndex: 'parentName'
          },
          {
            title: '级别',
            align: 'center',
            dataIndex: 'level'
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否显示',
            align: 'center',
            // dataIndex: 'isRecommend'
            customRender: (text, record) => {
              return text.isShow ? '是' : '否'
            }
          },
          // {
          //   title: '顶部大图',
          //   align: 'center',
          //   dataIndex: 'imgUrl',
          //   scopedSlots: {customRender: 'imgUrl'}
          // },
          // {
          //   title: 'icon链接',
          //   align: 'center',
          //   dataIndex: 'iconUrl',
          //   scopedSlots: {customRender: 'iconUrl'}
          // },
          // {
          //   title: '简介',
          //   align: 'center',
          //   dataIndex: 'frontName'
          // },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        //  搜索表格
        columnsSearch: [
          {
            title: '分类名称',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: '上级分类',
            align: 'center',
            dataIndex: 'parentName',

          },
          {
            title: '级别',
            align: 'center',
            width: 400,
            dataIndex: 'level'
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否显示',
            align: 'center',
            // dataIndex: 'isRecommend'
            customRender: (text, record) => {
              return text.isShow ? '是' : '否'
            }
          },

          // {
          //   title: '品牌大图',
          //   align: 'center',
          //   dataIndex: 'imgUrl',
          //   scopedSlots: {customRender: 'imgUrl'}
          // },
          // {
          //   title: '品牌小图',
          //   align: 'center',
          //   dataIndex: 'iconUrl',
          //   scopedSlots: {customRender: 'iconUrl'}
          // },
          // {
          //   title: '简介',
          //   align: 'center',
          //   dataIndex: 'frontName'
          // },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        type: [],
        recommend: Constant.RECOMMEND,
        effective: Constant.EFFECTIVE,
        url: {
          list: '/ecommerce/mall/category/queryAll',  //   /ecommerce/mall/category/queryAll
          delete: '/ecommerce/mall/category/delete',
          deleteBatch: '/system/sysArticle/deleteBatch',
          exportXlsUrl: 'system/sysArticle/exportXls',
          importExcelUrl: 'system/sysArticle/importExcel'
        }
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },

    created() {
      this.getDataList()
    },
    methods: {
      // 查询表格数据切换展示表格
      switchTable() {
        let parmas = this.queryParam.name.trim();
        if (parmas != '') {
          this.showSearchTable = true
        } else {
          this.showSearchTable = false
        }
      },
      //  点击重置按钮初始化显示表格
      resetTable() {
        this.showSearchTable = false
      },
      /**
       * 获取商品
       * @param  {data}   页码及当前页数
       * @returns {Promise<void>}
       */
      async getDataList(data) {
        let res = await getAction('/ecommerce/mall/category/queryAll', data);
        let tempData = [];
        if (res.code && (res.code == 200 || res.code == 0)) {

          tempData = this.treeDataTranslate(res.result.records, 'id', 'parentId', 'childrens');
          tempData.forEach(item => {
            item.children = item.childrens || [];
            item.children.forEach(ite => {
              ite.children = ite.childrens
            })
          })
          this.tableData = tempData;
          PubSub.publish('allData', this.tableData)
        }
      },

      // 删除还是恢复
      delOrResClick(id) {
        const url = this.url.delete
        const params = [id]
        return postAction(url, params).then(res => {
          if (res.success) {
            this.searchQuery()
            this.reload()
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        })
      },
      // 查看点击
      viewClick(id) {
        this.feedBackImg = []
        this.viewVisible = true
        let url = '/ecommerce/mall/category/info/' + id
        let params = {}
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.viewData = result
            this.feedBackImg = JSON.parse(result.img)
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
<style scoped>
  @import '~@assets/less/common.less';
</style>