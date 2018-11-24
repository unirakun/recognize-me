const cluster = require("cluster")
const http = require('http')
const Koa = require('koa')
const send = require('koa-send')
const socket = require('socket.io')
const camera = require('./camera')
const clients = require('./clients')

const numCPUs = require("os").cpus().length
console.log(numCPUs)
const app = new Koa()

app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: __dirname + '/../client' });
})

const server = http.createServer(app.callback())
const io = socket(server)

io.on('connection', async (socket) => {
  clients.add(socket)
  if (clients.firstConnected()) {
    const cameraReadable = await camera.open()
    cameraReadable
      .pipe(camera.transformToImg)
      .pipe(clients.emitImg({ frameName: 'frame' }))

    cameraReadable
      .pipe(camera.transformToFaces)
      .pipe(clients.emitImg({ objectMode: true, frameName: 'facesDetected' }))
  }

  socket.on('disconnect', () => {
    clients.remove(socket)
    if (clients.noConnected()) {
      camera.release()
    }
  })
})


if (cluster.isMaster) {
  let i = 0;

  while (i < numCPUs) {
    cluster.fork()
    i++
  }

  cluster.on("exit", function (worker, code, signal) {
    console.log("worker " + worker.process.pid + " died");
  })
} else {
  server.listen(3000, () => {
    console.log('listening...')
  })
}
