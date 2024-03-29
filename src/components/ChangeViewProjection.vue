<template>
  <div class="wrap" v-loading="loading">
    <el-upload ref="upload" accept=".shp,.dbf,.cpg,.prj" action="" :limit="4" :file-list="[]" :auto-upload="false"
      :multiple="true" :on-change="handleFileChange">
      <el-button plain slot="trigger" size="small" type="primary">添加矢量数据</el-button>
      <div slot="tip" class="el-upload__tip">需同时上传shp、dbf、cpg、prj格式的文件,且一次最多添加 4 个文件</div>
      <el-button size="small" type="primary" @click="readData" style="margin-left: 10px;">读取矢量数据</el-button>
    </el-upload>
    <div v-show="needAssignProj">
      <el-divider></el-divider>
      <span style="font-size: 13px;">指定坐标系：</span>
      <el-select v-model="assignProj" placeholder="请选择" @change="handleProjChange">
        <el-option v-for="item in projOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <span style="font-size: 13px;">查找中央经线：</span>
      <el-checkbox v-model="showGraticule" @change="handleGraticuleChange" style="margin-bottom: 10px;">
        <span style="font-size: 13px;">经纬网</span>
      </el-checkbox>
    </div>
    <span ref="projInfo" class="proj-info"></span>
    <div class="info" ref="info"></div>
  </div>
</template>

<script>
import View from 'ol/View';
import Graticule from 'ol/layer/Graticule';
import { GeoJSON } from 'ol/format';
import * as shapefile from 'shapefile';
import { getLayerByName } from '@/utils/layerUtils';
import { Style, Fill, Stroke } from 'ol/style';
import getEPSGCode from 'get-epsg-code'
import proj4 from 'proj4';
import { applyTransform } from 'ol/extent.js';
import { get as getProjection, getTransform } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';

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
    this.currentFeature = null;

    this.graticule = null;
    return {
      loading: false,
      showGraticule: false,
      needAssignProj: false,
      assignProj: '',
      // 在epsg.io可输入“CGCS2000 3 degree”进行模糊搜索
      projOptions: [
        { value: '4326', label: 'WGS 84(EPSG:4326)' },
        { value: '3857', label: 'Web墨卡托投影(EPSG:3857)' },
        { value: '4490', label: 'CGCS2000(地理)' },
        { value: '4479', label: 'CGCS2000(平面)' },
        { value: '4534', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 75E' },
        { value: '4535', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 78E' },
        { value: '4536', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 81E' },
        { value: '4537', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 84E' },
        { value: '4538', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 87E' },
        { value: '4539', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 90E' },
        { value: '4540', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 93E' },
        { value: '4541', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 96E' },
        { value: '4542', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 99E' },
        { value: '4543', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 102E' },
        { value: '4544', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 105E' },
        { value: '4545', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 108E' },
        { value: '4546', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 111E' },
        { value: '4547', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 114E' },
        { value: '4548', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 117E' },
        { value: '4549', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 120E' },
        { value: '4550', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 123E' },
        { value: '4551', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 126E' },
        { value: '4552', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 129E' },
        { value: '4553', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 132E' },
        { value: '4554', label: 'CGCS2000 / 3-degree Gauss-Kruger CM 135E' },
      ],
    };
  },
  mounted() {
    this.graticule = new Graticule({
      strokeStyle: new Stroke({
        color: 'rgba(255,120,0,0.9)',
        width: 2,
        lineDash: [0.5, 4],
      }),
      showLabels: true,
      visible: false,
      wrapX: false,
      lonLabelPosition: 0.05,
      intervals: [30, 3],
      maxLines: 200,
    });
    this.map.addLayer(this.graticule);
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
          source.read().then(function next(result) {
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

            //3.将json数据解析为要素对象
            const feature = geojsonFormat.readFeature(value);

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
          const code = getEPSGCode(data);
          if (code) {
            this.handleProjChange(code);
          } else {
            this.needAssignProj = true;
          }
        }
      }).catch(err => this.$modal.msgError(err.stack));
    },
    handleProjChange(val) {
      if (val) {
        this.getEPSGInfo(val).then(res => {
          const code = res['code'];
          const name = res['name'];
          const proj4def = res['wkt'];
          const bbox = res['bbox'];
          if (
            code &&
            code.length > 0 &&
            proj4def &&
            proj4def.length > 0 &&
            bbox &&
            bbox.length == 4
          ) {
            this.setViewProjection(code, name, proj4def, bbox);
          }
        });
      }
    },
    //更改地图视图投影
    setViewProjection(code, name, proj4def, bbox) {
      if (code === null || name === null || proj4def === null || bbox === null) {
        if (!this.needAssignProj) this.needAssignProj = true;
        this.$refs.projInfo.innerText = '无法读取数据的坐标系，将使用 EPSG:4326 坐标系';
        this.map.setView(
          new View({
            center: [113.64, 34.72],
            zoom: 10,
            projection: 'EPSG:4326',
          })
        );
        return;
      }
      this.$refs.projInfo.innerText = '数据的坐标系：' + name + '(EPSG:' + code + ')';
      const newProjCode = 'EPSG:' + code;
      proj4.defs(newProjCode, proj4def);
      register(proj4);
      const newProj = getProjection(newProjCode);
      const fLL = getTransform('EPSG:4326', newProj);

      let worldExtent = [bbox[1], bbox[2], bbox[3], bbox[0]];
      newProj.setWorldExtent(worldExtent);

      // 投影范围的近似计算，检查世界范围是否跨越日期变更线
      if (bbox[1] > bbox[3]) {
        worldExtent = [bbox[1], bbox[2], bbox[3] + 360, bbox[0]];
      }
      const extent = applyTransform(worldExtent, fLL, undefined, 8);
      newProj.setExtent(extent);
      const newView = new View({
        projection: newProj,
      });
      this.map.setView(newView);
      newView.fit(extent);
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
      this.$refs.projInfo.innerText = '';
      this.$refs.upload.clearFiles();//清除已上传的文件列表
      this.needAssignProj = false;
    },
    handleGraticuleChange(checked) {
      this.graticule.setVisible(checked);
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  display: inline-block;
  height: auto;
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 3;
  background-color: #ffffffee;
  box-shadow: 2px 2px 10px 2px black;
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
