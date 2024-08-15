import { get as getProjection } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTSSource from "ol/source/WMTS";
import { Tile as TileLayer, Group as LayerGroup } from "ol/layer";

export default class Tianditu {
  #baseUrl = "http://t{0-7}.tianditu.gov.cn/";
  #tk = "75890d81e1df2d26c95eb742f5b49b0b";
  #grpType = {
    vec: ["vec", "cva"], // 矢量底图
    img: ["img", "cia"], // 影像底图
  };

  /**
   * 创建天地图切片数据源对象
   *
   * @param {string} type 数据类型
   * @param {string} themeColor 主题颜色
   * @returns 返回XYZ数据源实例
   */
  createWMTSSource(type, themeColor = "nomal") {
    const tileLoadFunction =
      themeColor === "normal"
        ? undefined
        : function (imageTile, src) {
            handleImageTile(imageTile, src, themeColor);
          };
    const url = `${this.#baseUrl}${type}_w/wmts?tk=${this.#tk}`;
    const projection = getProjection("EPSG:3857");
    const tileGrid = createWMTSTileGrid(projection);

    return new WMTSSource({
      url,
      layer: type,
      tileGrid,
      matrixSet: "w",
      projection,
      tileLoadFunction,
      format: "tiles",
      style: "default",
      crossOrigin: "anonymous",
    });
  }

  /**
   * 根据数据类型直接创建图层组对象
   * @param type 数据类型
   * @param visible 图层组可见性
   * @param themeColor 主题颜色
   * @returns 图层组对象
   */
  createLyrGrp(type, visible, themeColor = "normal") {
    const layers = this.#grpType[type]
      .map((gt) => this.createWMTSSource(gt, themeColor))
      .map((src) => {
        return new TileLayer({
          source: src,
        });
      });

    return new LayerGroup({
      layers,
      visible,
      properties: {
        name: type,
      },
    });
  }
}

/**
 * 创建瓦片网格模式
 *
 * @param projection 投影对象
 * @returns 网格模式对象
 */
function createWMTSTileGrid(projection) {
  const projExtent = projection.getExtent();
  const origin = getTopLeft(projExtent);
  const width = getWidth(projExtent);
  const resolutions = new Array(18);
  const matrixIds = new Array(18);
  for (let z = 0; z < 18; ++z) {
    resolutions[z] = width / (256 * Math.pow(2, z));
    matrixIds[z] = z;
  }
  return new WMTSTileGrid({
    origin,
    resolutions,
    matrixIds,
  });
}

/**
 * 按照地图的主题颜色处理地图瓦片
 * @param imageTile 地图瓦片对象
 * @param src 图片资源的URL
 * @param themeColor 主题颜色
 */
function handleImageTile(imageTile, src, themeColor) {
  const img = new Image();
  img.crossOrigin = "";
  img.src = src;
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    ctx.filter = getFilter(themeColor);
    ctx.drawImage(img, 0, 0);
    imageTile.getImage().src = canvas.toDataURL("image/png", 1);
  };
  img.onerror = function () {
    imageTile.getImage().src = undefined;
  };
}

/**
 * 通过颜色的名称获取对应的css filter
 * @param color 颜色名称
 * @returns css filter
 */
function getFilter(color) {
  let filter = "";
  switch (color) {
    case "deepBlue":
      filter =
        "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
      break;
    case "deepGreen":
      filter =
        "grayscale(98%) invert(100%) sepia(20%) hue-rotate(120deg) saturate(1600%) brightness(100%) contrast(90%)";
      break;
    case "lightBlue":
      filter =
        "invert(69%) sepia(55%) saturate(485%) hue-rotate(178deg) brightness(104%) contrast(96%)";
      break;
    case "grey":
      filter =
        "invert(86%) sepia(28%) saturate(648%) hue-rotate(61deg) brightness(96%) contrast(94%)";
      break;
    case "green":
      filter =
        "invert(77%) sepia(50%) saturate(350%) hue-rotate(64deg) brightness(91%) contrast(92%)";
      break;
    default:
      filter = "";
      break;
  }
  return filter;
}
