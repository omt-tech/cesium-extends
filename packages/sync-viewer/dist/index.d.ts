import { Viewer, Cartesian3 } from 'cesium';

interface SyncViewProps {
    percentageChanged?: number;
}
declare class SyncViewer {
    private _leftViewer;
    private _rightViewer;
    private _options;
    private _leftHandler;
    private _rightHandler;
    private _currentOperation;
    private _originRate;
    private _destroyed;
    synchronous: boolean;
    get isDestory(): boolean;
    constructor(leftViewer: Viewer, rightViewer: Viewer, options?: SyncViewProps);
    getViewPoint(viewer: Viewer): {
        worldPosition: Cartesian3 | undefined;
        height: number;
        destination: Cartesian3;
        orientation: {
            heading: number;
            pitch: number;
            roll: number;
        };
    };
    private leftChangeEvent;
    private rightChangeEvent;
    private leftViewerMouseMove;
    private rightViewerMouseMove;
    start(): void;
    destroy(): void;
}

export { SyncViewer as default };
