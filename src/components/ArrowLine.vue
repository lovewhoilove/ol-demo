<template>
  <div></div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Point, LineString } from 'ol/geom';
import { Style, Stroke, Icon } from 'ol/style';

export default {
  name: 'ArrowLine',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    this.drawSource = null;
    return {};
  },
  mounted() {
    this.drawSource = new VectorSource();
    this.map.addLayer(new VectorLayer({
      source: this.drawSource,
      style: feature => {
        //添加一个基本的线样式
        const styles = [
          new Style({
            stroke: new Stroke({
              color: 'green',
              width: 12
            })
          })
        ];
        const geometry = feature.getGeometry();
        const start = geometry.getFirstCoordinate();
        const end = geometry.getLastCoordinate();

        //计算绘制的箭头个数
        const startIdx = feature.get('idx') ? 0 : 1;
        const startPixelCoor = this.map.getPixelFromCoordinate(start);
        const endPixelCoor = this.map.getPixelFromCoordinate(end);
        const pixelLength = this.calculateLength(...startPixelCoor, ...endPixelCoor);
        const arrowNum = Math.floor(pixelLength / 50);//每间隔50像素绘制一个箭头

        //计算箭头的角度
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);

        for (let i = startIdx; i < arrowNum; i++) {
          const coor = geometry.getCoordinateAt(i / arrowNum);
          styles.push(
            new Style({
              geometry: new Point(coor),
              image: new Icon({
                src: require('@/assets/arrow.png'),
                width: 8,
                rotateWithView: true,
                rotation: -rotation
              }),
            }),
          );
        }
        return styles;
      },
    }));

    //添加两个线要素
    const feature = new Feature({
      geometry: new LineString([[113.6207, 34.8232], [113.7135, 34.8232]])
    });
    feature.setProperties({ 'idx': 0 });
    this.drawSource.addFeature(feature);
    const feature2 = new Feature({
      geometry: new LineString([[113.7135, 34.8232], [113.7774, 34.8583]])
    });
    feature2.setProperties({ 'idx': 1 });
    this.drawSource.addFeature(feature2);
  },
  methods: {
    calculateLength(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
  }
}
</script>
