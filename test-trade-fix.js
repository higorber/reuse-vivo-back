// Test script to verify trade functionality
const http = require('http');

async function testTrade() {
    console.log('Testing trade functionality...');
    
    // Create a test user
    const userData = JSON.stringify({
        nome: 'Test Trader',
        email: 'trader@example.com',
        senha: 'password123',
        telefone: '(11) 99999-8888'
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
            email: 'trader@example.com',
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

        // Get session cookie
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Cookies:', cookies);

        // Add a test item for the user to trade with
        const itemData = new FormData();
        itemData.append('titulo', 'Camiseta Teste');
        itemData.append('descricao', 'Camiseta para teste de troca');
        itemData.append('categoria', 'Masculino');
        itemData.append('tipo', 'Troca');
        itemData.append('preferencia', 'Moletom');

        const itemResponse = await fetch('http://localhost:3000/adicionar-peca', {
            method: 'POST',
            headers: {
                'Cookie': cookies
            },
            body: itemData
        });

        const itemResult = await itemResponse.text();
        console.log('Item creation:', itemResult);

        // Test trade proposal
        const tradeData = JSON.stringify({
            pecaOfertada: 2 // This should be the ID of the item we just created
        });

        const tradeResponse = await fetch('http://localhost:3000/troca/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: tradeData
        });

        const tradeResult = await tradeResponse.text();
        console.log('Trade proposal result:', tradeResult);

    } catch (error) {
        console.error('Error:', error);
    }
}

testTrade();
