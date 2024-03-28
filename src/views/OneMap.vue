<template>
  <div class="one-map">
    <!-- <MapView ref="map" @ready="init" /> -->
    <MapView ref="map" @ready="init" v-loading="loading" element-loading-text="定位中"
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" />
    <!-- <MapboxMap /> -->
    <!-- <ImportShp /> -->
    <!-- <ImportShpAndDbf /> -->
    <!-- <ImportShapefile /> -->
    <!-- <ChangeViewProjection /> -->
    <!-- <ViewSwitch /> -->
    <!-- <NorthCompass /> -->
    <!-- <GradientLine /> -->
    <!-- <RiskGraph /> -->
    <!-- <IconSymbolizer /> -->
    <!-- <ArrowLine /> -->
    <!-- <NavigationRoute /> -->
    <Position @handleLoading="handleLoading" />
  </div>
</template>

<script>
import MapView from '@/components/MapView';
// import MapboxMap from '@/components/MapboxMap';

import { Vector as VectorSource } from 'ol/source';
import { VectorImage as VectorLayer } from 'ol/layer';
// import IconSymbolizer from '@/components/IconSymbolizer';
// import ViewSwitch from '@/components/ViewSwitch';
// import NorthCompass from '@/components/NorthCompass.vue';
// import GradientLine from '@/components/GradientLine.vue';
// import ArrowLine from '@/components/ArrowLine.vue';
// import NavigationRoute from '@/components/NavigationRoute';
// import RiskGraph from '@/components/RiskGraph';

// import ImportShp from '@/components/ImportShp';
// import ImportShpAndDbf from '@/components/ImportShpAndDbf';
// import ImportShapefile from '@/components/ImportShapefile';
// import ChangeViewProjection from '@/components/ChangeViewProjection';
import Position from '@/components/Position';

export default {
  name: "OneMap",
  components: {
    MapView,
    // IconSymbolizer,
    // GradientLine,
    // ArrowLine,
    // NavigationRoute,
    Position,
  },
  provide() {
    return {
      getMap: () => this.map,
    };
  },
  data() {
    this.map = null;
    return {
      loading: false,
    };
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
    handleLoading(bool) {
      this.loading = bool;
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
