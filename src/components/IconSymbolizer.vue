<template>
  <div></div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { Icon, Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style.js';

export default {
  name: 'IconSymbolizer',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    this.highlightSource = null;
    this.iconSource = null;
    return {};
  },
  mounted() {
    this.addLayer();
    this.addIcon();
    this.addHighlightPoint();
  },
  methods: {
    addLayer() {
      //添加一个图标图层
      this.iconSource = new VectorSource({ wrapX: false });
      const iconLayer = new VectorLayer({
        source: this.iconSource,
        zIndex: 3
      });
      this.map.addLayer(iconLayer);
      //添加一个高亮图层
      this.highlightSource = new VectorSource({ wrapX: false });
      const highlightLayer = new VectorLayer({
        source: this.highlightSource,
        style: this.createHighlightStyle(),
        zIndex: 4
      });
      this.map.addLayer(highlightLayer);
    },

    //添加图标
    addIcon() {
      const iconFeature = new Feature({
        geometry: new Point([113.64, 34.72]),
      });

      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: require('@/assets/icon.png'),
        }),
      });

      iconFeature.setStyle(iconStyle);
      this.iconSource.addFeature(iconFeature);
    },
    //添加高亮点
    addHighlightPoint() {
      this.highlightSource.addFeature(new Feature({
        geometry: new Point([113.64, 34.72]),
      }));
    },
    //创建高亮样式
    createHighlightStyle() {
      return new Style({
        fill: new Fill({
          color: 'rgba(0, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 255, 255, 1)',
          width: 3,
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: 'rgba(0, 255, 255, 1)',
          }),
        }),
      });
    },
  },
}
</script>

<style lang="scss" scoped></style>
