# Snap 📸

```sh
npm i snap-photo
```

Snap is a light weighted Node.js image processing wrapper library for generating web-friendly images using [node-canvas](https://github.com/Automattic/node-canvas). 

#### Benefits of Using Node-Canvas
- **Compression**: compress image locally by adjusting image quality
- **Operations**: support every web-canvas magic, and more!
- **Web-friendly**: generate images that save spaces/bandwidth and support browsers natively 
- **Flexible**: draw, write, reshape... it's a canvas!

#### Benefits of Using Snap
- **Support**: easy to install; support popular platforms & image formats
- **Simple**: simple code, simple operations
- **Local**: make use of server-side power and local file structure
- **Batch**: process mass images at once


# Get Started

```js
const snap = require('snap-photo')

snap.setRootDir('/Your/Folder/To/Image').createImage('1.png').then((image) => {
    // rotate image clockwise 90° and set width 100px, render canvas
    image.rotate(90).width(100).render()

    // regret what you did? revert to last state!
    image.revert()

    // image is 10% size than before
    image.scale(0.1).render()

    /** exportImage: 
     * {
     *     src: {
     *         src: '/Source/Folder',
     *         type: 'LOCAL',
     *         name: '1.png'
     *     },
     *     export: {
     *         dir: '/Export/Folder',
     *         quality: 0.1,
     *         name: 'photo.jpeg',
     *         format: 'JPEG',
     *         MD5HashName: false
     *     },
     *     name: 'photo.jpeg',
     *     info: {
     *         exif: {
     *             image: [Object],
     *             thumbnail: {},
     *             exif: [Object],
     *             gps: {},
     *             interoperability: {},
     *             makernote: {}
     *         },
     *         width: 1440,
     *         height: 1080
     *     }
     * }
     * */
    var exportImageName = image.export({
        dir: '/Export/Folder',
        quality: 0.1,
        name: 'photo',
        format: 'JPEG'
    })
})
```

# Other Examples

Batch processing images, async style
```js
async function processImages(images) {
    var images = await snap.createImages(images)

    var thread = snap.createThread(images).render((image, name, format) => {
        // render image in batch
        if(format === 'PNG') {
            return image.scale(0.1)
        }else if(format === 'JPEG') {
            return image.scale(10)
        }
    })
    
    /**
     * 
     *  exportImages: 
     *  [
     *      {
     *          src: {
     *              src: '/Source/Folder',
     *              type: 'LOCAL',
     *              name: '1.png'
     *          },
     *          export: {
     *              dir: '/Export/Folder',
     *              quality: 0.1,
     *              name: '91ba97271e9fdb149db252c8f00772b1.jpeg',
     *              format: 'JPEG',
     *              MD5HashName: false
     *          },
     *          name: '91ba97271e9fdb149db252c8f00772b1.jpeg',
     *          info: {
     *              exif: {
     *                  image: [Object],
     *                  thumbnail: {},
     *                  exif: [Object],
     *                  gps: {},
     *                  interoperability: {},
     *                  makernote: {}
     *              },
     *              width: 1440,
     *              height: 1080
     *          }
     *      },
     *      ...
     *  ]
     **/
    var exportDir = '/Export/Folder'
    var exportImages = thread.export({
        dir: exportDir,
        prefix: 'snap_',
        quality: 0.1,
        naming: 'MD5Hash', // increment, MD5Hash. original
        format: 'JPEG'  // JPEG, PNG, PDF
    })
}

processImages(['m.jpg', 'n.png'])
```

Render raw canvas
```js
image.renderRaw((canvas) => {
    var ctx = canvas.getContext('2d')
    // ...some canvas operations
    return canvas
})
```

# API

Snap is composite of two elements: 
- [SnapImage](#SnapImage): a canvas instance of a single image
- [SnapThread](#SnapThread): a batch processing thread that takes Array\<SnapImage\> as input and render them in batch with the same operations
***
### Snap

#### Snap.setRootDir(path)
> Set the global root file directory for Snap to work on
```js
Snap.setRootDir('/Your/Folder/To/Image')
```
Parameters:
- path(string): the root path

Returns:
- Snap
<br><br>

#### Async Snap.createImage(fileName)
> Create a SnapImage instance from an image<br>
> If root directory is not set, default dir is your project dir
```js
var image = await Snap.createImage('1.jpg')
```
Parameters:
- fileName(string): the source image

Returns:
- SnapImage
<br><br>

#### Async Snap.createImages(fileNames)
> Create an Array of SnapImage from multiple images<br>
> If root directory is not set, default dir is your project dir
```js
var images = await Snap.createImages(['1.jpg', '2.png'])
```
Parameters:
- fileName(Array\<string\>): source images

Returns:
- Array\<SnapImage\>
<br><br>

#### Snap.createThread(images)
> Create a processing thread from SnapImage
```js
Snap.createThread(images)
```
Parameters:
- images(Array\<SnapImage\> | SnapImage): SnapImage instances

Returns:
- SnapThread
***
### SnapImage

#### SnapImage.scale(num)
> Scale a SnapImage both width and height 
> new size = [width * num, height * num]
```js
image.scale(10) // enlarge the image by x 10
```
Parameters:
- num(number): Scaling factor

Returns:
- SnapImage

#### SnapImage.width(num)/.height(num)
> Set a SnapImage's width/height, in pixels
```js
// number
image.width(200)
// function
image.height((originalH) => {
    return originalH / 100
})
```
Parameters:
- num(number | function(originalW/H): New width/height)

Returns:
- SnapImage

#### SnapImage.contextRotate(angel)
> Rotate context inside a canvas, in degree angels
```js
image.contextRotate(90)
```
Parameters:
- angel(number)

Returns:
- SnapImage

#### SnapImage.canvasRotate(angel)
> Rotate the canvas in whole, in degree angels
```js
image.canvasRotate(90)  // only supports 90, 180, 270
```
Parameters:
- angel(number)

Returns:
- SnapImage

#### SnapImage.flip(orientation)
> Flip image along an orientation
```js
image.flip('vertical')  // vertical, horizontal
```
Parameters:
- orientation(number)

Returns:
- SnapImage

#### SnapImage.x(x)
> Move image from the left most long x
```js
// number
image.x(10)

// function
image.x((originalW) => {
    return originalW / 100
})
```
Parameters:
- x(number | function(originalW): New x)

Returns:
- SnapImage

#### SnapImage.y(y)
> Move image from the top most long y
```js
// number
image.y(10)

// function
image.y((originalH) => {
    return originalH / 100
})
```
Parameters:
- y(number | function(originalH): New y)

Returns:
- SnapImage

#### SnapImage.render()
> Render canvas after operations => save progress
```js
image.render()
```
Returns:
- SnapImage

#### SnapImage.renderRaw(func)
> Render previous operations => render canvas directly => save progress
```js
image.flip('vertical').renderRaw((canvas) => {
    // ...some canvas operations
    return canvas
})
```
Parameters:
- func(function(canvas): canvas)

Returns:
- SnapImage

#### SnapImage.revert()
> Revert image to latest render
```js
image.revert()
```
Returns:
- SnapImage

#### SnapImage.export(options)
> Revert image to latest render
```js
image.export({
    name: 'cat',    // default snap_originalName
    // or name image by its file hash
    MD5HashName: true,
    format: 'PNG', // PNG, JPEG, default JPEG
    quality: 0.1,   // between 0-1, default RAW
    dir: '/Export/Folder'   // default root dir
})
```
Parameters:
- options(object): everything is optional; even passing in options is optional

Returns:
- info: object {
    src: {
        src: '/Source/Folder',
        type: string,
        name: string
    },
    export: {
        dir: '/Export/Folder',
        quality: number,
        name: string,
        format: string',
        MD5HashName: boolean
    },
    name: 'photo.jpeg',
    info: {
        exif: {
            image: [Object],
            thumbnail: {},
            exif: [Object],
            gps: {},
            interoperability: {},
            makernote: {}
        },
        width: number,
        height: number
    }
}
***
### SnapThread

#### SnapThread.render(func)
> Render SnapImage in batch
```js
thread.render((image, name, format, src) => {
    // render image in batch
    return image
})
```
Parameters:
- func(function(image: SnapImage, name: string, format: string, src: string): SnapImage) // name => original name; format => PNG or JPEG; src => Image/Original/Folder

Returns:
- SnapThread

#### SnapThread.export(options)
> Export images in batch
```js
thread.export({
    dir: '/Export/Folder'   // default root dir
    prefix: 'snap_',    // default snap_
    quality: 0.1,   // between 0-1, default RAW
    naming: 'MD5Hash', // increment, MD5Hash, originalName, default originalName
    format: 'JPEG'  // JPEG, PNG, PDF
})
```
Parameters:
- options(object): everything is optional; even passing in options is optional

Returns:
- info: Array<object> [{
    src: {
        src: '/Source/Folder',
        type: string,
        name: string
    },
    export: {
        dir: '/Export/Folder',
        quality: number,
        name: string,
        format: string',
        MD5HashName: boolean
    },
    name: 'photo.jpeg',
    info: {
        exif: {
            image: [Object],
            thumbnail: {},
            exif: [Object],
            gps: {},
            interoperability: {},
            makernote: {}
        },
        width: number,
        height: number
    }
}]


# TODO
- SnapImage.filter(): blur/filter
- SnapImage.text(): add text (watermark)
- SnapImage.overlay(): overlay two canvas (watermark)
- SnapThread.concat(): thread concat
- SnapImage.exportBuffer(): export to Buffer
- SnapImage.init(): import PDF
- SnapImage.info(): get Image information
- Snap.setRootUrl(): support images from remote sites

# Credit
**Zimo Xiao**<br>
Email: xiaozimo@zuggr.com