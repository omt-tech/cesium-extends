import { Viewer, ImageryLayer } from 'cesium';
import * as h337 from '@mars3d/heatmap.js';
import { BaseHeatmapConfiguration, DataPoint } from '@mars3d/heatmap.js';

type HeatMapDataItem = {
    pos: number[];
    value: number;
};
type AutoRadiusConfig = {
    enabled?: boolean;
    min?: number;
    max?: number;
    maxRadius?: number;
    minRadius?: number;
};
type CanvasConfig = {
    autoResize?: boolean;
    minSize?: number;
    maxSize?: number;
    width?: number;
    height?: number;
};
interface HeatMapLayerContructorOptions {
    viewer: Viewer;
    heatStyle?: BaseHeatmapConfiguration;
    data: HeatMapDataItem[];
    canvasSize?: number;
    bbox?: number[];
    autoRadiusConfig?: AutoRadiusConfig;
    /** auto calculated bbox buffer width, default to 1 degree */
    tolerance?: number;
    canvasConfig?: CanvasConfig;
}
declare class HeatMapLayer {
    private _viewer;
    private _container;
    heatMap: h337.Heatmap<'value', 'x', 'y'>;
    private _layer;
    _data: HeatMapDataItem[];
    private _autoRadiusConfig;
    cameraMoveEnd: () => any;
    private _dataRange;
    private _tolerance;
    private _canvasConfig;
    private _destroyed;
    get viewer(): Viewer;
    get layer(): ImageryLayer | undefined;
    set show(val: boolean);
    get show(): boolean;
    get destroyed(): boolean;
    set data(val: HeatMapDataItem[]);
    get data(): HeatMapDataItem[];
    get autoRadiusConfig(): AutoRadiusConfig;
    set autoRadiusConfig(val: AutoRadiusConfig);
    get dataRange(): {
        west: number;
        east: number;
        sourth: number;
        north: number;
        min: number;
        max: number;
    };
    constructor(options: HeatMapLayerContructorOptions);
    changeConfig(config: BaseHeatmapConfiguration | undefined): void;
    /**
     * 按当前的相机高度调整点的辐射（越高，越大）
     */
    private _updateHeatmap;
    /**
     * 更新cesium显示
     */
    updateCesium(): void;
    convertHeatItem(heatItems: HeatMapDataItem[]): DataPoint[];
    convertPos(pos: number[]): number[];
    private _getDataRange;
    remove(): boolean;
    destroy(): boolean;
}

export { type HeatMapLayerContructorOptions, HeatMapLayer as default };
