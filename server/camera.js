const cv = require('opencv4nodejs')

const FPS = 30
let camera
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2)

const tracker = new cv.TrackerBoosting()

let faceDetected = false

const getDate = () => Math.round(Date.now() / 1000)
let date = getDate()

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

const decodeFrame = async () => {
  const img = await camera.readAsync()
  if (img.empty) return

  const gray = await img.bgrToGrayAsync()

  const { objects, levelWeights } = await classifier.detectMultiScaleWithRejectLevelsAsync(gray)

  if (date !== getDate()) {
    date = getDate()
    const bestDetection = objects
      .map((o, i) => ({ rect: o, level: levelWeights[i] }))
      .reduce((acc, curr) => (acc.level > curr.level ? acc : curr), {})

    if (bestDetection.rect) {
      faceDetected = true
      tracker.init(img, bestDetection.rect)
    }

    if (!bestDetection.rect) {
      faceDetected = false
      tracker.clear()
    }
  }

  if (faceDetected) img.drawRectangle(tracker.update(img))

  return cv.imencode('.jpg', img).toString('base64')
}

const release = () => {
  if (isOpen()) camera.release()
}

module.exports = {
  camera,
  open,
  decodeFrame,
  release,
}
