document.addEventListener('DOMContentLoaded', (e) => {

    const submitButton = document.getElementById('submit-button');

    submitButton.addEventListener('click', async e => {
        e.preventDefault();

        const response = await fetch('/api/allusers');
        users = await response.json();

        const roomName = document.getElementById('room-name');
        await fetch('/room/roomform/createroom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: roomName.value || 'No name room',
                isPrivate: false,
                users,
            })
        })
            .then(res => {
                window.location.href = '/dashboard';
            })
    });
});

