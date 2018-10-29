const clients = {}

const get = () => Object.values(clients)

const add = (socket) => {
  console.log('Hello : ' + socket.id)
  clients[socket.id] = socket
}

const remove = (socket) => {
  console.log('Bye : ' + socket.id)
  delete clients[socket.id]
}

const firstConnected = () => {
  return Object.keys(clients).length === 1
}

const noConnected = () => {
  return Object.keys(clients).length === 0
}

module.exports = {
  add,
  remove,
  get,
  firstConnected,
  noConnected,
}
