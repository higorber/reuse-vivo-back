const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// ----------------------
// CONFIGURAÇÃO DO CORS
// ----------------------
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://reuse-vivo-front.vercel.app' // 🔑 troque pela URL do seu front hospedado
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// ----------------------
// MIDDLEWARES
// ----------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../front')));
app.use('/image', express.static(path.join(__dirname, '../image')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------
// CONFIGURAÇÃO DE SESSÃO
// ----------------------
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret: 'seu-segredo-aqui',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: isProduction, // true apenas no Render (https)
        sameSite: isProduction ? 'none' : 'lax', 
        maxAge: 24 * 60 * 60 * 1000
    }
}));


// ----------------------
// CONFIGURAÇÃO DO MULTER
// ----------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads/pecas');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.session.userId || 'unknown';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `peca-${userId}-${timestamp}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

// Simula um banco de dados em memória
const usuarios = [];
const pecas = [
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
const negociacoes = []; // NOVO ARRAY PARA ARMAZENAR AS NEGOCIAÇÕES

// Peças de exemplo para exibir se a loja estiver vazia
const pecasDeExemplo = [
    { id: 'ex-1', titulo: "Camiseta Monalisa Preta", descricao: "Pouco usada, ideal para qualquer ocasião.", tipo: "Troca", categoria: "Masculino", imagem: "/image/mona.png" },
    { id: 'ex-2', titulo: "Calça Jeans", descricao: "Calça de marca, em excelente estado.", tipo: "Troca", categoria: "Feminino", imagem: "/image/calca.jpg" },
    { id: 'ex-3', titulo: "Jaqueta de Couro", descricao: "Jaqueta vintage de alta qualidade.", tipo: "Venda", preco: 189.90, categoria: "Masculino", imagem: "/image/jaqueta.jpg" },
    { id: 'ex-4', titulo: "Vestido Floral", descricao: "Vestido leve, com estampa vibrante.", tipo: "Troca", categoria: "Feminino", imagem: "/image/vestido.jpg" },
    { id: 'ex-5', titulo: "Blusa de Frio", descricao: "Blusa de lã para crianças, muito quentinha.", tipo: "Troca", categoria: "Infantil", imagem: "/image/blusa.jpg" },
    { id: 'ex-6', titulo: "Tênis Casual", descricao: "Tênis esportivo, poucas marcas de uso.", tipo: "Venda", preco: 120.00, categoria: "Masculino", imagem: "/image/tenis.jpg" },
    { id: 'ex-7', titulo: "Shorts Infantil", descricao: "Shorts de algodão, confortável para brincar.", tipo: "Troca", categoria: "Infantil", imagem: "/image/shortkids.jpg" }
];

// Middleware para verificar se o usuário está autenticado
const verificarAutenticacao = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('Usuário não autenticado');
    }
    next();
};

// Rota de cadastro para criar novo usuário
app.post('/cadastro', (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha || !telefone) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    // Validação de senha - mínimo 6 caracteres
    if (senha.length < 6) {
        return res.status(400).send('A senha deve ter pelo menos 6 caracteres.');
    }

    // Validação de telefone - formato básico
    const telefoneRegex = /^(\+\d{1,3})?[\s-]?\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        return res.status(400).send('Telefone inválido. Use o formato: (XX) XXXXX-XXXX');
    }

    const usuarioExistente = usuarios.find(u => u.email === email);
    if (usuarioExistente) {
        return res.status(400).send('E-mail já cadastrado.');
    }

    console.log('Attempting to register user:', { nome, email, telefone });
    
    const novoUsuario = {
        id: usuarios.length + 1,
        nome,
        email,
        senha,
        telefone,
        dataCriacao: new Date()
    };

    usuarios.push(novoUsuario);
    
    req.session.userId = novoUsuario.id;
    req.session.save((err) => {
        if (err) {
            return res.status(500).send('Erro ao salvar sessão');
        }
        res.status(201).send('Usuário cadastrado com sucesso!');
    });
});

// Rota de login para autenticação
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        req.session.userId = usuario.id;
        req.session.save((err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar sessão');
            }
            return res.status(200).send('Usuário autenticado com sucesso!');
        });
        return;
    }
    res.status(401).send('E-mail ou senha incorretos.');
});

app.get('/pecas', (req, res) => {
    const { id } = req.query; // Obter o ID do produto dos parâmetros de consulta
    console.log('Buscando peça com ID:', id, 'Tipo:', typeof id); // Log para depuração
    
    if (id) {
        // Usar comparação não estrita para lidar com string vs number
        console.log('Procurando peça real com ID:', id);
        const pecaReal = pecas.find(p => {
            console.log('Comparando:', p.id, '==', id, 'Resultado:', p.id == id);
            return p.id == id;
        });
        
        console.log('Procurando peça de exemplo com ID:', id);
        const pecaExemplo = pecasDeExemplo.find(p => {
            console.log('Comparando:', p.id, '==', id, 'Resultado:', p.id == id);
            return p.id == id;
        });
        
        const peca = pecaReal || pecaExemplo;
        
        if (peca) {
            console.log('Peça encontrada:', peca);
            return res.json(peca); // Return the specific product
        } else {
            console.log('Produto não encontrado - IDs disponíveis:');
            console.log('Pecas reais:', pecas.map(p => ({id: p.id, tipo: typeof p.id})));
            console.log('Pecas exemplo:', pecasDeExemplo.map(p => ({id: p.id, tipo: typeof p.id})));
            return res.status(404).send('Produto não encontrado');
        }
    }
    console.log('Retornando todas as peças');
    const todasAsPecas = [...pecas, ...pecasDeExemplo];
    res.json(todasAsPecas);
});

// Rota para venda de peça
app.post('/venda', verificarAutenticacao, (req, res) => {
    const { idPeca } = req.body;
    const userId = req.session.userId;

    // Busca a peça real ou de exemplo
    const peca = pecas.find(p => p.id == idPeca) || pecasDeExemplo.find(p => p.id === idPeca);

    if (!peca) {
        return res.status(404).send('Peça não encontrada.');
    }

    if (peca.idUsuario === userId) {
        return res.status(400).send('Não é possível comprar sua própria peça.');
    }

    // Para peças de exemplo, não há idUsuario, então não podemos verificar se é do próprio usuário
    if (peca.idUsuario && peca.idUsuario === userId) {
        return res.status(400).send('Não é possível comprar sua própria peça.');
    }

    // Para peças de exemplo, apenas retorna a mensagem de sucesso
    res.status(200).send(`Compra da peça "${peca.titulo}" concluída!`);
});

// Rota para verificar status de login e obter informações do usuário
app.get('/status', (req, res) => {
    if (req.session.userId) {
        const usuario = usuarios.find(u => u.id === req.session.userId);
        const negociacoesPendentes = negociacoes.filter(n => 
            (n.idUsuarioDestino === req.session.userId || n.idUsuarioOrigem === req.session.userId) && 
            n.status === 'pendente'
        ).length;

        res.json({
            loggedIn: true,
            user: usuario ? { nome: usuario.nome, email: usuario.email, fotoPerfil: usuario.fotoPerfil } : null,
            negociacoesPendentes // Adiciona a contagem de negociações
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Rota para logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Erro ao fazer logout');
        }
        res.send('Logout realizado com sucesso');
    });
});

// Rota para obter peças do usuário logado
app.get('/pecas-usuario', verificarAutenticacao, (req, res) => {
    const userId = req.session.userId;
    
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const userPecas = pecas.filter(peca => peca.idUsuario === userId);
    res.json(userPecas);
});

// Rota para adicionar nova peça
app.post('/adicionar-peca', verificarAutenticacao, upload.single('imagem'), (req, res) => {
    const { titulo, descricao, categoria, tipo, preco, preferencia } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send('Você precisa estar logado para cadastrar uma peça.');
    }

    if (!titulo || !descricao || !categoria || !tipo) {
        return res.status(400).send('Todos os campos obrigatórios precisam ser preenchidos.');
    }

    const novaPeca = {
        id: pecas.length + 1,
        titulo,
        descricao,
        categoria,
        tipo,
        preco: tipo === 'Venda' ? parseFloat(preco) : null,
        preferencia: tipo === 'Troca' ? preferencia : null,
        isPremium: false,
        idUsuario: userId,
        imagem: req.file ? `/uploads/pecas/${req.file.filename}` : null
    };

    pecas.push(novaPeca);
    res.status(201).send('Peça cadastrada com sucesso!');
});

// Rota para negociar uma peça (ajustada para lidar com o ID na URL)
app.post('/negociar/:pecaId', verificarAutenticacao, (req, res) => {
    const { pecaId } = req.params;
    const userId = req.session.userId;
    
    // Busca a peça real ou de exemplo
    const peca = pecas.find(p => p.id == pecaId) || pecasDeExemplo.find(p => p.id == pecaId);
    
    if (!peca) {
        return res.status(404).send('Peça não encontrada.');
    }

    if (peca.idUsuario === userId) {
        return res.status(400).send('Não é possível negociar sua própria peça.');
    }
    
    // Verifica se a negociação já existe
    const negociacaoExistente = negociacoes.find(n => n.idUsuarioInteressado === userId && n.idPeca == pecaId);
    if (negociacaoExistente) {
        return res.status(400).send('Você já iniciou uma negociação para esta peça.');
    }

    // Apenas negocia se a peça não for de exemplo
    if (typeof peca.id === 'number') {
        const novaNegociacao = {
            id: negociacoes.length + 1,
            idUsuarioInteressado: userId,
            idUsuarioDono: peca.idUsuario,
            idPeca: peca.id,
            mensagem: 'Proposta de negociação enviada.',
            status: 'pendente',
            data: new Date()
        };
        negociacoes.push(novaNegociacao);
        res.status(200).send(`Proposta de negociação enviada com sucesso para a peça "${peca.titulo}".`);
    } else {
        // Para peças de exemplo, apenas retorna uma mensagem de sucesso
        res.status(200).send(`Proposta de negociação de exemplo enviada para a peça "${peca.titulo}". (Esta é apenas uma demonstração)`);
    }
});

// Rota para comprar uma peça (ajustada para lidar com o ID na URL)
app.post('/comprar/:pecaId', verificarAutenticacao, (req, res) => {
    const { pecaId } = req.params;
    const userId = req.session.userId;

    // Busca a peça real ou de exemplo
    const peca = pecas.find(p => p.id == pecaId) || pecasDeExemplo.find(p => p.id == pecaId);

    if (!peca) {
        return res.status(404).send('Peça não encontrada.');
    }

    if (peca.idUsuario === userId) {
        return res.status(400).send('Não é possível comprar sua própria peça.');
    }

    // Apenas compra se a peça não for de exemplo
    if (typeof peca.id === 'number') {
        // Lógica de compra real aqui
        res.status(200).send(`Compra da peça "${peca.titulo}" concluída!`);
    } else {
        // Para peças de exemplo, apenas retorna uma mensagem de sucesso
        res.status(200).send(`Compra de exemplo da peça "${peca.titulo}" concluída! (Esta é apenas uma demonstração)`);
    }
});

// ROTA PARA BUSCAR AS NEGOCIAÇÕES DO USUÁRIO
app.get('/minhas-negociacoes', verificarAutenticacao, (req, res) => {
    const userId = req.session.userId;
    const minhasNegociacoes = negociacoes.filter(n => n.idUsuarioInteressado === userId || n.idUsuarioDono === userId);
    
    const negociacoesDetalhes = minhasNegociacoes.map(n => {
        const peca = pecas.find(p => p.id === n.idPeca);
        return {
            ...n,
            tituloPeca: peca ? peca.titulo : 'Peça removida',
            imagemPeca: peca ? peca.imagem : null
        };
    });

    res.json(negociacoesDetalhes);
});

// Rota para fazer upload da foto de perfil
app.post('/upload-profile-photo', verificarAutenticacao, upload.single('profilePhoto'), (req, res) => {
    const userId = req.session.userId;
    const usuario = usuarios.find(u => u.id === userId);

    if (!req.file || !usuario) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado ou usuário não encontrado.' });
    }

    // Atualiza o caminho da foto de perfil do usuário
    usuario.fotoPerfil = `/uploads/pecas/${req.file.filename}`;
    res.json({ success: true, fotoPerfil: usuario.fotoPerfil });
});

// Rota para troca
app.post('/troca', verificarAutenticacao, (req, res) => {
    console.log('Request body:', req.body); // Log the incoming request body
    const { idPecaOrigem, idPecaDestino } = req.body;
    const idUsuarioOrigem = req.session.userId;

    console.log('Recebendo proposta de troca:', { idPecaOrigem, idPecaDestino, idUsuarioOrigem });

    // Busca a peça destino (peça da loja)
    console.log('Buscando peça destino com ID:', idPecaDestino);
    const pecaDestino = pecas.find(p => p.id == idPecaDestino);
    
    if (!pecaDestino) {
        console.log('Peça destino não encontrada. IDs disponíveis:', pecas.map(p => p.id));
        return res.status(404).send('Peça não encontrada.');
    }

    console.log('Peça destino encontrada:', pecaDestino);

    if (pecaDestino.idUsuario === idUsuarioOrigem) {
        console.log('Usuário tentando negociar sua própria peça');
        return res.status(400).send('Não é possível negociar sua própria peça.');
    }

    // Verifica se a peça origem pertence ao usuário
    console.log('Buscando peça origem com ID:', idPecaOrigem);
    const pecaOrigem = pecas.find(p => p.id == idPecaOrigem && p.idUsuario === idUsuarioOrigem);
    if (!pecaOrigem) {
        console.log('Peça origem não encontrada ou não pertence ao usuário. IDs disponíveis:', pecas.map(p => p.id));
        return res.status(400).send('Peça ofertada não encontrada ou não pertence a você.');
    }

    console.log('Peça origem encontrada:', pecaOrigem);

    // Verifica se já existe uma proposta para esta combinação
    const propostaExistente = negociacoes.find(n => 
        n.idUsuarioOrigem === idUsuarioOrigem && 
        n.idPecaDestino == idPecaDestino &&
        n.idPecaOrigem == idPecaOrigem &&
        n.status === 'pendente'
    );

    if (propostaExistente) {
        console.log('Proposta já existe para esta combinação');
        return res.status(400).send('Você já enviou uma proposta para esta troca.');
    }

    const novaNegociacao = {
        id: negociacoes.length + 1,
        idPecaOrigem: parseInt(idPecaOrigem),
        idPecaDestino: parseInt(idPecaDestino),
        idUsuarioOrigem: idUsuarioOrigem,
        idUsuarioDestino: pecaDestino.idUsuario,
        status: 'pendente',
        dataProposta: new Date(),
        dataResposta: null
    };

    negociacoes.push(novaNegociacao);
    console.log('Nova negociação criada:', novaNegociacao);
    res.status(200).send('Requisição de troca enviada');
    console.log(`Nova proposta de troca: ${idUsuarioOrigem} oferece peça ${idPecaOrigem} pela peça ${idPecaDestino} de ${pecaDestino.idUsuario}`);
});

// Rota para aceitar ou recusar uma proposta de troca
app.post('/troca/:id/acao', verificarAutenticacao, (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;
    const { acao } = req.body;

    const negociacao = negociacoes.find(n => n.id == id);

    if (!negociacao) {
        return res.status(404).send('Negociação não encontrada.');
    }

    if (negociacao.idUsuarioDestino !== userId) {
        return res.status(403).send('Você não tem permissão para responder a esta proposta.');
    }

    negociacao.status = acao === 'aceitar' ? 'aceita' : 'recusada';
    negociacao.dataResposta = new Date();

    res.status(200).send(`Proposta de troca ${acao === 'aceitar' ? 'aceita' : 'recusada'}.`);
});

// Rota para aceitar ou recusar uma proposta de troca (mantida para compatibilidade)
app.post('/responder-troca/:negociacaoId', verificarAutenticacao, (req, res) => {
    const { negociacaoId } = req.params;
    const userId = req.session.userId;
    const { resposta } = req.body;

    const negociacao = negociacoes.find(n => n.id == negociacaoId);

    if (!negociacao) {
        return res.status(404).send('Negociação não encontrada.');
    }

    if (negociacao.idUsuarioDestino !== userId) {
        return res.status(403).send('Você não tem permissão para responder a esta proposta.');
    }

    negociacao.status = resposta === 'aceitar' ? 'aceita' : 'recusada';
    negociacao.dataResposta = new Date();

    res.status(200).send(`Proposta de troca ${resposta === 'aceitar' ? 'aceita' : 'recusada'}.`);
});

// Rota para obter detalhes completos das negociações
app.get('/negociacoes-detalhadas', verificarAutenticacao, (req, res) => {
    const userId = req.session.userId;
    const minhasNegociacoes = negociacoes.filter(n => 
        n.idUsuarioOrigem === userId || n.idUsuarioDestino === userId
    );

    const negociacoesDetalhadas = minhasNegociacoes.map(n => {
        const pecaOrigem = pecas.find(p => p.id === n.idPecaOrigem);
        const pecaDestino = pecas.find(p => p.id === n.idPecaDestino);
        const usuarioOrigem = usuarios.find(u => u.id === n.idUsuarioOrigem);
        const usuarioDestino = usuarios.find(u => u.id === n.idUsuarioDestino);

        return {
            id: n.id,
            status: n.status,
            dataProposta: n.dataProposta,
            dataResposta: n.dataResposta,
            pecaOrigem: pecaOrigem ? {
                id: pecaOrigem.id,
                titulo: pecaOrigem.titulo,
                imagem: pecaOrigem.imagem
            } : null,
            pecaDestino: pecaDestino ? {
                id: pecaDestino.id,
                titulo: pecaDestino.titulo,
                imagem: pecaDestino.imagem
            } : null,
            usuarioOrigem: usuarioOrigem ? {
                nome: usuarioOrigem.nome,
                telefone: usuarioOrigem.telefone
            } : null,
            usuarioDestino: usuarioDestino ? {
                nome: usuarioDestino.nome,
                telefone: usuarioDestino.telefone
            } : null
        };
    });

    res.json(negociacoesDetalhadas);
});

// Rota para obter notificações pendentes do usuário
app.get('/notificacoes', verificarAutenticacao, (req, res) => {
    const userId = req.session.userId;
    
    // Notificações são propostas onde o usuário é o dono da peça destino e o status é pendente
    const notificacoes = negociacoes.filter(n => 
        n.idUsuarioDestino === userId && n.status === 'pendente'
    ).map(n => {
        const pecaOrigem = pecas.find(p => p.id === n.idPecaOrigem);
        const pecaDestino = pecas.find(p => p.id === n.idPecaDestino);
        const usuarioOrigem = usuarios.find(u => u.id === n.idUsuarioOrigem);

        return {
            id: n.id,
            pecaOrigem: pecaOrigem ? {
                titulo: pecaOrigem.titulo,
                imagem: pecaOrigem.imagem
            } : null,
            pecaDestino: pecaDestino ? {
                titulo: pecaDestino.titulo,
                imagem: pecaDestino.imagem
            } : null,
            usuarioOrigem: usuarioOrigem ? {
                nome: usuarioOrigem.nome,
                telefone: usuarioOrigem.telefone
            } : null,
            dataProposta: n.dataProposta
        };
    });

    res.json(notificacoes);
});

// Rota para obter contagem de notificações pendentes
app.get('/notificacoes/contagem', verificarAutenticacao, (req, res) => {
    console.log('Accessed /notificacoes/contagem'); // Debug log
    const userId = req.session.userId;
    
    const contagem = negociacoes.filter(n => 
        n.idUsuarioDestino === userId && n.status === 'pendente'
    ).length;

    res.json({ contagem });
});

// Rota para chat com LLaMA3 local
/*
 * Para instalar as dependências necessárias:
 * 1. Certifique-se de ter o Node.js instalado (versão 14 ou superior)
 * 2. Instale as dependências do projeto:
 *    npm install express body-parser @xenova/transformers
 * 
 * Para rodar o servidor:
 * 1. Execute o comando: node server.js
 * 2. O servidor estará disponível em http://localhost:3000
 * 
 * Para testar a rota no Postman ou CURL:
 * 1. Envie uma requisição POST para http://localhost:3000/api/chat
 * 2. O corpo da requisição deve ser um JSON no formato: { "message": "sua mensagem aqui" }
 * 3. A resposta será um JSON no formato: { "response": "resposta do assistente" }
 * 
 * Exemplo com CURL:
 * curl -X POST http://localhost:3000/api/chat \
 *   -H "Content-Type: application/json" \
 *   -d '{"message": "Quais são as tendências de moda para o verão?"}'
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mensagem é obrigatória' });
        }

        // Importar o pipeline de transformers (carregará o modelo na primeira vez)
        const { pipeline } = require('@xenova/transformers');
        
        // Carregar o modelo LLaMA3 3B (isso pode levar algum tempo na primeira execução)
        // O modelo será baixado e armazenado em cache automaticamente
        const generator = await pipeline('text-generation', 'Xenova/llama3-3b-tokenizer');
        
        // Definir o prompt do sistema
        const systemPrompt = "Você é um assistente especializado em moda e customização de roupas. Responda de forma clara, detalhada e amigável em português.";
        
        // Formatar o prompt para o modelo
        const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
        
        // Gerar a resposta do modelo
        const response = await generator(prompt, {
            max_new_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
        });
        
        // Extrair o texto da resposta
        const responseText = response[0].generated_text.replace(prompt, '').trim();
        
        // Retornar a resposta em formato JSON
        res.json({ response: responseText });
        
    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


