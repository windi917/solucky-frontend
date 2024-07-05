const serverUrl = "https://backdev.solucky.online";
//  Create User
export async function createUser(userData) {
    const res = await fetch(serverUrl + '/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error('Error creating user');

    const newUser = await res.json();
    return newUser;
}

//   Get all users
export async function getUsers() {
    const res = await fetch(serverUrl + '/users');

    if (!res.ok) throw new Error('Error fetching users');

    const users = await res.json();
    return users;
}

//   Get User By ID
export async function getUserById(id) {
    const res = await fetch(serverUrl + `/users/${id}`);

    if (!res.ok) throw new Error('Error fetching user');

    const user = await res.json();
    return user;
}


//   Get User By Wallet
export async function getUserByWallet(wallet) {
    const res = await fetch(serverUrl + `/users/wallet/${wallet}`);

    if (!res.ok) throw new Error('Error fetching user');

    const user = await res.json();
    return user;
}

//   Update user
export async function updateUser(id, userData) {
    const res = await fetch(serverUrl + `/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error('Error updating user');

    const updatedUser = await res.json();
    return updatedUser;
}