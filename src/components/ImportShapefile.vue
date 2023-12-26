<template>
  <div class="wrap" v-loading="loading">
    <el-upload ref="upload" accept=".shp,.dbf,.cpg,.prj" action="" :limit="4" :file-list="[]"
      :auto-upload="false" :multiple="true" :on-change="handleFileChange">
      <el-button plain slot="trigger" size="small" type="primary">添加矢量数据</el-button>
      <div slot="tip" class="el-upload__tip">需同时上传shp、dbf、cpg、prj格式的文件,且一次最多添加 4 个文件</div>
      <el-button size="small" type="primary" @click="readData" style="margin-left: 10px;">读取矢量数据</el-button>
    </el-upload>
    <span ref="projInfo" class="proj-info"></span>
    <div class="info" ref="info"></div>
  </div>
</template>

<script>
import { GeoJSON } from 'ol/format';
import * as shapefile from 'shapefile';
import { getLayerByName } from '@/utils/layerUtils';
import { Style, Fill, Stroke } from 'ol/style';
import getEPSGCode from 'get-epsg-code'
import { reproject } from 'reproject';

export default {
  name: 'ImportShapefile',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    }
  },
  data() {
    this.shapeFile = null;
    this.dbfFile = null;
    this.encoding = null;
    this.fromCode = null;
    this.fromProj = null;
    this.toProj = null;
    this.currentFeature = null;
    return {
      loading: false,
    };
  },
  mounted() {
    const code = this.map?.getView()?.getProjection()?.getCode()?.split(':')?.[1];
    code && this.getEPSGInfo(code).then(res => {
      this.toProj = res['proj4'];
      // console.log(this.toProj);
    });
  },
  methods: {
    readData() {
      const that = this;
      const geojsonFormat = new GeoJSON();
      const arr = [];

      const encoding = that.encoding ? that.encoding : 'utf-8';
      that.loading = true;
      shapefile.open(that.shapeFile, that.dbfFile, { encoding })
        .then((source) => {
          source.read().then(async function next(result) {
            let { done, value } = result;
            if (done) {// 读取完毕
              that.showData(arr);
              that.resetDataFile();
              that.loading = false;
              that.$message.success('加载完毕！');
              return;
            }
            //1.若属性表中存在多余的空字符则需要去除
            that.removeTrailingSpace(value.properties, '\u0000');//方法1：创建要素前去除属性值末尾多余空格
            //2.若导入数据不为WGS84坐标系，则需要坐标转换
            let projectedJson
            if (that.fromCode !== '4326') {
              projectedJson = await reproject(value, that.fromProj, that.toProj);
              // console.log(projectedJson);
            }
            //3.将json数据解析为要素对象
            const feature = geojsonFormat.readFeature(that.fromCode !== '4326' ? projectedJson : value);

            // that.removeTrailingSpace(props, '\x00');//方法2：创建要素后去除属性值末尾多余空格
            // feature.setProperties(props);

            //4.给每个要素设置样式
            const color = that.getRandomColor();
            const style = that.createStyle(color);
            feature.setStyle(style);

            arr.push(feature);
            return source.read().then(next);
          })
            .catch((error) => that.$message.error(error.stack));
        });
    },
    //去除一个对象中某个属性的值的末尾多余的字符
    removeTrailingSpace(obj, replaceStr) {
      Object.entries(obj).forEach(item => {
        const [k, v] = item;
        if (v && typeof v === 'string') {
          if (v.indexOf(replaceStr)) {
            obj[k] = v.replaceAll(replaceStr, '');
          }
        }
      });
    },
    //打开上传的各个文件
    handleFileChange(file) {
      const { name } = file;
      const fileExtension = this.getFileExtension(name);
      this.openFile(file).then(data => {
        if (fileExtension === 'shp') {
          this.shapeFile = data;
        } else if (fileExtension === 'dbf') {
          this.dbfFile = data;
        } else if (fileExtension === 'cpg') {
          this.encoding = data;
        } else if (fileExtension === 'prj') {
          this.fromCode = getEPSGCode(data);
          this.getEPSGInfo(this.fromCode).then(res => {
            this.fromProj = res['proj4'];
            this.$refs.projInfo.innerText = '数据的坐标系：' + res['name'] + '(EPSG:' + res.code + ')';
          });
        }
      }).catch(err => this.$modal.msgError(err.stack));
    },
    getEPSGInfo(query) {
      return new Promise(resolve => {
        fetch('https://epsg.io/?format=json&q=' + query)
          .then(res1 => res1.json())
          .then(res2 => resolve(res2['results'][0]))
          .catch(err => {
            this.$message.error(err.stack)
          });
      });
    },
    //打开并读取文件内容
    openFile(file) {
      const { name, raw } = file;
      const fileExtension = this.getFileExtension(name);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        if (['cpg', 'prj'].includes(fileExtension)) {
          reader.readAsText(raw);
        } else {
          reader.readAsArrayBuffer(raw);
        }
        reader.onload = (evt) => {
          resolve(evt.target.result);
        }
        reader.onerror = reject;
      });
    },
    //获取文件扩展名
    getFileExtension(fileName) {
      return fileName.slice(-3);
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
          color: color + '66'
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
          this.$refs.info.innerText = feature.get('_1');
        }
      } else {
        this.$refs.info.style.visibility = 'hidden';
      }
      this.currentFeature = feature;
    },
    //重置
    resetDataFile() {
      this.shapeFile = null;
      this.dbfFile = null;
      this.encoding = null;
      this.fromProj = null;
      this.fromCode = null;
      this.$refs.projInfo.innerText = '';
      this.$refs.upload.clearFiles();//清除已上传的文件列表
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 3;
  background-color: #ffffffee;
  box-shadow: 2px 2px 10px 2px black;
  display: inline-block;
  border-radius: 4px;
  padding: 8px;

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

  .proj-info {
    font-size: 12px;
    color: red;
  }

  ::v-deep .el-upload {
    margin-bottom: 10px;

    &__tip {
      margin-bottom: 10px;
    }
  }
}
</style>
