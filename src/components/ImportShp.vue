<template>
  <div class="wrap">
    <el-card class="import-shp">
      <!-- <el-upload ref="upload" accept=".shp" action="" :limit="1" :file-list="fileList" :on-change="handleFileChange"
        :auto-upload="false" :multiple="true">
        <el-button slot="trigger" size="small" type="primary">上传文件</el-button>
      </el-upload> -->
      <el-button v-loading="loading" type="success" @click="readOnlineData">加载在线数据</el-button>
    </el-card>
  </div>
</template>

<script>
import { GeoJSON } from 'ol/format';
import * as shapefile from 'shapefile';
import { getLayerByName } from '@/utils/layerUtils';
import { Style, Fill, Stroke } from 'ol/style';

export default {
  name: 'ImportShp',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    }
  },
  data() {
    return {
      fileList: [],
      loading: false,
    };
  },
  methods: {
    handleFileChange(file, fileList) {
      const that = this;
      const { name, raw } = file;
      const geojsonFormat = new GeoJSON();

      const reader = new FileReader();
      reader.readAsArrayBuffer(raw);

      reader.onload = (evt) => {
        const arr = [];
        shapefile.open(evt.target.result)
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
      }
    },
    readOnlineData() {
      this.loading = true;
      const that = this;
      const geojsonFormat = new GeoJSON();
      const arr = [];
      shapefile.open('https://cdn.rawgit.com/matplotlib/basemap/v1.1.0/lib/mpl_toolkits/basemap/data/UScounties.shp')
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
    showData(data) {
      const source = getLayerByName(this.map, 'importLayer').getSource();
      source.addFeatures([...data]);
      this.map.getView().fit(source.getExtent(), {
        padding: [50, 0, 50, 0]
      });
      this.$message.success('读取成功！');
      this.loading = false;
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
    height: 140px;
    z-index: 3;
    opacity: 0.95;
  }

  // 自定义elemnt ui卡片外填充
  ::v-deep .el-card__body,
  .el-main {
    padding: 10px;
  }
}
</style>