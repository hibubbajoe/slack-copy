const users = [];

// JOIN USER TO CHAT 
const userJoin = (id, username, room) => {
    const user = { id, username, room };
    users.push(user);
    return user;
};

// GET CURRENT USER
const getCurrentUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    });
};

module.exports = {
    userJoin,
    getCurrentUser
}