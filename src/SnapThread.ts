import SnapImage from "./SnapImage"
import SnapError from "./SnapError"

class SnapThread {

    imagePool: Array<SnapImage> = []

    private _export = {
        dir: null,
        quality: null,
        name: 'MD5Hash',
        format: null,
        MD5HashName: false
    }

    constructor() {
        this.imagePool = []
    }

    addImage(image: SnapImage): SnapThread {
        this.imagePool.push(image)
        return this
    }

    addImages(images: Array<SnapImage>): SnapThread {
        this.imagePool = this.imagePool.concat(images)
        return this
    }

    render(f: Function): SnapThread {
        for (var i in this.imagePool) {
            this.imagePool[i] = f(
                this.imagePool[i],
                this.imagePool[i].getSrc()['name'],
                this.imagePool[i].getSrc()['type'],
                this.imagePool[i].getSrc()['src']
            )
            if (this.imagePool[i] == null) {
                throw new SnapError('SnapThread', 301, 'please return SnapImage obj after rendering')
            }
            this.imagePool[i] = this.imagePool[i].render()
        }
        return this
    }

    export(configs: object): Array<object> {
        for (var i in configs) {
            this._export[i] = configs[i]
        }

        var validNaming = ['MD5Hash', 'original', 'increment']
        var out = [];
        if (validNaming.includes(this._export.name)) {
            for (var i in this.imagePool) {
                var c = this._copyJson(this._export)
                if (this._export.name === 'MD5Hash') {
                    c.MD5HashName = true
                } else if (this._export.name === 'original') {
                    c.name = c.prefix != undefined ? c.prefix + this.imagePool[i].getSrc().name : null
                } else if (this._export.name === 'increment') {
                    c.name = c.prefix != undefined ? c.prefix + i : i
                }
                var finalC = {}
                for (var j in c) {
                    if (c[j] != null && j != 'prefix') {
                        finalC[j] = c[j]
                    }
                }
                out.push(this.imagePool[i].export(finalC))
            }
        }
        return out
    }

    /** helper functions **/

    private _copyJson(json) {
        return JSON.parse(JSON.stringify(json));
    }
}

export default SnapThread
