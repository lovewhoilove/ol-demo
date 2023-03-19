import { get as getProjection } from 'ol/proj';
import { getTopLeft, getWidth } from 'ol/extent';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTSSource from 'ol/source/WMTS';
import { Tile as TileLayer, Group as LayerGroup } from 'ol/layer';

export default class Tianditu {
    #baseUrl = 'http://t{0-7}.tianditu.gov.cn/';
    #tk = 'df5812a6b02d97c7a611b36343deb204';
    #sourceType = {
        '矢量底图': 'vec',
        '矢量注记': 'cva',
        '影像底图': 'img',
        '影像注记': 'cia',
        '地形晕渲': 'ter',
        '地形注记': 'cta',
        '全球境界': 'ibo',
    };
    #sourceGroupType = {
        '矢量组': ['矢量底图', '矢量注记'],
        '影像组': ['影像底图', '影像注记'],
        '地形组': ['地形晕渲', '地形注记'],
    }
    #projectionType = {
        '经纬度投影': 'c',
        '球面墨卡托投影': 'w',
    };
    #format = 'tiles';

    /**
     * 创建天地图图层
     * @param {string} srcType 数据源类型
     * @param {boolean} visible 图层的可见性
     * @returns 图层对象
     */
    createWMTSLayer(srcType, visible) {
        const source = this.createWMTSSource(srcType);
        const typeName = this.#sourceType[srcType];
        return new TileLayer({
            source,
            visible,
            properties: {
                name: typeName
            }
        });
    }

    /**
     * 创建天地图数据源对象
     * @param {string} srcType 
     * @returns 数据源对象
     */
    createWMTSSource(srcType) {
        const layer = this.#sourceType[srcType];
        const matrixSet = this.#projectionType['球面墨卡托投影'];
        const url = `${this.#baseUrl}${layer}_${matrixSet}/wmts?tk=${this.#tk}`;
        const projection = getProjection('EPSG:3857');
        const tileGrid = createWMTSTileGrid(projection);
        return new WMTSSource({
            url,
            layer,
            tileGrid,
            matrixSet,
            projection,
            format: this.#format,
            style: 'default',
        });
    }

    /**
     * 创建天地图同类型的图层组
     * @param {string} srcGroupType 数据源组类型
     * @param {boolean} visible 可见性
     * @returns 返回同类型的图层组对象
     */
    createWMTSLayerGroup(srcGroupType, visible) {
        const layers = this.#sourceGroupType[srcGroupType].map(srcType => {
            return this.createWMTSLayer(srcType);
        });

        return new LayerGroup({
            layers,
            visible,
            properties: {
                name: srcGroupType
            }
        });
    }

    /**
     * 返回同类型的数据源组
     * @param {string} srcGroupType 数据源组类型
     * @returns 数据源对象组成的数组对象
     */
    createWMTSSourceGroup(srcGroupType) {
        return this.#sourceGroupType[srcGroupType].map(srcType => {
            return this.createWMTSSource(srcType);
        });
    }

    /**
     * 根据数据源组类型创建数据源组图层对象
     * @param {Array} srcGroup 同类型数据源组成的数组
     * @param {boolean} visible 图层组的可见性
     * @param {string} srcGroupType 数据源组类型
     * @returns 图层组对象
     */
    createWMTSLayerGroupBySourceGroup(srcGroup, visible, srcGroupType) {
        const layers = srcGroup.map(src => {
            return new TileLayer({
                source: src,
            });
        });

        return new LayerGroup({
            layers,
            visible,
            properties: {
                name: srcGroupType
            }
        });
    }
}

/**
 * 创建瓦片网格模式-私有方法
 * @param {Object} projection 投影对象
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