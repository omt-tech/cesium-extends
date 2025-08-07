import { Viewer } from 'cesium';

interface PopupOptions {
    /** 经纬度坐标 */
    position: number[] | null;
    element: HTMLElement;
    offset?: [number, number];
}
declare class Popup {
    private _position;
    private _screenPosition;
    private _element;
    private _viewer;
    private _options;
    private _destroyed;
    private _offset;
    constructor(viewer: Viewer, options: PopupOptions);
    set position(val: number[] | null | undefined);
    get position(): number[] | null | undefined;
    get destroyed(): boolean;
    switchElementShow(val: boolean): void;
    /**
     * 处理弹窗的屏幕位置
     */
    setPosition: () => void;
    /**
     * 地图添加监听，用于更新弹窗的位置
     */
    private addMapListener;
    destroy(): void;
}

export { Popup as default };
