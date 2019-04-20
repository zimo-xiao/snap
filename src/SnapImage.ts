import * as pify from "pify"
import * as ExifImage from "exif"
import * as canvasLib from "canvas"
import * as fs from "fs"
import * as SparkMD5 from "spark-md5"
import SnapError from "./SnapError"
import { SnapImageSrc, SnapImageCache, SnapImageRenderCycle, SnapImageExport, SnapBetween, SnapImageResize } from "./types"

class SnapImage {
    /** properties **/
    private _src: SnapImageSrc

    private _supportedSrc: Array<string> = ['LOCAL']

    private _cache: SnapImageCache = {
        canvas: null,
        exif: null,
        lastProgress: null,
        originalName: null
    }

    private _export: SnapImageExport = {
        dir: null,
        quality: null,
        name: null,
        format: null,
        MD5HashName: false
    }

    private _renderCycle: SnapImageRenderCycle = {
        flip: null,
        contextRotate: null,
        canvasRotate: null,
        width: null,
        height: null,
        scale: null,
        x: null,
        y: null
    }

    private _defaultCycle: SnapImageRenderCycle = {
        flip: null,
        contextRotate: null,
        canvasRotate: null,
        width: null,
        height: null,
        scale: null,
        x: null,
        y: null
    }

    /** initializations **/
    constructor(src: SnapImageSrc, rootDir: string) {
        var defaultFormat = 'JPEG'
        if (!this._supportedSrc.includes(src.type)) {
            throw new SnapError('SnapImage', 201, 'do not support image source type' + src.type)
        }
        this._src = src
        this._export.name = this._changeNameExtension('snap_' + src.name, defaultFormat)
        this._export.format = this._parseFormat(defaultFormat)
        this._export.dir = rootDir
    }

    async init(): Promise<SnapImage> {
        if (this._cache.canvas != null) {
            throw new SnapError('SnapImage', 201, 'cannot re-initialize an instance')
        }

        try {
            var rawImage = await canvasLib.loadImage(this._src.src)
        } catch (error) {
            throw new SnapError('SnapImage', 201, error)
        }

        var w = rawImage.width
        var h = rawImage.height

        try {
            var [exifData] = await pify(ExifImage, { multiArgs: true })({ image: this._src.src })
        } catch (error) {
            var exifData = null
        }

        // correct image orientation using EXIF info
        var orientation: number = exifData === null ? 1 : exifData.image.Orientation
        switch (orientation) {
            case 90: orientation = 6
                break;
            case 180: orientation = 3
                break;
            case 270: orientation = 8
                break;
        }
        orientation = orientation ? orientation : 1

        // create canvas
        var canvas = null
        if (orientation <= 4) {
            canvas = canvasLib.createCanvas(w, h)
        } else {
            canvas = canvasLib.createCanvas(h, w)
        }

        var ctx = canvas.getContext('2d')

        // correct orientation
        if (orientation == 3 || orientation == 4) {
            ctx.translate(w, h)
            ctx.rotate(180 * Math.PI / 180)
        } else if (orientation == 5 || orientation == 6) {
            ctx.translate(h, 0)
            ctx.rotate(90 * Math.PI / 180)
        } else if (orientation == 7 || orientation == 8) {
            ctx.translate(0, w)
            ctx.rotate(270 * Math.PI / 180)
        }

        ctx.drawImage(rawImage, 0, 0, w, h)

        this._cache.canvas = canvas
        this._cache.exif = exifData

        return Promise.resolve(this)
    }

    /** declarations **/

    flip(flip: 'vertical' | 'horizontal'): SnapImage {
        this._imageIsInitOrFail()
        this._renderCycle.flip = flip
        return this
    }

    scale(scale: number): SnapImage {
        this._imageIsInitOrFail()
        this._betweenOrFail(scale, { min: 0, max: 1 }, 'scale')
        this._renderCycle.scale = scale
        return this
    }

    x(x: number | Function): SnapImage {
        this._imageIsInitOrFail()
        this._renderCycle.x = x
        return this
    }

    y(y: number | Function): SnapImage {
        this._imageIsInitOrFail()
        this._renderCycle.y = y
        return this
    }

    contextRotate(rotate: number): SnapImage {
        this._imageIsInitOrFail()
        this._betweenOrFail(rotate, { min: 0, max: 360 }, 'context_rotate')
        this._renderCycle.contextRotate = rotate
        return this
    }

    canvasRotate(rotate: number): SnapImage {
        this._imageIsInitOrFail()
        this._inOrFail(rotate, [90, 180, 270], 'canvas_rotate')
        this._renderCycle.canvasRotate = rotate
        return this
    }

    width(width: number | Function): SnapImage {
        this._imageIsInitOrFail()
        this._renderCycle.width = width
        return this
    }

    height(height: number | Function): SnapImage {
        this._imageIsInitOrFail()
        this._renderCycle.height = height
        return this
    }

    /** info **/
    getSrc(): SnapImageSrc {
        return this._src
    }


    /** operations **/
    render(): SnapImage {

        // helper functions
        var _cleanRenderCycle = function (renderCycle) {
            var out: object = {}
            for (var i in renderCycle) {
                if (renderCycle[i] != null) {
                    out[i] = renderCycle[i]
                }
            }
            return out
        }

        var _createImageObjFromOldCanvas = function () {
            var image = new canvasLib.Image()
            image.src = oldCanvas.toDataURL()
            return image
        }

        var _compiler = function (code: string, num: any) {
            switch (code) {
                case 'width':
                    _compiler('op_resize', {
                        w: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width) : oldCanvas.width,
                        h: oldCanvas.height,
                        x: 0,
                        y: 0
                    })
                    break
                case 'height':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.height) : oldCanvas.height,
                        x: 0,
                        y: 0
                    })
                    break
                case 'scale':
                    _compiler('op_resize', {
                        w: typeof num === 'number' ? oldCanvas.width * num : oldCanvas.width,
                        h: typeof num === 'number' ? oldCanvas.height * num : oldCanvas.height,
                        x: 0,
                        y: 0
                    })
                    break
                case 'flip':
                    var scaleH = num === 'horizontal' ? -1 : 1 // Set horizontal scale to -1 if flip horizontal
                    var scaleV = num === 'vertical' ? -1 : 1 // Set vertical scale to -1 if flip vertical
                    var x = num === 'horizontal' ? -1 * oldCanvas.width : 0 // Set x position to -100% if flip horizontal 
                    var y = num === 'vertical' ? -1 * oldCanvas.height : 0 // Set y position to -100% if flip vertical
                    newCanvas = canvasLib.createCanvas(oldCanvas.width, oldCanvas.height)
                    var newCtx = newCanvas.getContext('2d')
                    newCtx.scale(scaleH, scaleV)
                    newCtx.drawImage(_createImageObjFromOldCanvas(), x, y, oldCanvas.width, oldCanvas.height)
                    break
                case 'contextRotate':
                    newCanvas = canvasLib.createCanvas(oldCanvas.width, oldCanvas.height)
                    var newCtx = newCanvas.getContext('2d')
                    newCtx.translate(oldCanvas.width / 2, oldCanvas.height / 2)
                    newCtx.rotate(num * Math.PI / 180)
                    newCtx.translate(-oldCanvas.width / 2, -oldCanvas.height / 2)
                    newCtx.drawImage(_createImageObjFromOldCanvas(), 0, 0, oldCanvas.width, oldCanvas.height)
                    break
                case 'x':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: oldCanvas.height,
                        x: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width, oldCanvas.height) : 0,
                        y: 0
                    })
                    break
                case 'y':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: oldCanvas.height,
                        x: 0,
                        y: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width, oldCanvas.height) : 0
                    })
                    break
                case 'canvasRotate':
                    if (typeof num === 'number') {
                        if (num === 180) {
                            _compiler('flip', 'vertical')
                        } else if (num === 90 || num === 270) {
                            newCanvas = canvasLib.createCanvas(oldCanvas.height, oldCanvas.width)
                            var newCtx = newCanvas.getContext('2d')
                            newCtx.setTransform(
                                0, 1,   // x axis down the screen
                                -1, 0,  // y axis across the screen from right to left
                                oldCanvas.height,  // x origin is on the right side of the canvas 
                                0   // y origin is at the top
                            )
                            newCtx.drawImage(_createImageObjFromOldCanvas(), 0, 0, oldCanvas.width, oldCanvas.height)
                            newCtx.setTransform(1, 0, 0, 1, 0, 0)
                            if (num === 270) {
                                oldCanvas = newCanvas != null ? newCanvas : oldCanvas
                                _compiler('flip', 'horizontal')
                            }
                        }
                    }
                    break
                // universal operations
                case 'op_resize':
                    newCanvas = canvasLib.createCanvas(num.w, num.h)
                    var newCtx = newCanvas.getContext('2d')
                    newCtx.drawImage(_createImageObjFromOldCanvas(), num.x, num.y, num.w, num.h)
                    break
            }
        }

        // init
        this._imageIsInitOrFail()
        var cycle = _cleanRenderCycle(this._renderCycle)

        if (Object.entries(cycle).length === 0) {
            return this
        }

        var oldCanvas = this._cache.canvas
        var newCanvas = null

        for (var i in cycle) {
            oldCanvas = newCanvas != null ? newCanvas : oldCanvas
            _compiler(i, cycle[i]);
        }

        this._renderCycle = this._copyJson(this._defaultCycle)

        if (newCanvas != null) {
            this._saveProgress(newCanvas)
        }

        return this
    }

    renderRaw(f: Function): SnapImage {
        this._cache.canvas = f(this._cache.canvas)
        return this.render()
    }

    revert(): SnapImage {
        if (this._cache.canvas === null) {
            throw new SnapError('SnapImage', 301, 'trying to revert SnapImage in null, please render it first')
        }

        if (this._cache.lastProgress === null) {
            throw new SnapError('SnapImage', 301, 'cannot revert more than once after a render action')
        }

        this._cache.canvas = this._cache.lastProgress
        this._cache.lastProgress = null

        return this
    }

    export(configs: object = {}) {
        // overwrite default configs
        var format = this._export.format
        for (var i in configs) {
            if (!(i in this._export)) {
                throw new SnapError('SnapImage', 401, 'do not support config ' + i)
            }
            if (i === 'format') {
                this._export[i] = format = this._parseFormat(configs[i])
            } else {
                this._export[i] = configs[i]
            }
        }

        // set quality
        var exportFormat = this._parseExportFormat(this._export.format)
        if (this._export.quality === null) {
            var canvasData = this._cache.canvas.toDataURL(exportFormat)
        } else {
            var canvasData = this._cache.canvas.toDataURL(exportFormat, this._export.quality)
        }

        var finalName = this._export.MD5HashName ? SparkMD5.hash(canvasData) : this._export.name
        finalName = this._changeNameExtension(finalName, format)
        this._export.name = finalName

        fs.writeFile(this._combineNameAndSrc(this._export.name, this._export.dir), canvasData.replace(/^(data:)[\s\S]*(;base64,)/, ''), 'base64', function (error) { })

        return {
            src: this._src,
            export: this._export,
            name: finalName,
            info: {
                exif: this._cache.exif,
                width: this._cache.canvas.width,
                height: this._cache.canvas.height
            }
        }
    }

    /** helper functions **/

    private _changeNameExtension(name: string, format: string): string {
        var nameArray = name.split('.')
        if (this._isValidFormat(nameArray[nameArray.length - 1])) {
            nameArray.splice(-1, 1)
        }
        return nameArray.join('.') + '.' + this._parseFormat(format).toLowerCase()
    }

    private _parseFormat(format: string): string {
        if (!this._isValidFormat(format)) {
            throw new SnapError('SnapImage', 101, 'parsing a non-supported format ' + format)
        }
        return format.toUpperCase()
    }

    private _isValidFormat(format: string): boolean {
        format = format.toUpperCase()
        format = format === 'JPG' ? 'JPEG' : format
        var supportFormat = [
            'JPEG',
            'PNG'
        ]
        return supportFormat.includes(format)
    }

    private _parseExportFormat(format: string): string {
        format = this._parseFormat(format)
        var map = {
            'JPEG': 'image/jpeg',
            'PNG': 'image/png'
        }
        return map[format]
    }

    private _saveProgress(newCanvas) {
        this._cache.lastProgress = this._cache.canvas
        this._cache.canvas = newCanvas
    }

    private _betweenOrFail(num: number, between: SnapBetween, method: string) {
        if (num < between.min || num > between.max) {
            throw new SnapError('SnapImage', 101, "method " + method + " only accepts number be between " + between.max + "-" + between.min + ", " + num + " is not in that range")
        }
    }

    private _inOrFail(num: number, group: Array<number>, method: string) {
        if (!group.includes(num)) {
            throw new SnapError('SnapImage', 101, "method " + method + " only accepts number be in [" + group.join(',') + "], " + num + " is not in that group")
        }
    }

    private _imageIsInitOrFail() {
        if (this._cache.canvas === null) {
            throw new SnapError('SnapImage', 201, "please initialize it before declaration/operation")
        }
    }

    private _combineNameAndSrc(name: string, src: string): string {
        if (src[src.length - 1] === '/') {
            src += name
        } else {
            src += '/' + name
        }
        return src
    }

    private _copyJson(json) {
        return JSON.parse(JSON.stringify(json));
    }
}

export default SnapImage