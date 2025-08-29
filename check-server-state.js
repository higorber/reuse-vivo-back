// Script para verificar o estado atual do servidor
const express = require('express');
const app = express();
const port = 3001; // Usar porta diferente para não conflitar

// Simular o estado do servidor real
const usuarios = [];
const pecas = [];
const pecasDeExemplo = [
    { id: 'ex-1', titulo: "Camiseta Monalisa Preta", descricao: "Pouco usada, ideal para qualquer ocasião.", tipo: "Troca", categoria: "Masculino", imagem: "/image/mona.png" },
    { id: 'ex-2', titulo: "Calça Jeans", descricao: "Calça de marca, em excelente estado.", tipo: "Troca", categoria: "Feminino", imagem: "/image/calca.jpg" }
];

// Adicionar alguns dados de teste
const usuarioTeste = {
    id: 1,
    nome: "Usuário Teste",
    email: "teste@email.com",
    senha: "123456",
    telefone: "(11) 99999-9999"
};
usuarios.push(usuarioTeste);

const pecaTeste = {
    id: 1,
    titulo: "Camiseta Teste",
    descricao: "Camiseta para teste",
    categoria: "Masculino",
    tipo: "Troca",
    idUsuario: 1,
    imagem: null
};
pecas.push(pecaTeste);

// Rota de teste
app.get('/test-pecas', (req, res) => {
    const { id } = req.query;
    
    console.log("Buscando peça com ID:", id);
    console.log("Peças reais:", pecas);
    console.log("Peças de exemplo:", pecasDeExemplo);
    
    if (id) {
        // Procurar primeiro nas peças reais
        const pecaReal = pecas.find(p => p.id == id);
        if (pecaReal) {
            console.log("Encontrada peça real:", pecaReal);
            return res.json(pecaReal);
        }
        
        // Procurar nas peças de exemplo
        const pecaExemplo = pecasDeExemplo.find(p => p.id == id);
        if (pecaExemplo) {
            console.log("Encontrada peça de exemplo:", pecaExemplo);
            return res.json(pecaExemplo);
        }
        
        console.log("Peça não encontrada em nenhum array");
        return res.status(404).send('Produto não encontrado');
    }
    
    res.json([...pecas, ...pecasDeExemplo]);
});

app.listen(port, () => {
    console.log(`Servidor de teste rodando em http://localhost:${port}`);
    console.log('Teste a rota: http://localhost:3001/test-pecas?id=1');
});
