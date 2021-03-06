"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = {
            label: 0,
            sent: function () {
                if (t[0] & 1) throw t[1];
                return t[1];
            },
            trys: [],
            ops: []
        },
        f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;

    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }

    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [6, e];
            y = 0;
        } finally {
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
exports.__esModule = true;
var SnapImage_1 = require("./src/SnapImage");
var SnapThread_1 = require("./src/SnapThread");
var snap = {
    rootSrc: {
        src: __dirname + '/../..',
        type: 'LOCAL',
        name: null
    },
    /** global configs**/
    setRootDir: function (dir) {
        this.rootSrc.src = dir;
        this.rootSrc.type = 'LOCAL';
        return this;
    },
    /** create SnapImage **/
    createImages: function (images) {
        return __awaiter(this, void 0, void 0, function () {
            var out, _a, _b, _i, i, image, rootSrc, snapImages;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        out = [];
                        _a = [];
                        for (_b in images)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/ , 4];
                        i = _a[_i];
                        image = images[i];
                        rootSrc = {
                            name: image,
                            src: this._combineNameAndSrc(image, this.rootSrc.src),
                            type: this.rootSrc.type
                        };
                        return [4 /*yield*/ , (new SnapImage_1["default"](rootSrc, this.rootSrc.src)).init()];
                    case 2:
                        snapImages = _c.sent();
                        out.push(snapImages);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/ , 1];
                    case 4:
                        return [2 /*return*/ , Promise.resolve(out)];
                }
            });
        });
    },
    createImage: function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var rootSrc, snapImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rootSrc = {
                            name: image,
                            src: this._combineNameAndSrc(image, this.rootSrc.src),
                            type: this.rootSrc.type
                        };
                        return [4 /*yield*/ , (new SnapImage_1["default"](rootSrc, this.rootSrc.src)).init()];
                    case 1:
                        snapImage = _a.sent();
                        return [2 /*return*/ , Promise.resolve(snapImage)];
                }
            });
        });
    },
    /** create SnapThread **/
    createThread: function (images) {
        if (images instanceof SnapImage_1["default"]) {
            images = [images];
        }
        return (new SnapThread_1["default"]()).addImages(images);
    },
    /** private functions **/
    _combineNameAndSrc: function (name, src) {
        if (src[src.length - 1] === '/') {
            return src + name;
        } else {
            return src + '/' + name;
        }
    }
};
module.exports = snap;