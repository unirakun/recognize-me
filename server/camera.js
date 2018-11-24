const { Readable, Transform } = require('stream')
const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const FPS = 70
let camera
let cameraReadable
const detector = fr.AsyncFaceDetector()

const transformToImg = new Transform({
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    const { cvMat } = chunk
    const img = cv.imencode('.jpg', cvMat).toString('base64')
    callback(null, img)
  },
})

const transformToFaces = new Transform({
  writableObjectMode: true,
  readableObjectMode: true,
  async transform(chunk, encoding, callback) {
    const { cvMat, cvImg } = chunk

    if (!cvImg) return

    const faceRects = await detector.locateFaces(cvImg)
    const imgs = faceRects
      .map(mmodRect => fr.toCvRect(mmodRect.rect))
      .map(cvRect => cvMat.getRegion(cvRect).copy())
      .map(faceMat => cv.imencode('.jpg', faceMat).toString('base64'))
    callback(null, imgs)
  },
})

const isOpen = () => {
  return camera && !camera.read().empty
}

const open = async () => {
  if (isOpen()) return
  camera = new cv.VideoCapture(0)
  await camera.setAsync(cv.CAP_PROP_FPS, FPS)
  await camera.setAsync(cv.CAP_PROP_FRAME_WIDTH, 1)
  await camera.setAsync(cv.CAP_PROP_FRAME_HEIGHT, 1)

  cameraReadable = new Readable({
    objectMode: true,
    async read() {
      const cvMat = await camera.readAsync()
      this.push({ cvMat, cvImg: fr.CvImage(cvMat) })
    },
  })

  return cameraReadable
}

const release = () => {
  if (isOpen()) {
    camera.release()
    cameraReadable.destroy()
  }
}

module.exports = {
  camera,
  open,
  release,
  transformToImg,
  transformToFaces,
}
