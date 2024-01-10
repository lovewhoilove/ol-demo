<template>
  <div class="risk" ref="risk"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'RiskGraph',
  data() {
    return {
      data: [
        [0, 4, 2], [1, 4, 3], [2, 4, 3], [3, 4, 4], [4, 4, 4, 1],
        [0, 3, 2], [1, 3, 2], [2, 3, 3], [3, 3, 3], [4, 3, 4],
        [0, 2, 1], [1, 2, 2], [2, 2, 2], [3, 2, 3], [4, 2, 4],
        [0, 1, 1], [1, 1, 1], [2, 1, 2], [3, 1, 2], [4, 1, 3],
        [0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 2], [4, 0, 2]
      ]
    };
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
          height: '50%',
          top: '10%'
        },
        xAxis: {
          name: '后\n果\n严\n重\n程\n度',
          type: 'category',
          data: xAxisData,
          axisLine: {
            show: false
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
        },
        yAxis: {
          name: '泄露可能性',
          type: 'category',
          data: yAxisData,
          axisLine: {
            show: false
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
        },
        visualMap: {
          type: 'piecewise',
          pieces: [
            { value: 1, label: '低', color: '#65a7fe' },
            { value: 2, label: '一般', color: '#f1d93a' },
            { value: 3, label: '较大', color: '#f49d2c' },
            { value: 4, label: '重大', color: '#f25d60' }
          ],
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '30%'
        },
        series: [
          {
            name: '风险评估结果',
            type: 'heatmap',
            data: this.data,
            label: {
              show: true,
              formatter: params => params.value[3] ? '{a|}' : this.getRiskLevel(params.value[2]),
              rich: {
                a: {
                  backgroundColor: {
                    image: require('@/assets/star.png'),
                  },
                  height: 28
                },
              }
            },
            zlevel: -1
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
      chart.setOption(option);

      chart.on('mouseenter', params => {
        console.log('mouseenter');
        const { value } = params;
        const idx = this.data.findIndex(d => d.every((item, index) => item === value[index]));
        if (idx > -1) {
          this.data[idx][3] = 1;
          chart.setOption({
            series: [{
              data: this.data
            }]
          });
        }
      });
      chart.on('mouseleave', params => {
        console.log('mouseleave');
        const { value } = params;
        const idx = this.data.findIndex(d => d.every((item, index) => item === value[index]));
        if (idx > -1) {
          this.data[idx].length = 3;
          chart.setOption({
            series: [{
              data: this.data
            }]
          });
        }
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.risk {
  width: 800px;
  height: 600px;
}
</style>
