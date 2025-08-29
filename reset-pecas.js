// Script para limpar e reinicializar o array de peças
const fs = require('fs');
const path = require('path');

// Simular o mesmo array do servidor
let pecas = [];

// Adicionar algumas peças de teste bem formatadas
const pecasTeste = [
    {
        id: 1,
        titulo: "Moletom Amarelo",
        descricao: "Moletom confortável e estiloso, perfeito para dias frios.",
        categoria: "Masculino",
        tipo: "Troca",
        preco: null,
        preferencia: "Camisetas",
        isPremium: false,
        idUsuario: 2,
        imagem: './image/moletom.jpg'
    }
];

// Adicionar as peças de teste
pecas = [...pecasTeste];

// Testar o JSON gerado
console.log("=== TESTE DE FORMATO JSON ===");
const jsonTeste = JSON.stringify(pecas, null, 2);
console.log(jsonTeste);

// Verificar se o JSON é válido
try {
    const parsed = JSON.parse(jsonTeste);
    console.log("✅ JSON válido!");
    console.log("Número de peças:", parsed.length);
    
    // Testar busca por ID
    const peca1 = parsed.find(p => p.id == 1);
    console.log("Peça com ID 1 encontrada:", peca1 ? peca1.titulo : "Não encontrada");
    
    const peca2 = parsed.find(p => p.id == 2);
    console.log("Peça com ID 2 encontrada:", peca2 ? peca2.titulo : "Não encontrada");
    
} catch (error) {
    console.log("❌ JSON inválido:", error.message);
}

console.log("\n=== INSTRUÇÕES ===");
console.log("1. Pare o servidor atual (Ctrl+C)");
console.log("2. Substitua o array 'pecas' no server.js por:");
console.log("const pecas = " + JSON.stringify(pecasTeste, null, 2) + ";");
console.log("3. Reinicie o servidor");
