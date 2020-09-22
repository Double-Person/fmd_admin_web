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
    <div class="table-operator">
      <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>-->
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

        <span slot="headImgUrl" slot-scope="text, record">
          <div style="width: 100px; height: 100px;margin-left: 50%;transform: translateX(-50px)">
            <img :src="text" alt="" style="width: 100%; height: 100%;object-fit: cover;">
          </div>

        </span>
        <span slot="signAllIntegral" slot-scope="text, record" @click="changeIntegral(record)"
              style="cursor: pointer;color: #1890ff;">
          {{text}}
        </span>


        <span slot="action" slot-scope="text, record">
          <a @click="viewClick(record.id)">查看</a>

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
              <a-menu-item v-if="record.userType != 2">
                <a-popconfirm title="确定设为主播吗?" @confirm="() =>setPriority(record.id,2) ">
                  <a>设为主播</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.userType == 2">
                <a-popconfirm title="确定移除主播吗?" @confirm="() =>setPriority(record.id,1) ">
                  <a>移除主播</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item>
                <a @click="addBlackList(record)">加入黑名单</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <UserListModal ref="modalForm" @ok="modalFormOk"></UserListModal>

    <!-- model区 加入黑名单 -->
    <div class="opinion-modal">
      <a-modal title="加入黑名单" v-model="addBlackListVisible" class="viewModal" @ok="addBlackListOk">
        <div class="viewDialog-cont">
          <div class="viewDialog-item">
            <div class="viewDialog-tit">处罚用户：</div>
            <div class="viewDialog-content">{{addBlackListDate.nickname}}</div>
          </div>
          <div class="viewDialog-item">
            <div class="viewDialog-tit">备注：</div>
            <div class="viewDialog-content">

              <a-textarea
                v-model="addBlackListDate.remark"
                placeholder="请输入受理部门意见"
                :autosize="{ minRows: 5, maxRows: 15 }"
              />
            </div>
          </div>

        </div>
      </a-modal>
    </div>


    <!-- model区 修改积分 -->
    <div class="opinion-modal">
      <a-modal title="用户积分" v-model="changeIntegralVisible" class="viewModal" @ok="changeIntegralOk('ruleForm')"
               okText="提交保存">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="类型" prop="action">
            <el-radio-group v-model="ruleForm.action">
              <el-radio label="增加积分"></el-radio>
              <el-radio label="减少积分"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="积分" prop="name">
            <el-input-number v-model.number="ruleForm.name" :min="0"></el-input-number>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input v-model="ruleForm.remark" maxlength="8" show-word-limit placeholder="请输入增加或者减少原因"></el-input>
          </el-form-item>
        </el-form>
      </a-modal>
    </div>

    <!-- model区 查看用户资料 -->
    <div class="opinion-modal">
      <a-modal title="用户积分" v-model="viewVisible" class="viewModal" :footer="null">
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">昵称：</a-col>
            <a-col :span="18">{{viewData.nickname}}</a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">头像：</a-col>

            <a-col :span="18">
              <!--<img :src="viewData.headImgUrl" alt="" style="width: 40%">-->
              <el-image
                style="width: 40%"
                :src="viewData.headImgUrl"
                :preview-src-list="[viewData.headImgUrl]">
              </el-image>

            </a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">账号：</a-col>
            <a-col :span="18">{{viewData.mobile}}</a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">性别：</a-col>
            <a-col :span="18">{{viewData.gender==1?'男':viewData.gender==2?'女':'未知'}}</a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">所在地：</a-col>
            <a-col :span="18">{{viewData.province + viewData.city + viewData.district}}</a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">积分：</a-col>
            <a-col :span="18">{{viewData.signAllIntegral}} 积分</a-col>
          </a-row>
        </div>
        <div style="margin-bottom: 15px">
          <a-row>
            <a-col :span="6">注册时间：</a-col>
            <a-col :span="18">{{viewData.registerTime}}</a-col>
          </a-row>
        </div>


      </a-modal>
    </div>
  </a-card>
</template>

<script>
  import UserListModal from './UserListModal'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import * as Constant from '@/utils/constant'
  import {getAction, deleteAction, postAction, postActionHeader, putAction} from '@/api/manage'
  import {attributeList} from "@/api/api";
  import ACol from "ant-design-vue/es/grid/Col";


  export default {
    name: 'UserList',
    inject: ['reload'],
    mixins: [JeecgListMixin],
    components: {
      ACol,
      UserListModal,
      JDate
    },
    data() {
      return {
        viewData: {},
        feedBackImg: [],
        viewVisible: false,
        addBlackListVisible: false,// 加入黑名单
        addBlackListDate: {
          userId: '',
          nickname: '',
          remark: '',
        },// 加入黑名单
        changeIntegralVisible: false,//修改用户积分
        currentUserId: '',//当前用户id
        ruleForm: {
          name: '',
          action: '',
          remark: ''
        },
        rules: {
          name: [
            {required: true, message: '请输入增加或者减少的积分', trigger: 'blur'},
          ],
          action: [
            {required: true, message: '请输入修改积分类型', trigger: 'change'},
          ],
          remark: [
            {required: true, message: '请输入增加或者减少原因', trigger: 'blur'},
          ]
        },
        description: '广告管理页面',
        // 表头
        columns: [
          {
            title: '昵称',
            align: 'center',
            dataIndex: 'nickname'
          },
          {
            title: '头像',
            align: 'center',
            dataIndex: 'headImgUrl',
            scopedSlots: {customRender: 'headImgUrl'}
          },
          {
            title: '账号',
            align: 'center',
            dataIndex: 'mobile'
          },
          {
            title: '性别',
            align: 'center',
            dataIndex: 'gender',
            customRender: (text, record) => {
              if (text == 1) {
                return '男'
              } else if (text == 2) {
                return '女'
              }
              if (text == 0) {
                return '未知'
              } else {
                return '未知'
              }
            },
          },
          {
            title: '积分',
            align: 'center',
            dataIndex: 'signAllIntegral',
            //  signUsedIntegral
            scopedSlots: {customRender: 'signAllIntegral'}
          },
          {
            title: '是否主播',
            align: 'center',
            // dataIndex: 'subscribe'
            dataIndex: 'userType',
            customRender: (text, record) => {
              return text == 2 ? '主播' : '普通用户'
            },
          },
          {
            title: '注册时间',
            align: 'center',
            dataIndex: 'registerTime'
          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: 'action'}
          }
        ],
        url: {
          list: '/user/list',
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
    },
    methods: {

      /**
       * 修改用户级别（是否是主播）
       * @param id 用户id
       * @param userType 用户类型 {1:普通用户,2:主播}
       */
      async setPriority(id, userType) {
        let {success, message} = await putAction('/user/setUserType', {userId: id, userType});
        if (success) {
          this.$message.success(message);
          this.reload()
          return false;
        }
        this.$message.error(message)
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
      // 加入黑名单
      addBlackList(row) {
        this.addBlackListVisible = true;
        this.addBlackListDate = {
          userId: row.id,
          nickname: row.nickname,
          remark: '',
        }
      },
      addBlackListOk() {
        this.addBlackListVisible = false;
        postAction('/user/userBlacklist/add', this.addBlackListDate).then(res => {
          if (res.success) {
            this.$message.success(res.message);
          } else {
            this.$message.warning(res.message);
          }
        }).finally(() => {
          this.reload()
        })
      },
      // 查看点击
      viewClick(id) {

        this.feedBackImg = []
        this.viewVisible = true
        let url = '/user/info/' + id;
        return getAction(url).then(({result, success}) => {
          if (success) {
            this.viewData = result
          }
        })

      },
      //  关闭查看弹窗
      handleOk() {
        this.viewVisible = false
      },
      // 修改积分
      changeIntegral(record) {
        this.currentUserId = record.id
        this.changeIntegralVisible = true;
      },
      /**
       * 修改用户积分
       * @param formName 表单名
       */
      changeIntegralOk(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let add = '/user/points/plus';
            let sub = '/user/points/sub';
            let parmas = {
              action: this.ruleForm.action == '增加积分' ? 'pointAdd' : 'pointSub',
              points: Math.abs((this.ruleForm.name) * 1),
              userId: this.currentUserId,
              id: this.currentUserId,
              remark:this.ruleForm.remark
            }
            let url = '';
            this.ruleForm.action == '增加积分' ? (url = add) : (url = sub);
            putAction(url, parmas).then(res => {
              if (res.success) {
                this.$message.success(res.message)
              } else {
                this.$message.error(res.message)
              }
            })
            this.changeIntegralVisible = false;
            this.reload();
            this.$refs.ruleForm.resetFields();

          } else {
            console.log('error submit!!');
            return false;
          }
        });

      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  @import './view.scss';
</style>