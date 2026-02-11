<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel SuperApp 2.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white font-sans">
    <div class="max-w-2xl mx-auto p-6 text-center">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-green-400">SuperApp 2.0</h1>
            <p class="text-slate-400 text-[10px] tracking-widest uppercase">Gerenciador de Instância</p>
        </header>
        
        <div class="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
            <div id="status-container" class="mb-6">
                <span id="badge" class="px-4 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400 uppercase">Sincronizando...</span>
            </div>

            <div class="bg-white p-4 rounded-xl inline-block min-w-[300px] min-h-[300px] flex items-center justify-center border-4 border-slate-700">
                <div id="loader" class="text-slate-800 font-medium">Aguardando sinal do servidor...</div>
                <img id="qr" class="hidden w-64 h-64" src="">
                <div id="success" class="hidden text-green-600 font-bold text-2xl uppercase italic">✓ Bot Online</div>
            </div>

            <div class="mt-8 text-left border-t border-slate-700 pt-6">
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">Comando de Voz / Personalidade IA</label>
                <textarea id="prompt" class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm h-28 outline-none focus:border-green-500" placeholder="Digite as instruções da sua IA aqui..."></textarea>
                <button onclick="salvarConfig()" class="w-full mt-4 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition-all uppercase tracking-wider">Salvar Alterações</button>
            </div>
        </div>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // CONFIGURAÇÃO ATUALIZADA PARA PROJETO: bot2-79d05
        const firebaseConfig = {
            apiKey: "AIzaSyAi3LTAIeeD4_-6BmnNBI2kgiR5kLCKgQE", // Baseada no seu SDK
            authDomain: "bot2-79d05.firebaseapp.com",
            projectId: "bot2-79d05",
            storageBucket: "bot2-79d05.appspot.com",
            messagingSenderId: "103394690306809587999",
            appId: "1:1033946903068:web:04339a8c7e64caec0bbc5e" // ID padrão para esse sender
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // ESCUTAR O WHATSAPP
        onSnapshot(doc(db, "instancias", "whatsapp"), (snap) => {
            const badge = document.getElementById('badge');
            const loader = document.getElementById('loader');
            const qrImg = document.getElementById('qr');
            const success = document.getElementById('success');

            if (snap.exists()) {
                const data = snap.data();
                
                if (data.status === 'online') {
                    badge.innerText = "SISTEMA ONLINE";
                    badge.className = "px-4 py-1 rounded-full text-xs font-bold bg-green-500 text-white";
                    loader.classList.add('hidden');
                    qrImg.classList.add('hidden');
                    success.classList.remove('hidden');
                } else if (data.qrcode) {
                    badge.innerText = "ESCANEIE O QR CODE";
                    badge.className = "px-4 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black";
                    loader.classList.add('hidden');
                    qrImg.src = data.qrcode;
                    qrImg.classList.remove('hidden');
                    success.classList.add('hidden');
                }
            }
        });

        // SALVAR PROMPT
        window.salvarConfig = async () => {
            const texto = document.getElementById('prompt').value;
            try {
                await setDoc(doc(db, "configuracoes", "ia"), { prompt: texto }, { merge: true });
                alert("✅ Configuração salva no Firebase!");
            } catch (e) {
                alert("❌ Erro ao salvar: " + e.message);
            }
        };
    </script>
</body>
</html>
