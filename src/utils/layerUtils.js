import Map from 'ol/Map.js';
import BaseLayer from 'ol/layer/Base';

/**
 * 通过图层名字属性来获得图层
 * @param {Map} map 图层名称
 * @param {string} name 图层名称
 * @returns {BaseLayer|undefined} 图层
 */
export function getLayerByName(map, name) {
  const result = map
    .getLayers()
    .getArray()
    .filter((lyr) => {
      return lyr.get('name') === name;
    });
  return result.length ? result[0] : undefined;
}