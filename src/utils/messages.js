const generateMessage = (username, text) => {
    return {
        username,
        text,
        sentAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        sentAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}