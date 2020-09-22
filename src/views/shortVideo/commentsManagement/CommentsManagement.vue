<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="发布账号">
              <a-input placeholder="发布账号" v-model="queryParam.userAccount"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="状态">
              <a-select v-model="queryParam.status">
                <a-select-option value="">全部</a-select-option>
                <a-select-option :value="1">待审核</a-select-option>
                <a-select-option :value="2">同意发布</a-select-option>
                <a-select-option :value="3">拒绝发布</a-select-option>
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
    <!--<div class="table-operator">-->
      <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>-->
    <!--</div>-->

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
        <span slot="user" slot-scope="text, record">
          {{text.nickname}}
        </span>
        <span slot="mobile" slot-scope="text, record">
          {{record.user.mobile}}
        </span>

        <span slot="action" slot-scope="text, record">
          <!---->
           <a class="view ant-dropdown-link" @click="audit(record.id)" v-if="record.status ==1">审核</a>
           <a class="view ant-dropdown-link" @click="viewClick(record.id)" v-else>查看</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
               <!--<a-menu-item>-->

                 <!--<a @click="handleEdit(record)">编辑</a>-->
               <!--</a-menu-item>-->
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
    <CommentsManagementModal ref="modalForm" @ok="modalFormOk"></CommentsManagementModal>

    <!-- model查看区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" :footer="null" width="48%">
        <a-form :form="viewData">

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="内容">
            {{viewData.content}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="评论层级">
            {{viewData.parentId ? '二级':'一级'}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布人" v-if="viewData.user">
            {{viewData.user.nickname}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布人账号" v-if="viewData.user">
            {{viewData.user.mobile}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布时间">
            {{viewData.createTime}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="审核进度">
            <span v-if="viewData.status == 1">待审核</span>
            <span v-if="viewData.status == 2">同意发布</span>
            <span v-if="viewData.status == 3">拒绝发布</span>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="审核时间">
            {{viewData.updateTime}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="处理人">
            {{viewData.updateBy}}
          </a-form-item>
        </a-form>
      </a-modal>
    </div>

    <!-- 审核 model区 -->
    <div class="opinion-modal">
      <a-modal title="审核" v-model="auditVisible" class="viewModal" :footer="null" width="48%">
        <a-form :form="auditData">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="内容">
            {{auditData.content}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="评论层级">
            {{auditData.parentId ? '二级':'一级'}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布人" v-if="auditData.user">
            <!--{{auditData.user}}-->
            {{auditData.user.nickname}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布人账号"  v-if="auditData.user">
            {{auditData.user.mobile}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发布时间">
            {{auditData.createTime}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="审核进度">
            <span v-if="auditData.status == 1">待审核</span>
            <span v-if="auditData.status == 2">同意发布</span>
            <span v-if="auditData.status == 3">拒绝发布</span>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="审核时间">
            {{auditData.updateTime}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="处理人">
            {{auditData.updateBy}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="">
            <div class="auditDiv">
              <a-button type="danger" ghost @click="handelAudit(3)">拒绝发布</a-button>
              <a-button type="primary" @click="handelAudit(2)">同意发布</a-button>
            </div>
          </a-form-item>

        </a-form>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
  import CommentsManagementModal from './CommentsManagementModal.vue'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, postAction} from '@/api/manage'

  export default {
    name: "CommentsManagement",
    inject:['reload'],
    mixins: [JeecgListMixin],
    components: {
      CommentsManagementModal,
      JDate
    },
    data() {
      return {
        viewVisible: false,
        viewData: {},
        description: '广告管理页面',
        auditVisible: false,
        auditData: {},
        // 表头
        columns: [
          {
            title: '评论',
            align: 'center',
            width :200,
            dataIndex: 'content'
          },
          {
            title: '评论层级',
            align: 'center',
            dataIndex: 'parentId',
            // scopedSlots: {customRender: 'user'}
            customRender: (text, record) => {
              return record.parentId ? '二级':'一级'
            }
          },
          {
            title: '发布人',
            align: 'center',
            dataIndex: 'user',
            scopedSlots: {customRender: 'user'}
            // customRender: (text, record) => {
            //   return record.user
            //
            // }
          },
          {
            title: '发布账号',
            align: 'center',
            scopedSlots: {customRender: 'mobile'}
          },
          {
            title: '发布时间',
            align: 'center',
            dataIndex: 'createTime'
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'status',
            customRender: (text, record) => {
              if (record.status == 1) {
                return '待审核'
              } else if (record.status == 2) {
                return '同意发布'
              } else if (record.status == 3) {
                return '拒绝发布'
              }
              return record.status
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
          list: '/shortvideo/comments/list',
          auth: '/shortvideo/comments/auth',//审核
          delete: '/shortvideo/comments/delete',
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
        const url = '/shortvideo/comments/delete'
        const params = {}
        params.id = id
        return deleteAction(url, params).then(res => {
          if (res.success) {

            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },
      // 查看点击
      viewClick(id) {
        this.viewVisible = true
        let url = '/shortvideo/comments/queryById'
        let params = {
          id: id
        }
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            console.log(res);
            this.viewData = result
          }
        })

      },
      // 点击审核
      async audit(id) {
        this.auditVisible = true;
        let {success, result, message} = await getAction('/shortvideo/comments/queryById', {id});
        if (success) {
          this.auditData = result;
          console.log('审核', this.auditData);
          return false;
        }
        this.$message.error(message)
      },
      /**
       * 审核
       * @param status { number }  [2,3][同意，拒绝]
       */
      async handelAudit(status) {
        let param = {
          id: this.auditData.id,
          status
        }
        let {success, message} = await postAction(this.url.auth, param);
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.error(message)
        }
        this.viewVisible = false;
        this.reload()


      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';

  .auditDiv {
    float: right;
  }

  .auditDiv > button:nth-of-type(1) {
    margin-right: 15px;
  }
</style>