import { Widget } from '@cesium-extends/common';
import { Viewer } from 'cesium';

declare const Icons: {
    compass_outer: string;
    compass_inner: string;
    compass_rotation_marker: string;
};

interface CompassOptions {
    container?: Element;
    tips?: {
        inner?: string;
        outer?: string;
    };
    icons?: typeof Icons;
}
declare class Compass extends Widget {
    private _compassRectangle;
    private _outRing;
    private _gyro;
    private _rotation_marker;
    private _orbitCursorAngle;
    private _orbitCursorOpacity;
    private _orbitLastTimestamp;
    private _orbitFrame;
    private _orbitIsLook;
    private _rotateInitialCursorAngle;
    private _rotateFrame;
    private _mouseMoveHandle;
    private _mouseUpHandle;
    private _rotateInitialCameraAngle;
    private _options;
    private _ifHover;
    private _icons;
    constructor(viewer: Viewer, options?: CompassOptions);
    /**
     *
     * @private
     */
    protected _bindEvent(): void;
    /**
     *
     * @private
     */
    protected _unbindEvent(): void;
    /**
     *
     * @private
     */
    private _postRenderHandler;
    protected _mountContent(): void;
    /**
     *
     * @param e
     * @returns {boolean}
     * @private
     */
    private _handleMouseDown;
    /**
     *
     * @param event
     * @returns {boolean}
     * @private
     */
    private _handleDoubleClick;
    /**
     *
     * @param inWorldCoordinates
     * @returns {Cartesian3|undefined}
     * @private
     */
    private _getCameraFocus;
    /**
     *
     * @param vector
     * @private
     */
    private _orbit;
    private _orbitTickFunction;
    /**
     *
     * @param vector
     * @param compassWidth
     * @private
     */
    private _updateAngleAndOpacity;
    /**
     *
     * @param e
     * @private
     */
    private _orbitMouseMoveFunction;
    /**
     *
     * @private
     */
    private _orbitMouseUpFunction;
    /**
     *
     * @param vector
     * @private
     */
    private _rotate;
    private _rotateMouseMoveFunction;
    private _rotateMouseUpFunction;
    private _getVector;
}

export { type CompassOptions, Compass as default };
