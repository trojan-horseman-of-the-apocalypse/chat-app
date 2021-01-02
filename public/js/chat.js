const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')
const $shareLocationBtn = document.querySelector('#location-btn')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  //get new message element
  const $newMessage = messages.lastElementChild

  //get the height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible height
  const visibleHeight = $messages.offsetHeight

  // height of messages container
  const containerHeight = $messages.scrollHeight

  //how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  $messageFormBtn.setAttribute('disabled', 'disabled')
  // grabs the elements we're working with
  const input = e.target.elements['message-input'].value
  socket.emit('sendMessage', input, error => {
    $messageFormBtn.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      return console.log(error)
    }
    console.log('Message delivered')
  })
})

$shareLocationBtn.addEventListener('click', (e) => {
  if(!navigator.geolocation) return alert('Geolocation is not supported by your browser.')
  $shareLocationBtn.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    }, () => {
      $shareLocationBtn.removeAttribute('disabled')
      console.log('Location sent')
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({ users, room }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users  
  })
  $sidebar.innerHTML = html
})