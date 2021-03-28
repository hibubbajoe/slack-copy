document.addEventListener('DOMContentLoaded', (e) => {
    const socket = io();
    const chatForm = document.getElementById('chat-form')
    const chatMessages = document.querySelector('.chat-messages')
    const room = document.getElementById('room-id').value;
    const username = document.getElementById('username').value;

    function scrollBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    socket.emit('join', { username, room });

    socket.on('message', message => {
        outputMessage(message);
        scrollBottom();
    });

    // message submit
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = e.target.elements.msg.value;
        socket.emit('chatMessage', message);
    })

    function outputMessage(message) {
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `<p class="meta">${message.author} <span> ${message.time} </span> </p>
        <p class="text">
        ${message.message}
        </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }





    scrollBottom();

});
