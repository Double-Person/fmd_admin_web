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
              <!--<a-input placeholder="请输入商品编码" v-model="queryParam.goodsSn"></a-input>-->
              <a-select v-model="queryParam.isOnSale" allowClear placeholder="请选择">
                <a-select-option :value="1">上架</a-select-option>
                <a-select-option :value="0">下架</a-select-option>
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


        <!-- 列表图 -->
        <span slot="listPicUrl" slot-scope="text, record" class="show-img-table">
          <img :src="text" alt="商品图片"/>
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
                <!--<a class="view ant-dropdown-link" @click="SKUConfiguration(record.id)">SKU配置</a>-->

              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <GoodsListModal ref="modalForm" @ok="modalFormOk"></GoodsListModal>

    <!-- model区 -->

    <el-dialog
      title="SKU配置"
      :close-on-click-modal="false"
      :visible.sync="visible">
      <table class="table table-hover" cellspacing="10" cellpadding="10">
        <tbody>
        <tr v-for="(productEntity,productIndex) in productEntityList">
          <th v-for="(item,index) in allSpc">
            <div v-for="(kv,indexKv) in productEntity.keyValue">
              <template v-if="kv.key==item">
                {{item}}
                <el-input v-model="kv.value" :placeholder="item"/>
              </template>
              <template v-if="kv.key=='' && indexKv ==0">
                {{item}}
                <el-input v-model="kv.value" :placeholder="item"/>
              </template>
            </div>
          </th>
          <th>
            序列号：
            <el-input v-model="productEntity.goodsSn" placeholder="商品序列号"/>
          </th>
          <th>
            库存：
            <el-input v-model="productEntity.goodsNumber" placeholder="商品库存"/>
          </th>
          <th>
            零售价格：
            <el-input v-model="productEntity.retailPrice" placeholder="零售价格"/>
          </th>
          <th>
            市场价格：
            <el-input v-model="productEntity.marketPrice" placeholder="市场价格"/>
          </th>
          <th>
            <el-button type="warning" icon="el-icon-plus" v-if="productIndex == 0"
                       @click="addAttrRow"
                       circle></el-button>
          </th>
          <th>
            <el-button type="danger" icon="el-icon-delete" @click="delAttrRow(productIndex)"
                       circle></el-button>
          </th>
        </tr>
        </tbody>
      </table>
      <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
    </el-dialog>

  </a-card>
</template>

<script>
  import GoodsListModal from './GoodsListModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, postAction} from '@/api/manage'


  export default {
    name: "GoodsList",
    mixins: [JeecgListMixin],
    components: {
      GoodsListModal,
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
            title: '商品名称',
            align: 'center',
            dataIndex: 'name',
            scopedSlots: {customRender: 'name'}
          },
          {
            title: '商品编码',
            align: 'center',
            dataIndex: 'goodsSn'
          },

          {
            title: '是否上架',
            align: 'center',
            dataIndex: 'isOnSale',
            scopedSlots: {customRender: 'isOnSale'}
          },
          {
            title: '商品库存',
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
            title: '兑换积分',
            align: 'center',
            dataIndex: 'categoryName',
            customRender: (text, record) => {
              return record.needPoints +' 积分'
            }
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
            key: 'operation',

            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/pointmall/mall/goods/list',//
          delete: '/pointmall/mall/goods/delete',
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

    },
    methods: {
      async getDataList(data) {
        let res = await getAction('/pointmall/mall/category/queryAll', data);
        let tempData = [];
        if (res.code && (res.code == 200 || res.code == 0)) {

          tempData = this.treeDataTranslate(res.result.records, 'id', 'parentId', 'childrens');
          tempData.forEach(item => {
            item.children = item.childrens || [];
            item.children.forEach(ite => {
              ite.children = ite.childrens
            })
          })

        }
      },

      /**
       * 改变上下架状态
       * @param e  当前event 参数
       * @param row  列数据 object
       */
      async changeStandUp(e, row) {
        let url = '/pointmall/mall/goods/changeSale';
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
       let info = '/pointmall/mall/goods/info/' + row.id;
        let goodsInfo = await getAction(info);

        let url = '/pointmall/mall/goods/update';
        let parma = goodsInfo.result;
        parma.isHot = Number(e);
        let {success, message} = await postAction(url, parma)
        if (success) {
          this.$message.success(message)
        }

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
      SKUConfiguration(id) {
        this.feedBackImg = []
        this.viewVisible = true
        // this.initSKU(id)
        this.init(id)
      },
      //  关闭查看弹窗
      handleOk() {
        this.viewVisible = false
      },

      //  SKU配置

      //  初始化sku数据

      async init(id) {
        let that = this;
        this.goodsId = id
        this.productEntityList = [{
          keyValue: [{key: '', value: ''}],
          goodsSn: '',
          goodsId: id,
          goodsNumber: '',
          retailPrice: '',
          marketPrice: ''
        }]
        this.allSpc = []
        this.visible = true
        this.$nextTick(async () => {

          let url = '/pointmall/mall/specification/queryAll';
          let params = {goodsId: this.goodsId}
          let res = await getAction(url, params)
          if (res && res.code === 200) {
            for (let i = 0; i < res.result.records.length; i++) {
              let name = res.result.records[i].name
              this.allSpc.push(name)
            }
          }
          let url1 = '/pointmall/mall/goodssku/queryByGoodsId/' + this.goodsId;
          let res1 = await getAction(url1)

          if (res1 && res1.code === 200) {
            let keyValue = []
            for (let i = 0; i < this.allSpc.length; i++) {
              keyValue.push({key: this.allSpc[i], value: ''})
            }

            that.productEntityList = res1.result.records

            if (that.productEntityList.length === 0) {
              that.productEntityList = [{
                keyValue: keyValue,
                goodsSn: '',
                goodsId: this.goodsId,
                goodsNumber: '',
                retailPrice: '',
                marketPrice: ''
              }]
            }
            for (let i = 0; i < that.productEntityList.length; i++) {
              if (that.productEntityList[i].keyValue.length === 0) {
                that.productEntityList[i].keyValue = keyValue
              } else if (that.productEntityList[i].keyValue.length !== keyValue.length) {
                // 原来一个规格，然后又新增一个规格，原来的值都置空
                that.productEntityList[i].keyValue = keyValue
              }
            }
          }

        })
      },
      delAttrRow(index) {
        // 最后一行时禁止删除
        let that = this;
        if (this.productEntityList.length === 1) {
          return
        }

        this.$confirm({
          title: '确认删除这条数据吗？',
          content: '',
          zIndex: 2300,
          okText: '删除',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            that.productEntityList.splice(index, 1)
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      },
      addAttrRow() {
        let keyValue = []
        for (let i = 0; i < this.allSpc.length; i++) {
          keyValue.push({key: this.allSpc[i], value: ''})
        }
        this.productEntityList.push({
          keyValue: keyValue,
          goodsSn: '',
          goodsId: this.goodsId,
          goodsNumber: '',
          retailPrice: '',
          marketPrice: ''
        })
      },
      // 表单提交
      dataFormSubmit() {
        this.$http({
          url: `/pointmall/mall/goodssku/saveGoodsProduct`,
          method: 'post',
          data: this.productEntityList
        }).then(res => {
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