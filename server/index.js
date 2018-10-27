const http = require('http')
const Koa = require('koa')
const send = require('koa-send')
const socket = require('socket.io')

var cv = require('opencv4nodejs')

const app = new Koa()

app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: __dirname + '/../client'});
})


const encodeJpgBase64 = (img) => {
  return cv.imencode('.jpg', img).toString('base64');
}

const server = http.createServer(app.callback())
const io = socket(server)

var camera = new cv.VideoCapture(0)

io.on('connection', (socket) => {
  console.log('client connected')
  setInterval(() => {
    const img = camera.read()
    socket.emit('frame', cv.imencode('.jpg', img).toString('base64'))
  }, 1000)

  socket.on('disconnect', () => console.log('client disconnected'))
})

server.listen(3000, () => {
  console.log('listening...')
})
