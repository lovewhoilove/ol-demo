<template>
  <div class="wrap">
    <el-button-group>
      <el-button type="primary" @click="switchPrev">上一视图</el-button>
      <el-button type="primary" @click="switchNext">下一视图</el-button>
      <el-button type="primary" @click="pointNorth">指北</el-button>
    </el-button-group>
  </div>
</template>

<script>
import Collection from 'ol/Collection.js';
import { unlistenByKey } from 'ol/events';

const MAX_LENGTH = 5;

export default {
  name: 'ViewSwitch',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    this.viewStates = new Collection();
    this.currentStateIndex = -1;
    this.moveEndEvtKey = null;
    this.pointerDragOrWheelEvtKey = null;
    return {};
  },
  mounted() {
    this.bindMapMoveEndEvt();
  },
  methods: {
    //给地图绑定移动结束事件
    bindMapMoveEndEvt() {
      this.moveEndEvtKey = this.map.on('moveend', this.saveViewState);
    },
    //保存视图状态
    saveViewState(evt) {
      if ((this.viewStates.getLength() - 1) === MAX_LENGTH) {//若超限，则删除第一个视图状态
        this.viewStates.removeAt(0);
        this.currentStateIndex--;
      }
      const map = evt.map;
      const mapView = map.getView();
      const center = mapView.getCenter();
      const zoom = mapView.getZoom();
      const rotation = mapView.getRotation();
      const viewState = { idx: this.currentStateIndex, center, zoom, rotation };
      this.viewStates.insertAt(this.currentStateIndex + 1, viewState);
      localStorage.setItem('viewStates', JSON.stringify(this.viewStates.getArray()));
      this.currentStateIndex++;
      // console.log('保存', this.currentStateIndex);
    },
    //切换为上一视图
    switchPrev() {
      // console.log('left', this.currentStateIndex);
      if (this.currentStateIndex === 0) {
        this.$message.error('已到第一个视图');
      }
      if (this.currentStateIndex > 0) {
        this.restoreViewState(this.currentStateIndex - 1);
        this.currentStateIndex--;
      }
    },
    //切换为下一视图
    switchNext() {
      // console.log('right', this.currentStateIndex);
      if (this.currentStateIndex === (this.viewStates.getLength() - 1)) {
        this.$message.error('已到最后一个视图');
      }
      if (this.currentStateIndex < this.viewStates.getLength() - 1) {
        this.restoreViewState(this.currentStateIndex + 1);
        this.currentStateIndex++;
      }
    },
    //恢复为某一视图状态
    restoreViewState(index) {
      unlistenByKey(this.moveEndEvtKey);
      const viewState = this.viewStates.getArray()[index];
      const { center, zoom, rotation } = viewState;
      this.map.getView().animate({ center, zoom, rotation, duration: 300 });
      unlistenByKey(this.pointerDragOrWheelEvtKey);
      this.pointerDragOrWheelEvtKey = this.map.once(['pointerdrag', 'wheel'], () => {
        this.bindMapMoveEndEvt();
      });
      //考虑到点击指北针等指北操作也要激活视图存储
      unlistenByKey(this.pointNorthEvtKey);
      this.pointNorthEvtKey = this.map.getView().once('change:rotation', (e) => {
        const rotation = e.target.getRotation();
        if (!rotation) {
          this.bindMapMoveEndEvt();
        }
      });
    },
    //指北
    pointNorth() {
      const view = this.map?.getView();
      if (view && view.getRotation()) {
        view.setRotation(0);
      }
    },
  },
  beforeDestroy() {
    unlistenByKey(this.moveEndEvtKey);
    unlistenByKey(this.pointerDragOrWheelEvtKey);
    unlistenByKey(this.pointNorthEvtKey);
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  position: absolute;
  right: 10px;
  top: 60px;
  box-shadow: 2px 2px 10px 2px black;
  border: transparent;
  border-radius: 4px;
}
</style>
