const http = require('http');

// Test the trade functionality
function testTrade() {
    console.log('Testing trade functionality...');
    
    // First, create a test user
    const userData = JSON.stringify({
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'password123',
        telefone: '(11) 99999-9999'
    });

    const userReq = http.request('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('User created:', data);
            
            // Now test login
            const loginData = JSON.stringify({
                email: 'test@example.com',
                senha: 'password123'
            });

            const loginReq = http.request('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }, (loginRes) => {
                let loginData = '';
                loginRes.on('data', (chunk) => {
                    loginData += chunk;
                });
                loginRes.on('end', () => {
                    console.log('Login response:', loginData);
                    
                    // Get session cookie for subsequent requests
                    const cookie = loginRes.headers['set-cookie'];
                    console.log('Session cookie:', cookie);
                });
            });

            loginReq.write(loginData);
            loginReq.end();
        });
    });

    userReq.write(userData);
    userReq.end();
}

testTrade();
