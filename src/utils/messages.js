const generateMessage = (text, username = 'admin') => ({
  username,
  text,
  createdAt: new Date().getTime()
})

const generateLocationMessage = (url, username) => ({
  username,
  url,
  createdAt: new Date().getTime()
})

module.exports = {
  generateMessage,
  generateLocationMessage
}