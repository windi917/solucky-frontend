
require('dotenv').config();

//  Create User
export async function createTransaction(txData) { 
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
    });

    if (!res.ok) throw new Error('Error creating transaction');

    const newUser = await res.json();
    return newUser;
}

//   Get User By Wallet
export async function getTransactionsByRaffle(raffleId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/transactions/${raffleId}`);

    if (!res.ok) throw new Error('Error fetching transactions');

    const user = await res.json();
    return user;
}
