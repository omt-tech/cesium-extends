import { Entity, Cartesian2, defined, CallbackProperty, JulianDate, Cartesian3, ClassificationType, ArcType, PolygonHierarchy, Rectangle as Rectangle$1, Color, defaultValue } from 'cesium';
import { MouseTooltip } from '@cesium-extends/tooltip';
import Subscriber from '@cesium-extends/subscriber';

class Painter {
  _viewer;
  _terrain;
  _model;
  _activeShapePoints = [];
  _dynamicShapeEntity;
  _breakPointEntities = [];
  _addedEntitys = [];
  constructor(options) {
    this._viewer = options.viewer;
    this._terrain = options.terrain;
    this._model = options.model;
  }
  /**
   * 将entity添加到视图
   * @param {Entity | Entity.ConstructorOptions} entity entity实体或者构造参数
   * @returns {Entity} entity
   */
  addView(entity) {
    const newEntity = this._viewer.entities.add(entity);
    this._viewer.scene.requestRender();
    this._addedEntitys.push(newEntity);
    return newEntity;
  }
  /**
   * 移除entity
   * @param {Entity} entity entity实体
   * @returns {boolean} 是否移除成功
   */
  removeEntity(entity) {
    this._addedEntitys = this._addedEntitys.filter((item) => item !== entity);
    const bool = this._viewer.entities.remove(entity);
    this._viewer.scene.requestRender();
    return bool;
  }
  createPoint(worldPosition, options) {
    var _a;
    return new Entity({
      position: worldPosition,
      point: {
        ...(_a = defaultOptions.dynamicGraphicsOptions) == null ? void 0 : _a.POINT,
        ...options
      }
    });
  }
  pickCartesian3(position) {
    if (this._model) {
      return this._viewer.scene.pickPosition(position);
    }
    if (this._terrain) {
      const ray = this._viewer.camera.getPickRay(position);
      if (ray)
        return this._viewer.scene.globe.pick(ray, this._viewer.scene);
    } else {
      return this._viewer.camera.pickEllipsoid(position);
    }
    return void 0;
  }
  /**
   * 重置绘画结果，清空间断点和动态图形
   */
  reset() {
    if (this._dynamicShapeEntity) {
      this._viewer.entities.remove(this._dynamicShapeEntity);
      this._dynamicShapeEntity = void 0;
    }
    while (this._breakPointEntities.length) {
      const entity = this._breakPointEntities.pop();
      if (entity)
        this._viewer.entities.remove(entity);
    }
    this._activeShapePoints = [];
  }
  clear() {
    this.reset();
    while (this._addedEntitys.length) {
      const entity = this._addedEntitys.pop();
      if (entity)
        this._viewer.entities.remove(entity);
    }
  }
}

class BasicGraphices {
  result;
  painter;
  _terrain;
  _lastClickPosition = new Cartesian2(
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );
  _mouseDelta = 10;
  finalOptions;
  dynamicOptions = {};
  sameStyle;
  _onPointsChange;
  _onEnd;
  /**
   *
   * @param painter
   * @param options
   * @param flag
   */
  constructor(painter, options = {}) {
    this.painter = painter;
    this._terrain = painter._terrain;
    this.finalOptions = options.finalOptions ?? {};
    this.dynamicOptions = options.dynamicOptions ?? {};
    this.sameStyle = options.sameStyle ?? false;
    this._onPointsChange = options.onPointsChange;
    this._onEnd = options.onEnd;
  }
  _dropPoint(move, createShape) {
    if (!move.position)
      return;
    const earthPosition = this.painter.pickCartesian3(move.position);
    if (!earthPosition || !defined(earthPosition))
      return;
    if (this._lastClickPosition && Cartesian2.magnitude(
      Cartesian2.subtract(this._lastClickPosition, move.position, {})
    ) < this._mouseDelta)
      return;
    if (!this.painter._activeShapePoints.length) {
      this.dynamicUpdate(earthPosition, createShape);
    }
    this.SetBreakpoint(earthPosition);
    Cartesian2.clone(move.position, this._lastClickPosition);
  }
  moving(event) {
    this._moving(event);
  }
  _moving(event) {
    if (!event.endPosition || this.painter._activeShapePoints.length === 0)
      return;
    const earthPosition = this.painter.pickCartesian3(event.endPosition);
    if (earthPosition && defined(earthPosition)) {
      this.painter._activeShapePoints.pop();
      this.painter._activeShapePoints.push(earthPosition);
      if (this._onPointsChange)
        this._onPointsChange([...this.painter._activeShapePoints]);
    }
    this.painter._viewer.scene.requestRender();
  }
  _playOff(createShape) {
    this.painter._activeShapePoints.pop();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    this.result = createShape(this.painter._activeShapePoints);
    if (this._onEnd)
      this._onEnd(this.result, [...this.painter._activeShapePoints]);
    this.painter.reset();
    this._lastClickPosition = new Cartesian2(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    return this.result;
  }
  _cancel(createShape) {
    if (this.painter._activeShapePoints.length < 3) {
      this.painter.reset();
      return;
    }
    this.painter._activeShapePoints.splice(-2, 1);
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    this.result = createShape(this.painter._activeShapePoints);
    const entity = this.painter._breakPointEntities.pop();
    if (entity)
      this.painter.removeEntity(entity);
  }
  SetBreakpoint(earthPosition) {
    this.painter._activeShapePoints.push(earthPosition);
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    const $point = this.painter.createPoint(earthPosition);
    this.painter._breakPointEntities.push($point);
    this.painter.addView($point);
  }
  /**
   * 将新的点添加到动态数组中
   * @param {Cartesian3} earthPosition
   * @param {CreateFunc} createShape
   */
  dynamicUpdate(earthPosition, createShape) {
    this.painter._activeShapePoints.push(earthPosition);
    const dynamicPositions = new CallbackProperty(() => {
      return this.painter._activeShapePoints;
    }, false);
    this.painter._dynamicShapeEntity = createShape(dynamicPositions, true);
    this.painter.addView(this.painter._dynamicShapeEntity);
    return void 0;
  }
}

class Circle extends BasicGraphices {
  dropPoint(move) {
    this._dropPoint(move, this.createShape.bind(this));
  }
  playOff() {
    return this._playOff(this.createShape.bind(this));
  }
  cancel() {
    this._cancel(this.createShape.bind(this));
  }
  createShape(hierarchy, isDynamic = false) {
    const target = Array.isArray(hierarchy) ? hierarchy : hierarchy.getValue(JulianDate.now());
    const radiusFuc = new CallbackProperty(function() {
      const distance = Cartesian3.distance(
        target[0],
        target[target.length - 1]
      );
      return distance || 1;
    }, false);
    const ellipse = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        semiMinorAxis: radiusFuc,
        semiMajorAxis: radiusFuc,
        classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : void 0
      }
    );
    const position = this.painter._activeShapePoints[0];
    return new Entity({ position, ellipse });
  }
}

class Line extends BasicGraphices {
  dropPoint(event) {
    this._dropPoint(event, this.createShape.bind(this));
  }
  playOff() {
    return this._playOff(this.createShape.bind(this));
  }
  cancel() {
    this._cancel(this.createShape.bind(this));
  }
  createShape(positions, isDynamic = false) {
    const polyline = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        positions,
        arcType: ArcType.RHUMB,
        classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : void 0
      }
    );
    return new Entity({ polyline });
  }
}

class Point extends BasicGraphices {
  dropPoint(event) {
    if (!event.position)
      return;
    const earthPosition = this.painter.pickCartesian3(event.position);
    if (earthPosition && defined(earthPosition))
      this.result = this.createDynamicShape(earthPosition);
  }
  moving() {
    return void 0;
  }
  playOff() {
    this.painter.reset();
    return this.result;
  }
  cancel() {
    this.painter.reset();
    return void 0;
  }
  createDynamicShape(position) {
    const point = Object.assign({}, this.finalOptions);
    return new Entity({ position, point });
  }
}

class Polygon extends BasicGraphices {
  dropPoint(event) {
    if (!event.position)
      return;
    const earthPosition = this.painter.pickCartesian3(event.position);
    if (earthPosition && defined(earthPosition)) {
      if (!this.painter._activeShapePoints.length) {
        this.painter._activeShapePoints.push(earthPosition);
        const dynamicPositions = new CallbackProperty(
          () => new PolygonHierarchy(this.painter._activeShapePoints),
          false
        );
        this.painter._dynamicShapeEntity = this.painter.addView(
          this.createShape(dynamicPositions, true)
        );
      }
      this.SetBreakpoint(earthPosition);
    }
  }
  playOff() {
    this._cancel(this.createShape.bind(this));
    return this._playOff(this.createShape.bind(this));
  }
  cancel() {
    this._cancel(this.createShape.bind(this));
  }
  createShape(hierarchy, isDynamic = false) {
    const options = isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions;
    const polygon = Object.assign({}, options, {
      hierarchy: Array.isArray(hierarchy) ? new PolygonHierarchy(hierarchy) : hierarchy,
      arcType: ArcType.RHUMB,
      classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : void 0
    });
    const polyline = {
      width: options.outlineWidth,
      material: options.outlineColor,
      positions: Array.isArray(hierarchy) ? [...hierarchy, hierarchy[0]] : new CallbackProperty(() => {
        return [
          ...this.painter._activeShapePoints,
          this.painter._activeShapePoints[0]
        ];
      }, false),
      clampToGround: true,
      arcType: ArcType.RHUMB,
      classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : void 0
    };
    return new Entity({ polygon, polyline });
  }
}

class Rectangle extends BasicGraphices {
  dropPoint(move) {
    this._dropPoint(move, this.createShape.bind(this));
  }
  playOff() {
    var _a, _b;
    this.painter._activeShapePoints.pop();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    this.result = this.createShape(this.painter._activeShapePoints);
    const rect = (_b = (_a = this.result.rectangle) == null ? void 0 : _a.coordinates) == null ? void 0 : _b.getValue(
      new JulianDate()
    );
    const { west, east, north, south } = rect;
    const positions = [
      [west, north],
      [east, north],
      [east, south],
      [west, south]
    ].map((pos) => Cartesian3.fromRadians(pos[0], pos[1], 0));
    if (this._onEnd)
      this._onEnd(this.result, positions);
    this.painter.reset();
    this._lastClickPosition = new Cartesian2(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    return this.result;
  }
  cancel() {
    this._cancel(this.createShape.bind(this));
  }
  createShape(hierarchy, isDynamic = false) {
    const target = Array.isArray(hierarchy) ? hierarchy : hierarchy.getValue(JulianDate.now());
    const rectangle = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        coordinates: new CallbackProperty(function() {
          const obj = Rectangle$1.fromCartesianArray(target);
          return obj;
        }, false)
      }
    );
    return new Entity({ rectangle });
  }
}

const defaultOptions = {
  terrain: false,
  model: false,
  operateType: {
    START: "LEFT_CLICK",
    MOVING: "MOUSE_MOVE",
    CANCEL: "RIGHT_CLICK",
    END: "LEFT_DOUBLE_CLICK"
  },
  /**
   * 图形勾画时的Entity样式
   */
  dynamicGraphicsOptions: {
    POLYLINE: {
      clampToGround: true,
      width: 2,
      material: Color.YELLOW
    },
    POLYGON: {
      outlineColor: Color.YELLOW,
      outlineWidth: 2,
      material: Color.DARKTURQUOISE.withAlpha(0.5)
    },
    POINT: {
      color: Color.BLUE,
      pixelSize: 8,
      outlineColor: Color.WHITE,
      outlineWidth: 1
    },
    RECTANGLE: {
      material: Color.YELLOW.withAlpha(0.5)
    },
    CIRCLE: {
      material: Color.YELLOW.withAlpha(0.5),
      outline: true
    }
  },
  sameStyle: true,
  tips: {
    init: "Click to draw",
    start: "LeftClick to add a point, rightClick remove point, doubleClick end drawing",
    end: ""
  }
};
class Drawer {
  _viewer;
  _type;
  _terrain;
  _model;
  _subscriber;
  _status;
  _painter;
  _events = [];
  _typeClass;
  _option;
  $Instance;
  $AddedInstance = [];
  _dropPoint;
  _moving;
  _cancel;
  _playOff;
  /**
   * @desc 操作方式
   */
  _operateType;
  _oneInstance;
  _once;
  /**
   * @desc 动作回调
   */
  _action;
  _sameStyle;
  mouseTooltip;
  _tips;
  get status() {
    return this._status;
  }
  get operateType() {
    return this._operateType;
  }
  get isDestroyed() {
    return this._status === "DESTROY";
  }
  constructor(viewer, options) {
    this._option = defaultValue(options, {});
    if (!viewer)
      throw new Error("\u8BF7\u8F93\u5165Viewer\u5BF9\u8C61\uFF01");
    this._operateType = {
      ...defaultOptions.operateType,
      ...options == null ? void 0 : options.operateType
    };
    this._viewer = viewer;
    this._terrain = defaultValue(this._option.terrain, defaultOptions.terrain);
    this._model = defaultValue(this._option.model, defaultOptions.model);
    this._action = this._option.action;
    this._sameStyle = (options == null ? void 0 : options.sameStyle) ?? true;
    this._tips = {
      ...defaultOptions.tips,
      ...options == null ? void 0 : options.tips
    };
    if (this._terrain && !this._viewer.scene.pickPositionSupported) {
      console.warn(
        "\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 pickPosition\u5C5E\u6027\uFF0C\u65E0\u6CD5\u5728\u6709\u5730\u5F62\u7684\u60C5\u51B5\u4E0B\u6B63\u786E\u9009\u70B9"
      );
      this._terrain = false;
    }
    this._subscriber = new Subscriber(this._viewer);
    this.mouseTooltip = new MouseTooltip(viewer);
    this.mouseTooltip.enabled = false;
    this._status = "INIT";
  }
  /**
   * @param finalOptions
   * @param dynamicOptions
   */
  _initPainter(options) {
    const painterOptions = {
      viewer: this._viewer,
      terrain: this._terrain,
      model: this._model
    };
    this._painter = new Painter(painterOptions);
    if (this._type === "POLYGON") {
      this._typeClass = new Polygon(this._painter, options);
    } else if (this._type === "POLYLINE") {
      this._typeClass = new Line(this._painter, options);
    } else if (this._type === "POINT") {
      this._typeClass = new Point(this._painter, options);
    } else if (this._type === "CIRCLE") {
      this._typeClass = new Circle(this._painter, options);
    } else if (this._type === "RECTANGLE") {
      this._typeClass = new Rectangle(this._painter, options);
    }
    this._dropPoint = this._typeClass.dropPoint.bind(this._typeClass);
    this._moving = this._typeClass.moving.bind(this._typeClass);
    this._cancel = this._typeClass.cancel.bind(this._typeClass);
    this._playOff = this._typeClass.playOff.bind(this._typeClass);
  }
  _updateTips() {
    if (!this._painter)
      return;
    if (this._status === "INIT" || this._status === "DESTROY") {
      this.mouseTooltip.enabled = false;
      return;
    }
    if (this._status === "PAUSE") {
      this.mouseTooltip.content = this._tips.end;
      if (this._once === true)
        this.mouseTooltip.enabled = false;
      return;
    }
    if (this._painter._breakPointEntities.length === 0) {
      this.mouseTooltip.content = this._tips.init;
    } else {
      this.mouseTooltip.content = this._tips.start;
    }
  }
  /**
   * @desc 绘制函数,
   * @param config 绘制配置，可以通过定义options直接改写结果而不再填第二个参数
   * @param overrideFunc Entity 重写函数，用于重写绘制结果，如果 overrideFunc返回一个Entity,则将该Entity添加到Viewer中，否则结束函数无操作
   * @returns
   */
  start(config, overrideFunc = (action, entity) => entity) {
    config = defaultValue(config, {});
    this._once = defaultValue(config.once, true);
    this._oneInstance = defaultValue(config.oneInstance, false);
    if (!this._isSupport(config.type)) {
      throw new Error(`the type '${config.type}' is not support`);
    }
    this._type = config.type;
    const defaultOpts = defaultOptions.dynamicGraphicsOptions[this._type];
    this._initPainter({
      finalOptions: {
        ...defaultOpts,
        ...config.finalOptions
      },
      dynamicOptions: {
        ...defaultOpts,
        ...config.dynamicOptions
      },
      sameStyle: this._sameStyle,
      onEnd: config.onEnd,
      onPointsChange: config.onPointsChange
    });
    if (this._status === "START")
      return;
    this._status = "START";
    this._viewer.canvas.style.cursor = "crosshair";
    this._updateTips();
    let isStartDraw = false;
    const startId = this._subscriber.addExternal((move) => {
      var _a, _b;
      if (this._oneInstance && this.$Instance) {
        this._viewer.entities.remove(this.$Instance);
        this.$AddedInstance = [];
      }
      this._dropPoint(move);
      if (this._action)
        this._action(this._operateType.START, move);
      if (this._type === "POINT") {
        this._complete(overrideFunc);
        isStartDraw = false;
        const positions = (_b = (_a = this.$Instance) == null ? void 0 : _a.position) == null ? void 0 : _b.getValue(new JulianDate());
        if (config.onEnd && this.$Instance && positions)
          config.onEnd(this.$Instance, [positions]);
      }
      this._updateTips();
      setTimeout(() => {
        isStartDraw = true;
      }, 100);
    }, this._operateType.START);
    const moveId = this._subscriber.addExternal((move) => {
      this._viewer.canvas.style.cursor = "crosshair";
      if (!isStartDraw)
        return;
      this._moving(move);
      if (this._action)
        this._action(this._operateType.MOVING, move);
    }, this._operateType.MOVING);
    const cancelId = this._subscriber.addExternal((move) => {
      if (!isStartDraw)
        return;
      this._cancel(move);
      this._updateTips();
      if (this._action)
        this._action(this._operateType.CANCEL, move);
    }, this._operateType.CANCEL);
    const endId = this._subscriber.addExternal((move) => {
      if (!isStartDraw)
        return;
      this._playOff(move);
      if (this._action)
        this._action(this._operateType.END, move);
      if (this._type === "POINT")
        return;
      this._complete(overrideFunc);
      this._updateTips();
      isStartDraw = false;
    }, this._operateType.END);
    this._events = [startId, moveId, cancelId, endId];
  }
  _complete(override) {
    if (this._once)
      this.pause();
    this.$Instance = override.call(
      this,
      this._operateType.END,
      this._typeClass.result
    );
    if (this.$Instance instanceof Entity) {
      this._viewer.entities.add(this.$Instance);
      this.$AddedInstance.push(this.$Instance);
    }
    this._viewer.canvas.style.cursor = "default";
  }
  _isSupport(type) {
    return ["POLYGON", "POLYLINE", "POINT", "CIRCLE", "RECTANGLE"].includes(
      type
    );
  }
  reset() {
    var _a;
    this.pause();
    this._status = "INIT";
    (_a = this._painter) == null ? void 0 : _a.clear();
    this.$AddedInstance.map((entity) => {
      this._viewer.entities.remove(entity);
    });
    this.$AddedInstance = [];
    this._viewer.scene.requestRender();
  }
  pause() {
    this._status = "PAUSE";
    this._updateTips();
    this._subscriber.removeExternal(this._events);
    this._events = [];
    this._viewer.canvas.style.cursor = "default";
  }
  destroy() {
    this.reset();
    this.mouseTooltip.destroy();
    this._subscriber.destroy();
    this._status = "DESTROY";
  }
}

export { Drawer as default, defaultOptions };
