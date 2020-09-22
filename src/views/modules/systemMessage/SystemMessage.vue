<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="标题">
              <a-input placeholder="标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">

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
    <SystemMessageModal ref="modalForm" @ok="modalFormOk"></SystemMessageModal>


  </a-card>
</template>

<script>
  import SystemMessageModal from './SystemMessageModal.vue'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction} from '@/api/manage'

  export default {
    name: "VideoList",
    mixins: [JeecgListMixin],
    components: {
      SystemMessageModal,
      JDate
    },
    data() {
      return {
        viewVisible: false,
        viewData:{},
        description: '系统消息',
        // 表头
        columns: [

          {
            title: '标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '发布者',
            align: 'center',
            dataIndex: 'createBy',
          //  creator
          },
          {
            title: '最近修改时间',
            align: 'center',
            dataIndex: 'updateTime'
          },

          {
            title: '类型',
            align: 'center',
            dataIndex: 'type',
            customRender: (text, record) => {
              if(record.type == 1){
                return '系统公告'
              }else if(record.type == 2){
                return '服务消息'
              }else if(record.type == 3){
                return '直播消息'
              }else {
                return record.type
              }
            }
          },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/admin/sysMessage/list',
          delete: '/admin/sysMessage/delete',
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        type: [],
      }
    },

    methods: {

      // 删除还是恢复
      delOrResClick(id) {
        const params = {}
        params.id = id
        return deleteAction(this.url.delete, params).then(res => {
          if (res.success) {
            // console.log(res)
            this.$message.success(res.message)
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },

    }
  }
</script>
<style lang="scss" scoped>
  @import '~@assets/less/common.less';

  .view-modal{
    .item{
      margin-bottom: 15px;
      span{
        display: inline-block;
        width: 15%;
        text-align: right;
        &:after{
          content: "：";
        }
      }
    }

    .videos{
      position: relative;
      top: -220px;
    }
  }
</style>