<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>CRM SuperApp 2.0 - Controle de Bot</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
        h1 { color: #075e54; text-align: center; }
        .status { padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; font-weight: bold; }
        .online { background: #dcf8c6; color: #075e54; }
        textarea { width: 100%; height: 150px; margin: 10px 0; border-radius: 5px; border: 1px solid #ccc; padding: 10px; }
        button { width: 100%; padding: 15px; background: #25d366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #128c7e; }
        #qrcode { display: block; margin: 20px auto; max-width: 200px; }
    </style>
</head>
<body>

<div class="card">
    <h1>SuperApp CRM 2.0</h1>
    <div id="status-box" class="status">Verificando status...</div>
    
    <img id="qrcode" src="" alt="Aguardando QR Code..." style="display:none;">

    <h3>Identidade da IA (Nicho)</h3>
    <p>Defina como o bot deve se comportar:</p>
    <textarea id="prompt" placeholder="Ex: Você é um corretor de imóveis focado em vendas de luxo..."></textarea>
    
    <div style="margin: 15px 0;">
        <label>
            <input type="checkbox" id="modo_manual"> <b>Intervenção Manual (Pausar IA)</b>
        </label>
    </div>

    <button onclick="salvarConfiguracoes()">Salvar Configurações</button>
</div>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  // COLE AQUI AS CONFIGURAÇÕES DO SEU FIREBASE (WEB APP)
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "ID",
    appId: "ID"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Monitorar Status e QR Code em tempo real
  onSnapshot(doc(db, "instancias", "whatsapp"), (doc) => {
      const data = doc.data();
      const statusBox = document.getElementById('status-box');
      const qrImg = document.getElementById('qrcode');

      if(data.status === 'online') {
          statusBox.innerText = "BOT ONLINE";
          statusBox.className = "status online";
          qrImg.style.display = 'none';
      } else {
          statusBox.innerText = "AGUARDANDO QR CODE";
          statusBox.className = "status";
          if(data.qrcode) {
              qrImg.src = data.qrcode;
              qrImg.style.display = 'block';
          }
      }
  });

  // Função para salvar nicho e prompt
  window.salvarConfiguracoes = async () => {
      const promptText = document.getElementById('prompt').value;
      const manual = document.getElementById('modo_manual').checked;
      
      await setDoc(doc(db, "configuracoes", "ia"), {
          prompt_vendas: promptText,
          modo_manual: manual
      }, { merge: true });

      alert("Configurações salvas! O bot já atualizou a inteligência.");
  }
</script>
</body>
</html>
