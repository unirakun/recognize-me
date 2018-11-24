const { Writable } = require('stream')

const clientStorage = {}

const get = () => Object.values(clientStorage)

const add = (socket) => {
  console.log('Hello : ' + socket.id)
  clientStorage[socket.id] = socket
}

const remove = (socket) => {
  console.log('Bye : ' + socket.id)
  delete clientStorage[socket.id]
}

const firstConnected = () => {
  return Object.keys(clientStorage).length === 1
}

const noConnected = () => {
  return Object.keys(clientStorage).length === 0
}

const emitImg = ({
  frameName,
  clients = Object.values(clientStorage),
  objectMode = false,
}) => new Writable({
  objectMode,
  write(chunk, encoding, callback) {
    clients.forEach(client => {
      client.emit(frameName, objectMode ? chunk : chunk.toString())
    })
    callback()
  },
})

module.exports = {
  add,
  remove,
  get,
  firstConnected,
  noConnected,
  emitImg,
}
