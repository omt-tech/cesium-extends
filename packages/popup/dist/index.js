import { Cartesian2, Cartesian3, SceneMode, BoundingSphere, Occluder, SceneTransforms } from 'cesium';

class Popup {
  _position;
  _screenPosition = new Cartesian2();
  _element;
  _viewer;
  _options;
  _destroyed = false;
  _offset;
  constructor(viewer, options) {
    this._viewer = viewer;
    this._options = options;
    const { position, element, offset } = options;
    if (!element) {
      throw Error("no element!");
    }
    this._position = position ? Cartesian3.fromDegrees(position[0], position[1], position[2]) : null;
    this._element = element;
    this._offset = [(offset == null ? void 0 : offset[0]) ?? 0, (offset == null ? void 0 : offset[1]) ?? 0];
    this.addMapListener();
  }
  set position(val) {
    if (!val) {
      this.switchElementShow(false);
      this._position = null;
      this._options.position = null;
      return;
    }
    this._position = Cartesian3.fromDegrees(val[0], val[1], val[2]);
    this._options.position = val;
    this.setPosition();
  }
  get position() {
    return this._options.position;
  }
  get destroyed() {
    return this._destroyed;
  }
  switchElementShow(val) {
    if (this._element) {
      this._element.style.display = val ? "block" : "none";
    }
  }
  /**
   * 处理弹窗的屏幕位置
   */
  setPosition = () => {
    if (!this._position)
      return;
    if (this._viewer && this._position) {
      if (this._viewer.scene.mode === SceneMode.SCENE3D) {
        const cameraPosition = this._viewer.scene.camera.position;
        const littleSphere = new BoundingSphere(
          new Cartesian3(0, 0, 0),
          635e4
        );
        const occluder = new Occluder(littleSphere, cameraPosition);
        const visible = occluder.isPointVisible(this._position);
        if (!visible) {
          this.switchElementShow(false);
          return;
        }
      }
      const screenPosition = SceneTransforms.worldToWindowCoordinates(
        this._viewer.scene,
        this._position
      );
      const { _element: element } = this;
      if (element && screenPosition) {
        if (this._screenPosition) {
          if (this._screenPosition.x === screenPosition.x && this._screenPosition.y === screenPosition.y) {
            return;
          }
        }
        this.switchElementShow(true);
        const x = screenPosition.x - element.clientWidth / 2 + this._offset[0];
        const y = screenPosition.y - element.clientHeight + this._offset[1];
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        this._screenPosition = screenPosition;
      }
    }
  };
  /**
   * 地图添加监听，用于更新弹窗的位置
   */
  addMapListener() {
    var _a;
    (_a = this._viewer) == null ? void 0 : _a.scene.postRender.addEventListener(this.setPosition);
  }
  destroy() {
    if (!this._viewer.isDestroyed()) {
      this._viewer.scene.postRender.removeEventListener(this.setPosition);
    }
    this.setPosition = void 0;
    this._destroyed = true;
  }
}

export { Popup as default };
