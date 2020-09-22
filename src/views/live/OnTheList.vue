<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="房间名称">
              <a-input placeholder="请输入房间名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="主播名称">
              <a-input placeholder="请输入主播名称" v-model="queryParam.userName"></a-input>
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
        <span slot="cover" slot-scope="text, record" class="show-img-table">
          <img :src="text"/>
        </span>
        <span slot="recommend" slot-scope="text, record">

          <a-switch :disabled="record.status == 2" checkedChildren="是" unCheckedChildren="否" @change="changeIsRecommend($event,record)"
                    :defaultChecked="Boolean(text)"/>
        </span>

        <span slot="action" slot-scope="text, record">
           <!--<a class="view ant-dropdown-link" @click="viewClick(record.id)">查看</a>-->
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
    <OnTheListModal ref="modalForm" @ok="modalFormOk"></OnTheListModal>

    <!-- 查看model区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" :footer="null" width="48%">
        <a-form :form="viewData">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
            {{viewData.status==1?'未开始':'直播中'}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="房间名称">
            {{viewData.name}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="封面">
            <img :src="viewData.cover" style="width: 100px;"/>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="主播">
            {{viewData.accountId}}-'主播名称未找到'
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="人气">
            {{viewData.viewCount}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="基础人气">
            {{viewData.basicsViewCount}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="点赞数">
            {{viewData.likeCount}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="关注人数">
            {{viewData.collectCount}}
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="绑定商品">
            {{viewData.name}}-‘未找到’
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
  import OnTheListModal from './OnTheListModal.vue'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, putAction} from '@/api/manage'


  export default {
    name: "OnTheList",
    mixins: [JeecgListMixin],
    components: {
      OnTheListModal,
      JDate
    },
    data() {
      return {
        viewData: {},//查看信息
        feedBackImg: [],
        viewVisible: false,
        description: '直播房间页面',
        // 表头
        columns: [
          {
            title: '房间名称',
            align: 'center',
            width:300,
            dataIndex: 'name'
          },
          {
            title: '封面',
            align: 'center',
            dataIndex: 'cover',//createBy
            scopedSlots: {customRender: 'cover'}
          },
          {
            title: '主播',
            align: 'center',
            dataIndex: 'userName'
          },
          {
            title: '基础人气',
            align: 'center',
            dataIndex: 'basicsViewCount'
          },
          {
            title: '点赞数',
            align: 'center',
            dataIndex: 'likeCount'
          },
          {
            title: '关注人数',
            align: 'center',
            dataIndex: 'collectCount'
          },
          // {
          //   title: '有效性',
          //   align: 'center',
          //   dataIndex: 'delFlag',
          //   customRender(text, record) {
          //     return record.delFlag ? '有效' : '无效'
          //   }
          // },
          {
            title: '是否推荐',
            align: 'center',
            dataIndex: 'recommend',
            scopedSlots: {customRender: 'recommend'}
            // customRender: (text, record) => {
            //   return !!+record.recommend ? '推荐' : '不推荐'
            // }
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'status',
            customRender: (text, record) => {
              return record.status == 1 ? '未开始' : '直播中'
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
          list: '/live/liveRoom/list',
          delete: '/live/liveRoom/delete',
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
        effective: Constant.EFFECTIVE
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },

    methods: {
      async changeIsRecommend(e, row) {
        let url = '/live/liveRoom/edit';
        let queryById = '/live/liveRoom/queryById';

        let {result} = await getAction(queryById, {id: row.id});
        result.recommend = Number(e)
        let {success, message} = await putAction(url, result);
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
            this.searchQuery()
          } else {
            this.$message.error(res.message)
          }
        })
      },
      // 查看点击
      viewClick(id) {
        this.viewVisible = true
        let url = '/live/liveRoom/queryById';
        let liveRoomGoods = '/live/liveRoomGoods/queryById';
        let liveRoomGoodsList = '/live/liveRoomGoods/list';

        let params = {
          id: id
        }
        getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.viewData = result
          }
        })

      },


    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>