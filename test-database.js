// Script para testar o estado do banco de dados em memória
const usuarios = [];
const pecas = [];
const negociacoes = [];

// Adicionar alguns dados de exemplo para teste
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

console.log("=== ESTADO DO BANCO DE DADOS ===");
console.log("Usuários:", usuarios);
console.log("Peças:", pecas);
console.log("Negociações:", negociacoes);
console.log("================================");

// Testar a rota /pecas com id
console.log("\n=== TESTE ROTA /pecas?id=1 ===");
const pecaEncontrada = pecas.find(p => p.id == 1);
console.log("Peça encontrada:", pecaEncontrada);

// Testar a rota /pecas-usuario para usuário 1
console.log("\n=== TESTE ROTA /pecas-usuario (usuário 1) ===");
const pecasUsuario = pecas.filter(p => p.idUsuario === 1);
console.log("Peças do usuário:", pecasUsuario);
