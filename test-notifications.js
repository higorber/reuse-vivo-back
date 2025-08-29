// Simple test to verify notifications endpoint
async function testNotifications() {
    console.log('Testing notifications endpoint...');
    
    try {
        // Login with the test user
        const loginData = JSON.stringify({
            email: 'test@example.com',
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

    } catch (error) {
        console.error('Error:', error);
    }
}

testNotifications();
