<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel SuperApp 2.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white font-sans">
    <div class="max-w-2xl mx-auto p-6">
        <header class="text-center mb-8">
            <h1 class="text-3xl font-bold text-green-400">SuperApp 2.0</h1>
            <p class="text-slate-400 uppercase text-[10px] tracking-widest">Painel de Controle</p>
        </header>

        <div class="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <div id="status-container" class="mb-6 text-center">
                <span id="badge" class="px-4 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400">SINCRONIZANDO...</span>
            </div>

            <div class="flex flex-col justify-center bg-white p-6 rounded-xl min-h-[300px] items-center text-center">
                <p id="msg" class="text-slate-800 font-bold mb-4">Conectando ao Firebase...</p>
                <img id="qr" class="hidden w-64 h-64 border-4 border-white" src="">
                <div id="success" class="hidden text-green-600 font-bold text-xl">✓ BOT CONECTADO</div>
            </div>

            <div class="mt-8">
                <label class="block text-sm font-medium mb-2 text-slate-300">Personalidade da IA (Nicho)</label>
                <textarea id="prompt" class="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-green-500" placeholder="Ex: Você é um vendedor..."></textarea>
                <button onclick="salvarConfig()" id="btn-save" class="w-full mt-4 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition-all">
                    SALVAR CONFIGURAÇÃO
                </button>
            </div>
        </div>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // CONFIGURAÇÃO COM SUAS CHAVES REAIS
        const firebaseConfig = {
            apiKey: "AIzaSyAi3LTAIeeD4_-6BmnNBI2kgiR5kLCKgQE",
            authDomain: "superapp-d0368.firebaseapp.com",
            projectId: "superapp-d0368",
            storageBucket: "superapp-d0368.firebasestorage.app",
            messagingSenderId: "469594170619",
            appId: "1:469594170619:web:04339a8c7e64caec0bbc5e"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // MONITORAR STATUS E QR CODE
        onSnapshot(doc(db, "instancias", "whatsapp"), (snap) => {
            const badge = document.getElementById('badge');
            const msg = document.getElementById('msg');
            const qrImg = document.getElementById('qr');
            const success = document.getElementById('success');

            if (snap.exists()) {
                const data = snap.data();
                
                if (data.status === 'online') {
                    badge.innerText = "ONLINE";
                    badge.className = "px-4 py-1 rounded-full text-xs font-bold bg-green-500 text-white";
                    msg.classList.add('hidden');
                    qrImg.classList.add('hidden');
                    success.classList.remove('hidden');
                } else if (data.qrcode) {
                    badge.innerText = "AGUARDANDO QR CODE";
                    badge.className = "px-4 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black";
                    msg.classList.add('hidden');
                    qrImg.src = data.qrcode;
                    qrImg.classList.remove('hidden');
                    success.classList.add('hidden');
                }
            } else {
                msg.innerText = "Aguardando sinal do servidor SSH...";
            }
        });

        // SALVAR NICHO
        window.salvarConfig = async () => {
            const btn = document.getElementById('btn-save');
            const prompt = document.getElementById('prompt').value;
            btn.innerText = "SALVANDO...";
            try {
                await setDoc(doc(db, "configuracoes", "ia"), { prompt_vendas: prompt }, { merge: true });
                alert("Salvo com sucesso!");
            } catch (e) { alert("Erro: " + e.message); }
            btn.innerText = "SALVAR CONFIGURAÇÃO";
        };
    </script>
</body>
</html>
