<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="类型">
              <!--<a-select v-model="queryParam.typeCode" allowClear placeholder="请选择">-->
              <!--<a-select-option-->
              <!--v-for="(item, index) in type"-->
              <!--:value="item.value"-->
              <!--:key="index"-->
              <!--&gt;{{item.label}}-</a-select-option>-->
              <!--</a-select>-->

              <j-dict-select-tag v-model="queryParam.typeCode" placeholder="请选择"
                                 dictCode="advertise"/>
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
        <span slot="img" slot-scope="text, record" class="show-img-table">
          <img :src="text" alt="">
        </span>

        <span slot="status" slot-scope="text, record">
         <a-switch checkedChildren="是" unCheckedChildren="否"
                   @change="changeShowStatus($event,record)"
                   :key="Math.random()"
                   :defaultChecked="(record.delFlag === false) && (record.status === 1)"/>
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
                <a-popconfirm
                  title="确定删除吗?"
                  @confirm="() => delOrResClick(record)"
                  v-if="!record.delFlag">
                  <a>删除</a>
                </a-popconfirm>
                <a-popconfirm
                  title="确定恢复吗?"
                  @confirm="() => delOrResClick(record)"
                  v-if="record.delFlag">
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
    <sysAdvertise-modal ref="modalForm" @ok="modalFormOk"></sysAdvertise-modal>
  </a-card>
</template>

<script>
  import {initDictOptions, filterDictTextCopy} from '@/components/dict/JDictSelectUtil'
  import SysAdvertiseModal from './SysAdvertiseModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {filterObj} from '@/utils/util';
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'

  export default {
    name: 'SysAdvertiseList',
    inject: ['reload'],
    mixins: [JeecgListMixin],
    components: {
      SysAdvertiseModal,
      JDate
    },
    data() {
      return {
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '轮播图',
            align: 'center',
            dataIndex: 'img',
            scopedSlots: {customRender: 'img'}
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'typeCode',
            customRender: (text, record, index) => {
              //字典值替换通用方法
              return filterDictTextCopy(this.advertise, text);
            },
          },
          {
            title: '结束时间',
            align: 'center',
            dataIndex: 'endTime'
          },
          {
            title: '有效性',
            align: 'center',
            dataIndex: 'status',
            scopedSlots: {customRender: 'status'},
            // customRender: (text, record) => {
            //   if ((record.delFlag === false) && (record.status === 1)) {
            //     return '有效'
            //   } else {
            //     return '无效'
            //   }
            //   return record.moduleCode + '--' + record.status + '-delFlag-' + record.delFlag
            // }
          },
          {
            title: '排序',
            align: 'center',
            dataIndex: 'sortNum'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/system/sysAdvertise/list',// 广告-分页列表查询
          // list: '/system/sysAdvertise/active_list', //广告-分页列表前端查询
          delete: '/system/sysAdvertise/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
        },
        type: [
          {label: '商品', value: 1},
          {label: '众筹', value: 2},
          {label: '直播', value: 3},
          {label: '短视频', value: 4},
          {label: '其他', value: 5}
        ],
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    created() {
      // this.searchType()
      this.initDictConfig();

    },
    methods: {
      initDictConfig() {
        //初始化字典 - 性别
        initDictOptions('advertise').then((res) => {
          if (res.success) {
            this.advertise = res.result;
          }
        });
      },
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
            this.type = result.records
          }
        })
      },
      // 删除还是恢复
      delOrResClick(record) {
        const params = {};
        params.id = record.id;
        return deleteAction(this.url.delete, params).then(res => {
          if (res.success) {
            this.$message.success('恢复成功')
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
        return false;
        // 無效  status == 0  delFlag == true
        //  當前為有效狀態，將是否有效狀態 status 改為0，然後刪除數據（ delFlag == true）
        if (!record.delFlag) {
          this.changeIsEffective(record).then(res => {
            if (res.success) {
              return deleteAction(this.url.delete, params).then(res => {
                if (res.success) {
                  this.$message.success(res.message)
                  this.searchQuery()
                } else {
                  this.$message.error(res.message)
                }
              })
            } else {
              this.$message.error(res.message)
            }

          })

        } else {  //當前無效狀態，恢複數據（delFlag == false）
          return deleteAction(this.url.delete, params).then(res => {
            if (res.success) {
              this.$message.success('恢复成功')
              this.searchQuery()
            } else {
              this.$message.error(res.message)
            }
          })
        }

        // this.reload()

        this.loadData()

      },

      /**
       * 改變状态，将是否有效性进行更改：status
       * @param bool
       */
      async changeIsEffective(record) {//put
        let edit = '/system/sysAdvertise/edit';
        record.status = 0; //無效
        let state = await putAction(edit, record);
        return state
      },
      async changeShowStatus(e, record) {
        record.delFlag = !e;
        record.status = (record.delFlag ? 0 : 1);
        let edit = '/system/sysAdvertise/edit';
        let {success, message} = await putAction(edit, record);
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.error(message)
        }
      },

      searchQuery() {
        this.loadData(1);
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
      getQueryField() {
        //TODO 字段权限控制
        var str = "id,";
        this.columns.forEach(function (value) {
          str += "," + value.dataIndex;
        });
        return str;
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
            let nowDate = new Date()
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
            // 數據過濾處理，當 當前時間大於結束時間時候自動關閉
            this.dataSource.forEach(item => {
              if(new Date(item.endTime) < nowDate){
                item.status = 0;
              }
            })

          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
      },

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>