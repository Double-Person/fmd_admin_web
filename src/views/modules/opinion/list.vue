<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="反馈编号">
              <a-input placeholder="请输入反馈编号" v-model="queryParam.id"></a-input>
            </a-form-item>
          </a-col>
          <!--<a-col :md="6" :sm="8">-->
            <!--<a-form-item label="反馈人账号">-->
              <!--<a-input placeholder="请输入反馈人账号" v-model="queryParam.computedParames"></a-input>-->
            <!--</a-form-item>-->
          <!--</a-col>-->
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="处理状态">
                <a-select v-model="queryParam.status" allowClear placeholder="请选择">
                  <a-select-option value>全部</a-select-option>
                  <a-select-option value="0">待处理</a-select-option>
                  <a-select-option value="1">已处理</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="反馈时间">
                <j-date
                  v-model="queryParam.createTime"
                  :showTime="false"
                  style="width:45%"
                  placeholder="请选择开始时间"
                ></j-date>
                <span style="width: 10px;">~</span>
                <j-date
                  v-model="queryParam.updateTime"
                  :showTime="false"
                  style="width:45%"
                  placeholder="请选择结束时间"
                ></j-date>
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
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
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
          <a @click="viewClick(record.id)">查看</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.status===0">
                <a @click="() => dealClick(record.id)">处理</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <span>删除</span>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- model区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" :footer="null">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">反馈人：</div>
            <div class="viewDialog-content" v-if="viewData.user && viewData.user.nickname">{{viewData.user.nickname}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">反馈时间：</div>
            <div class="viewDialog-content">{{viewData.createTime}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">反馈内容：</div>
            <div class="viewDialog-content">{{viewData.content || '无'}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">图片：</div>
            <div class="viewDialog-content" v-if="feedBackImg && feedBackImg.length<1">{{'无'}}</div>
            <div class="viewDialog-content viewDialog-img" v-else>
              <ul>
                <li class="img-item" v-for="(item, index) in feedBackImg" :key="index">
                  <!--<img :src="item" :preview="[item]" />-->
                  <el-image
                    :src="item"
                    :preview-src-list="feedBackImg">
                  </el-image>
                </li>
              </ul>
            </div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">处理结果：</div>
            <div class="viewDialog-content">{{viewData.solveContent?viewData.solveContent:'待处理'}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">处理时间：</div>
            <div class="viewDialog-content">{{viewData.solveTime||'无'}}</div>
          </div>

          <div class="viewDialog-item">
            <div class="viewDialog-tit">处理人：</div>
            <div class="viewDialog-content">{{viewData.username}}</div>
          </div>
        </div>
      </a-modal>
      <a-modal title="处理" v-model="dealVisible" @ok="dealOk" class="viewModal">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">处理结果：</div>
            <div class="viewDialog-content">
              <a-textarea
                v-model="solveInput"
                placeholder="请输入处理结果"
                :autosize="{ minRows: 4, maxRows: 8 }"
              />
            </div>
          </div>
        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterObj } from '@/utils/util';
import JDate from '@/components/jeecg/JDate'
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'SysArticleList',
  mixins: [JeecgListMixin],
  components: {
    JDate
  },
  data() {
    return {
      description: '意见反馈页',
      // 表头
      columns: [
        {
          title: '反馈编号',
          align: 'center',
          dataIndex: 'id'
        },
        {
          title: '反馈内容',
          align: 'center',
          dataIndex: 'content'
        },
        {
          title: '反馈人账号',
          align: 'center',
          customRender: (text, record) => {
            if(record.user){
              return record.user.mobile
            }
          }
        },

        {
          title: '反馈人',
          align: 'center',
          customRender: (text, record) => {
            if(record.user){
              return record.user.nickname
            }
          }
        },
        {
          title: '反馈时间',
          align: 'center',
          dataIndex: 'createTime'
        },
        {
          title: '反馈状态',
          align: 'center',
          // dataIndex: 'status'
          customRender: (text, record) => {
            return String(record.status) === '1' ? '已处理' : '待处理'
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/system/sysFeedback/list',
        delete: '/system/sysFeedback/delete',
        deleteBatch: '/system/sysArticle/deleteBatch',
        exportXlsUrl: 'system/sysArticle/exportXls',
        importExcelUrl: 'system/sysArticle/importExcel'
      },
      viewVisible: false,
      dealVisible: false,
      viewData: {},
      feedBackImg: [],
      solveInput: '',
      dealId: ''
    }
  },
  methods: {

    // 查看点击
    viewClick(id) {
      this.feedBackImg = [];
      let url = '/system/sysFeedback/queryById';
      let params = {
        id: id
      }
      return getAction(url, params).then(res => {
        if (res.success) {
          let result = res.result
          this.viewData = result
          this.viewVisible = true
          this.feedBackImg = JSON.parse(result.img)
        }
      })
    },
    // 处理点击
    dealClick(id) {
      this.dealVisible = true
      this.dealId = id
    },
    // 处理ok
    dealOk() {
      if (!this.solveInput) {
        this.$message.warning('请输入处理结果');
        return false;
      }
      let url = '/system/sysFeedback/solve'
      let data = this.$qs.stringify({
        id: this.dealId,
        content: this.solveInput
      })
      return postAction(url, data).then(res => {
        if (res.success) {
          this.$message.success(res.message)
          this.dealVisible = false
          this.solveInput = ''
          this.searchQuery()
        }else {
          this.$message.warning(res.message)
        }
      })
    },


    searchQuery() {
      this.loadData(1);
    },
    getQueryParams() {
      //获取查询条件
      let sqp = {}
      if(this.superQueryParams){
        sqp['superQueryParams']=encodeURI(this.superQueryParams)
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
      param.field = this.getQueryField();
      param.pageNo = this.ipagination.current;

      param.pageSize = this.ipagination.pageSize;
      param.page = this.ipagination.current;
      param.limit = this.ipagination.pageSize;
      // if(param.computedParames){
      //   let user = {
      //     mobile:param.computedParames
      //   };
      //   param.user = user;
      // }

      // param.user.mobile  computedParames
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
      if(!this.url.list){
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
        if(res.code===510){
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
@import './_list.scss';

 /dppp/ .el-input__inner{
    height: 34px;
  }
</style>