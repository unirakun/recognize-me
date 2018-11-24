const socket = io('http://localhost:3000')

const imgs = {}

const createImg = id => {
  const canvas = document.getElementById(id)
  imgs[id] = {
    canvas,
    context: canvas.getContext('2d'),
    img: new Image(),
  }
}

createImg('video')
createImg('face0')
createImg('face1')


socket.on('connect', () => console.log('connected'))
socket.on('disconnect', console.log)

socket.on('frame', (frame) => {
  const { canvas, context, img } = imgs.video
  img.onload = function () {
    context.drawImage(this, 0, 0, canvas.width, canvas.height)
  }
  img.src = 'data:image/jpg;base64,' + frame.toString()
})

socket.on('facesDetected', (frames) => {
  frames.forEach((f, i) => {
    const { canvas, context, img } = imgs[`face${i}`]
    img.onload = function () {
      context.drawImage(this, 0, 0, canvas.width, canvas.height)
    }
    img.src = 'data:image/jpg;base64,' + f.toString()
  })
})
