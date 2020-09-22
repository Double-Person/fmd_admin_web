<template>
  <a-card :bordered="false">
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
            <a-form-item label="是否上架">
              <a-select v-model="queryParam.isOnSale" allowClear placeholder="请选择">
                <a-select-option :value="1" >上架</a-select-option>
                <a-select-option :value="0" >下架</a-select-option>
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
        <!--:scroll="{ x: 2450 }"-->
        <!-- 商品名称 -->
        <span slot="name" slot-scope="text, record">{{ text }}</span>
        <!-- 是否上架 -->
        <span slot="isOnSale" slot-scope="text, record">
          <a-switch checkedChildren="上架" unCheckedChildren="下架" @change="changeStandUp($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>

        <span slot="isHot" slot-scope="text, record">
          <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeRecommended($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>

        <!-- 列表图 -->
        <span slot="listPicUrl" slot-scope="text, record">
          <img :src="text" style="width: 50%;"/>
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
    <ProductListModal ref="modalForm" @ok="modalFormOk"></ProductListModal>


  </a-card>
</template>

<script>
  import ProductListModal from './ProductListModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, postAction} from '@/api/manage'


  export default {
    name: "ProductList",
    mixins: [JeecgListMixin],
    components: {
      ProductListModal,
      JDate
    },
    data() {
      return {
        viewData: {},
        feedBackImg: [],
        viewVisible: false,
        description: '积分商品列表',
        // 表头
        columns: [
          {
            title: 'ID',
            align: 'center',
            // width: 100,
            dataIndex: 'id'
          },
          {
            title: '商品名称',
            align: 'center',
            // width: 150,
            dataIndex: 'name',
            scopedSlots: {customRender: 'name'}
          },
          {
            title: '商品编码',
            align: 'center',
            // width: 100,
            dataIndex: 'goodsSn'
          },
          {
            title: '是否上架',
            align: 'center',
            // width: 100,
            dataIndex: 'isOnSale',
            scopedSlots: {customRender: 'isOnSale'}
          },
          {
            title: '库存',
            align: 'center',
            // width: 100,
            dataIndex: 'goodsNumber'
          },
          {
            title: '商品封面',
            align: 'center',
            width: 200,
            dataIndex: 'listPicUrl',//createBy
            scopedSlots: {customRender: 'listPicUrl'}
          },





          {
            title: '是否新商品',
            align: 'center',
            width: 100,
            // dataIndex: 'isNew'
            customRender: (text, record) => {
              return record.isNew ? '是' : '否'
            }
          },
          {
            title: '是否限购',
            align: 'center',
            width: 100,
            // dataIndex: 'isLimited'
            customRender: (text, record) => {
              return record.isLimited +' 积分'
            }
          },


          {
            title: '排序',
            align: 'center',
            // width: 100,
            dataIndex: 'sort'
          },



          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            key: 'operation',
            // fixed: 'right',
            // width: 200,
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/ecommerce/mall/goods/list',//
          delete: '/ecommerce/mall/goods/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        type: [],
        effective: Constant.EFFECTIVE,

        //  SKU配置
        goodsId: '',
        visible: false,
        allSpc: [],
        productEntityList: [] // 商品的所有产品

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
      async ttest() {
        const params = {}
        params.page = '1'
        params.limit = '50'
        let res = await getAction(this.url.list, params)
        console.log('测试数据---', res);
      },
      /**
       * 改变上下架状态
       * @param e  当前event 参数
       * @param row  列数据 object
       */
      async changeStandUp(e, row) {
        let url = '/ecommerce/mall/goods/changeSale';
        let parma = [row.id];
        let res = await postAction(url, parma)
        let responseMsg = e ? '上架成功' : '下架成功'
        if (res.code === 200) {
          this.$message.success(responseMsg)
        }
      },
      /**
       * 是否推荐
       * @param e  当前event 参数
       * @param row  列数据 object
       * @returns {Promise<void>}
       */
      async changeRecommended(e, row) {
        let url = '/ecommerce/mall/goods/update';
        let parma = row;
        parma.isHot = Number(e);
        let {success, message} = await postAction(url, parma)
        if (success) {
          this.$message.success(message)
        }

      },

      // 查询广告类型
      searchType() {
        const url = '/sys/dictItem/list'
        const params = {}
        params.dictId = 'a3d1b1ee6706c63271b5637bea47dd67'
        params.field = 'id,,itemText,itemValue,action'
        params.page = '1'
        params.limit = '50'
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
        const params = [id];
        return postAction(this.url.delete, params).then(res => {
          if (res.success) {
            this.$message.success(res.message)
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },
      //点击SKU配置
      //  关闭查看弹窗
      handleOk() {
        this.viewVisible = false
      },


      // 表单提交
      dataFormSubmit() {
        this.$http({
          url: `/ecommerce/mall/goodssku/saveGoodsProduct`,
          method: 'post',
          data: this.productEntityList
        }).then(res => {
          console.log(res);
          if (res && res.code === 200) {
            this.$message.success('提交成功!')
            this.visible = false
            this.$emit('refreshDataList')
          }
        })
      }

    }
  }
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';

  .el-dialog {
    width: 70%;
    min-width: 920px;
  }

  /deep/ .ant-modal-content {
    position: relative;
    background: skyblue !important;
    z-index: 2300 !important;
  }

  /* 输入框上的标签 */
  .sku-config-lable {
    display: flex;
    text-align: center;
    div {
      width: 20%;
    }
  }

  /* 每排输入框的下边距 */
  /deep/ .ant-form-item {
    margin-bottom: 0px;
  }

  .modal-footer {
    /*width: 100%;*/
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e8e8e8;
    margin-top: 10px;
    padding-top: 15px;
    margin-left: -24px;
    margin-right: -24px;
    .ant-row {
      margin-right: 48px;
    }
    .ant-row:nth-of-type(1) {
      margin-right: 8px;
    }
  }

</style>