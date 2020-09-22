<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="用户账号">
              <a-input placeholder="请输入用户账号" v-model="queryParam.mobile"></a-input>
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

        <span slot="headImage" slot-scope="text, record">
          <img :src="text" alt="" style="width: 100px">
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="viewClick(record)">查看</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定移除黑名单吗?" @confirm="() => delOrResClick(record.userId)">
                  <a>移除黑名单</a>
                </a-popconfirm>

              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <BlackModal ref="modalForm" @ok="modalFormOk"></BlackModal>

    <!-- model区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" @ok="handleOk" okText="移除黑名单">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">处罚用户：</div>
            <div class="viewDialog-content">{{viewData.nickName}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">备注：</div>
            <div class="viewDialog-content">{{viewData.remark}}</div>
          </div>

        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
  import BlackModal from './BlackModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, postAction, postActionHeader, putAction} from '@/api/manage'
  import {attributeList} from "@/api/api";

  export default {
    name: 'BlackList',
    mixins: [JeecgListMixin],
    inject:['reload'],
    components: {
      BlackModal,
      JDate
    },
    data() {
      return {
        viewData: {},
        feedBackImg: [],
        viewVisible: false,
        description: '广告管理页面',
        details: {
          imgUrl: ''
        },
        // 表头
        columns: [
          {
            title: '昵称',
            align: 'center',
            dataIndex: 'nickName'
          },
          {
            title: '头像',
            align: 'center',
            dataIndex: 'headImage',
            scopedSlots: {customRender: 'headImage'}
          },
          {
            title: '账号',
            align: 'center',
            dataIndex: 'mobile'
          },
          {
            title: '性别',
            align: 'center',
            dataIndex: 'gender'
          },
          {
            title: '拉黑时间',
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
          list: '/user/userBlacklist/list',
          delete: '/ecommerce/mall/attribute/delete',
          deleteBatch: '/system/sysAdvertise/deleteBatch',
          exportXlsUrl: 'system/sysAdvertise/exportXls',
          importExcelUrl: 'system/sysAdvertise/importExcel'
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
    created() {
      this.searchType();
      attributeList({page: 1, limit: 10, name: ''}).then(res => {
        console.log('测试', res);
      })
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
        this.removeBlackListRequest(id)
      },
      // 查看点击
      viewClick(recode) {
        this.viewVisible = true
        this.viewData = recode
      },
      //  关闭查看弹窗 移除黑名单
      handleOk() {
        this.removeBlackListRequest(this.viewData.userId)
      },

      removeBlackListRequest(userId) {
        let url = '/user/userBlacklist/remove';
        let parmas = {userId}
        putAction(url, parmas).then(res => {
          if(res.success){
            this.$message.success(res.message);
            this.$emit('ok')
            this.reload()
          }else {
            this.$message.warning(res.message);
          }
        }).finally(() => {
          this.viewVisible = false;
        })
      },
      frontBeforeUpload: function (file) {
        return false
      },
      //  change
      frontHandleChange(info) {
        // console.log(info)
        this.upload(info, 'img')
      },
      // upload
      upload(info, name) {
        let that = this
        let reader = new FileReader()
        reader.readAsDataURL(info.file)
        reader.onload = function () {
          that.base64Img = reader.result
          that.base64Img = encodeURI(that.base64Img)
          that.axios
            .post('/common/uploadbase64img', {
              folder: 'admin/',
              base64Img: that.base64Img
            })
            .then(res => {
              console.log(res);
              that.details.imgUrl = res.result
            })
            .catch(err => {
              console.log(err)
            })
        }
      },

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  @import './view.scss';
</style>