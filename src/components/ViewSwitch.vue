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
  created() {
    const viewStatesStorage = JSON.parse(localStorage.getItem('viewStates')) || [];
    this.viewStates.extend(viewStatesStorage);
  },
  mounted() {
    const length = this.viewStates.getLength();
    if (length > 0) {
      const currentIdx = Number(localStorage.getItem('activeIndex'));
      this.restoreViewState(currentIdx);
      this.currentStateIndex = currentIdx;
      this.map.once('rendercomplete', this.bindMapMoveEndEvt);
    } else {
      this.bindMapMoveEndEvt();
    }
  },
  methods: {
    //给地图绑定移动结束事件
    bindMapMoveEndEvt() {
      this.moveEndEvtKey = this.map.on('moveend', this.saveViewState);
    },
    //保存视图状态
    saveViewState() {
      if ((this.viewStates.getLength() - 1) === MAX_LENGTH) {//若超限，则删除第一个视图状态
        this.viewStates.removeAt(0);
        this.currentStateIndex--;
      }
      const viewState = this.getMapViewState();
      this.viewStates.insertAt(this.currentStateIndex + 1, viewState);
      localStorage.setItem('viewStates', JSON.stringify(this.viewStates.getArray()));
      this.currentStateIndex++;
      localStorage.setItem('activeIndex', this.currentStateIndex);
    },
    getArrIndex(arr, item) {
      return arr.indexOf(item);
    },
    //获取视图的center, zoom, rotation
    getMapViewState() {
      const mapView = this.map.getView();
      const center = mapView.getCenter();
      const zoom = mapView.getZoom();
      const rotation = mapView.getRotation();
      return { center, zoom, rotation };
    },
    //切换为上一视图
    switchPrev() {
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
      this.map.getView().animate({ center, zoom, rotation, duration: 500 });
      localStorage.setItem('activeIndex', index);
      //在点击视图切换按钮之后记得绑定鼠标拖拽或滚动滑动时打开地图移动事件
      unlistenByKey(this.pointerDragOrWheelEvtKey);
      this.pointerDragOrWheelEvtKey = this.map.once(['pointerdrag', 'wheel'], () => {
        this.bindMapMoveEndEvt();
      });
    },
    //指北
    pointNorth() {
      this.bindMapMoveEndEvt();
      const view = this.map?.getView();
      if (view && view.getRotation()) {
        view.setRotation(0);
      }
    },
  },
  beforeDestroy() {
    unlistenByKey(this.moveEndEvtKey);
    unlistenByKey(this.pointerDragOrWheelEvtKey);
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
