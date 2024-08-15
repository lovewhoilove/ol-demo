import { XYZ } from "ol/source";
import { Tile as TileLayer, Group as LayerGroup } from "ol/layer";
import { get as getProjection } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";

export default class TDT {
  #baseUrl = "http://t{0-7}.tianditu.gov.cn/";
  #tk = "75890d81e1df2d26c95eb742f5b49b0b";
  #sourceGroupType = {
    vec: ["vec", "cva"], // 矢量底图
    img: ["img", "cia"], // 影像底图
  };

  /**
   * 创建指定类型的图层组
   *
   * @param type 图层组类型
   * @param visible 是否可见
   * @returns 返回创建的图层组对象
   */
  createTileLayerGroup(type, visible) {
    const layers = this.#sourceGroupType[type].map((st) => {
      return this.createTileLayer(st);
    });

    return new LayerGroup({
      layers,
      visible,
      properties: {
        name: type,
      },
    });
  }

  /**
   * 创建一个瓦片图层
   *
   * @param type 瓦片图层类型
   * @returns 返回一个新的瓦片图层实例
   */
  createTileLayer(type) {
    return new TileLayer({
      source: this.createXYZSource(type),
    });
  }

  /**
   * 创建XYZ数据源
   *
   * @param type 数据类型
   * @returns 返回XYZ数据源实例
   */
  createXYZSource(type) {
    return new XYZ({
      url:
        this.#baseUrl +
        type +
        "_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" +
        type +
        "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
        this.#tk,
      tileGrid: createTileGrid(getProjection("EPSG:3857")),
    });
  }
}

/**
 * 创建瓦片网格模式
 * @param {Object} projection 投影对象
 * @returns 网格模式对象
 */
function createTileGrid(projection) {
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