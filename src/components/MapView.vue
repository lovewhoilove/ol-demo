<template>
  <div class="map-view" ref="map-view">
    <!-- 底图切换 -->
    <div class="map-view-switch">
      <el-radio-group v-model="mapType" @input="switchMapType">
        <el-radio-button label="矢量"></el-radio-button>
        <el-radio-button label="影像"></el-radio-button>
      </el-radio-group>
    </div>
    <!-- 鼠标经纬度 -->
    <div ref="mouse-position"></div>
  </div>
</template>

<script>
import Map from 'ol/Map';
import View from 'ol/View';
import {
  OverviewMap,
  MousePosition,
  ScaleLine
} from 'ol/control';
import { format } from "ol/coordinate";
import { defaults as defaultInteractions } from 'ol/interaction';

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
      lonLatCoor: null,
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

      //创建鹰眼控件对象
      overviewMapControl = new OverviewMap({
        layers: [
          overviewVecLyrGrp,
          overviewImgLyrGrp
        ],
        collapsed: false,
      });

      //创建鼠标坐标位置控件
      const mousePositionControl = new MousePosition({
        target: this.$refs['mouse-position'],
        coordinateFormat: this.createStringXY(4),
      });

      //创建比例尺控件
      const scaleLineControl = new ScaleLine();

      const mapView = new View({
        center: [113.64, 34.72],
        zoom: 10,
        maxZoom: 18,
        projection: 'EPSG:4326',
      });

      map = new Map({
        target: this.$refs['map-view'],
        layers: [
          mapVecLyrGrp,
          mapImgLyrGrp,
          iboLyr
        ],//全球境界最好放到最后，会按顺序渲染
        view: mapView,
        controls: [
          overviewMapControl,
          mousePositionControl,
          scaleLineControl
        ],
        interactions: defaultInteractions({
          doubleClickZoom: false
        }),
      });
      this.$store.commit('setMap', map);
    },
    /**
     * 格式化坐标的小数位数-重写官方的方法
     * @param {number} fractionDigits 小数位数
     */
    createStringXY(fractionDigits) {
      return (
        /**
         * @param {Coordinate} coordinate Coordinate.
         * @return {string} String XY.
         */
        function (coordinate) {
          return format(coordinate, '经度: {x} | 纬度: {y}', fractionDigits);
        }
      );
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
  position: relative;
  height: 100%;

  &-switch {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 3;
    box-shadow: 2px 2px 10px 2px black;
    border-radius: 4px; //修改为element的边框圆角大小
    user-select: none;
  }
}
</style>
