<template>
  <div class="map-view" ref="map-view">
    <!-- 底图切换 -->
    <div class="map-view-switch">
      <el-radio-group v-model="mapType" @input="switchMapType">
        <el-radio-button label="矢量"></el-radio-button>
        <el-radio-button label="影像"></el-radio-button>
      </el-radio-group>
    </div>
    <!-- 状态栏 -->
    <div class="status-bar">
      <!-- 比例尺 -->
      <div class="scale-line" ref="scale-line"></div>
      <!-- 鼠标位置坐标 -->
      <div class="mouse-position" ref="mouse-position"></div>
      <!-- 缩放等级 -->
      <div class="zoom-level">{{ zoomLevel }}</div>
    </div>
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
      lonLatCoor: '',
      zoomLevel: '',
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

      //创建比例尺控件
      const scaleLineControl = new ScaleLine({
        target: this.$refs['scale-line']
      });

      //创建鼠标坐标位置控件
      const mousePositionControl = new MousePosition({
        target: this.$refs['mouse-position'],
        coordinateFormat: (coordinate) => {
          return format(coordinate, '经度: {x} , 纬度: {y}', 5);
        },
      });

      const mapView = new View({
        center: [113.64, 34.72],
        zoom: 10,
        // maxZoom: 18,
        projection: 'EPSG:4326',
      });

      mapView.on('change:resolution', evt => {
        const level = Math.round(mapView.getZoom() * 100000) / 100000;
        this.zoomLevel = `缩放等级: ${level}`;
      });

      map = new Map({
        target: this.$refs['map-view'],
        layers: [
          mapVecLyrGrp,
          mapImgLyrGrp,
          iboLyr
        ],
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
    position: fixed;
    top: 6px;
    right: 6px;
    z-index: 3;
    box-shadow: 2px 2px 10px 2px black;
    border-radius: 4px; //修改为element的边框圆角大小
    user-select: none;
  }

  /* 状态栏 */
  .status-bar {
    display: flex;
    align-items: center;
    position: absolute;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    height: 36px;
    background-color: #ffffff;
    z-index: 999;
    font-size: 12px;

    /* 比例尺 */
    .scale-line {
      display: flex;
      align-items: center;

      ::v-deep .ol-scale-line {
        position: static;
        border-radius: 0;
        background: transparent;
        padding: 0 10px;
      }

      &::after {
        content: '';
        border-right: 1px solid #cdcdcd;
        height: 24px;
      }
    }

    /* 鼠标位置坐标 */
    .mouse-position {
      display: flex;
      align-items: center;

      ::v-deep .ol-mouse-position {
        position: static;
        padding: 0 10px;
      }

      &::after {
        content: '';
        border-right: 1px solid #cdcdcd;
        height: 24px;
      }
    }

    /* 缩放等级 */
    .zoom-level {
      display: flex;
      align-items: center;
      height: 100%;
      margin: 0 10px;
    }
  }

  /* 鹰眼 */
  ::v-deep .ol-overviewmap {
    position: absolute;
    bottom: 40px;
    left: 6px;
    top: auto;
    right: auto;
    border: none;

    .ol-overviewmap-map {
      border-radius: 4px;

      .ol-viewport {
        border-radius: 4px;
      }
    }

    .ol-overviewmap-box {
      border: 1px solid black;
    }
  }
}
</style>
