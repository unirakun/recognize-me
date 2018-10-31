const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv)

const FPS = 30
let camera
const detector = fr.AsyncFaceDetector()

const isOpen = () => {
  return camera && !camera.read().empty
}

const open = async () => {
  if (isOpen()) return
  camera = new cv.VideoCapture(0)
  await camera.setAsync(cv.CAP_PROP_FPS, FPS)
  await camera.setAsync(cv.CAP_PROP_FRAME_WIDTH, 1)
  await camera.setAsync(cv.CAP_PROP_FRAME_HEIGHT, 1)
}

const readFrame = async () => {
  const cvMat = await camera.readAsync()
  if (cvMat.empty) return
  return { cvMat, cvImg: fr.CvImage(cvMat) }
}

const decodeFrame = async () => {
  const cvMat = await camera.readAsync()
  if (cvMat.empty) return
  return cv.imencode('.jpg', cvMat).toString('base64')
}

const detectFaces = async () => {
  const { cvMat, cvImg } = await readFrame()

  if (!cvImg) return
  const faceRects = await detector.locateFaces(cvImg)
  return faceRects
    .map(mmodRect => fr.toCvRect(mmodRect.rect))
    .map(cvRect => cvMat.getRegion(cvRect).copy())
    .map(faceMat => cv.imencode('.jpg', faceMat).toString('base64'))
}

const release = () => {
  if (isOpen()) camera.release()
}

module.exports = {
  camera,
  open,
  decodeFrame,
  detectFaces,
  release,
}
