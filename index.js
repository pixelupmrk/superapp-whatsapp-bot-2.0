const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeInMemoryStore, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const pino = require('pino');

// --- Configuração do Firebase Admin (USANDO O SEU ARQUIVO JSON) ---
let db;
try {
    const serviceAccount = require('./firebase-key.json');
    initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore();
    console.log("[Firebase] Conectado com sucesso!");
} catch (error) {
    console.error("[Firebase] ERRO ao carregar firebase-key.json:", error);
}

// --- Configuração da IA ---
const GEMINI_KEY = "AIzaSyApqtbHH451RHYwRG-FMshsvS9JZx21Rkk"; // Coloque sua chave aqui ou em env
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Configuração do Servidor ---
const app = express();
app.use(cors()); 
app.use(express.json());
const port = 8080;

const whatsappClients = {};
const qrCodeDataStore = {}; 

// --- Função para Salvar QR Code no Firebase para o Dashboard ---
async function saveQRToFirebase(userId, url) {
    try {
        await db.collection('instancias').doc('whatsapp').set({
            qrcode: url,
            status: 'aguardando_leitura',
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) { console.error("Erro ao salvar QR no Firebase", e); }
}

// --- Função Principal do WhatsApp ---
async function startBot(userId = "admin") {
    const { state, saveCreds } = await useMultiFileAuthState(`auth_${userId}`);
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['SuperApp 2.0', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            const url = await qrcode.toDataURL(qr);
            saveQRToFirebase(userId, url);
            console.log("[WhatsApp] Novo QR Code gerado. Escaneie no seu Dashboard!");
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot(userId);
        } else if (connection === 'open') {
            console.log("[WhatsApp] Conectado!");
            await db.collection('instancias').doc('whatsapp').update({ status: 'online', qrcode: null });
        }
    });

    // LÓGICA DE MENSAGENS COM INTELIGÊNCIA POR NICHO
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        try {
            // 1. BUSCA CONFIGURAÇÃO DE NICHO NO FIREBASE
            const configDoc = await db.collection('configuracoes').doc('ia').get();
            const config = configDoc.data() || { prompt_vendas: "Você é um assistente prestativo.", modo_manual: false };

            // 2. VERIFICA SE ESTÁ NO MODO MANUAL (CRM INTERVENÇÃO)
            if (config.modo_manual) {
                console.log("[IA] Modo manual ativo. Silenciando bot.");
                return;
            }

            // 3. GERA RESPOSTA COM A PERSONALIDADE DO NICHO
            const promptFinal = `${config.prompt_vendas}\n\nCliente diz: ${text}`;
            const result = await model.generateContent(promptFinal);
            const aiResponse = result.response.text();

            // 4. ENVIA E SALVA NO HISTÓRICO
            await sock.sendMessage(sender, { text: aiResponse });
            
            // Opcional: Salvar no histórico do Firebase aqui
        } catch (err) {
            console.error("Erro ao processar IA:", err);
        }
    });

    whatsappClients[userId] = sock;
}

// Iniciar o bot automaticamente
startBot();

app.get('/', (req, res) => res.send("Servidor SuperApp 2.0 Ativo"));
app.listen(port, () => console.log(`[Servidor] Rodando na porta ${port}`));
