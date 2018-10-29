const cv = require('opencv4nodejs')

const FPS = 30
let camera

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
