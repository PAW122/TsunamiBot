/**
 * verify if user is log on discord account && is owner || administrator on server
 * @param {string} token 
 * @returns {string} user_id
 */
async function verify(accessToken, tokenType) {
    try {
        const result = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        });

        const response = await result.json();
        const { id } = response;
        return id;
    } catch (error) {
        console.error('Błąd podczas weryfikacji:', error);
        throw error; // Rzuć błąd, aby go obsłużyć w wywołującym kodzie
    }
}

/*
w server.html jest skrypt tóry zwraca dane w tym isOwner: bool!
po dokonaniu jakiejkolwiek weryfikacji zapisywać maila urzytkownika
*/
module.exports = { verify }