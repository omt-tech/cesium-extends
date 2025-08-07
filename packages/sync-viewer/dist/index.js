import { ScreenSpaceEventHandler, Cartesian2, SceneMode, Cartesian3, Matrix4, ScreenSpaceEventType } from 'cesium';

class SyncViewer {
  _leftViewer;
  _rightViewer;
  _options;
  _leftHandler;
  _rightHandler;
  _currentOperation = "left";
  _originRate;
  _destroyed = false;
  synchronous;
  get isDestory() {
    return this._destroyed;
  }
  constructor(leftViewer, rightViewer, options = {}) {
    if (!leftViewer || !rightViewer)
      throw Error("viewer can't be empty!");
    this._leftViewer = leftViewer;
    this._rightViewer = rightViewer;
    this._options = options;
    this._leftHandler = new ScreenSpaceEventHandler(leftViewer.scene.canvas);
    this._rightHandler = new ScreenSpaceEventHandler(rightViewer.scene.canvas);
    this.synchronous = true;
    const leftCamera = this._leftViewer.camera;
    const rightCamera = this._rightViewer.camera;
    this._originRate = {
      left: leftCamera.percentageChanged,
      right: rightCamera.percentageChanged
    };
    leftCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    rightCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    this.start();
  }
  getViewPoint(viewer) {
    const camera = viewer.camera;
    const viewCenter = new Cartesian2(
      Math.floor(viewer.canvas.clientWidth / 2),
      Math.floor(viewer.canvas.clientHeight / 2)
    );
    const worldPosition = viewer.scene.camera.pickEllipsoid(viewCenter);
    return {
      worldPosition,
      height: camera.positionCartographic.height,
      destination: camera.position.clone(),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      }
    };
  }
  leftChangeEvent = () => {
    if (this._currentOperation === "left" && this.synchronous) {
      const viewPoint = this.getViewPoint(this._leftViewer);
      if (this._leftViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._rightViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height)
        );
      } else {
        this._rightViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation
        });
      }
    }
  };
  rightChangeEvent = () => {
    if (this._currentOperation === "right" && this.synchronous) {
      const viewPoint = this.getViewPoint(this._rightViewer);
      if (this._rightViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._leftViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height)
        );
      } else {
        this._leftViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation
        });
      }
    }
  };
  leftViewerMouseMove = () => {
    this._currentOperation = "left";
    if (this._rightViewer.scene.mode !== SceneMode.MORPHING)
      this._rightViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };
  rightViewerMouseMove = () => {
    this._currentOperation = "right";
    if (this._leftViewer.scene.mode !== SceneMode.MORPHING)
      this._leftViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };
  start() {
    this.synchronous = true;
    this._leftHandler.setInputAction(
      this.leftViewerMouseMove,
      ScreenSpaceEventType.MOUSE_MOVE
    );
    this._rightHandler.setInputAction(
      this.rightViewerMouseMove,
      ScreenSpaceEventType.MOUSE_MOVE
    );
    this._leftViewer.camera.changed.addEventListener(this.leftChangeEvent);
    this._rightViewer.camera.changed.addEventListener(this.rightChangeEvent);
  }
  destroy() {
    this.synchronous = false;
    if (!this._leftViewer.isDestroyed()) {
      this._leftViewer.camera.percentageChanged = this._originRate.left;
      this._leftViewer.camera.changed.removeEventListener(this.leftChangeEvent);
      this._leftHandler.destroy();
    }
    if (!this._rightViewer.isDestroyed()) {
      this._rightViewer.camera.percentageChanged = this._originRate.right;
      this._rightViewer.camera.changed.removeEventListener(
        this.rightChangeEvent
      );
      this._rightHandler.destroy();
    }
    this._destroyed = true;
  }
}

export { SyncViewer as default };
