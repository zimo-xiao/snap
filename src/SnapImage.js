"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var pify = require("pify");
var ExifImage = require("exif");
var canvasLib = require("canvas");
var fs = require("fs");
var SparkMD5 = require("spark-md5");
var SnapError_1 = require("./SnapError");
var SnapImage = /** @class */ (function () {
    /** initializations **/
    function SnapImage(src, rootDir) {
        this._supportedSrc = ['LOCAL'];
        this._cache = {
            canvas: null,
            exif: null,
            lastProgress: null,
            originalName: null
        };
        this._export = {
            dir: null,
            quality: null,
            name: null,
            format: null,
            MD5HashName: false
        };
        this._renderCycle = {
            flip: null,
            contextRotate: null,
            canvasRotate: null,
            width: null,
            height: null,
            scale: null,
            x: null,
            y: null
        };
        this._defaultCycle = {
            flip: null,
            contextRotate: null,
            canvasRotate: null,
            width: null,
            height: null,
            scale: null,
            x: null,
            y: null
        };
        var defaultFormat = 'JPEG';
        if (!this._supportedSrc.includes(src.type)) {
            throw new SnapError_1["default"]('SnapImage', 201, 'do not support image source type' + src.type);
        }
        this._src = src;
        this._export.name = this._changeNameExtension('snap_' + src.name, defaultFormat);
        this._export.format = this._parseFormat(defaultFormat);
        this._export.dir = rootDir;
    }
    SnapImage.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawImage, error_1, w, h, exifData, error_2, exifData, orientation, canvas, ctx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._cache.canvas != null) {
                            throw new SnapError_1["default"]('SnapImage', 201, 'cannot re-initialize an instance');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, canvasLib.loadImage(this._src.src)];
                    case 2:
                        rawImage = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new SnapError_1["default"]('SnapImage', 201, error_1);
                    case 4:
                        w = rawImage.width;
                        h = rawImage.height;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, pify(ExifImage, { multiArgs: true })({ image: this._src.src })];
                    case 6:
                        exifData = (_a.sent())[0];
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        exifData = null;
                        return [3 /*break*/, 8];
                    case 8:
                        orientation = exifData === null ? 1 : exifData.image.Orientation;
                        switch (orientation) {
                            case 90:
                                orientation = 6;
                                break;
                            case 180:
                                orientation = 3;
                                break;
                            case 270:
                                orientation = 8;
                                break;
                        }
                        orientation = orientation ? orientation : 1;
                        canvas = null;
                        if (orientation <= 4) {
                            canvas = canvasLib.createCanvas(w, h);
                        }
                        else {
                            canvas = canvasLib.createCanvas(h, w);
                        }
                        ctx = canvas.getContext('2d');
                        // correct orientation
                        if (orientation == 3 || orientation == 4) {
                            ctx.translate(w, h);
                            ctx.rotate(180 * Math.PI / 180);
                        }
                        else if (orientation == 5 || orientation == 6) {
                            ctx.translate(h, 0);
                            ctx.rotate(90 * Math.PI / 180);
                        }
                        else if (orientation == 7 || orientation == 8) {
                            ctx.translate(0, w);
                            ctx.rotate(270 * Math.PI / 180);
                        }
                        ctx.drawImage(rawImage, 0, 0, w, h);
                        this._cache.canvas = canvas;
                        this._cache.exif = exifData;
                        return [2 /*return*/, Promise.resolve(this)];
                }
            });
        });
    };
    /** declarations **/
    SnapImage.prototype.flip = function (flip) {
        this._imageIsInitOrFail();
        this._renderCycle.flip = flip;
        return this;
    };
    SnapImage.prototype.scale = function (scale) {
        this._imageIsInitOrFail();
        this._betweenOrFail(scale, { min: 0, max: 1 }, 'scale');
        this._renderCycle.scale = scale;
        return this;
    };
    SnapImage.prototype.x = function (x) {
        this._imageIsInitOrFail();
        this._renderCycle.x = x;
        return this;
    };
    SnapImage.prototype.y = function (y) {
        this._imageIsInitOrFail();
        this._renderCycle.y = y;
        return this;
    };
    SnapImage.prototype.contextRotate = function (rotate) {
        this._imageIsInitOrFail();
        this._betweenOrFail(rotate, { min: 0, max: 360 }, 'context_rotate');
        this._renderCycle.contextRotate = rotate;
        return this;
    };
    SnapImage.prototype.canvasRotate = function (rotate) {
        this._imageIsInitOrFail();
        this._inOrFail(rotate, [90, 180, 270], 'canvas_rotate');
        this._renderCycle.canvasRotate = rotate;
        return this;
    };
    SnapImage.prototype.width = function (width) {
        this._imageIsInitOrFail();
        this._renderCycle.width = width;
        return this;
    };
    SnapImage.prototype.height = function (height) {
        this._imageIsInitOrFail();
        this._renderCycle.height = height;
        return this;
    };
    /** info **/
    SnapImage.prototype.getSrc = function () {
        return this._src;
    };
    /** operations **/
    SnapImage.prototype.render = function () {
        // helper functions
        var _cleanRenderCycle = function (renderCycle) {
            var out = {};
            for (var i in renderCycle) {
                if (renderCycle[i] != null) {
                    out[i] = renderCycle[i];
                }
            }
            return out;
        };
        var _createImageObjFromOldCanvas = function () {
            var image = new canvasLib.Image();
            image.src = oldCanvas.toDataURL();
            return image;
        };
        var _compiler = function (code, num) {
            switch (code) {
                case 'width':
                    _compiler('op_resize', {
                        w: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width) : oldCanvas.width,
                        h: oldCanvas.height,
                        x: 0,
                        y: 0
                    });
                    break;
                case 'height':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.height) : oldCanvas.height,
                        x: 0,
                        y: 0
                    });
                    break;
                case 'scale':
                    _compiler('op_resize', {
                        w: typeof num === 'number' ? oldCanvas.width * num : oldCanvas.width,
                        h: typeof num === 'number' ? oldCanvas.height * num : oldCanvas.height,
                        x: 0,
                        y: 0
                    });
                    break;
                case 'flip':
                    var scaleH = num === 'horizontal' ? -1 : 1; // Set horizontal scale to -1 if flip horizontal
                    var scaleV = num === 'vertical' ? -1 : 1; // Set vertical scale to -1 if flip vertical
                    var x = num === 'horizontal' ? -1 * oldCanvas.width : 0; // Set x position to -100% if flip horizontal 
                    var y = num === 'vertical' ? -1 * oldCanvas.height : 0; // Set y position to -100% if flip vertical
                    newCanvas = canvasLib.createCanvas(oldCanvas.width, oldCanvas.height);
                    var newCtx = newCanvas.getContext('2d');
                    newCtx.scale(scaleH, scaleV);
                    newCtx.drawImage(_createImageObjFromOldCanvas(), x, y, oldCanvas.width, oldCanvas.height);
                    break;
                case 'contextRotate':
                    newCanvas = canvasLib.createCanvas(oldCanvas.width, oldCanvas.height);
                    var newCtx = newCanvas.getContext('2d');
                    newCtx.translate(oldCanvas.width / 2, oldCanvas.height / 2);
                    newCtx.rotate(num * Math.PI / 180);
                    newCtx.translate(-oldCanvas.width / 2, -oldCanvas.height / 2);
                    newCtx.drawImage(_createImageObjFromOldCanvas(), 0, 0, oldCanvas.width, oldCanvas.height);
                    break;
                case 'x':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: oldCanvas.height,
                        x: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width, oldCanvas.height) : 0,
                        y: 0
                    });
                    break;
                case 'y':
                    _compiler('op_resize', {
                        w: oldCanvas.width,
                        h: oldCanvas.height,
                        x: 0,
                        y: typeof num === 'number' ? num : typeof num === 'function' ? num(oldCanvas.width, oldCanvas.height) : 0
                    });
                    break;
                case 'canvasRotate':
                    if (typeof num === 'number') {
                        if (num === 180) {
                            _compiler('flip', 'vertical');
                        }
                        else if (num === 90 || num === 270) {
                            newCanvas = canvasLib.createCanvas(oldCanvas.height, oldCanvas.width);
                            var newCtx = newCanvas.getContext('2d');
                            newCtx.setTransform(0, 1, // x axis down the screen
                            -1, 0, // y axis across the screen from right to left
                            oldCanvas.height, // x origin is on the right side of the canvas 
                            0 // y origin is at the top
                            );
                            newCtx.drawImage(_createImageObjFromOldCanvas(), 0, 0, oldCanvas.width, oldCanvas.height);
                            newCtx.setTransform(1, 0, 0, 1, 0, 0);
                            if (num === 270) {
                                oldCanvas = newCanvas != null ? newCanvas : oldCanvas;
                                _compiler('flip', 'horizontal');
                            }
                        }
                    }
                    break;
                // universal operations
                case 'op_resize':
                    newCanvas = canvasLib.createCanvas(num.w, num.h);
                    var newCtx = newCanvas.getContext('2d');
                    newCtx.drawImage(_createImageObjFromOldCanvas(), num.x, num.y, num.w, num.h);
                    break;
            }
        };
        // init
        this._imageIsInitOrFail();
        var cycle = _cleanRenderCycle(this._renderCycle);
        if (Object.entries(cycle).length === 0) {
            return this;
        }
        var oldCanvas = this._cache.canvas;
        var newCanvas = null;
        for (var i in cycle) {
            oldCanvas = newCanvas != null ? newCanvas : oldCanvas;
            _compiler(i, cycle[i]);
        }
        this._renderCycle = this._copyJson(this._defaultCycle);
        if (newCanvas != null) {
            this._saveProgress(newCanvas);
        }
        return this;
    };
    SnapImage.prototype.renderRaw = function (f) {
        this._cache.canvas = f(this._cache.canvas);
        return this.render();
    };
    SnapImage.prototype.revert = function () {
        if (this._cache.canvas === null) {
            throw new SnapError_1["default"]('SnapImage', 301, 'trying to revert SnapImage in null, please render it first');
        }
        if (this._cache.lastProgress === null) {
            throw new SnapError_1["default"]('SnapImage', 301, 'cannot revert more than once after a render action');
        }
        this._cache.canvas = this._cache.lastProgress;
        this._cache.lastProgress = null;
        return this;
    };
    SnapImage.prototype["export"] = function (configs) {
        if (configs === void 0) { configs = {}; }
        // overwrite default configs
        var format = this._export.format;
        for (var i in configs) {
            if (!(i in this._export)) {
                throw new SnapError_1["default"]('SnapImage', 401, 'do not support config ' + i);
            }
            if (i === 'format') {
                this._export[i] = format = this._parseFormat(configs[i]);
            }
            else {
                this._export[i] = configs[i];
            }
        }
        // set quality
        var exportFormat = this._parseExportFormat(this._export.format);
        if (this._export.quality === null) {
            var canvasData = this._cache.canvas.toDataURL(exportFormat);
        }
        else {
            var canvasData = this._cache.canvas.toDataURL(exportFormat, this._export.quality);
        }
        var finalName = this._export.MD5HashName ? SparkMD5.hash(canvasData) : this._export.name;
        finalName = this._changeNameExtension(finalName, format);
        this._export.name = finalName;
        fs.writeFile(this._combineNameAndSrc(this._export.name, this._export.dir), canvasData.replace(/^(data:)[\s\S]*(;base64,)/, ''), 'base64', function (error) { });
        return {
            src: this._src,
            "export": this._export,
            name: finalName,
            info: {
                exif: this._cache.exif,
                width: this._cache.canvas.width,
                height: this._cache.canvas.height
            }
        };
    };
    /** helper functions **/
    SnapImage.prototype._changeNameExtension = function (name, format) {
        var nameArray = name.split('.');
        if (this._isValidFormat(nameArray[nameArray.length - 1])) {
            nameArray.splice(-1, 1);
        }
        return nameArray.join('.') + '.' + this._parseFormat(format).toLowerCase();
    };
    SnapImage.prototype._parseFormat = function (format) {
        if (!this._isValidFormat(format)) {
            throw new SnapError_1["default"]('SnapImage', 101, 'parsing a non-supported format ' + format);
        }
        return format.toUpperCase();
    };
    SnapImage.prototype._isValidFormat = function (format) {
        format = format.toUpperCase();
        format = format === 'JPG' ? 'JPEG' : format;
        var supportFormat = [
            'JPEG',
            'PNG'
        ];
        return supportFormat.includes(format);
    };
    SnapImage.prototype._parseExportFormat = function (format) {
        format = this._parseFormat(format);
        var map = {
            'JPEG': 'image/jpeg',
            'PNG': 'image/png'
        };
        return map[format];
    };
    SnapImage.prototype._saveProgress = function (newCanvas) {
        this._cache.lastProgress = this._cache.canvas;
        this._cache.canvas = newCanvas;
    };
    SnapImage.prototype._betweenOrFail = function (num, between, method) {
        if (num < between.min || num > between.max) {
            throw new SnapError_1["default"]('SnapImage', 101, "method " + method + " only accepts number be between " + between.max + "-" + between.min + ", " + num + " is not in that range");
        }
    };
    SnapImage.prototype._inOrFail = function (num, group, method) {
        if (!group.includes(num)) {
            throw new SnapError_1["default"]('SnapImage', 101, "method " + method + " only accepts number be in [" + group.join(',') + "], " + num + " is not in that group");
        }
    };
    SnapImage.prototype._imageIsInitOrFail = function () {
        if (this._cache.canvas === null) {
            throw new SnapError_1["default"]('SnapImage', 201, "please initialize it before declaration/operation");
        }
    };
    SnapImage.prototype._combineNameAndSrc = function (name, src) {
        if (src[src.length - 1] === '/') {
            src += name;
        }
        else {
            src += '/' + name;
        }
        return src;
    };
    SnapImage.prototype._copyJson = function (json) {
        return JSON.parse(JSON.stringify(json));
    };
    return SnapImage;
}());
exports["default"] = SnapImage;
