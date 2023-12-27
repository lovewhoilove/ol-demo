<template>
  <div class="one-map">
    <MapView ref="map" @ready="init" />
    <!-- <MapboxMap /> -->
    <!-- <ImportShp /> -->
    <!-- <ImportShpAndDbf /> -->
    <!-- <ImportShapefile /> -->
    <ChangeViewProjection />
  </div>
</template>

<script>
import MapView from '@/components/MapView';
// import MapboxMap from '@/components/MapboxMap';

import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';

// import ImportShp from '@/components/ImportShp';
// import ImportShpAndDbf from '@/components/ImportShpAndDbf';
// import ImportShapefile from '@/components/ImportShapefile';
import ChangeViewProjection from '@/components/ChangeViewProjection.vue';

export default {
  name: "OneMap",
  components: {
    MapView,
    // ImportShp,
    // ImportShpAndDbf,
    // ImportShapefile,
    ChangeViewProjection
  },
  provide() {
    return {
      getMap: () => this.map,
    };
  },
  data() {
    this.map = null;
    return {};
  },
  methods: {
    init(map) {
      this.map = map;
      const source = new VectorSource();
      const layer = new VectorLayer({
        source,
        properties: {
          name: 'importLayer'
        }
      });
      this.map.addLayer(layer);
    },
  }
}
</script>

<style lang="scss" scoped>
.one-map {
  position: relative;
  height: 100%;
}
</style>
