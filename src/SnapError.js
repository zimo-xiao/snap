"use strict";
exports.__esModule = true;
var SnapError = /** @class */ (function () {
    function SnapError(module, code, msg) {
        this.code = {
            101: 'validation',
            201: 'initialization',
            301: 'operation',
            401: 'export'
        };
        var msg = 'Snap! Error occurred at ' + module + ' (' + code + ' - ' + this.code[code] + ' error): ' + msg;
        throw new Error(msg);
    }
    return SnapError;
}());
exports["default"] = SnapError;
