<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="项目名称">
              <a-input placeholder="请输入项目名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="项目编号">
              <a-input placeholder="请输入项目编号" v-model="queryParam.code"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="筹款进度">
              <a-select v-model="queryParam.status" allowClear placeholder="请选择">
                <a-select-option :value="20">筹款成功</a-select-option>
                <a-select-option :value="10">筹款失败</a-select-option>
                <a-select-option :value="1">筹款中</a-select-option>
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
        <span slot="showStatus" slot-scope="text, record">
         <!--{{text ==1 ?'显示':text ==2 ?'不显示':text}}-->
          <a-switch checkedChildren="上架" unCheckedChildren="下架" @change="changeShowStatus($event,record)"
                    :defaultChecked="text == 1 ? true:text ==2 ? false : true"/>
        </span>
        <span slot="isRecommend" slot-scope="text, record">
          <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeIsRecommend($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>


        <span slot="imageList" slot-scope="text, record">
          <img :src="text[0].path" style="width: 50px;"/>
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看商品</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>

            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
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
    <RaiseProjectModal ref="modalForm" @ok="modalFormOk"></RaiseProjectModal>


  </a-card>
</template>

<script>
  import RaiseProjectModal from './RaiseProjectModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'
  import {filterObj} from "@/utils/util";
  import moment from 'dayjs'

  export default {
    name: "RaiseProject",
    mixins: [JeecgListMixin],
    components: {
      RaiseProjectModal,
      JDate
    },
    data() {
      return {
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '项目编号',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: '项目名称',
            align: 'center',
            width: 300,
            dataIndex: 'name'
          },
          {
            title: '当前资金',
            align: 'center',
            dataIndex: 'currentAmount'
          },
          {
            title: '目标资金',
            align: 'center',
            dataIndex: 'targetAmount'
          },

          {
            title: '筹款日期数',
            align: "center",
            customRender: (text, record) => {
              const time = `${record.beginTime && record.beginTime.length > 11 && record.beginTime.substring(0, 11)}至${record.endTime && record.endTime.length > 11 && record.endTime.substring(0, 11)}`;
              return time;
            },
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sort'
          },
          {
            title: '是否显示',
            align: 'center',
            dataIndex: 'showStatus',
            scopedSlots: {customRender: 'showStatus'}
          },
          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'isRecommend',
            scopedSlots: {customRender: 'isRecommend'}
          },
          {
            title: '筹款进度',
            align: 'center',
            customRender: (text, record) => {
              if (record.status == 1) {
                return '筹款中'
              } else if (record.status == 10) {
                return '筹款失败'
              } else if (record.status == 20) {
                return '筹款成功'
              }
              return record.status
            },
          },
          // {
          //   title: '筹款进度',
          //   align: 'center',
          //   customRender: (text, record) => {
          //     return this.moreTime(record)
          //   },
          // },


          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/ecommerce/mall/ecCrowdfundin/list',
          delete: '/ecommerce/mall/ecCrowdfundin/delete'
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
      handleView(record) {
        console.log(record.code);
        let path = '/raisemanagement/raiselist';
        this.$router.push({path, query: {isView:'view',code: record.code}})
      },

      /**
       *  修改是否显示
       */
      changeShowStatus(e, row) {
        row.showStatus = e ? 1 : 2;
        this.edit(row.id, {showStatus: row.showStatus})
      },
      /**
       *  修改是否推荐
       */
      changeIsRecommend(e, row) {
        row.isRecommend = e ? 1 : 0;
        this.edit(row.id, {isRecommend: row.isRecommend})
      },

      /**
       * 编辑
       * @param id  行数据id
       * @param changeObj 需要修改的对象
       * @returns {Promise<boolean>}
       */
      async edit(id, changeObj) {
        let key = Object.keys(changeObj)[0]
        let infoUrl = '/ecommerce/mall/ecCrowdfundin/detail';
        let {result} = await getAction(infoUrl, {id});
        result[key] = changeObj[key];
        let url = '/ecommerce/mall/ecCrowdfundin/edit';
        let {success, message} = await putAction(url, result);
        if (success) {
          this.$message.success(message);
          return false
        }
        this.$message.error(message);

      },
      //  筹款进度
      moreTime(record) {
        let today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        const amount = record.currentAmount - (record.targetAmount);
        const endTime = record.endTime;
        let timeStamp = Date.parse(endTime) - Date.parse(today)
        if ((timeStamp > 0) && (amount >= 0)) {
          return '筹款成功'
        }
        if (timeStamp < 0) {
          return '筹款失败'
        }
        if ((timeStamp > 0) && (amount < 0)) {
          return '筹款中'
        }

      },
      loadData(arg) {
        if (!this.url.list) {
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records;
            // this.tableData = res.result.records;
            this.ipagination.total = res.result.total;
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
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
        param.pageSize = this.ipagination.pageSize;
        param.page = this.ipagination.current;
        param.limit = this.ipagination.pageSize;
        return filterObj(param);
      },

      // 删除还是恢复
      delOrResClick(id) {
        const params = {}
        params.id = id
        return deleteAction(this.url.delete, params).then(res => {
          if (res.success) {
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
