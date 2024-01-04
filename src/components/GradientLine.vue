<template>
  <div class="wrap"></div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
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
    const feature = new Feature({
      geometry: new LineString([[113.5907, 34.7232], [113.7135, 34.7673]])
    });
    const style = new GradientLineStyle({
      color: '#ff0000',
      color2: '#00ff00',
      width2: 6,
      width: 6,
    });
    feature.setStyle(style);
    this.drawSource.addFeature(feature);
    const feature2 = new Feature({
      geometry: new LineString([[113.7135, 34.7673], [113.6207, 34.8232]])
    });
    const style2 = new Style({
      stroke: new Stroke({
        color: '#00ff00',
        width: 6,
      }),

    });
    feature2.setStyle(style2);
    this.drawSource.addFeature(feature2);
  },
  methods: {},
}
</script>

<style lang="scss"></style>