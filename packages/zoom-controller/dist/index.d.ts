import { Cartesian3, Viewer, Scene, Camera } from 'cesium';
import { Widget } from '@cesium-extends/common';

declare const Icons: {
    controller_decrease: string;
    controller_increase: string;
    controller_refresh: string;
};

interface ZoomControllerProps {
    container?: Element;
    home?: Cartesian3;
    tips?: {
        zoomIn?: string;
        zoomOut?: string;
        refresh?: string;
    };
    icons?: typeof Icons;
}
declare class ZoomController extends Widget {
    private _zoomInEl;
    private _zoomOutEl;
    private _refreshEl;
    private _options;
    private _icons;
    constructor(viewer: Viewer, options?: ZoomControllerProps);
    /**
     *
     * @param scene
     * @returns {Cartesian3}
     * @private
     */
    _getCameraFocus(scene: Scene): Cartesian3;
    /**
     *
     * @param camera
     * @param focus
     * @param scalar
     * @returns {Cartesian3}
     * @private
     */
    _getCameraPosition(camera: Camera, focus: Cartesian3, scalar: number): Cartesian3;
    /**
     *
     * @returns {boolean}
     * @private
     */
    _zoomIn(): void;
    /**
     *
     * @private
     */
    _refresh(): void;
    /**
     *
     * @returns {boolean}
     * @private
     */
    _zoomOut(): void;
    /**
     *
     * @private
     */
    _mountContent(): void;
}

export { type ZoomControllerProps, ZoomController as default };
