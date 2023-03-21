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
import { OverviewMap, defaults as defaultControls } from 'ol/control';

let mapVecLyrGrp;
let mapImgLyrGrp;
let overviewVecLyrGrp;
let overviewImgLyrGrp;
let map;
let overviewMapControl;

export default {
  name: 'MapView',
  data() {
    return {
      mapType: '矢量',
    }
  },
  mounted() {
    this._createMap();
  },
  methods: {
    _createMap() {
      const tianditu = new this.$OL.Tianditu();
      const iboLyr = tianditu.createWMTSLayer('全球境界', true);

      //创建矢量组和影像组的对象
      const vecSrcGrp = tianditu.createWMTSSourceGroup('矢量组');
      const imgSrcGrp = tianditu.createWMTSSourceGroup('影像组');

      //创建地图的矢量组和影像组的图层组对象
      mapVecLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(vecSrcGrp, true, '矢量组');
      mapImgLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(imgSrcGrp, false, '影像组');

      //创建鹰眼的矢量组和影像组的图层组对象
      overviewVecLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(vecSrcGrp, true, '矢量组');
      overviewImgLyrGrp = tianditu.createWMTSLayerGroupBySourceGroup(imgSrcGrp, false, '影像组');

      overviewMapControl = new OverviewMap({
        layers: [
          overviewVecLyrGrp,
          overviewImgLyrGrp
        ],
        collapsed: false,
      });

      const mapView = new View({
        center: [113.64, 34.72],
        zoom: 10,
        maxZoom: 18,
        projection: 'EPSG:4326',
      });

      map = new Map({
        controls: defaultControls().extend([overviewMapControl]),
        target: this.$refs['map-view'],
        layers: [
          mapVecLyrGrp,
          mapImgLyrGrp,
          iboLyr
        ],//全球境界最好放到最后，会按顺序渲染
        view: mapView,
      });
      this.$store.commit('setMap', map);
    },
    /**
     * 切换地图和鹰眼的图层类型
     * @param {string} label 图层类型
     */
    switchMapType(label) {
      if (label === '影像') {
        mapVecLyrGrp.setVisible(false);
        mapImgLyrGrp.setVisible(true);
        if (!overviewMapControl.getCollapsed()) {//若鹰眼是展开状态
          overviewVecLyrGrp.setVisible(false);
          overviewImgLyrGrp.setVisible(true);
        }
      } else {
        mapImgLyrGrp.setVisible(false);
        mapVecLyrGrp.setVisible(true);
        if (!overviewMapControl.getCollapsed()) {//若鹰眼是展开状态
          overviewImgLyrGrp.setVisible(false);
          overviewVecLyrGrp.setVisible(true);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.map-view {
  height: 100%;

  &-switch {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 3;
    box-shadow: 2px 2px 10px 2px black;
    border-radius: 4px; //修改为element的边框圆角大小
  }
}
</style>
