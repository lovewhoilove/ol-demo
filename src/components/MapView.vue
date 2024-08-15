<template>
  <div class="wrap">
    <div class="map-view" ref="map-view" :style="{ filter: mapFilter }"></div>
    <!--<div class="map-view-switch">
      <el-radio-group v-model="mapType" @input="switchMapType">
        <el-radio-button label="vec">矢量</el-radio-button>
        <el-radio-button label="img">影像</el-radio-button>
        <el-radio-button label="blue">蓝色</el-radio-button>
        <el-radio-button label="green">绿色</el-radio-button>
      </el-radio-group>
    </div>-->
    <!-- 状态栏 -->
    <div class="status-bar">
      <!-- 比例尺 -->
      <div class="scale-line" ref="scale-line"></div>
      <!-- 鼠标位置坐标 -->
      <div class="mouse-position" ref="mouse-position"></div>
    </div>
  </div>
</template>

<script>
import Map from "ol/Map";
import View from "ol/View";
import { ScaleLine, MousePosition } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { format } from "ol/coordinate";

import Tianditu from "@/utils/Tianditu.js";

export default {
  name: "MapView",
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
      mapType: "vec",
      lonLatCoor: "",
      mapFilter: "",
    };
  },
  watch: {
    mapType(val) {
      this.setFilter(val);
    },
  },
  mounted() {
    this._createMap();
  },
  methods: {
    _createMap() {
      const Tdt = new Tianditu();
      this.mapVecLyrGrp = Tdt.createLyrGrp(
        "vec",
        this.mapType === "vec",
        "deepBlue"
      );
      this.mapImgLyrGrp = Tdt.createLyrGrp(
        "img",
        this.mapType === "img"
      );
      const mapView = new View({
        center: [113.64, 34.82],
        zoom: 15,
        projection: "EPSG:4326",
      });

      mapView.on("change:resolution", (evt) => {
        const level = Math.round(mapView.getZoom() * 100000) / 100000;
        this.zoomLevel = `缩放等级: ${level}`;
      });

      //创建比例尺控件
      const scaleLineControl = new ScaleLine({
        target: this.$refs["scale-line"],
      });

      //创建鼠标坐标位置控件
      const mousePositionControl = new MousePosition({
        target: this.$refs["mouse-position"],
        coordinateFormat: (coordinate) => {
          return format(coordinate, "经度: {x} | 纬度: {y}", 4);
        },
      });

      this.map = new Map({
        target: this.$refs["map-view"],
        layers: [this.mapVecLyrGrp, this.mapImgLyrGrp],
        view: mapView,
        controls: [scaleLineControl, mousePositionControl],
        interactions: defaultInteractions({
          doubleClickZoom: false,
        }),
      });
      this.$emit("ready", this.map);
    },
    /**
     * 切换地图和鹰眼的图层类型
     * @param {string} label 图层类型
     */
    switchMapType(label) {
      if (label === "img") {
        this.mapVecLyrGrp.setVisible(false);
        this.mapImgLyrGrp.setVisible(true);
      } else {
        this.mapImgLyrGrp.setVisible(false);
        this.mapVecLyrGrp.setVisible(true);
      }
    },
    setFilter(type) {
      switch (type) {
        case "blue":
          this.mapFilter =
            "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
          break;
        case "green":
          this.mapFilter =
            "grayscale(98%) invert(100%) sepia(20%) hue-rotate(120deg) saturate(1600%) brightness(100%) contrast(90%)";
          break;
        default:
          this.mapFilter = "";
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  position: relative;
  height: 100%;
}

.map-view {
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
      content: "";
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

    // &::after {
    //   content: '';
    //   border-right: 1px solid #cdcdcd;
    //   height: 24px;
    // }
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
</style>
