<template>
  <div></div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import GradientLineStyle from './GradientLineStyle';

export default {
  name: 'GradientLine',
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
      source: this.drawSource
    }));

    //添加过渡色线要素
    const feature = new Feature({
      geometry: new LineString([[113.5907, 34.7232], [113.7135, 34.7673]])
    });
    const style = new GradientLineStyle({
      color: 'red',
      color2: 'green',
      width: 6,
    });
    feature.setStyle(style);
    this.drawSource.addFeature(feature);

    //添加单色的普通线要素
    const feature2 = new Feature({
      geometry: new LineString([[113.7135, 34.7873], [113.6207, 34.8232]])
    });
    const style2 = new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 6,
      }),

    });
    feature2.setStyle(style2);
    this.drawSource.addFeature(feature2);
  },
}
</script>
