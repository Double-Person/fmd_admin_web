<template>
  <div>
    <div class="page-header-index-wide">
      <div class="logo-img">
        <img src="./logo.svg" alt="" width="104">
      </div>
      <p class='title'>欢迎来到福满多管理后台</p>
      <div class="content">
        四川百璞归真商贸有限公司，是一家集珠宝玉器设计，生产，销售于一体的综合性企业。旗下"福满多"品牌已经成为知名的珠宝玉器品牌。
      </div>
      <div class="content">
        公司坐落于天府之国历史文化名城成都市城南中心的世纪城新会展中心。公司是四川工艺美术行业协会常务理事单位，中国工艺美术行业协会旗下中国艺品网四川运营中心，
        宗旨：立足工美行业 弘扬传统文化。让"福满多"品牌成为"具有影响力的中国特色文化品牌"
      </div>
      <div class="content">
        公司打破传统珠宝玉器的生产销售模式，直接面向收藏爱好者，以创新的生产设计理念，打造品质上呈的珠宝玉器作品，在国内采用互联网+模式，实现"线上购物，线下品鉴"的无差别购物体验，
        经过多年的发展，目前拥有50万余客户，相信未来工艺美术作为文化的载体必将大放光彩！
      </div>
    </div>



    <div class="page-header-index-wide" v-if="false">
      <a-row :gutter="24">
        <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="总销售额" total="￥126,560">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <trend flag="up" style="margin-right: 16px;">
                <span slot="term">周同比</span>
                12%
              </trend>
              <trend flag="down">
                <span slot="term">日同比</span>
                11%
              </trend>
            </div>
            <template slot="footer">日均销售额<span>￥ 234.56</span></template>
          </chart-card>
        </a-col>
        <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="访问量" :total="8846 | NumberFormat">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <mini-area />
            </div>
            <template slot="footer">日访问量<span> {{ '1234' | NumberFormat }}</span></template>
          </chart-card>
        </a-col>
        <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="支付笔数" :total="6560 | NumberFormat">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <mini-bar :height="40" />
            </div>
            <template slot="footer">转化率 <span>60%</span></template>
          </chart-card>
        </a-col>
        <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="运营活动效果" total="78%">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="78" :height="8" />
            </div>
            <template slot="footer">
              <trend flag="down" style="margin-right: 16px;">
                <span slot="term">同周比</span>
                12%
              </trend>
              <trend flag="up">
                <span slot="term">日环比</span>
                80%
              </trend>
            </template>
          </chart-card>
        </a-col>
      </a-row>

      <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
        <div class="salesCard">
          <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
            <div class="extra-wrapper" slot="tabBarExtraContent">
              <div class="extra-item">
                <a>今日</a>
                <a>本周</a>
                <a>本月</a>
                <a>本年</a>
              </div>
              <a-range-picker :style="{width: '256px'}" />
            </div>
            <a-tab-pane loading="true" tab="销售额" key="1">
              <a-row>
                <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                  <bar title="销售额排行" :dataSource="barData"/>
                </a-col>
                <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                  <rank-list title="门店销售排行榜" :list="rankList"/>
                </a-col>
              </a-row>
            </a-tab-pane>
            <a-tab-pane tab="访问量" key="2">
              <a-row>
                <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                  <bar title="销售额趋势" :dataSource="barData"/>
                </a-col>
                <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                  <rank-list title="门店销售排行榜" :list="rankList"/>
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-card>

      <a-row>
        <a-col :span="24">
          <a-card :loading="loading" :bordered="false" title="最近一周访问次数统计" :style="{ marginTop: '24px' }">
            <a-row>
              <a-col :span="6">
                <head-info title="今日访问IP数" :content="loginfo.todayIp"></head-info>
              </a-col>
              <a-col :span="2">
                <a-spin class='circle-cust'>
                  <a-icon slot="indicator" type="environment" style="font-size: 24px"  />
                </a-spin>
              </a-col>
              <a-col :span="6">
                <head-info title="今日访问次数" :content="loginfo.todayVisitCount"></head-info>
              </a-col>
              <a-col :span="2">
                <a-spin class='circle-cust'>
                  <a-icon slot="indicator" type="team" style="font-size: 24px"  />
                </a-spin>
              </a-col>
              <a-col :span="6">
                <head-info title="访问总次数" :content="loginfo.totalVisitCount"></head-info>
              </a-col>
              <a-col :span="2">
                <a-spin class='circle-cust'>
                  <a-icon slot="indicator" type="rise" style="font-size: 24px"  />
                </a-spin>
              </a-col>
            </a-row>
            <line-chart-multid :fields="visitFields" :dataSource="visitInfo"></line-chart-multid>
          </a-card>
        </a-col>
      </a-row>
    </div>


  </div>
</template>

<script>
  import ChartCard from '@/components/ChartCard'
  import ACol from "ant-design-vue/es/grid/Col"
  import ATooltip from "ant-design-vue/es/tooltip/Tooltip"
  import MiniArea from '@/components/chart/MiniArea'
  import MiniBar from '@/components/chart/MiniBar'
  import MiniProgress from '@/components/chart/MiniProgress'
  import RankList from '@/components/chart/RankList'
  import Bar from '@/components/chart/Bar'
  import LineChartMultid from '@/components/chart/LineChartMultid'
  import HeadInfo from '@/components/tools/HeadInfo.vue'

  import Trend from '@/components/Trend'
  import { getLoginfo,getVisitInfo } from '@/api/api'

  const rankList = []
  for (let i = 0; i < 7; i++) {
    rankList.push({
      name: '白鹭岛 ' + (i+1) + ' 号店',
      total: 1234.56 - i * 100
    })
  }
  const barData = []
  for (let i = 0; i < 12; i += 1) {
    barData.push({
      x: `${i + 1}月`,
      y: Math.floor(Math.random() * 1000) + 200
    })
  }
  export default {
    name: "Analysis",
    components: {
      ATooltip,
      ACol,
      ChartCard,
      MiniArea,
      MiniBar,
      MiniProgress,
      RankList,
      Bar,
      Trend,
      LineChartMultid,
      HeadInfo
    },
    data() {
      return {
        loading: true,
        center: null,
        rankList,
        barData,
        loginfo:{},
        visitFields:['ip','visit'],
        visitInfo:[],
        indicator: <a-icon type="loading" style="font-size: 24px" spin />
      }
    },
    created() {
      setTimeout(() => {
        this.loading = !this.loading
      }, 1000)
      this.initLogInfo();
    },
    methods: {
      initLogInfo () {
        getLoginfo(null).then((res)=>{
          if(res.success){
            Object.keys(res.result).forEach(key=>{
              res.result[key] =res.result[key]+""
            })
            this.loginfo = res.result;
          }
        })
        getVisitInfo().then(res=>{
          if(res.success){
            this.visitInfo = res.result;
          }
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .page-header-index-wide{
    height: 100vh;
    background: url("../../assets/pic_homebg.png");
    background-size: cover;
    .logo-img{
      padding-top: 46px;
      text-align: center;
    }
    .title{
      font-size: 30px;
      font-family: MicrosoftYaHei, MicrosoftYaHei-Bold;
      font-weight: 700;
      color: #000000;
      line-height: 30px;
      margin-top: 22px;
      text-align: center;
    }

    .content{
      font-size: 18px;
      font-family: MicrosoftYaHei;
      text-align: left;
      color: #000000;
      line-height: 30px;
      padding: 0 40px;
      margin-bottom: 15px;
    }
  }

  /* 原頁面樣式start */
  .circle-cust{
    position: relative;
    top: 28px;
    left: -100%;
  }
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  /* 首页访问量统计 */
  .head-info {
    position: relative;
    text-align: left;
    padding: 0 32px 0 0;
    min-width: 125px;

    &.center {
      text-align: center;
      padding: 0 32px;
    }

    span {
      color: rgba(0, 0, 0, .45);
      display: inline-block;
      font-size: .95rem;
      line-height: 42px;
      margin-bottom: 4px;
    }
    p {
      line-height: 42px;
      margin: 0;
      a {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }

</style>