<template>
  <a-card :bordered="false">

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
        <span slot="enable" slot-scope="text, record">
          <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeIsRecommend($event,record)"
                    :defaultChecked="Boolean(text)"/>
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
    <returnWhyModal ref="modalForm" @ok="modalFormOk"></returnWhyModal>


  </a-card>
</template>

<script>
  import returnWhyModal from './ReturnWhyModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'


  export default {
    name: "ReturnWhy",
    mixins: [JeecgListMixin],
    components: {
      returnWhyModal,
      JDate
    },
    data() {
      return {
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '原因描述',
            align: 'center',
            dataIndex: 'reason'
          },

          {
            title: '原因类型',
            align: 'center',
            dataIndex: 'type',
            customRender: (text, record) => {
              return text==1 ? '退款' : text==2 ? '退货' : text
            }
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否启用',
            align: 'center',
            dataIndex: 'enable',
            scopedSlots: {customRender: 'enable'}
          },
          {
            title: '添加时间',
            align: 'center',
            dataIndex: 'createTime'
          },





          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/ecommerce/mall/ecRefundReason/list',
          delete: '/ecommerce/mall/ecRefundReason/delete',

        },
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        type: []
      }
    },

    methods: {
      /**
       * 启用开关
       * @param e 开关状态
       * @param row 行数据
       * @returns {Promise<void>}
       */
      async changeIsRecommend(e, row) { //enable
        let url = '/ecommerce/mall/ecRefundReason/edit';
        row.enable = Number(e)
        let {success, message} = await putAction(url, row);
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.warning(message)
        }

      },
      // 删除还是恢复
      delOrResClick(id) {
        const url = this.url.delete
        const params = {}
        params.id = id
        return deleteAction(url, params).then(res => {
          if (res.success) {
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
<style scoped>
  @import '~@assets/less/common.less';
</style>