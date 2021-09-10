document.addEventListener('DOMContentLoaded', (e) => {
    const socket = io();
    const chatForm = document.getElementById('chat-form')
    const chatMessages = document.querySelector('.chat-messages')
    const room = document.getElementById('room-id').value;
    const username = document.getElementById('username').value;

    function scrollBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
    }

    // emitting user and room to socket when joining
    socket.emit('join', { username, room });

    // catching message from server
    socket.on('message', message => {
        outputMessage(message);
        scrollBottom();
    });

    // sending message input to server
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = e.target.elements.msg.value;
        socket.emit('chatMessage', message);
    })


    // outputs formatted message
    function outputMessage(message) {
        const div = document.createElement('div');
        div.classList.add('my-message');
        div.innerHTML = `<p">${message.author} ${message.time} </span> </p>
        <p>
        ${message.message}
        </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }

    scrollBottom();
});
