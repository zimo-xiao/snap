
import SnapImage from "./src/SnapImage"
import SnapThread from "./src/SnapThread"
import { SnapImageSrc } from "./src/types"

var snap = {
    rootSrc: {
        src: __dirname,
        type: 'LOCAL',
        name: null
    },

    /** global configs**/
    setRootDir: function (dir: string) {
        this.rootSrc.src = dir
        this.rootSrc.type = 'LOCAL'
        return this
    },

    /** create SnapImage **/
    createImages: async function (images: Array<string>): Promise<Array<SnapImage>> {
        var out: Array<SnapImage> = []
        for (var i in images) {
            var image: string = images[i]
            var rootSrc: SnapImageSrc = {
                name: image,
                src: this._combineNameAndSrc(image, this.rootSrc.src),
                type: this.rootSrc.type
            }
            var snapImages = await (new SnapImage(rootSrc, __dirname)).init()
            out.push(snapImages)
        }
        return Promise.resolve(out)
    },

    createImage: async function (image: string): Promise<SnapImage> {
        this.rootSrc.src = this._combineNameAndSrc(image, this.rootSrc.src)
        this.rootSrc.name = image
        var snapImage = await (new SnapImage(this.rootSrc, __dirname)).init();
        return Promise.resolve(snapImage);
    },

    /** create SnapThread **/
    createThread: function (images: Array<SnapImage> | SnapImage): SnapThread {
        if (images instanceof SnapImage) {
            images = [images]
        }
        return (new SnapThread()).addImages(images)
    },

    /** private functions **/

    _combineNameAndSrc: function (name: string, src: string): string {
        if (src[src.length - 1] === '/') {
            src += name
        } else {
            src += '/' + name
        }
        return src
    }
}

module.exports = snap