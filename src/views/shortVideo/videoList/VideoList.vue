<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="标题">
              <a-input placeholder="标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="类型">
              <a-select v-model="queryParam.videoType">
                <a-select-option :value="1">短视频</a-select-option>
                <a-select-option :value="2">广告</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="是否推荐">
                <a-select v-model="queryParam.recommend">
                  <a-select-option :value="1">是</a-select-option>
                  <a-select-option :value="2">否</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="6" :sm="8">
              <a-form-item label="分类">
                <a-select v-model="queryParam.categoryId">
                  <a-select-option v-for="item in category" :value="item.id" :key="item.id">{{item.name}}
                  </a-select-option>
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
        <span slot="cover" slot-scope="text, record" class="show-img-table">
          <img :src="text"/>
        </span>
        <span slot="recommend" slot-scope="text, record">
          <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeShowStatus($event,record,'recommend')"
                    :defaultChecked="text == 1 ? true:false"/>
        </span>
        <span slot="status" slot-scope="text, record">
         <a-switch checkedChildren="是" unCheckedChildren="否" @change="changeShowStatus($event,record,'status')"
                   :defaultChecked="text == 1 ? true:false"/>
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

    <!-- model查看区 -->
    <div class="opinion-modal">
      <a-modal title="查看" v-model="viewVisible" class="viewModal" :footer="null" width="48%">
        <div class="view-modal">
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>类型</span>
            {{viewData.videoType==1?'短视频':'广告'}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>标题</span>
            {{viewData.title}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>分类</span>
            {{viewData.categoryName}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>视频简介</span>
            {{viewData.introduce}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>视频时长</span>
            {{viewData.duration}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>视频宽度</span>
            {{viewData.w}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>视频高度</span>
            {{viewData.h}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>排序</span>
            {{viewData.sort}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>封面</span>
            <!--<img :src="viewData.cover" style="width: 100px;"/>-->
            <el-image
              style="width: 100px;"
              :src="viewData.cover"
              :preview-src-list="[viewData.cover]">
            </el-image>
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span class="videos">视频</span>
            <video width="320" height="240" ref="video" controls autoplay>
              <source :src="viewData.path" type="video/mp4">
              <object data="movie.mp4" width="320" height="240">
                <embed width="320" height="240" :src="viewData.path">
              </object>
            </video>

          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>播放量</span>
            {{viewData.viewCount}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>点赞数</span>
            {{viewData.likeCount}}
          </div>
          <!--<div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">-->
            <!--<span>是否推荐</span>-->
            <!--{{viewData.recommend==1?'推荐':'不推荐'}}-->
          <!--</div>-->
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>是否显示</span>
            {{viewData.status==1?'显示':'不显示'}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>创建人</span>
            {{viewData.createBy}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>创建时间</span>
            {{viewData.createTime}}
          </div>
          <div class="item" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span>最近修改时间</span>
            {{viewData.updateTime}}
          </div>
        </div>
      </a-modal>
    </div>

  </a-card>
</template>

<script>
  import VideoListModal from './VideoListModal.vue'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {getAction, deleteAction, putAction} from '@/api/manage'

  export default {
    name: "VideoList",
    mixins: [JeecgListMixin],
    components: {
      VideoListModal,
      JDate
    },
    data() {
      return {
        category: [],//分类
        viewVisible: false,
        viewData: {},
        description: '视频列表页面',
        // 表头
        columns: [
          {
            title: '封面',
            align: 'center',
            dataIndex: 'cover',
            scopedSlots: {customRender: 'cover'}
          },
          {
            title: '标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '类型',
            align: 'center',
            dataIndex: 'videoType',
            customRender: (text, record) => {
              if (record.videoType == 1) {
                return '短视频'
              } else if (record.videoType == 2) {
                return '广告'
              } else {
                return record.videoType
              }
            }
          },
          {
            title: '分类',
            align: 'center',
            dataIndex: 'categoryName'
          },

          // {
          //   title: '是否推荐',
          //   align: 'center',
          //   dataIndex: 'recommend',
          //   scopedSlots: {customRender: 'recommend'}
          // },

          {
            title: '是否显示',
            align: 'center',
            dataIndex: 'status',
            scopedSlots: {customRender: 'status'}
          },
          {
            title: '置顶',
            align: 'center',
            dataIndex: 'sort',
            customRender: (text, record) => {
              return (record.sort > 0 ? '是' : '否')
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
          list: '/shortvideo/list',
          category: '/shortvideo/category/list',
          delete: '/shortvideo/delete',
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
      getAction(this.url.category).then(({result, success}) => {
        if (success) {
          this.category = result.records
        }
      })
    },
    methods: {
      /**
       * 表格顯示、推薦按鈕
       * @param e 當前按鈕狀態
       * @param row 行數據
       * @param type 類型：{recommend：推薦，status：顯示}
       * @returns {Promise<void>}
       */
      async changeShowStatus(e, row, type) {
        if (type === 'recommend') {
          row.recommend = (e ? 1 : 2);
        } else if (type === 'status') {
          row.status = (e ? 1 : 2);
        }
        let url = '/shortvideo/edit';
        let {success, message} = await putAction(url, row);
        if (success) {
          this.$message.success(message)
        } else {
          this.$message.error(message)
        }


      },

      // 删除还是恢复
      delOrResClick(id) {
        const url = '/shortvideo/delete'
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

      // 查看点击
      viewClick(id) {
        this.viewVisible = true
        let url = '/shortvideo/queryById'
        let params = {
          id: id
        }
        return getAction(url, params).then(res => {
          if (res.success) {
            let result = res.result
            this.viewData = result;
            //  解决video的src不能播放
            this.$nextTick(() => {
              this.$refs.video.src = result.path
            })
          }
        })

      },
    }
  }
</script>
<style lang="scss" scoped>
  @import '~@assets/less/common.less';

  .view-modal {
    .item {
      margin-bottom: 15px;
      span {
        display: inline-block;
        width: 15%;
        text-align: right;
        &:after {
          content: "：";
        }
      }
    }

    .videos {
      position: relative;
      top: -220px;
    }
  }
</style>