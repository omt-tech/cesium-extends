import { SceneMode, Cartesian2, BoundingSphere, HeadingPitchRange, Math as Math$1, Cartesian3, Ray, Cartographic, getTimestamp, Transforms, Matrix4 } from 'cesium';
import { Widget, DomUtil } from '@cesium-extends/common';

const compass_inner = `
<svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.4404 24.9864C19.9559 24.3306 24.3306 19.9559 24.9864 14.4404C23.4698 15.4694 20.3773 16.2623 16.5723 16.5723C16.2623 20.3773 15.4694 23.4698 14.4404 24.9864ZM13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26ZM11.5596 1.01361C6.04407 1.6694 1.6694 6.04407 1.01361 11.5596C2.53022 10.5306 5.62274 9.73773 9.42771 9.4277C9.73773 5.62274 10.5306 2.53022 11.5596 1.01361ZM10.365 9.36206C10.539 7.31674 10.855 5.50274 11.2664 4.06271C11.5895 2.93219 11.9566 2.08481 12.3237 1.54138C12.7127 0.965546 12.9584 0.928571 13 0.928571C13.0416 0.928571 13.2873 0.965546 13.6763 1.54138C14.0434 2.08481 14.4105 2.93219 14.7336 4.06271C15.145 5.50274 15.461 7.31674 15.635 9.36206C14.7841 9.31201 13.9028 9.28571 13 9.28571C12.0972 9.28571 11.2159 9.31201 10.365 9.36206ZM9.36206 10.365C7.31674 10.539 5.50274 10.855 4.06271 11.2664C2.93219 11.5895 2.08481 11.9566 1.54138 12.3237C0.965545 12.7127 0.928572 12.9584 0.928571 13C0.928572 13.0416 0.965545 13.2873 1.54138 13.6763C2.08481 14.0434 2.93219 14.4105 4.06271 14.7336C5.50274 15.145 7.31674 15.461 9.36206 15.635C9.31201 14.7841 9.28571 13.9028 9.28571 13C9.28571 12.0972 9.31201 11.2159 9.36206 10.365ZM10.2964 15.7036C10.2428 14.8346 10.2143 13.9301 10.2143 13C10.2143 12.0699 10.2428 11.1654 10.2964 10.2964C11.1654 10.2428 12.0699 10.2143 13 10.2143C13.9301 10.2143 14.8346 10.2428 15.7036 10.2964C15.7572 11.1654 15.7857 12.0699 15.7857 13C15.7857 13.9301 15.7572 14.8346 15.7036 15.7036C14.8346 15.7572 13.9301 15.7857 13 15.7857C12.0699 15.7857 11.1654 15.7572 10.2964 15.7036ZM10.365 16.6379C10.539 18.6833 10.855 20.4973 11.2664 21.9373C11.5895 23.0678 11.9566 23.9152 12.3237 24.4586C12.7127 25.0345 12.9584 25.0714 13 25.0714C13.0416 25.0714 13.2873 25.0345 13.6763 24.4586C14.0434 23.9152 14.4105 23.0678 14.7336 21.9373C15.145 20.4973 15.461 18.6833 15.635 16.6379C14.7841 16.688 13.9028 16.7143 13 16.7143C12.0972 16.7143 11.2159 16.688 10.365 16.6379ZM9.42771 16.5723C9.73773 20.3773 10.5306 23.4698 11.5596 24.9864C6.04407 24.3306 1.6694 19.9559 1.01361 14.4404C2.53022 15.4694 5.62274 16.2623 9.42771 16.5723ZM16.6379 15.635C18.6833 15.461 20.4973 15.145 21.9373 14.7336C23.0678 14.4105 23.9152 14.0434 24.4586 13.6763C25.0345 13.2873 25.0714 13.0416 25.0714 13C25.0714 12.9584 25.0345 12.7127 24.4586 12.3237C23.9152 11.9566 23.0678 11.5895 21.9373 11.2664C20.4973 10.855 18.6833 10.539 16.6379 10.365C16.688 11.2159 16.7143 12.0972 16.7143 13C16.7143 13.9028 16.688 14.7841 16.6379 15.635ZM16.5723 9.4277C20.3773 9.73773 23.4698 10.5306 24.9864 11.5596C24.3306 6.04407 19.9559 1.6694 14.4404 1.01361C15.4694 2.53022 16.2623 5.62274 16.5723 9.4277Z" />
</svg>

`;

const compass_outer = `
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80ZM40 64C53.2548 64 64 53.2548 64 40C64 26.7452 53.2548 16 40 16C26.7452 16 16 26.7452 16 40C16 53.2548 26.7452 64 40 64Z" fill="#22293A"/>
<path d="M38 5V11H38.916V6.4874H38.9496L42.0504 11H42.9412V5H42.0252V9.46218H41.9916L38.9244 5H38Z" fill="#E2E5E8"/>
<rect opacity="0.8" x="3" y="40" width="8" height="1" fill="#5D5D62"/>
<rect opacity="0.8" x="68" y="40" width="8" height="1" fill="#5D5D62"/>
<rect opacity="0.8" x="40" y="76" width="8" height="1" transform="rotate(-90 40 76)" fill="#5D5D62"/>
<circle cx="65" cy="20" r="1" fill="#E2E5E8"/>
<circle cx="65" cy="60" r="1" fill="#E2E5E8"/>
<circle cx="15" cy="60" r="1" fill="#E2E5E8"/>
<circle cx="15" cy="20" r="1" fill="#E2E5E8"/>
</svg>

`;

const compass_rotation_marker = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="53px" height="53px" viewBox="0 0 53 53" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="compass-rotation-marker">
            <path d="M52.4399986,26.2199993 C52.4399986,11.7390936 40.7009051,0 26.2199993,0 C11.7390936,0 0,11.7390936 0,26.2199993 C0,40.7009051 11.7390936,52.4399986 26.2199993,52.4399986 C40.7009051,52.4399986 52.4399986,40.7009051 52.4399986,26.2199993 Z" id="rotator" stroke-opacity="0.135841259" stroke="#E2A549" stroke-width="9" opacity="0.201434235"></path>
            <path d="M0,26.2199993 C0,11.7390936 11.7390936,0 26.2199993,0 L26.2199993,9 C16.7096563,9 9,16.7096563 9,26.2199993" id="Shape" opacity="0.634561567" fill="#4990E2"></path>
        </g>
    </g>
</svg>
`;

const Icons = {
  compass_outer,
  compass_inner,
  compass_rotation_marker
};

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = ".cesium-compass{cursor:pointer;height:60px;pointer-events:auto;position:absolute;right:15px;top:100px;user-select:none;width:60px}.cesium-compass .out-ring{fill:rgba(23,49,71,.702);background-repeat:no-repeat;background-size:contain;border-radius:50%;height:60px;left:0;position:absolute;top:0;transition:all .3s ease;width:60px}.cesium-compass .out-ring svg{height:60px;width:60px}.cesium-compass:hover .rotation_marker svg{height:70.2px;width:70.2px}.cesium-compass .gyro{align-items:center;background:#fff;border-radius:50%;box-sizing:border-box;display:flex;height:30px;justify-content:center;margin:0 auto;padding:4px;position:relative;text-align:center;top:50%;transform:translateY(-50%);transition:all .3s ease;width:30px}.cesium-compass .gyro svg{height:20px;width:20px}.rotation_marker{background-repeat:no-repeat;background-size:contain;border-radius:50%;position:relative}.rotation_marker svg{height:60px;left:50%;position:absolute;top:50%;transform:translate(-50%,-50%);transition:all .3s ease;width:60px}.cesium-compass .gyro-active,.cesium-compass .gyro:hover{fill:#68adfe}";
n(css,{});

class Compass extends Widget {
  _compassRectangle;
  _outRing;
  _gyro;
  _rotation_marker;
  _orbitCursorAngle;
  _orbitCursorOpacity;
  _orbitLastTimestamp;
  _orbitFrame;
  _orbitIsLook;
  _rotateInitialCursorAngle;
  _rotateFrame;
  _mouseMoveHandle;
  _mouseUpHandle;
  _rotateInitialCameraAngle;
  _options;
  _ifHover = false;
  _icons;
  constructor(viewer, options = {}) {
    super(
      viewer,
      DomUtil.create(
        "div",
        "cesium-compass",
        options.container ?? viewer.container
      )
    );
    this._options = {
      ...options,
      icons: {
        ...Icons,
        ...options == null ? void 0 : options.icons
      }
    };
    this._icons = this._options.icons;
    this._wrapper.onmousedown = (e) => {
      this._handleMouseDown(e);
    };
    this._wrapper.ondblclick = () => {
      this._handleDoubleClick();
    };
    this._wrapper.onmouseover = () => {
      this._ifHover = true;
      this._postRenderHandler();
    };
    this._wrapper.onmouseleave = () => {
      this._ifHover = false;
      this._postRenderHandler();
    };
    this._compassRectangle = new DOMRect();
    this._orbitCursorAngle = 0;
    this._orbitCursorOpacity = 0;
    this._orbitLastTimestamp = 0;
    this._rotateInitialCameraAngle = 0;
    this._orbitFrame = void 0;
    this._orbitIsLook = false;
    this._rotateInitialCursorAngle = 0;
    this._rotateFrame = void 0;
    this._mouseMoveHandle = void 0;
    this._mouseUpHandle = void 0;
    this.enabled = true;
  }
  /**
   *
   * @private
   */
  _bindEvent() {
    this._viewer.scene.postRender.addEventListener(
      this._postRenderHandler,
      this
    );
  }
  /**
   *
   * @private
   */
  _unbindEvent() {
    this._viewer.scene.postRender.removeEventListener(
      this._postRenderHandler,
      this
    );
  }
  /**
   *
   * @private
   */
  _postRenderHandler() {
    const heading = this._viewer.camera.heading;
    if (this._outRing)
      this._outRing.style.cssText = `
      transform :  ${this._ifHover ? "scale(1.17)" : ""};
      -webkit-transform :  ${this._ifHover ? "scale(1.17)" : ""};
      `;
    const innerSvg = this._outRing.children.item(0);
    if (innerSvg)
      innerSvg.style.cssText = `
    transform : rotate(-${heading}rad);
    -webkit-transform : rotate(-${heading}rad);
    `;
  }
  _mountContent() {
    const { tips } = this._options;
    DomUtil.create("div", "out-ring-bg", this._wrapper);
    this._outRing = DomUtil.parseDom(this._icons.compass_outer, "out-ring");
    this._wrapper.appendChild(this._outRing);
    this._gyro = DomUtil.parseDom(this._icons.compass_inner, "gyro");
    this._wrapper.appendChild(this._gyro);
    this._outRing.title = (tips == null ? void 0 : tips.outer) ?? "Drag outer ring: rotate view.\nDrag inner gyroscope: free orbit.\nDouble-click: reset view.\nTIP: You can also free orbit by holding the CTRL key and dragging the map.";
    this._gyro.title = (tips == null ? void 0 : tips.inner) ?? "";
    this._rotation_marker = DomUtil.parseDom(
      this._icons.compass_rotation_marker,
      "rotation_marker"
    );
    this._wrapper.appendChild(this._rotation_marker);
    this._rotation_marker.style.visibility = "hidden";
    this._ready = true;
  }
  /**
   *
   * @param e
   * @returns {boolean}
   * @private
   */
  _handleMouseDown(e) {
    var _a;
    const scene = this._viewer.scene;
    if (scene.mode === SceneMode.MORPHING) {
      return true;
    }
    const rect = (_a = e.currentTarget) == null ? void 0 : _a.getBoundingClientRect();
    if (!rect)
      return false;
    this._compassRectangle = rect;
    const maxDistance = this._compassRectangle.width / 2;
    const vector = this._getVector(e);
    const distanceFraction = Cartesian2.magnitude(vector) / maxDistance;
    if (distanceFraction < 50 / 145) {
      this._orbit(vector);
    } else if (distanceFraction < 1) {
      this._rotate(vector);
    } else {
      return true;
    }
    return true;
  }
  /**
   *
   * @param event
   * @returns {boolean}
   * @private
   */
  _handleDoubleClick() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    const sscc = scene.screenSpaceCameraController;
    if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
      return true;
    }
    if (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
      return;
    }
    if (scene.mode === SceneMode.SCENE3D || scene.mode === SceneMode.COLUMBUS_VIEW) {
      if (!sscc.enableLook) {
        return;
      }
      if (scene.mode === SceneMode.SCENE3D) {
        if (!sscc.enableRotate) {
          return;
        }
      }
    }
    const center = this._getCameraFocus(true);
    if (!center) {
      return;
    }
    const cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(
      camera.positionCartographic
    );
    const surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);
    const focusBoundingSphere = new BoundingSphere(center, 0);
    camera.flyToBoundingSphere(focusBoundingSphere, {
      offset: new HeadingPitchRange(
        0,
        Math$1.PI_OVER_TWO - Cartesian3.angleBetween(surfaceNormal, camera.directionWC),
        Cartesian3.distance(cameraPosition, center)
      ),
      duration: 1.5
    });
    return true;
  }
  /**
   *
   * @param inWorldCoordinates
   * @returns {Cartesian3|undefined}
   * @private
   */
  _getCameraFocus(inWorldCoordinates) {
    var _a;
    let result = new Cartesian3();
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.MORPHING) {
      return void 0;
    }
    if ((_a = this._viewer.trackedEntity) == null ? void 0 : _a.position) {
      result = this._viewer.trackedEntity.position.getValue(
        this._viewer.clock.currentTime
      );
    } else {
      const rayScratch = new Ray();
      rayScratch.origin = camera.positionWC;
      rayScratch.direction = camera.directionWC;
      result = scene.globe.pick(rayScratch, scene);
    }
    if (!result) {
      return void 0;
    }
    if (scene.mode === SceneMode.SCENE2D || scene.mode === SceneMode.COLUMBUS_VIEW) {
      result = camera.worldToCameraCoordinatesPoint(result);
      const unprojectedScratch = new Cartographic();
      if (inWorldCoordinates) {
        result = scene.globe.ellipsoid.cartographicToCartesian(
          scene.mapProjection.unproject(result, unprojectedScratch)
        );
      }
    } else {
      if (!inWorldCoordinates) {
        result = camera.worldToCameraCoordinatesPoint(result);
      }
    }
    return result;
  }
  /**
   *
   * @param vector
   * @private
   */
  _orbit(vector) {
    const scene = this._viewer.scene;
    const sscc = scene.screenSpaceCameraController;
    const camera = scene.camera;
    if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
      return;
    }
    switch (scene.mode) {
      case SceneMode.COLUMBUS_VIEW:
        if (sscc.enableLook) {
          break;
        }
        if (!sscc.enableTranslate || !sscc.enableTilt) {
          return;
        }
        break;
      case SceneMode.SCENE3D:
        if (sscc.enableLook) {
          break;
        }
        if (!sscc.enableTilt || !sscc.enableRotate) {
          return;
        }
        break;
      case SceneMode.SCENE2D:
        if (!sscc.enableTranslate) {
          return;
        }
        break;
    }
    this._mouseMoveHandle = (e) => {
      this._orbitMouseMoveFunction(e);
    };
    this._mouseUpHandle = () => {
      this._orbitMouseUpFunction();
    };
    document.removeEventListener("mousemove", this._mouseMoveHandle, false);
    document.removeEventListener("mouseup", this._mouseUpHandle, false);
    this._orbitLastTimestamp = getTimestamp();
    if (this._viewer.trackedEntity) {
      this._orbitFrame = void 0;
      this._orbitIsLook = false;
    } else {
      const center = this._getCameraFocus(true);
      if (!center) {
        this._orbitFrame = Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid
        );
        this._orbitIsLook = true;
      } else {
        this._orbitFrame = Transforms.eastNorthUpToFixedFrame(
          center,
          scene.globe.ellipsoid
        );
        this._orbitIsLook = false;
      }
    }
    this._rotation_marker.style.visibility = "visible";
    this._gyro.className += " gyro-active";
    document.addEventListener("mousemove", this._mouseMoveHandle, false);
    document.addEventListener("mouseup", this._mouseUpHandle, false);
    this._viewer.clock.onTick.addEventListener(this._orbitTickFunction, this);
    this._updateAngleAndOpacity(vector, this._compassRectangle.width);
  }
  _orbitTickFunction() {
    const scene = this._viewer.scene;
    const camera = this._viewer.camera;
    const timestamp = getTimestamp();
    const deltaT = timestamp - this._orbitLastTimestamp;
    const rate = (this._orbitCursorOpacity - 0.5) * 2.5 / 1e3;
    const distance = deltaT * rate;
    const angle = this._orbitCursorAngle + Math$1.PI_OVER_TWO;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    let oldTransform;
    if (this._orbitFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._orbitFrame);
    }
    if (scene.mode === SceneMode.SCENE2D) {
      camera.move(
        new Cartesian3(x, y, 0),
        Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100 * camera.positionCartographic.height * distance
      );
    } else {
      if (this._orbitIsLook) {
        camera.look(Cartesian3.UNIT_Z, -x);
        camera.look(camera.right, -y);
      } else {
        camera.rotateLeft(x);
        camera.rotateUp(y);
      }
    }
    if (this._orbitFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
    this._orbitLastTimestamp = timestamp;
  }
  /**
   *
   * @param vector
   * @param compassWidth
   * @private
   */
  _updateAngleAndOpacity(vector, compassWidth) {
    const angle = Math.atan2(-vector.y, vector.x);
    this._orbitCursorAngle = Math$1.zeroToTwoPi(angle - Math$1.PI_OVER_TWO);
    const distance = Cartesian2.magnitude(vector);
    const maxDistance = compassWidth / 2;
    const distanceFraction = Math.min(distance / maxDistance, 1);
    this._orbitCursorOpacity = 0.5 * distanceFraction * distanceFraction + 0.5;
    this._rotation_marker.style.cssText = `
      transform: rotate(-${this._orbitCursorAngle}rad);
      opacity: ${this._orbitCursorOpacity}`;
  }
  /**
   *
   * @param e
   * @private
   */
  _orbitMouseMoveFunction(e) {
    this._updateAngleAndOpacity(
      this._getVector(e),
      this._compassRectangle.width
    );
  }
  /**
   *
   * @private
   */
  _orbitMouseUpFunction() {
    if (!this._mouseMoveHandle || !this._mouseUpHandle)
      return;
    document.removeEventListener("mousemove", this._mouseMoveHandle, false);
    document.removeEventListener("mouseup", this._mouseUpHandle, false);
    this._viewer.clock.onTick.removeEventListener(
      this._orbitTickFunction,
      this
    );
    this._mouseMoveHandle = void 0;
    this._mouseUpHandle = void 0;
    this._rotation_marker.style.visibility = "hidden";
    this._gyro.className = this._gyro.className.replace(" gyro-active", "");
  }
  /**
   *
   * @param vector
   * @private
   */
  _rotate(vector) {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    const sscc = scene.screenSpaceCameraController;
    if (scene.mode === SceneMode.MORPHING || scene.mode === SceneMode.SCENE2D || !sscc.enableInputs) {
      return;
    }
    if (!sscc.enableLook && (scene.mode === SceneMode.COLUMBUS_VIEW || scene.mode === SceneMode.SCENE3D && !sscc.enableRotate)) {
      return;
    }
    this._mouseMoveHandle = (e) => {
      this._rotateMouseMoveFunction(e);
    };
    this._mouseUpHandle = () => {
      this._rotateMouseUpFunction();
    };
    document.removeEventListener("mousemove", this._mouseMoveHandle, false);
    document.removeEventListener("mouseup", this._mouseUpHandle, false);
    this._rotateInitialCursorAngle = Math.atan2(-vector.y, vector.x);
    if (this._viewer.trackedEntity) {
      this._rotateFrame = void 0;
    } else {
      const center = this._getCameraFocus(true);
      if (!center || scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate) {
        this._rotateFrame = Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid
        );
      } else {
        this._rotateFrame = Transforms.eastNorthUpToFixedFrame(
          center,
          scene.globe.ellipsoid
        );
      }
    }
    let oldTransform;
    if (this._rotateFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._rotateFrame);
    }
    this._rotateInitialCameraAngle = -camera.heading;
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
    document.addEventListener("mousemove", this._mouseMoveHandle, false);
    document.addEventListener("mouseup", this._mouseUpHandle, false);
  }
  _rotateMouseMoveFunction(e) {
    const camera = this._viewer.camera;
    const vector = this._getVector(e);
    const angle = Math.atan2(-vector.y, vector.x);
    const angleDifference = angle - this._rotateInitialCursorAngle;
    const newCameraAngle = Math$1.zeroToTwoPi(
      this._rotateInitialCameraAngle - angleDifference
    );
    let oldTransform;
    if (this._rotateFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._rotateFrame);
    }
    const currentCameraAngle = -camera.heading;
    camera.rotateRight(newCameraAngle - currentCameraAngle);
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
  }
  _rotateMouseUpFunction() {
    if (!this._mouseMoveHandle || !this._mouseUpHandle)
      return;
    document.removeEventListener("mousemove", this._mouseMoveHandle, false);
    document.removeEventListener("mouseup", this._mouseUpHandle, false);
    this._mouseMoveHandle = void 0;
    this._mouseUpHandle = void 0;
  }
  _getVector(e) {
    const compassRectangle = this._compassRectangle;
    const center = new Cartesian2(
      (compassRectangle.right - compassRectangle.left) / 2,
      (compassRectangle.bottom - compassRectangle.top) / 2
    );
    const clickLocation = new Cartesian2(
      e.clientX - compassRectangle.left,
      e.clientY - compassRectangle.top
    );
    const vector = new Cartesian2();
    Cartesian2.subtract(clickLocation, center, vector);
    return vector;
  }
}

export { Compass as default };
