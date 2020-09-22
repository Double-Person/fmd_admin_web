<template>
  <a-card :bordered="false">
    <div v-if="$route.query.isView=='view'" @click="closeTabs"
         class="close_top-right">
      <a-icon type="close-circle"/>
    </div>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="商品名称">
              <a-input placeholder="请输入商品名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="项目编号">
              <a-input placeholder="请输入项目编号" v-model="queryParam.crowdfundingCode"></a-input>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="是否上架">
                <a-select v-model="queryParam.status" placeholder="请选择">
                  <a-select-option :value="1">上架</a-select-option>
                  <a-select-option :value="2">下架</a-select-option>
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
        <span slot="status" slot-scope="text, record">
         <!--{{text ==1 ?'上架':text ==2 ?'下架':text}}-->

          <a-switch checkedChildren="上架" unCheckedChildren="下架" @change="changeStandUp($event,record)"
                    :defaultChecked="text == 1 ? true:text ==2 ? false : true"/>
        </span>
        <span slot="imageList" slot-scope="text, record" class="show-img-table">
          <img :src="text[0].path"/>
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
    <VideoListModal ref="modalForm" @ok="modalFormOk"></VideoListModal>


  </a-card>
</template>

<script>
  import {filterObj} from '@/utils/util';
  import VideoListModal from './RaiseListModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'
  import PubSub from 'pubsub-js'

  export default {
    name: "VideoList",
    mixins: [JeecgListMixin],
    components: {
      VideoListModal,
      JDate
    },
    data() {
      return {
        description: '广告管理页面',
        columns: [
          {
            title: '商品名称',
            align: 'center',
            width: 300,
            dataIndex: 'name'
          },
          {
            title: '商品编码',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: '项目编号',
            align: 'center',
            dataIndex: 'crowdfundingCode'
          },
          {
            title: '是否上架',
            align: 'center',
            dataIndex: 'status',
            scopedSlots: {customRender: 'status'}
          },
          {
            title: '库存',
            align: 'center',
            dataIndex: 'inventory'
          },
          {
            title: '商品图片',
            align: 'center',
            dataIndex: 'imageList',
            scopedSlots: {customRender: 'imageList'}
          },
          {
            title: '零售价格',
            align: 'center',
            dataIndex: 'price'
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
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/ecommerce/mall/ecCrowdfundingGoods/list',
          delete: '/ecommerce/mall/ecCrowdfundingGoods/delete',
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
      let querys = this.$route.query;//code
      if (querys && querys.isView && querys.isView == 'view') {
        this.loadData()
      }
    },
    watch: {
      $route(to, from) {
        let {code} = this.$route.query;
        if (code) {
          this.loadData({crowdfundingCode: code})
        }
      }
    },
    methods: {

      /** 2020-05-07 14:28:28 by yu
       *@meathod: closeTabs
       *@desc: 通過眾籌項目點擊查看商品跳轉到眾籌商品列表時，右上角的關閉按鈕
       */
        closeTabs(){
        let key = this.$route.path;
        PubSub.publish('closeTabs',key);
        this.$router.push({path:'/raisemanagement/raiseproject'})
      },


      getQueryParams() {
        //获取查询条件
        let sqp = {}
        if (this.superQueryParams) {
          sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        }
        var param = Object.assign(sqp, this.queryParam, this.isorter, this.filters);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        let querys = this.$route.query;//code
        if (querys && querys.isView && querys.isView == 'view') {
          param.crowdfundingCode = querys.code;
        }
        param.pageSize = this.ipagination.pageSize;
        param.page = this.ipagination.current;
        param.limit = this.ipagination.pageSize;
        return filterObj(param);
      },
      //  上下架
      async changeStandUp(e, row) {
        console.log(e, row);
        row.status = e ? 1 : 2;
        let url = '/ecommerce/mall/ecCrowdfundingGoods/edit';
        let {success, message} = await putAction(url, row);
        if (success) {
          this.$message.success(e ? "上架" : "下架" + message);
          return false
        }
        this.$message.error(message)

      },
      // 删除还是恢复
      delOrResClick(id) {
        const url = this.url.delete;
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
<style lang="scss" scoped>
  @import '~@assets/less/common.less';

  .close_top-right {
    display: inline-block;
    width: 45px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    position: absolute;
    right: 15px;
    z-index: 5;
    font-size: 25px;
    i {
      cursor: pointer;
    }
  }
</style>
