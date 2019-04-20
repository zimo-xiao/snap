export interface SnapImageRenderCycle {
    flip: string,
    contextRotate: number,
    canvasRotate: number,
    width: number | Function,
    height: number | Function,
    scale: number,
    x: number | Function,
    y: number | Function,
}

export interface SnapBetween {
    min: number,
    max: number
}

export interface SnapImageCache {
    canvas: any,
    exif: any,
    lastProgress: any,
    originalName: string
}

export interface SnapImageSrc {
    src: string,
    type: string,
    name: string
}

export interface SnapImageExport {
    dir: string,
    name: string,
    quality: number,
    format: string,
    MD5HashName: boolean
}

export interface SnapImageResize {
    w: number,
    h: number
}