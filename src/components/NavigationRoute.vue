<template>
  <div></div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Point, LineString } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import GradientLineStyle from '@/utils/GradientLineStyle';

const MAX_ARROWS = 100;

export default {
  name: 'NavigationRoute',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  mounted() {
    //添加渐变色图层
    this.addGradientLyr();
    //添加箭头图层
    this.addArrowLyr();
  },
  methods: {
    addGradientLyr() {
      const gradientSource = new VectorSource();
      const gradientLayer = new VectorLayer({
        source: gradientSource,
        style: feature => {
          return new GradientLineStyle({
            width: feature.get('width'),
            startColor: feature.get('start'),
            endColor: feature.get('end')
          })
        }
      });
      this.map.addLayer(gradientLayer);

      //真实使用场景可能根据返回的json要素的属性来获取颜色值或代表颜色值的属性
      //这里我们直接写死，用颜色值模拟下拥堵效果
      const feature = new Feature({
        geometry: new LineString([[113.6207, 34.8232], [113.7135, 34.8332]])
      });
      feature.setProperties({ 'width': 12, 'start': 'green', 'end': 'orange' });
      gradientSource.addFeature(feature);
      const feature2 = new Feature({
        geometry: new LineString([[113.7135, 34.8332], [113.7774, 34.8583]])
      });
      feature2.setProperties({ 'width': 12, 'start': 'orange', 'end': 'red' });
      gradientSource.addFeature(feature2);
      const feature3 = new Feature({
        geometry: new LineString([[113.7774, 34.8583], [113.8089, 34.8509]])
      });
      feature3.setProperties({ 'width': 12, 'start': 'red', 'end': 'green' });
      gradientSource.addFeature(feature3);
    },
    addArrowLyr() {
      const lineCoors = [[113.6207, 34.8232], [113.7135, 34.8332], [113.7774, 34.8583], [113.8089, 34.8509]];

      const arrowSource = new VectorSource();
      const arrowLayer = new VectorLayer({
        source: arrowSource,
        style: feature => {
          const styles = [];
          const geometry = feature.getGeometry();
          const start = geometry.getFirstCoordinate();
          const end = geometry.getLastCoordinate();

          //计算绘制的箭头个数
          const startPixelCoor = this.map.getPixelFromCoordinate(start);
          const endPixelCoor = this.map.getPixelFromCoordinate(end);
          const pixelLength = this.calculateLength(...startPixelCoor, ...endPixelCoor);
          const num = Math.floor(pixelLength / 50);
          const arrowNum = num > MAX_ARROWS ? MAX_ARROWS : num;//每间隔50像素绘制一个箭头

          for (let i = 1; i < arrowNum; i++) {
            const coor = geometry.getCoordinateAt(i / arrowNum);
            const closestSegment = this.getClosestSegment(...coor, lineCoors);
            const rotation = this.calculateRotation([closestSegment[0], closestSegment[1]], [closestSegment[2], closestSegment[3]]);
            styles.push(
              new Style({
                geometry: new Point(coor),
                image: new Icon({
                  src: require('@/assets/arrow.png'),
                  width: 6,
                  rotateWithView: true,
                  rotation: -rotation,
                }),
              }),
            );
          }

          return styles;
        }
      });

      this.map.addLayer(arrowLayer);
      const feature = new Feature({
        geometry: new LineString(lineCoors)
      })
      arrowSource.addFeature(feature);
    },
    //计算箭头所在点的旋转角度
    calculateRotation(start, end) {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      return Math.atan2(dy, dx);
    },
    // 计算点到折线距离最近的那部分线段
    getClosestSegment(x, y, line) {
      let minDistance = Infinity;
      let closestSegment = null;

      for (let i = 0; i < line.length - 1; i++) {
        const x1 = line[i][0];
        const y1 = line[i][1];
        const x2 = line[i + 1][0];
        const y2 = line[i + 1][1];

        const distance = this.distanceToSegment(x, y, x1, y1, x2, y2);

        if (distance < minDistance) {
          minDistance = distance;
          closestSegment = [x1, y1, x2, y2];
        }
      }

      return closestSegment;
    },
    // 计算点到线段的距离
    distanceToSegment(x, y, x1, y1, x2, y2) {
      const A = x - x1;
      const B = y - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) // in case of 0 length line
        param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      return this.calculateLength(x, y, xx, yy);
    },
    //计算线段的长度
    calculateLength(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
  }
}
</script>
