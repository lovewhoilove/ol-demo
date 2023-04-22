import { ImageWMS, TileWMS, Vector as VectorSource } from 'ol/source';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { getTopLeft, getWidth } from 'ol/extent';
import { get as getProjection } from 'ol/proj';
import { GeoJSON } from 'ol/format';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';//基于视图范围和分辨率的特征加载策略函数
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';

/**
 * @Description:加载地图服务
 */
export default class LoadService {

  /**
   * 创建WMS图层：若要缓存，则会创建瓦片wms图层，否则会创建图像wms图层。
   * 瓦片可以被缓存，因此浏览器不会重新获取已经查看过的区域的数据，但是
   * 在服务器不知道是瓦片的情况下，wms服务可能存在重复标签的问题，这时图像wms将会呈现更好的效果。
   * （译自官网：https://openlayers.org/en/latest/examples/wms-tiled.html）
   * @param {Array} options.extent 图层渲染的边界范围，图层不会在此范围之外渲染
   * @param {string} options.url 服务的请求地址
   * @param {string} options.workspace 图层所在的工作空间
   * @param {string} options.lyrName 图层名称
   * @param {number} options.ratio 比率：1表示图像请求范围是地图视图窗口的大小，2意味着是地图视图窗口的大小的2倍
   * @param {string} options.serverType 服务类型：'mapserver', 'geoserver', 'carmentaserver', or 'qgis'
   * @param {boolean} options.cacheable 若缓存，则创建，否则创建TileWMS数据源，否则创建ImageWMS数据源
   * @return {ImageLayer|TileLayer} wms图层
   */
  getWMSLayer(options) {
    let {
      extent, url, workspace, lyrName, ratio, serverType, cacheable
    } = options;
    ratio = ratio ? ratio : 1.5;
    serverType = serverType ? serverType : 'geoserver';
    const crossOrigin = 'anonymous';
    let params = { 'LAYERS': `${workspace}:${lyrName}` };
    params = cacheable ? Object.assign({}, params, { 'TILED': true }) : params;
    let sourceOptions = {
      url,
      params,
      // ratio,
      serverType,
      crossOrigin
    };
    //默认情况下，WMS瓦片会在180°子午线上重复使用，这里可以通过将wrapX选项设置为false来禁用此行为。
    sourceOptions = cacheable ? Object.assign({}, sourceOptions, { wrapX: false }) : sourceOptions;
    const source = cacheable ? new TileWMS(sourceOptions) : new ImageWMS(sourceOptions);
    const layerOptions = {
      extent,
      source,
      properties: {
        name: lyrName
      }
    };
    const layer = cacheable ? new TileLayer(layerOptions) : new ImageLayer(layerOptions);
    return layer;
  }

  /**
   * 创建WMTS图层
   * @param {string} options.url 服务请求地址
   * @param {string} options.layer 图层名称
   * @param {string} options.matrixSet 矩阵集合的名称
   * @param {string} options.format 图片格式，默认是'image/jpeg'
   * @param {number} options.level 缩放层级
   * @param {string} options.style WMTS中的样式名称
   * @param {number} options.opacity 图层的透明度,范围0-1
   * @param {Object.<string, *> | undefined} options.properties 任意可观测的属性
   * @return {TileLayer} WMTS图层
   */
  getWMTSLayer(options) {
    let {
      url, layer, level, matrixSet, requestEncoding, format, style, opacity
    } = options;
    //创建投影对象
    const projection = getProjection('EPSG:4326');
    //获取投影范围
    const projExtent = projection.getExtent();
    format = format ? format : 'image/jpeg';
    style = style ? style : 'default';
    opacity = opacity ? opacity : 1;
    //获取投影范围的宽度
    const width = getWidth(projExtent);
    //获取投影范围的原点
    const origin = getTopLeft(projExtent);
    level = level ? level : 18;
    const crossOrigin = 'anonymous';
    const resolutions = new Array(level);
    const matrixIds = new Array(level);
    for (let z = 0; z < level; ++z) {
      // 为WMTS生成resolutions数组和matrixIds数组
      resolutions[z] = width / (256 * Math.pow(2, z));
      matrixIds[z] = z;
    }
    const tileGrid = new WMTSTileGrid({
      origin,
      resolutions,
      matrixIds,
    });
    const source = new WMTS({
      url,
      layer,
      matrixSet,
      tileGrid,
      requestEncoding,
      format,
      style,
      opacity,
      projection,
      crossOrigin,
      wrapX: true,
    });
    const wmtsLayer = new TileLayer({
      source,
      properties: { id: `${layer}` },
    });
    return wmtsLayer;
  }

  /**
   * 创建WFS图层
   * @param {string} options.url 服务请求地址
   * @param {string} options.workspace 图层所在的工作空间
   * @param {string} options.lyrName 图层名称
   * @param {string} options.proj 投影，例如：'EPSG:4326'
   * @param {Object} options.style 图层的自定义样式，如果没有设置(值为undefined)，将使用默认样式。
   * 样式设置可参考：https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html
   * @return {VectorLayer} 矢量图层
   */
  getWFSLayer(options) {
    const format = new GeoJSON();
    const strategy = bboxStrategy;//自定义策略请参考：https://openlayers.org/en/latest/examples/vector-wfs-geographic.html
    let { url, workspace, lyrName, proj, style } = options;
    const service = 'WFS';
    const version = '1.1.0';
    const request = 'GetFeature';
    const typename = `${workspace}:${lyrName}`;
    const outputFormat = 'application/json';
    const srsname = proj ? proj : 'EPSG:4326';
    style = style ? style : undefined;
    const urlParams = {
      service,
      version,
      request,
      typename,
      outputFormat,
      srsname
    }
    /**
     * 
     * @param {Array} extent 数据的四至范围
     * @param {number} resolution 分辨率
     * @param {Object} projObj 投影对象
     * @param {Object} params 要拼接的url各项参数
     * @return {string} 拼接好的请求链接字符串
     */
    const getUrl = (extent, resolution, projObj, params) => {
      let paramsStr = '';
      for (let [k, v] of Object.entries(params)) {
        paramsStr += `${k}=${v}&`;
      }
      paramsStr = `${url}?${paramsStr}bbox=${extent.join(',')},${proj}`;
      return (paramsStr);
    }
    const vectorSource = new VectorSource({
      format,
      url: (extent, resolution, projection) => {
        return getUrl(extent, resolution, projection, urlParams)
      },
      strategy,
    });
    const wfsLayer = new VectorLayer({
      source: vectorSource,
      style,
    });
    return wfsLayer;
  }

  /**
   * 解析GeoJSON数据
   * @param {string} options.url 请求地址
   * @param {string} options.color 颜色
   * @param {number} options.type 图层类型
   * @param {string} options.icon 图标
   * @return {VectorLayer} WMTS图层
   */
  parseGeoJSON(options) {
    let { url, color, type, icon } = options;
    color = color ? color : undefined;

    const styles = {
      'MultiLineString': new Style({
        stroke: new Stroke({
          color,
          width: 2,
        }),
      }),
    };

    const styleFunction = function (feature) {
      console.log(feature.getGeometry().getType());
      return styles[feature.getGeometry().getType()];
    };
    const vectorSource = new VectorSource({
      url,
      format: new GeoJSON(),
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });
    return vectorLayer;
  }
}
