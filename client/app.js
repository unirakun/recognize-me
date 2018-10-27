const socket = io('http://localhost:3000')

const canvas = document.getElementById('video')
const context = canvas.getContext('2d')
const img = new Image()

socket.on('connect', () => console.log('connected'))
socket.on('disconnect', console.log)

socket.on('frame', (frame) => {
  img.onload = function () {
    context.drawImage(this, 0, 0, canvas.width, canvas.height)
  }
  img.src = 'data:image/jpg;base64,' + frame
})
