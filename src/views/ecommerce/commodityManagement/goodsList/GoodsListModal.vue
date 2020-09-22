<template>
  <a-modal
    :title="title"
    width="80%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-tabs defaultActiveKey="1" tabPosition="left">
          <a-tab-pane tab="通用信息" key="1">

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品名称">
              <a-input placeholder="请输入商品名称" v-decorator="['name',{ rules: [{ required: true, message: '请输入项目名称'}]},]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品编码">
              <a-input placeholder="请输入商品编码"
                       v-decorator="['goodsSn',{ rules: [{ required: true, message: '请输入商品编码'}]},]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品分类" class="isRequired">
              <el-cascader
                v-model="categoryArr"
                :options="categoryOptions"
                class="sortWidth"
                @change="handleChange"></el-cascader>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="零售价格">
              <a-input-number
                class="sortWidth"
                v-decorator="[ 'retailPrice',{ rules: [{ validator: checkPrice },{ required: true, message: '请输入筹款资金'}]}]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商品库存">
              <a-input-number
                class="sortWidth"
                v-decorator="[ 'goodsNumber',{ rules: [{ validator: checkPrice },{ required: true, message: '请输入商品库存'}]}]"/>
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
              <a-input-number class="sortWidth"
                              v-decorator="[ 'sort',{ rules: [{ required: true, message: '请输入序号'}]}]"/>
            </a-form-item>

          </a-tab-pane>
          <a-tab-pane tab="商品属性" key="2">
            <a-form-item
              label="属性"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              class="isRequired"
            >
              <!--修改商品属性  2.拼单  3.砍价  1.普通-->
              <el-radio-group v-model="model.type">
                <el-radio :label="2">拼单商品</el-radio>
                <el-radio :label="3">砍价商品</el-radio>
                <el-radio :label="1">普通商品</el-radio>
              </el-radio-group>

            </a-form-item>

            <!-- 拼单区 model.type 2-->
            <a-row v-if="model.type==2">
              <a-col :span="8">
                <a-form-item label="拼单人数" style="display: flex" :label-col="{ span: 15 }" class="isRequired">
                  <el-input type="text" v-model="commodityAttribute.singleNumber" min="0"/>
                </a-form-item>
              </a-col>
              <a-col :span="8" :offset="1" :label-col="{ span: 8 }">
                <a-form-item label="拼单价格" style="display: flex" min="0" :label-col="{ span: 8 }" class="isRequired">
                  <el-input type="text" v-model="commodityAttribute.singlePrice"/>
                </a-form-item>
              </a-col>
            </a-row>

            <!--砍价区-->
            <a-row v-if="model.type==3">
              <a-col :span="8">
                <a-form-item label="目标价" :label-col="{ span: 15 }" style="display: flex" class="isRequired">
                  <el-input type="text" v-model="commodityAttribute.targetPrice" min="0"/>
                </a-form-item>
              </a-col>
              <a-col :span="8" :offset="1">
                <a-form-item label="底价" style="display: flex" :label-col="{ span: 8 }" class="isRequired">
                  <el-input type="text" v-model="commodityAttribute.floorPrice" min="0"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="model.type==3">
              <a-col :span="8">
                <a-form-item label="最多可砍刀数:" style="display: flex" :label-col="{ span: 15 }" class="isRequired">
                  <el-input type="text" v-model="commodityAttribute.maxCutNumber" min="0"/>
                </a-form-item>
              </a-col>
            </a-row>

          </a-tab-pane>
          <a-tab-pane tab="商品封面" key="3">
            <div class="coverPhotoAndVideo">
              <a-form-item label="封面图片" class="isRequired">
                <ul class="coverPhoto">
                  <li v-for="(item, index) in productCovers.covers">
                    <!--<img :src="item.url"/>-->
                    <el-image
                      style="width: 200px; height: 125px"
                      :src="item.url"
                      :preview-src-list="previewList">
                    </el-image>
                    <div>
                      <div :class="{activeClick:index}" @click="setMainFigure(index)">{{index==0?'商品主图':'设为主图'}}</div>
                      <div class="activeClick" @click="deleteCover(index)">删除图片</div>
                    </div>
                  </li>
                </ul>
                <a-upload
                  listType="picture-card"
                  class="avatar-uploader"
                  :showUploadList="false"
                  accept=".jpg, .jpeg, .png"
                  :beforeUpload="frontBeforeUpload"
                  @change="frontHandleChange"
                >
                  <div>
                    <a-icon :type="uploadLoading ? 'loading' : 'plus'"/>
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
              </a-form-item>

              <a-form-item label="封面视频">
                <ul class="coverVideo">
                  <li v-for="(item, index) in productCovers.videos">
                    <video width="200" controls loop style="margin-right: 15px">
                      <source :src="item.url" type="video/mp4">
                      您的浏览器不支持 HTML5 video 标签。
                    </video>
                    <span @click="deleteVideo(index)">删除视频</span>
                  </li>
                </ul>
                <a-upload
                  listType="picture-card"
                  class="avatar-uploader"
                  :showUploadList="false"
                  accept=".mp4"
                  :beforeUpload="frontBeforeUploadVideo"
                  @change="frontHandleChangeVideo"
                >
                  <div>
                    <a-icon :type="uploadLoadingVideo ? 'loading' : 'plus'"/>
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
              </a-form-item>
            </div>
          </a-tab-pane>
          <a-tab-pane tab="详细描述" key="4">
            <a-form-item
              label="内容"
              :labelCol="{lg: {span: 2}, sm: {span: 20}}"
              :wrapperCol="{lg: {span: 20}, sm: {span: 20} }"
            >
              <vue-ueditor-wrap v-model="details.content" :config="myConfig" :destroy="true"/>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>


      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import VueUeditorWrap from 'vue-ueditor-wrap'
  import moment from 'moment'
  import JDate from '@/components/jeecg/JDate'
  import pick from 'lodash.pick'
  import {getAction, httpAction} from '@/api/manage'

  export default {
    inject: ['reload'],
    name: 'GoodsListModal',
    data() {
      return {
        previewList:[],// 预览图片
        //  通用信息
        categoryArr: [],//商品分类默认值
        categoryOptions: [],//商品分类数据源

        //弹窗 商品属性
        commodityAttribute: {
          singleNumber: null,// 拼单人数
          singlePrice: null,// 拼单价格
          targetPrice: null,// 目标价
          floorPrice: null,// 底价
          maxCutNumber: null,// 最多可砍刀数
        },

        //  商品封面
        productCovers: {
          covers: [],
          videos: []
        },


        title: '操作',
        visible: false,
        model: {},
        uploadLoading: false,
        uploadLoadingVideo: false,
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          typeCode: {rules: [{required: true, message: '请选择广告类型'}]},
          title: {rules: [{required: true, message: '请输入标题'}]},
        },
        url: {
          add: '/ecommerce/mall/goods/save',
          edit: '/ecommerce/mall/goods/update',
          info: '/ecommerce/mall/goods/info/',
          categoryInfo: '/ecommerce/mall/category/queryAll',//弹窗中的商品分类
        },
        details: {
          imgUrl: '',
          content: ''
        },
        myConfig: {
          // 编辑器不自动被内容撑高
          autoHeightEnabled: false,
          // 初始容器高度
          initialFrameHeight: 240,
          // 初始容器宽度
          initialFrameWidth: '100%',
          serverUrl: process.env.VUE_APP_BASE_API + '/system/ueditor/action'
        },

      }
    },

    components: {
      VueUeditorWrap,
      JDate
    },
    methods: {

      /**
       * 检查价格
       * @param rule
       * @param value
       * @param callback
       */
      checkPrice(rule, value, callback) {
        if (value >= 0) {
          callback();
          return;
        }
        callback('价格必须大于0!');
      },
      checkInventory(rule, value, callback) {
        if (value >= 0) {
          callback();
          return;
        }
        callback('库存必须大于0!');
      },
      changeStatus(val) {
        this.model.showStatus = val
      },
      //商品分类下拉框
      handleChange(value) {
        this.categoryArr = value;
      },
      /**
       * 查找元素位置坐标
       */
      findIndexArr() {
        let resIndex = -1, lineIndex = -1;
        if (this.model.categoryId == null) {
          return '无分类'
        }
        for (let i = 0; i < this.categoryOptions.length; i++) {
          // let checkOut = this.categoryOptions[i].childrens.some(val => val.id == this.model.categoryId)
          let checkOut = false;
          if (this.categoryOptions[i].childrens) {
            checkOut = this.categoryOptions[i].childrens.some(val => val.id == this.model.categoryId)
          }
          if (checkOut) {
            resIndex = i
          }
        }
        if (resIndex != -1) {
          lineIndex = this.categoryOptions[resIndex].childrens.findIndex(val => val.id == this.model.categoryId)
        }
        return ({x: resIndex, y: lineIndex})
      },
      /**
       * 获取弹窗中商品分类下拉框的值
       * @returns {Promise<void>}
       */
      async getCategoryInfo() {
        let {result, success} = await getAction(this.url.categoryInfo);
        let tempData = [];
        if (success) {
          tempData = await this.treeDataTranslate(result.records, 'id', 'parentId', 'childrens');
          await tempData.forEach(item => {
            item.children = (item.childrens ? item.childrens : item.children)
            item.value = item.id
            item.label = item.name;
            if (item.children) {
              item.children.forEach(ite => {
                ite.children = (ite.childrens ? ite.childrens : ite.children)
                ite.value = ite.id
                ite.label = ite.name
                if (ite.children) {
                  ite.children.forEach(ite1 => {
                    ite1.children = (ite1.childrens ? ite1.childrens : ite1.children)
                    ite1.value = ite1.id
                    ite1.label = ite1.name
                  })
                }

              })
            }

          })
          this.categoryOptions = tempData;
        }
      },

      add() {
        this.edit({})
      },
      async edit(record) {
        await this.form.resetFields();
        this.model = {};
        await this.getCategoryInfo();
        if (record.id) {
          //获取商品信息
          let {success, message, result} = await getAction(this.url.info + record.id);
          this.model = Object.assign({}, result);
          this.details.content = result.goodsDesc || '';
          //查找商品分类位置
          let position = this.findIndexArr();
          console.log('位置', position);
          if (position != '无分类' && position.x > -1 && position.y > -1) {
            this.categoryArr = [];
            let one = this.categoryOptions[position.x].value;
            let two = this.categoryOptions[position.x].childrens[position.y].value;
            this.categoryArr = [one, two]
          }
          // 商品属性
          this.productAttribute();
          // 商品封面
          this.productsCover();
          // productCovers.covers
          // productCovers.videos

        }
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'name', 'goodsSn', 'retailPrice', 'goodsNumber', 'currentAmount', 'introduce', 'sort')
          )
          if (record.id && record.imageList) {
            this.details.imgUrl = record.imageList[0].path;
          }
        })

      },

      // 過濾圖片路徑預覽
      filterImgUrl(){
        this.previewList = this.productCovers.covers && this.productCovers.covers.map(item=>item.url);
      },


      // 商品属性
      productAttribute() {
        if (this.model.type == 2) {//拼单
          this.commodityAttribute.singleNumber = this.model.groupMemberCount // 拼单人数
          this.commodityAttribute.singlePrice = this.model.groupPrice  // 拼单价格
        }
        if (this.model.type == 3) {//砍价
          this.commodityAttribute.targetPrice = this.model.haggleTargetPrice  // 目标价
          this.commodityAttribute.floorPrice = this.model.haggleMinPrice  // 底价
          this.commodityAttribute.maxCutNumber = this.model.maxHaggleCount  // 最多可砍刀数
        }
      },
      // 商品封面 attachmentEntityList
     async productsCover() {
        let coverList = this.model.attachmentEntityList;
        let img = coverList.filter(item => {
          if (item.url.endsWith('jpg') || item.url.endsWith('png') || (item.type && item.type < 2)) {
            item.type = 1;
            return item
          }
        });
        let video = coverList.filter(item => {
          if (item.type > 1 || item.url.endsWith('mp4')) {
            item.type = 2;
            return item
          }
        });
        this.productCovers.covers = img;
       await this.filterImgUrl()
        this.productCovers.videos = video
      },


      close() {
        this.$emit('close')
        // this.reload()
        this.categoryArr = [];
        this.productCovers = {
          covers: [],
          videos: []
        };
        this.details.content = '';
        this.visible = false
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            if (!this.categoryArr.length) {
              that.$message.warning('商品分类必须选择')
              return false;
            }
            if (!this.productCovers.covers.length) {
              that.$message.warning('封面图片必须上传')
              return false;
            }
            if (!this.model.type) {
              that.$message.warning('商品属性必须选择')
              return false;
            }
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add;
              method = 'post'
            } else {
              httpurl += this.url.edit;
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            formData.categoryId = this.categoryArr[1];
            formData.goodsDesc = this.details.content;

            formData.listPicUrl = (this.productCovers.covers && this.productCovers.covers.length > 0 && this.productCovers.covers[0].url) || "";
            formData.attachmentEntityList = [...this.productCovers.covers, ...this.productCovers.videos];
            if (formData.type == 2) {//拼单
              if (this.commodityAttribute.singleNumber == '') {
                that.$message.warning('拼单人数必须输入')
                return false;
              }
              if (this.commodityAttribute.singlePrice == '') {
                that.$message.warning('拼单价格必须输入')
                return false;
              }
              formData.groupMemberCount = this.commodityAttribute.singleNumber // 拼单人数
              formData.groupPrice = this.commodityAttribute.singlePrice // 拼单价格
            }
            if (formData.type == 3) {//砍价
              if (this.commodityAttribute.targetPrice == '') {
                that.$message.warning('拼单人数必须输入')
                return false;
              }
              if (this.commodityAttribute.floorPrice == '') {
                that.$message.warning('底价必须输入')
                return false;
              }
              if (this.commodityAttribute.maxCutNumber == '') {
                that.$message.warning(' 最多可砍刀数必须输入')
                return false;
              }
              formData.haggleTargetPrice = this.commodityAttribute.targetPrice // 目标价
              formData.haggleMinPrice = this.commodityAttribute.floorPrice // 底价
              formData.maxHaggleCount = this.commodityAttribute.maxCutNumber // 最多可砍刀数
            }
            console.log(formData);

            httpAction(httpurl, formData, method)
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.$emit('ok')
                } else {
                  that.$message.warning(res.message)
                }
              })
              .finally(() => {
                that.confirmLoading = false
                that.close()
              })
          }
        })
      },
      handleCancel() {
        this.close()
      },
      /**
       * 设置项目封面主图
       * @param index {number} 下标
       */
      setMainFigure(index) {
        if (index) {
          let change = this.productCovers.covers.splice(index, 1);
          this.productCovers.covers.unshift(...change)
        }
      },
      /**
       * 删除项目封面图片
       * @param index {number} 下标
       */
      deleteCover(index) {
        this.productCovers.covers.splice(index, 1);
      },
      /**
       * 删除项目封面视频
       * @param index {number} 下标
       */
      deleteVideo(index) {
        this.productCovers.videos.splice(index, 1);
      },
      deleteImgUrl() {
        this.details.imgUrl = '';
      },
      // 图片 上传 bofore
      frontBeforeUpload: function (file) {
        return false
      },
      // 图片 上传 change
      frontHandleChange(info) {
        this.upload(info, 'imgUrl')
      },
      // 图片 upload
      upload(info, name) {
        let that = this;
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
              // that.details[name] = res.result
              let obj = {
                url: res.result,
                type: 1
              };

              that.productCovers.covers.push(obj)
              that.filterImgUrl()
              //   this.productCovers.covers

            })
            .catch(err => {
              console.log(err)
            })
        }
      },
      // 视频上传 bofore
      frontBeforeUploadVideo: function (file) {
        return false;
      },
      // 上传 change
      frontHandleChangeVideo(info) {
        const formData = new FormData()
        formData.append('file', info.file)
        formData.append('token', "token")
        this.saveFile(formData)
      },
      saveFile(formData) {
        this.spinning = true
        this.axios({
          method: 'post',
          url: '/common/upload_file',
          headers: {},
          params: {},
          data: formData
        }).then((response) => {
          //  response.result.url
          if (!response.result.url.endsWith('.mp4')) {
            this.$message.error("请上传mp4格式的视频");
            return false;
          }
          let obj = {
            url: response.result.url,
            type: 2
          };
          this.productCovers.videos.push(obj)

          this.spinning = false
        }).catch((error) => {
          this.$message.error("新增失败，请重试");
          this.spinning = false
        })

      },

    }
  }
</script>

<style lang="less" scoped>
  .coverPhotoAndVideo {
    margin-left: 10%;
    .coverPhoto {
      display: flex;
      padding: 0;
      width: 100%;
      justify-content: start;

      flex-wrap: wrap;
      li {
        width: 200px;
        margin-right: 15px;
        list-style: none;
        & > div {
          display: flex;
          justify-content: space-around;

          &:hover {
            cursor: pointer;
          }
        }
        img {
          width: 200px;
          height: 125px;
        }
      }
    }

    .coverVideo {
      display: flex;
      list-style: none;
      padding: 0;
      li {
        display: inline-block;
        width: 200px;
        margin-right: 15px;
        span {
          display: block;
          text-align: center;
          color: #40a9ff;
          &:hover {
            cursor: pointer;
          }

        }
      }
    }
  }

  .activeClick {
    color: #40a9ff;
  }

  /deep/ .isRequired {
    .ant-form-item-label {
      label {
        &:before {
          content: "* ";
          color: red;
        }
      }
    }
  }

  .sortWidth {
    width: 100%;
  }

</style>