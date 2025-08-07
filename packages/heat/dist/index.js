import { SingleTileImageryProvider, Rectangle } from 'cesium';
import * as h337 from '@mars3d/heatmap.js';

class HeatMapLayer {
  _viewer;
  _container;
  heatMap;
  _layer;
  _data;
  _autoRadiusConfig;
  cameraMoveEnd;
  _dataRange;
  _tolerance;
  _canvasConfig;
  _destroyed = false;
  get viewer() {
    return this._viewer;
  }
  get layer() {
    return this._layer;
  }
  set show(val) {
    if (this._layer)
      this._layer.show = val;
  }
  get show() {
    var _a;
    return ((_a = this._layer) == null ? void 0 : _a.show) ?? false;
  }
  get destroyed() {
    return this._destroyed;
  }
  set data(val) {
    this._data = val;
    this._getDataRange(this._data);
    this.updateCesium();
  }
  get data() {
    return this._data;
  }
  get autoRadiusConfig() {
    return this._autoRadiusConfig;
  }
  set autoRadiusConfig(val) {
    this._autoRadiusConfig = {
      ...this._autoRadiusConfig,
      ...val
    };
    this._viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
    if (this._autoRadiusConfig.enabled)
      this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
  }
  get dataRange() {
    return this._dataRange;
  }
  constructor(options) {
    this._viewer = options.viewer;
    this._autoRadiusConfig = {
      enabled: false,
      min: 1e6,
      max: 1e7,
      maxRadius: 10,
      minRadius: 1,
      ...options.autoRadiusConfig
    };
    this._container = newDiv(
      {
        position: `absolute`,
        top: 0,
        left: 0,
        "z-index": -100,
        overflow: "hidden",
        width: 0,
        height: 0
      },
      document.body
    );
    this._tolerance = options.tolerance ?? 0;
    this._data = options.data;
    this._getDataRange(this._data);
    const { east, west, north, sourth } = this._dataRange;
    const canvasConfig = {
      minSize: 1024,
      maxSize: 1e4,
      autoResize: true,
      width: 1024,
      height: 1024,
      ...options.canvasConfig
    };
    const height = north - sourth, width = east - west;
    const radius = height / width;
    if (canvasConfig == null ? void 0 : canvasConfig.autoResize) {
      const length = this._data.length;
      const w = length > canvasConfig.maxSize ? canvasConfig.maxSize : length < canvasConfig.minSize ? canvasConfig.minSize : length;
      const h = w * radius;
      this._canvasConfig = {
        ...canvasConfig,
        width: w,
        height: h
      };
    } else {
      if (!canvasConfig.width || !canvasConfig.height) {
        throw Error("specify width and height if not auto resize");
      }
      this._canvasConfig = canvasConfig;
    }
    const config = {
      ...options.heatStyle,
      container: newDiv(
        {
          width: this._canvasConfig.width,
          height: this._canvasConfig.height
        },
        this._container
      )
    };
    this.heatMap = h337.create(config);
    this.updateCesium();
    this.cameraMoveEnd = () => this.updateCesium();
    if (this._autoRadiusConfig.enabled)
      this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
  }
  changeConfig(config) {
    if (!config)
      return;
    this.heatMap.configure(config);
    this.updateCesium();
  }
  /**
   * 按当前的相机高度调整点的辐射（越高，越大）
   */
  _updateHeatmap() {
    let data = this.convertHeatItem(this.data);
    if (this._autoRadiusConfig.enabled) {
      const h = this.viewer.camera.getMagnitude();
      const { min, max, minRadius, maxRadius } = this._autoRadiusConfig;
      const newRadius = minRadius + (maxRadius - minRadius) * (h - min) / (max - min);
      data = data.map(({ x, y, value }) => {
        return {
          x,
          y,
          value,
          radius: newRadius
        };
      });
    }
    this.heatMap.setData({
      min: this._dataRange.min,
      max: this._dataRange.max,
      data
    });
  }
  /**
   * 更新cesium显示
   */
  updateCesium() {
    if (this._destroyed)
      return;
    if (this._layer) {
      this.viewer.scene.imageryLayers.remove(this._layer);
    }
    this._updateHeatmap();
    const { west, sourth, east, north } = this._dataRange;
    const provider = new SingleTileImageryProvider({
      url: this.heatMap.getDataURL(),
      rectangle: Rectangle.fromDegrees(west, sourth, east, north),
      tileHeight: this._canvasConfig.height,
      tileWidth: this._canvasConfig.width
    });
    this._layer = this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }
  convertHeatItem(heatItems) {
    const data = heatItems.map((item) => {
      const xy = this.convertPos(item.pos);
      return {
        x: +xy[0],
        y: +xy[1],
        value: item.value
      };
    });
    return data;
  }
  convertPos(pos) {
    const [lon, lat] = pos;
    const { west, east, sourth, north } = this._dataRange;
    const x = (lon - west) / (east - west) * this._canvasConfig.width;
    const y = (north - lat) / (north - sourth) * this._canvasConfig.height;
    return [+x, +y];
  }
  _getDataRange(data) {
    const result = {
      west: Math.min(...data.map((item) => item.pos[0])),
      east: Math.max(...data.map((item) => item.pos[0])),
      sourth: Math.min(...data.map((item) => item.pos[1])),
      north: Math.max(...data.map((item) => item.pos[1])),
      min: Math.min(...data.map((item) => item.value)),
      max: Math.max(...data.map((item) => item.value))
    };
    const { west, sourth, east, north } = result;
    const tolerance = this._tolerance;
    this._dataRange = {
      ...result,
      west: Math.max(west - tolerance, -180),
      east: Math.min(east + tolerance, 180),
      sourth: Math.max(sourth - 1, -90),
      north: Math.min(180, north + tolerance)
    };
    return result;
  }
  remove() {
    let bool = false;
    this._viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
    if (this.layer && this._viewer) {
      bool = this._viewer.scene.imageryLayers.remove(this.layer);
      this.viewer.scene.requestRender();
    } else {
      bool = true;
    }
    return bool;
  }
  destroy() {
    if (this._container)
      this._container.remove();
    this._destroyed = this.remove();
    return this._destroyed;
  }
}
function newDiv(style, parent) {
  const div = document.createElement("div");
  if (parent)
    parent.append(div);
  for (const k in style) {
    if (typeof style[k] === "number") {
      div.style[k] = style[k] + "px";
      continue;
    }
    div.style[k] = style[k];
  }
  return div;
}

export { HeatMapLayer as default };
