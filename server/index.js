const http = require('http')
const Koa = require('koa')
const send = require('koa-send')
const socket = require('socket.io')
const camera = require('./camera')
const clients = require('./clients')

const app = new Koa()

app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: __dirname + '/../client' });
})

const server = http.createServer(app.callback())
const io = socket(server)

const emitFaces = async () => {
  const { faces } = await camera.detectFaces()
  if (!faces || faces.length === 0) return
  clients.get().forEach(client => {
    client.emit('facesDetected', faces)
  })
}

const emitAll = async () => {
  const img = await camera.decodeFrame()
  if (!img) return
  emitAll()
  clients.get().forEach(client => {
    client.emit('frame', img)
  })
  // emitFaces()
}

io.on('connection', async (socket) => {
  clients.add(socket)
  if (clients.firstConnected()) {
    await camera.open()
    emitAll()
  }

  socket.on('disconnect', () => {
    clients.remove(socket)
    if (clients.noConnected()) {
      camera.release()
    }
  })
})

server.listen(3000, () => {
  console.log('listening...')
})
