const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if ((containerHeight - newMessageHeight) <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        sentAt: moment(message.sentAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {    
    const locationMsg = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        sentAt: moment(location.sentAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', locationMsg)
    autoScroll()
})

socket.on('roomData', ( {room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value

    $messageFormBtn.setAttribute('disabled', 'disabled')
    
    socket.emit('sendMessage', message, (cbError) => {
        
        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if (cbError) {
            return console.log(`callbackError: ${cbError}`)
        }
        console.log('[chat.js] "sendMessage": Message Sent')
    })
})


$sendLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('your browser is not supported')
    }
    $sendLocationBtn.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition( position => {
        userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        
        socket.emit('sendLocation', userLocation, () => {
            $sendLocationBtn.removeAttribute('disabled')
            console.log('[chat.js] "sendLocation": Location Sent')            
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})