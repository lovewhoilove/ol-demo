<template>
  <div class="map-view" ref="map-view"></div>
</template>

<script>
import Map from 'ol/Map';
import View from 'ol/View';

export default {
  name: 'MapView',
  mounted() {
    this._createMap();
  },
  methods: {
    _createMap() {
      const tianditu = new this.$OL.Tianditu();
      const vecLyrGrp = tianditu.createWMTSLayerGroup('矢量组', true);
      const iboLyr = tianditu.createWMTSLayer('全球境界', true);

      const mapView = new View({
        center: [113.64, 34.72],
        zoom: 10,
        maxZoom: 18,
        projection: 'EPSG:4326',
      });

      const map = new Map({
        target: this.$refs['map-view'],
        layers: [vecLyrGrp, iboLyr],
        view: mapView,
      });

      map.getLayers().getArray().forEach(lyr => {
        console.log(lyr.get('name'));
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.map-view {
  height: 100%;
}
</style>
