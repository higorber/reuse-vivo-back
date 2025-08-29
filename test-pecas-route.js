// Script para testar a rota /pecas detalhadamente
const http = require('http');

function testPecasRoute() {
    console.log('Testando rota /pecas...');
    
    // Testar rota sem ID (todas as peças)
    http.get('http://localhost:3000/pecas', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Resposta de /pecas (todas):');
            console.log('Status:', res.statusCode);
            console.log('Conteúdo:', data.substring(0, 200) + '...'); // Mostrar apenas parte do conteúdo
            console.log('Tamanho total:', data.length, 'bytes');
            
            // Tentar parsear o JSON para ver se está bem formatado
            try {
                const jsonData = JSON.parse(data);
                console.log('JSON parseado com sucesso!');
                console.log('Número de peças:', jsonData.length);
                
                // Testar buscar uma peça específica
                if (jsonData.length > 0) {
                    const primeiraPeca = jsonData[0];
                    console.log('Primeira peça ID:', primeiraPeca.id, 'Tipo:', typeof primeiraPeca.id);
                    testPecaEspecifica(primeiraPeca.id);
                }
            } catch (error) {
                console.log('Erro ao parsear JSON:', error.message);
            }
        });
    }).on('error', (err) => {
        console.log('Erro na requisição:', err.message);
    });
}

function testPecaEspecifica(id) {
    console.log(`\nTestando rota /pecas?id=${id}...`);
    
    http.get(`http://localhost:3000/pecas?id=${id}`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Resposta de /pecas?id=' + id + ':');
            console.log('Status:', res.statusCode);
            
            if (res.statusCode === 200) {
                console.log('Conteúdo:', data);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('JSON parseado com sucesso!');
                    console.log('Peça encontrada:', jsonData.titulo);
                } catch (error) {
                    console.log('Erro ao parsear JSON:', error.message);
                }
            } else {
                console.log('Mensagem de erro:', data);
            }
        });
    }).on('error', (err) => {
        console.log('Erro na requisição:', err.message);
    });
}

// Executar teste
testPecasRoute();
