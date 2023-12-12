<template>
  <div class="wrap">
    <el-card class="import-shp">
      <el-upload ref="upload" accept=".shp,.dbf" action="" :limit="2" :file-list="[]" :auto-upload="false"
        :multiple="true" :on-change="handleFileChange">
        <el-button slot="trigger" size="small" type="primary">加载矢量文件</el-button>
      </el-upload>
      <el-button @click="readData" type="success">读取并加载至地图</el-button>
    </el-card>
    <div class="info" ref="info"></div>
  </div>
</template>

<script>
import { GeoJSON } from 'ol/format';
import * as shapefile from 'shapefile';
import { getLayerByName } from '@/utils/layerUtils';
import { Style, Fill, Stroke } from 'ol/style';

export default {
  name: 'ImportShpAndDbf',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    }
  },
  data() {
    this.shapeFile = null;
    this.dbfFile = null;
    this.currentFeature = null;
    return {};
  },
  methods: {
    readData() {
      const that = this;
      const geojsonFormat = new GeoJSON();
      const arr = [];

      shapefile.open(this.shapeFile, this.dbfFile, { encoding: 'utf-8' })
        .then((source) => {
          source.read().then(function log(result) {
            const { done, value } = result;
            if (done) {// 读取完毕
              that.showData(arr);
              return;
            }
            const feature = geojsonFormat.readFeature(value);
            const color = that.getRandomColor();
            const style = that.createStyle(color);
            console.log(feature);
            feature.setStyle(style);
            arr.push(feature);
            return source.read().then(log);
          });
        })
        .catch((error) => that.$message.error(error.stack));
    },
    handleFileChange(file, fileList) {
      this.map.un('pointermove', this.pointerMoveEvent);
      fileList.forEach(f => {
        const { name } = f;
        const fileExtension = name.slice(-3);
        this.openFile(f).then(data => {
          if (fileExtension === 'shp') {
            this.shapeFile = data;
          } else if (fileExtension === 'dbf') {
            this.dbfFile = data;
          }
        }).catch((error) => this.$message.error(error.stack));
      });
    },
    openFile(file) {
      const { raw } = file;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(raw);
        reader.onload = (evt) => {
          resolve(evt.target.result);
        }
        reader.onerror = reject;
      });
    },
    showData(data) {
      const source = getLayerByName(this.map, 'importLayer').getSource();
      source.addFeatures([...data]);
      this.map.getView().fit(source.getExtent(), {
        padding: [50, 0, 50, 0]
      });
      this.$message.success('读取成功！');
      this.map.on('pointermove', this.pointerMoveEvent);
    },
    getRandomColor() {
      return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
    },
    createStyle(color) {
      return new Style({
        stroke: new Stroke({
          color,
          lineDash: [10, 10]
        }),
        fill: new Fill({
          color: color + '88'
        }),
      })
    },
    pointerMoveEvent(evt) {
      if (evt.dragging) {
        this.$refs.info.style.visibility = 'hidden';
        this.currentFeature = undefined;
        return;
      }
      const pixel = this.map.getEventPixel(evt.originalEvent);
      this.displayFeatureInfo(pixel, evt.originalEvent.target);
    },
    displayFeatureInfo(pixel, target) {
      // closest方法参考文档：https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
      const feature = target.closest('.ol-control')
        ? undefined
        : this.map.forEachFeatureAtPixel(pixel, feature => {
          return feature;
        });
      if (feature) {
        this.$refs.info.style.left = pixel[0] + 'px';
        this.$refs.info.style.top = pixel[1] + 'px';
        if (feature !== this.currentFeature) {
          this.$refs.info.style.visibility = 'visible';
          this.$refs.info.innerText = feature.get('省');
        }
      } else {
        this.$refs.info.style.visibility = 'hidden';
      }
      this.currentFeature = feature;
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  .import-shp {
    position: absolute;
    right: 10px;
    top: 50px;
    width: 270px;
    height: 180px;
    z-index: 3;
    opacity: 0.95;
  }

  .info {
    position: absolute;
    display: inline-block;
    height: auto;
    width: auto;
    z-index: 100;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    left: 50%;
    transform: translateX(3%);
    visibility: hidden;
    pointer-events: none;
  }

  // 自定义elemnt ui卡片外填充
  ::v-deep .el-card__body,
  .el-main {
    padding: 10px;
  }

  ::v-deep .el-upload {
    margin-bottom: 20px;
  }
}
</style>