<template>
  <div class="map-view" ref="map-view">
    <FixedScalePrint />
  </div>
</template>

<script>
import Map from 'ol/Map';
import View from 'ol/View';
import { ScaleLine } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';

import Tianditu from '@/utils/Tianditu';

import FixedScalePrint from './FixedScalePrint';

export default {
  name: 'MapView',
  components: {
    FixedScalePrint,
  },
  provide() {
    return {
      getMap: () => this.map,
    };
  },
  data() {
    this.map = null;
    return {}
  },
  mounted() {
    this._createMap();
  },
  methods: {
    _createMap() {
      const tianditu = new Tianditu();
      const iboLyr = tianditu.createWMTSLayer('全球境界', true);

      //创建矢量组和影像组的对象
      const vecSrcGrp = tianditu.createWMTSSourceGroup('矢量组');
      const imgSrcGrp = tianditu.createWMTSSourceGroup('影像组');

      //创建地图的矢量组和影像组的图层组对象
      const mapVecLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(vecSrcGrp, true, '矢量组');
      const mapImgLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(imgSrcGrp, false, '影像组');

      const mapView = new View({
        center: [113.64, 34.72],
        zoom: 10,
        projection: 'EPSG:4326',
      });

      //为了更直观地显示比例尺，这里我们设置比例尺的样式为bar样式
      const scaleLineControl = new ScaleLine({ bar: true, text: true, minWidth: 125 });

      this.map = new Map({
        target: this.$refs['map-view'],
        layers: [
          mapVecLyrGrp,
          mapImgLyrGrp,
          iboLyr
        ],
        view: mapView,
        controls: [
          scaleLineControl,
        ],
        interactions: defaultInteractions({
          doubleClickZoom: false
        }),
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.map-view {
  position: relative;
  height: 100%;
}
</style>
