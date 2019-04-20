class SnapError {
    private code: object = {
        101: 'validation',
        201: 'initialization',
        301: 'operation',
        401: 'export',
    }

    constructor(module: string, code: number, msg: string) {
        var msg = 'Snap! Error occurred at ' + module + ' (' + code + ' - ' + this.code[code] + ' error): ' + msg
        throw new Error(msg)
    }
}

export default SnapError