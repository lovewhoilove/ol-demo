<template>
  <div class="risk" ref="risk"></div>
</template>

<script>
import * as echarts from 'echarts';

const starStyle = {
  label: {
    show: true,
    formatter: '{a|}',
    rich: {
      a: {
        backgroundColor: {
          image: require('@/assets/star.png'),
        },
        height: 28
      }
    }
  }
};

export default {
  name: 'RiskGraph',
  data() {
    this.data = [
      [0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 2], [4, 0, 2],
      [0, 1, 1], [1, 1, 1], [2, 1, 2], [3, 1, 2], [4, 1, 3],
      [0, 2, 1], [1, 2, 2], [2, 2, 2], [3, 2, 3], [4, 2, 4],
      [0, 3, 2], [1, 3, 2], [2, 3, 3], [3, 3, 3], [4, 3, 4],
      [0, 4, 2], [1, 4, 3], [2, 4, 3], [3, 4, 4], [4, 4, 4]
    ];
    this.score = { row: 5, col: 5 };
    return {};
  },
  mounted() {
    this.drawHeatMap();
  },
  methods: {
    drawHeatMap() {
      const xAxisData = ['很小', '小', '一般', '大', '很大'];
      const yAxisData = ['基本不可能', '较不可能', '可能', '较可能', '很可能'];
      const option = {
        tooltip: {
          position: 'top',
          formatter: params => this.getRiskLevel(params.value[2])
        },
        grid: {
          width: '50%',
          height: '50%',
        },
        xAxis: {
          name: '后\n果\n严\n重\n程\n度',
          type: 'category',
          data: xAxisData,
          axisLine: {
            show: true,
            symbol: ['none', 'arrow'],
            symbolOffset: [0, '13'],
            lineStyle: {
              width: 2,
              cap: 'round'
            }
          },
          axisTick: {
            show: false
          },
          lineStyle: {
            color: '#fff',
            width: 2
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#fff",
              width: 2,
            },
          },
          position: 'top'
        },
        yAxis: {
          name: '泄漏可能性',
          type: 'category',
          data: yAxisData,
          axisLine: {
            show: true,
            symbol: ['arrow', 'none'],
            symbolOffset: ['-13', 0],
            lineStyle: {
              width: 2,
              cap: 'round'
            }
          },
          axisTick: {
            show: false
          },
          lineStyle: {
            color: '#fff',
            width: 2
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#fff",
              width: 2,
            },
          },
          inverse: true
        },
        //倘若打分的结果是一个范围，可以在这里进行设置visualMap下的pieces的值。
        //具体请参考：https://echarts.apache.org/zh/option.html#visualMap-piecewise.pieces
        visualMap: {
          type: 'piecewise',
          pieces: [
            { value: 1, label: '低', color: '#65a7fe' },
            { value: 2, label: '一般', color: '#f1d93a' },
            { value: 3, label: '较大', color: '#f49d2c' },
            { value: 4, label: '重大', color: '#f25d60' }
          ],
          orient: 'horizontal',
          left: '19%',
          bottom: '35%',
          itemWidth: 16,
          itemHeight: 16,
          itemGap: 20,
          selectedMode: false,//是否可以选择
          hoverLink: false,//鼠标悬浮时图表项高亮关闭
        },
        series: [
          {
            name: '风险评估矩阵',
            type: 'heatmap',
            data: this.data,
            label: {
              show: true,
              formatter: params => {
                return this.getRiskLevel(params.value[2]);
              },
            },
            zlevel: -1,
            emphasis: {
              label: starStyle.label
            }
          }
        ]
      };
      this.createChart('risk', option);
    },
    getRiskLevel(val) {
      const risks = {
        1: () => '低',
        2: () => '一般',
        3: () => '较大',
        4: () => '重大',
      }
      return risks[val]();
    },
    //创建echarts
    createChart(domRef, option) {
      const chartDom = this.$refs[domRef];
      const existInstance = echarts.getInstanceByDom(chartDom);
      if (existInstance) {
        echarts.dispose(chartDom);
      }
      const chart = echarts.init(chartDom);
      if (this.score) {
        //设置某一项显示五角星
        const { row, col } = this.score;
        const idx = col * row - 1;
        this.data[idx] = Object.assign({ value: this.data[idx] }, starStyle);
      }
      chart.setOption(option);
    },
  }
}
</script>

<style lang="scss" scoped>
.risk {
  width: 800px;
  height: 800px;
}
</style>
