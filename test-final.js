// Final test to verify the complete trade functionality
const http = require('http');

async function testCompleteTrade() {
    console.log('Testing complete trade functionality...');
    
    // Create a new test user to avoid duplicate issues
    const userData = JSON.stringify({
        nome: 'Test User Final',
        email: 'final@example.com',
        senha: 'password123',
        telefone: '(11) 99999-7777'
    });

    try {
        // Create user
        const createResponse = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: userData
        });
        
        const createResult = await createResponse.text();
        console.log('User creation:', createResult);

        // Login
        const loginData = JSON.stringify({
            email: 'final@example.com',
            senha: 'password123'
        });

        const loginResponse = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: loginData
        });

        const loginResult = await loginResponse.text();
        console.log('Login:', loginResult);

        // Add a test item for the user to trade with using URL encoded form data
        const itemData = new URLSearchParams();
        itemData.append('titulo', 'Camiseta Final Test');
        itemData.append('descricao', 'Camiseta para teste final de troca');
        itemData.append('categoria', 'Masculino');
        itemData.append('tipo', 'Troca');
        itemData.append('preferencia', 'Moletom');

        const itemResponse = await fetch('http://localhost:3000/adicionar-peca', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': loginResponse.headers.get('set-cookie')
            },
            body: itemData.toString()
        });

        const itemResult = await itemResponse.text();
        console.log('Item creation:', itemResult);

        // Get user's items to find the correct ID
        const userItemsResponse = await fetch('http://localhost:3000/pecas-usuario', {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie')
            }
        });

        const userItems = await userItemsResponse.json();
        console.log('User items:', userItems);

        if (userItems.length > 0) {
            const userItemId = userItems[0].id;
            console.log('Using user item ID:', userItemId);

            // Test trade proposal to the existing item (ID 1)
            const tradeData = JSON.stringify({
                pecaOfertada: userItemId
            });

            const tradeResponse = await fetch('http://localhost:3000/propor-troca/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': loginResponse.headers.get('set-cookie')
                },
                body: tradeData
            });

            const tradeResult = await tradeResponse.text();
            console.log('Trade proposal result:', tradeResult);
        } else {
            console.log('No user items found for trading');
        }

        // Test notifications
        const notificationsResponse = await fetch('http://localhost:3000/notificacoes', {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie')
            }
        });

        const notifications = await notificationsResponse.json();
        console.log('Notifications count:', notifications.length);

        // Test notification count
        const countResponse = await fetch('http://localhost:3000/notificacoes/contagem', {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie')
            }
        });

        const count = await countResponse.json();
        console.log('Notification count:', count.contagem);

    } catch (error) {
        console.error('Error:', error);
    }
}

testCompleteTrade();
