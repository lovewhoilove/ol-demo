<template>
  <div class="map-view" ref="map-view">
    <div class="map-view-switch">
      <el-radio-group v-model="mapType" @input="switchMapType">
        <el-radio-button label="矢量"></el-radio-button>
        <el-radio-button label="影像"></el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import Map from 'ol/Map';
import View from 'ol/View';
import { ScaleLine } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';

import Tianditu from '@/utils/Tianditu';

// import FixedScalePrint from './FixedScalePrint';

export default {
  name: 'MapView',
  components: {
    // FixedScalePrint,
  },
  provide() {
    return {
      getMap: () => this.map,
    };
  },
  data() {
    this.map = null;
    this.mapVecLyrGrp = null;
    this.mapImgLyrGrp = null;
    return {
      mapType: '矢量'
    }
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
      this.mapVecLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(vecSrcGrp, true, '矢量组');
      this.mapImgLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(imgSrcGrp, false, '影像组');

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
          this.mapVecLyrGrp,
          this.mapImgLyrGrp,
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
      this.$emit('ready', this.map);
    },
    /**
     * 切换地图和鹰眼的图层类型
     * @param {string} label 图层类型
     */
    switchMapType(label) {
      if (label === '影像') {
        this.mapVecLyrGrp.setVisible(false);
        this.mapImgLyrGrp.setVisible(true);
      } else {
        this.mapImgLyrGrp.setVisible(false);
        this.mapVecLyrGrp.setVisible(true);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.map-view {
  position: relative;
  height: 100%;
}

.map-view-switch {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  box-shadow: 2px 2px 10px 2px black;
  border-radius: 4px; //修改为element的边框圆角大小
}
</style>
