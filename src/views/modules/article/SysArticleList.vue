<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="标题">
              <a-input placeholder="请输入文章标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="类型">
              <a-select placeholder="请选择类型" v-model="queryParam.typeCode">
                <a-select-option v-for="(item, index) in type" :value="item.itemValue" :key="index">{{item.itemText}}
                </a-select-option>
              </a-select>
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
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <router-link to="/article/add">
        <a-button type="primary" icon="plus">新增</a-button>
      </router-link>
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
        <span slot="typeCode" slot-scope="text, record">
          {{text |articleType }}
        </span>
        <span slot="action" slot-scope="text, record">
          <!-- <a @click="handleEdit(record)">编辑</a> -->
          <router-link :to="{path: '/article/add', query: {id: record.id}}">编辑</router-link>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm
                  title="确定删除吗?"
                  @confirm="() => delOrResClick(record.id)"
                  v-if="record.delFlag">
                  <a>删除</a>
                </a-popconfirm>
                <a-popconfirm
                  title="确定恢复吗?"
                  @confirm="() => delOrResClick(record.id)"
                  v-else>
                  <a>恢复</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <sysArticle-modal ref="modalForm" @ok="modalFormOk"></sysArticle-modal>
  </a-card>
</template>

<script>
  let filterThat;
  import SysArticleModal from './SysArticleModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction} from '@/api/manage'

  export default {
    name: 'SysArticleList',
    mixins: [JeecgListMixin],
    components: {
      SysArticleModal,
      JDate
    },
    data() {
      return {
        description: '文章管理页面',
        // 表头
        columns: [
          {
            title: '标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'typeCode',
            scopedSlots: {customRender: 'typeCode'}
          },
          // {
          //   title: '是否显示',
          //   align: 'center',
          //   customRender: (text, record) => {
          //     return record.isRecommend ? '是' : '否'
          //   }
          // },

          {
            title: '添加时间',
            align: 'center',
            dataIndex: 'createTime'
          },
          {
            title: '修改时间',
            align: 'center',
            dataIndex: 'updateTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        type: [],

        url: {
          list: '/system/sysArticle/list',
          delete: '/system/sysArticle/delete',
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
    filters: {
      articleType(code) {
        let types = filterThat.type.filter(item => {
          let computedData = item.itemValue.split('_').join('');
          if (computedData.toLowerCase() == code.toLowerCase()) {
            return item.itemText
          }
        })
        return types.length == 0 ? code : types[0].itemText
      }
    },
    beforeCreate() {
      filterThat = this;
    },
    created() {
      this.searchType()
    },
    methods: {
      // 查询文章类型
      searchType() {
        const url = '/sys/dictItem/list'
        const params = {}
        params.dictId = 'e897cd65d67a18c0695c45abbea768fe'
        params.field = 'id,,itemText,itemValue,action'
        params.pageNo = '1'
        params.pageSize = '50'
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.type = result.records;
          }
        })
      },
      // 删除还是恢复
      delOrResClick(id) {
        const params = {}
        params.id = id
        return deleteAction(this.url.delete, params).then(res => {
          if (res.success) {
            // console.log(res)
            this.$message.success('操作成功')
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>