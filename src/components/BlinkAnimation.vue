<template>
  <div class="wrap">
    <el-table
      :data="tableData"
      style="width: 100%"
      highlight-current-row
      @row-click="rowClick"
    >
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="type" label="类型" width="100">
        <template slot-scope="scope">
          {{ getTypeName(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click.stop="handleDeleteBlink(scope.row)"
            >移除闪烁</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Feature from "ol/Feature.js";
import { Point, LineString } from "ol/geom.js";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style.js";

import { BlinkAnimation } from "./Blink.js";

export default {
  name: "BlinkAnimation",
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    this.source = null;
    this.blinkInstance = null;

    return {
      tableData: [
        {
          id: "001",
          type: "line",
          coors: [
            [113.6389, 34.8233],
            [113.6439, 34.818],
          ],
        },
        {
          id: "002",
          type: "point",
          coors: [113.6389, 34.8194],
        },
      ],
    };
  },
  mounted() {
    this.init();
    this.addFeature();
  },
  beforeDestroy() {
    if (this.blinkInstance) {
      this.blinkInstance.destroy();
    }
  },
  methods: {
    init() {
      this.source = new VectorSource();
      this.map.addLayer(
        new VectorLayer({
          source: this.source,
          style: new Style({
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({
                color: "#409eff",
              }),
            }),
            stroke: new Stroke({
              color: "#409eff",
              width: 3,
            }),
          }),
        })
      );
      this.blinkInstance = new BlinkAnimation(this.map);
    },
    addFeature() {
      const features = this.tableData
        .map((d) => {
          const { type, coors } = d;
          let geometry = null;
          if (type === "point") {
            geometry = new Point(coors);
          } else if (type === "line") {
            geometry = new LineString(coors);
          }
          return geometry ? new Feature({ geometry }) : null;
        })
        .filter((ele) => Boolean(ele)); //筛选出null值
      this.source.addFeatures(features);
    },
    //单击行
    rowClick(row) {
      const { id, type, coors } = row;
      this.blinkInstance.add(type, coors, id, true);
      this.blinkInstance.blink(type);
    },
    //删除(当前点击行对应的要素)闪烁
    handleDeleteBlink({ id }) {
      this.blinkInstance.removeBlinkById(id);
    },
    //获取要素类型
    getTypeName(type) {
      let name = "";
      switch (type) {
        case "point":
          name = "点";
          break;
        case "line":
          name = "线";
          break;
      }
      return name;
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  position: absolute;
  top: 60px;
  right: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  z-index: 9;
}

/**更改选中后的背景色 */
::v-deep .el-table__body tr.current-row > td {
  background-color: #e6a23c;
}

/**更改鼠标悬浮后的背景色 */
::v-deep .el-table__body tr:hover > td {
  background-color: #e6a23c !important;
}
</style>
