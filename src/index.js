const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words') 
const {
  generateMessage, 
  generateLocationMessage
} = require('./utils/messages')
const { 
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users')

const app = express()

app.use(express.static(path.join(__dirname, '../public')))

const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000

io.on('connection', (socket) => {

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    if (error) {
       return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', generateMessage('Welcome to the chat!'))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    
    io.to(user.room).emit('message', generateMessage(message, user.username))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(`http://google.com/maps?q=${coords.lat},${coords.long}`, user.username))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => console.log(`Server has started, listening on port ${port}`))