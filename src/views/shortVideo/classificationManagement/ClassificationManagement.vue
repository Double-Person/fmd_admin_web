<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="分类名称">
              <a-input placeholder="请输入商品名称" v-model="queryParam.name"></a-input>
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
        <span slot="cover" slot-scope="text, record">
          <img :src="text" style="width: 50px;"/>
        </span>
        <span slot="status" slot-scope="text, record">
          <a-switch checkedChildren="上架" unCheckedChildren="下架" @change="changeShowStatus($event,record)"
                    :defaultChecked="text == 1 ? true:false"/>
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

    <!-- 表单区域 -->
    <ClassificationManagementModal ref="modalForm" @ok="modalFormOk"></ClassificationManagementModal>

  </a-card>
</template>

<script>
  import ClassificationManagementModal from './ClassificationManagementModal.vue'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'

  export default {
    name: "ClassificationManagement",
    mixins: [JeecgListMixin],
    components: {
      ClassificationManagementModal,
      JDate
    },
    data() {
      return {
        viewVisible: false,
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '分类名称',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否显示',
            align: 'center',
            dataIndex: 'status',
            scopedSlots: {customRender: 'status'}
            // customRender: (text, record) => {
            //   return record.status == 1 ? '是' : '否'
            // }
          },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/shortvideo/category/list',
          delete: '/shortvideo/category/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        type: [],
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    created() {

    },
    methods: {
     async changeShowStatus(e, row) {
        row.status = (e ? 1 : 2);
        let url = '/shortvideo/category/edit';
        let {success,message} = await putAction(url, row);
        if(success){
          this.$message.success(message)
        }else {
          this.$message.error(message)
        }


      },
      // 删除还是恢复
      delOrResClick(id) {
        const params = {}
        params.id = id
        return deleteAction(this.url.delete, params).then(res => {
          if (res.success) {
            this.$message.success('删除成功');
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