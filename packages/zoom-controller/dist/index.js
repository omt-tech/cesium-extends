import { Ray, IntersectionTests, Ellipsoid, Cartesian3, SceneMode, Math } from 'cesium';
import { Widget, DomUtil } from '@cesium-extends/common';

const controller_decrease = `
<svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" fill-opacity="0.01"></rect>
  <path d="M10.5 24L38.5 24" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
`;

const controller_increase = `
<svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" fill-opacity="0.01"></rect>
  <path d="M24.0607 10L24.024 38" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
  <path d="M10 24L38 24" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
`;

const controller_refresh = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M9.02352 2.44583L14.5642 6.42334V16.0284H11.7852V10.4703H6.22711V16.0284H3.44807V6.42334L9.02352 2.44583ZM9.02352 0.899994C8.88457 0.899994 8.74562 0.934732 8.62403 1.02158L0.147959 7.06599C-0.129945 7.25705 0.00900736 7.69127 0.356387 7.69127H2.05855V17.0705C2.05855 17.2616 2.21487 17.4179 2.40593 17.4179H7.26925C7.46031 17.4179 7.61663 17.2616 7.61663 17.0705V11.8598H10.3957V17.0705C10.3957 17.2616 10.552 17.4179 10.7431 17.4179H15.6064C15.7974 17.4179 15.9538 17.2616 15.9538 17.0705V7.69127H17.6559C17.9859 7.69127 18.1249 7.25705 17.8643 7.06599L9.42301 1.03895C9.30142 0.952101 9.16247 0.899994 9.02352 0.899994Z" />
</svg>
`;

const Icons = {
  controller_decrease,
  controller_increase,
  controller_refresh
};

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = ".cesium-zoom-controller{border-radius:100px;box-sizing:border-box;display:flex;flex-direction:column;line-height:1.2rem;pointer-events:auto;position:absolute;right:30px;text-align:center;top:187px;user-select:none}.cesium-zoom-controller .refresh,.cesium-zoom-controller .zoom-in,.cesium-zoom-controller .zoom-out{border-radius:14%;margin-bottom:5px}.cesium-zoom-controller .cesium-button{background:#2a2e39;border:none;margin-right:0;transition:all .3s cubic-bezier(.645,.045,.355,1);transition-delay:0s;transition-duration:.2s;transition-property:all;transition-timing-function:cubic-bezier(.645,.045,.355,1)}.cesium-zoom-controller .cesium-button:hover{background:#48b;box-shadow:none}.cesium-zoom-controller .cesium-button:active{fill:#edffff;background:#adf;color:#edffff}.cesium-zoom-controller .cesium-toolbar-button{align-items:center;display:flex;height:30px;justify-content:center;width:30px}";
n(css,{});

class ZoomController extends Widget {
  _zoomInEl;
  _zoomOutEl;
  _refreshEl;
  _options;
  _icons;
  constructor(viewer, options = {}) {
    super(
      viewer,
      DomUtil.create(
        "div",
        "cesium-zoom-controller",
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
    this.enabled = true;
  }
  /**
   *
   * @param scene
   * @returns {Cartesian3}
   * @private
   */
  _getCameraFocus(scene) {
    const ray = new Ray(scene.camera.positionWC, scene.camera.directionWC);
    const intersections = IntersectionTests.rayEllipsoid(ray, Ellipsoid.WGS84);
    if (intersections) {
      return Ray.getPoint(ray, intersections.start);
    }
    return IntersectionTests.grazingAltitudeLocation(ray, Ellipsoid.WGS84);
  }
  /**
   *
   * @param camera
   * @param focus
   * @param scalar
   * @returns {Cartesian3}
   * @private
   */
  _getCameraPosition(camera, focus, scalar) {
    const cartesian3Scratch = new Cartesian3();
    const direction = Cartesian3.subtract(
      focus,
      camera.position,
      cartesian3Scratch
    );
    const movementVector = Cartesian3.multiplyByScalar(
      direction,
      scalar,
      cartesian3Scratch
    );
    return Cartesian3.add(camera.position, movementVector, cartesian3Scratch);
  }
  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomIn() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.SCENE3D) {
      const focus = this._getCameraFocus(scene);
      const cameraPosition = this._getCameraPosition(camera, focus, 1 / 2);
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll
        },
        duration: 0.5,
        convert: false
      });
    } else {
      camera.zoomIn(camera.positionCartographic.height * 0.5);
    }
  }
  /**
   *
   * @private
   */
  _refresh() {
    if (this._options.home) {
      this._viewer.camera.flyTo({
        destination: this._options.home,
        orientation: {
          heading: Math.toRadians(0),
          pitch: Math.toRadians(-90),
          roll: Math.toRadians(0)
        },
        duration: 1
      });
    } else {
      this._viewer.camera.flyHome(1);
    }
  }
  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomOut() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.SCENE3D) {
      const focus = this._getCameraFocus(scene);
      const cameraPosition = this._getCameraPosition(camera, focus, -1);
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll
        },
        duration: 0.5,
        convert: false
      });
    } else {
      camera.zoomOut(camera.positionCartographic.height);
    }
  }
  /**
   *
   * @private
   */
  _mountContent() {
    const { tips } = this._options;
    this._zoomInEl = DomUtil.parseDom(
      this._icons.controller_increase,
      "zoom-in cesium-toolbar-button cesium-button"
    );
    this._refreshEl = DomUtil.parseDom(
      this._icons.controller_refresh,
      "refresh cesium-toolbar-button cesium-button"
    );
    this._zoomOutEl = DomUtil.parseDom(
      this._icons.controller_decrease,
      "zoom-out cesium-toolbar-button cesium-button"
    );
    this._wrapper.appendChild(this._refreshEl);
    this._wrapper.appendChild(this._zoomInEl);
    this._wrapper.appendChild(this._zoomOutEl);
    this._zoomInEl.title = (tips == null ? void 0 : tips.zoomIn) ?? "Zoom in";
    this._zoomOutEl.title = (tips == null ? void 0 : tips.zoomOut) ?? "Zoom out";
    this._refreshEl.title = (tips == null ? void 0 : tips.refresh) ?? "Reset zoom";
    this._zoomInEl.onclick = () => {
      this._zoomIn();
    };
    this._refreshEl.onclick = () => {
      this._refresh();
    };
    this._zoomOutEl.onclick = () => {
      this._zoomOut();
    };
    this._ready = true;
  }
}

export { ZoomController as default };
