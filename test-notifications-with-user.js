// Test to create a user and then test notifications endpoint
async function testNotificationsWithUser() {
    console.log('Testing notifications endpoint with new user...');
    
    try {
        // Create a new test user
        const userData = JSON.stringify({
            nome: 'Test User Notifications',
            email: 'notifications@example.com',
            senha: 'password123',
            telefone: '(11) 99999-8888'
        });

        const createResponse = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: userData
        });
        
        const createResult = await createResponse.text();
        console.log('User creation:', createResult);

        // Login with the test user
        const loginData = JSON.stringify({
            email: 'notifications@example.com',
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

        // Test notification count
        const countResponse = await fetch('http://localhost:3000/notificacoes/contagem', {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie')
            }
        });

        const count = await countResponse.text();
        console.log('Notification count response:', count);

        // Test notifications endpoint
        const notificationsResponse = await fetch('http://localhost:3000/notificacoes', {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie')
            }
        });

        const notifications = await notificationsResponse.text();
        console.log('Notifications response:', notifications);

    } catch (error) {
        console.error('Error:', error);
    }
}

testNotificationsWithUser();
