// --- CONFIGURAÇÃO DO FIREBASE ---
// COLOQUE AQUI O OBJETO firebaseConfig QUE VOCÊ COPIOU DO SEU PROJETO
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByz3_TTLTFN612oTmnTvyZdNdRo7DrPYM",
  authDomain: "mpbn-e0d95.firebaseapp.com",
  projectId: "mpbn-e0d95",
  storageBucket: "mpbn-e0d95.firebasestorage.app",
  messagingSenderId: "601329958556",
  appId: "1:601329958556:web:a771f894b801969a5ff759",
  measurementId: "G-Q02J7HPK50"
};
// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); 
const fieldValue = firebase.firestore.FieldValue; 

// --- SENHAS ---
const ADMIN_PASSWORD = 'seminario';
const PLAYER_PASSWORD = 'mpbn';
const PRESENTER_PASSWORD = 'showmpb'; 

// --- REFERÊNCIAS DO DOM (Atualizadas) ---
const screens = document.querySelectorAll('.screen');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');

// Player Setup
const joinGameButton = document.getElementById('join-game-button');
const playerNameInput = document.getElementById('player-name');
// Corrigido para selecionar os botões de cor dentro do container do Jogador
const playerColorOptions = document.querySelectorAll('#color-selection-container .color-option'); 
const namePreview = document.getElementById('name-preview');     

// Presenter Setup
const joinPresenterButton = document.getElementById('join-presenter-button');
const presenterNameInput = document.getElementById('presenter-name');
// Corrigido para selecionar os botões de cor dentro do container do Apresentador
const presenterColorOptions = document.querySelectorAll('#presenter-color-selection .color-option'); 
const presenterNamePreview = document.getElementById('presenter-name-preview');

// Game Screen (Player)
const quizForm = document.getElementById('quiz-form');
const submitVoteButton = document.getElementById('submit-vote-button');
const timerDisplay = document.getElementById('timer-display');
const timeLeftSpan = document.getElementById('time-left');
const votingGroup = document.getElementById('voting-group');
const requestHintPlayerButton = document.getElementById('request-hint-player');
const waitingMessage = document.getElementById('waiting-message');

// Presenter Panel
const presenterIdDisplay = document.getElementById('presenter-id-display');
const levelSelect = document.getElementById('level-select');
const questionSelect = document.getElementById('question-select');
const timerDurationInput = document.getElementById('timer-duration');
const publishQuestionButton = document.getElementById('publish-question-button');
const showAnswerButton = document.getElementById('show-answer-button');
const voteCountDisplay = document.getElementById('vote-count-display');
const voteResultsDisplay = document.getElementById('vote-results-display');
const gameStatusDisplay = document.getElementById('game-status-display');
const presenterPlayerList = document.getElementById('presenter-player-list');
// Os botões de Ban/Punish no Presenter devem ficar desabilitados, ele só solicita a dica.
const presenterBanButton = document.getElementById('presenter-ban-button'); 
const presenterPunishButton = document.getElementById('presenter-punish-button');
const presenterRequestHintButton = document.getElementById('presenter-request-hint-button');
const presenterViewScoreboardButton = document.getElementById('presenter-view-scoreboard');

// Admin Panel
const passwordInput = document.getElementById('password-input');
const startGameButton = document.getElementById('start-game-button');
const viewScoreboardButton = document.getElementById('view-scoreboard-button');
const backToAdminButton = document.getElementById('back-to-admin');
const adminHintRequestsList = document.getElementById('admin-hint-requests');
const adminHintPrompt = document.getElementById('admin-hint-prompt');
const adminSendHintButton = document.getElementById('admin-send-hint-button');
// Novos/Verificados no Admin
const adminPlayerList = document.getElementById('admin-player-list');
const adminBanButton = document.getElementById('admin-ban-button');
const adminPunishButton = document.getElementById('admin-punish-button');


// Captcha
const captchaPlayerId = document.getElementById('captcha-player-id');
const submitCaptchaButton = document.getElementById('submit-captcha');
const captchaButtons = document.querySelectorAll('.captcha-btn');

// --- ESTADO GLOBAL DO JOGO ---
let currentPlayer = {
    id: null,
    name: null,
    score: 0,
    color: '#4a342a',
    role: 'player' 
};
let timerInterval;
let adminCurrentHintTarget = { playerId: null, requestId: null };

// --- DADOS DO QUIZ (RESPOSTAS CORRETAS E PONTUAÇÃO) ---
const QUIZ_DATA = {
    level1: { 
        name: "Nível 1 (Fácil)",
        questions: {
            q1: { text: "1. Quem é conhecido como o 'Rei do Baião', nome importante para a MPB Nordestina?", options: { a: "Zé Ramalho", b: "Geraldo Azevedo", c: "Luiz Gonzaga", d: "Alceu Valença" }, answer: 'c', points: 10 }, 
            q2: { text: "2. Qual destes artistas é o único que NÃO nasceu na região Nordeste?", options: { a: "Chico Science", b: "Gilberto Gil", c: "Chico Buarque", d: "Caetano Veloso" }, answer: 'c', points: 10 }, 
            q3: { text: "3. A canção 'Canteiros', um clássico da MPB Nordestina, é famosa na voz de qual artista cearense?", options: { a: "Fagner", b: "Belchior", c: "Dominguinhos", d: "Nando Cordel" }, answer: 'a', points: 10 }, 
        }
    },
    level2: {
        name: "Nível 2 (Médio)",
        questions: {
            q4: { text: "4. Qual estado nordestino é o berço do movimento Manguebeat, liderado por Chico Science?", options: { a: "Bahia", b: "Pernambuco", c: "Ceará", d: "Paraíba" }, answer: 'b', points: 15 }, 
            q5: { text: "5. O artista Zé Ramalho é famoso por qual de seus álbuns, que contém a faixa 'Avohai'?", options: { a: "Paêbirú", b: "Força Estranha", c: "A Terceira Lâmina", d: "Ramalho" }, answer: 'd', points: 15 }, 
            q6: { text: "6. Qual o nome do compositor e cantor baiano que é considerado um dos maiores expoentes do Tropicalismo?", options: { a: "Caetano Veloso", b: "Gilberto Gil", c: "Tim Maia", d: "Jards Macalé" }, answer: 'b', points: 15 },
            q7: { text: "7. Qual destes instrumentos NÃO é essencial do Forró tradicional?", options: { a: "Sanfona", b: "Zabumba", c: "Triângulo", d: "Cavaquinho" }, answer: 'd', points: 15 }, 
        }
    },
    level3: { 
        name: "Nível 3 (Difícil)",
        questions: {
            q8: { text: "8. Qual instrumento musical Jackson do Pandeiro, de Alagoas, ajudou a popularizar na MPB Nordestina?", options: { a: "Sanfona", b: "Pandeiro", c: "Triângulo", d: "Cavaquinho" }, answer: 'b', points: 20 }, 
            q9: { text: "9. Complete a letra famosa de Gilberto Gil: 'Aquele abraço pro Rio, __________'.", options: { a: "terra de alegria", b: "pro Rio de Janeiro", c: "que nunca viu", d: "capital do mar" }, answer: 'b', points: 20 }, 
            q10: { text: "10. O artista central na imagem (Caetano Veloso) é um dos fundadores de qual movimento musical?", options: { a: "Bossa Nova", b: "Tropicalismo", c: "Jovem Guarda", d: "Manguebeat" }, answer: 'b', points: 20 }, 
            q11: { text: "11. Qual destes é o título de uma famosa canção política de Caetano Veloso?", options: { a: "O Leãozinho", b: "Alegria, Alegria", c: "Sampa", d: "Chega de Saudade" }, answer: 'b', points: 20 }, 
            q12: { text: "12. CAPTCHA LOCK: Para finalizar, qual é a alternativa de resposta CORRETA para a Questão 4 (Qual estado nordestino é o berço do movimento Manguebeat)?", options: { a: "A", b: "B", c: "C", d: "D" }, answer: 'b', points: 0 }, 
        }
    }
};

// --- FUNÇÕES DE NAVEGAÇÃO ---
function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// --- LÓGICA DO LOGIN ---
loginButton.addEventListener('click', () => {
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) { 
        currentPlayer.role = 'admin';
        showScreen('admin-panel-screen');
        loginError.textContent = '';
        adminInit();
    } else if (password === PLAYER_PASSWORD) {
        currentPlayer.role = 'player';
        showScreen('player-setup-screen');
        loginError.textContent = '';
        passwordInput.value = '';
    } else if (password === PRESENTER_PASSWORD) {
        currentPlayer.role = 'presenter';
        showScreen('presenter-setup-screen');
        loginError.textContent = '';
        passwordInput.value = '';
        // Não é mais necessário chamar presenterInitSetup, pois os seletores foram corrigidos.
    } else {
        loginError.textContent = 'Senha incorreta.';
    }
});

// --- LÓGICA DO JOGADOR / APRESENTADOR SETUP (CORRIGIDO) ---
function setupColorSelection(selector, previewElement, inputElement) {
    selector.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'selected' de todos os botões no DOM para garantir que apenas um seja selecionado por vez
            document.querySelectorAll('.color-option.selected').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            
            const selectedColor = button.getAttribute('data-color');
            currentPlayer.color = selectedColor;
            previewElement.style.color = selectedColor;
            previewElement.textContent = inputElement.value || "[Seu Nome Aqui]";
        });
    });

    inputElement.addEventListener('input', () => {
        previewElement.textContent = inputElement.value || "[Seu Nome Aqui]";
        previewElement.style.color = currentPlayer.color; 
    });
}

// Configurações para Jogador e Apresentador
setupColorSelection(playerColorOptions, namePreview, playerNameInput);
setupColorSelection(presenterColorOptions, presenterNamePreview, presenterNameInput);


// 2. Entrar no Jogo (Player)
joinGameButton.addEventListener('click', () => {
    const playerName = playerNameInput.value;
    if (playerName.trim() === '') {
        alert('Por favor, insira seu nome.');
        return;
    }
    currentPlayer.id = playerName.toLowerCase().replace(/\s/g, '_') + "_" + Date.now();
    currentPlayer.name = playerName;
    
    db.collection('players').doc(currentPlayer.id).set({
        name: playerName,
        color: currentPlayer.color, 
        score: 0,
        status: 'waiting',
        role: currentPlayer.role
    })
    .then(() => {
        showScreen('waiting-room-screen');
        listenForGameStatus(); 
        listenForHints(); 
        listenForBan(); 
    });
});

// 2. Entrar no Painel (Presenter)
joinPresenterButton.addEventListener('click', () => {
    const presenterName = presenterNameInput.value;
    if (presenterName.trim() === '') {
        alert('Por favor, insira seu nome de apresentador.');
        return;
    }
    currentPlayer.id = presenterName.toLowerCase().replace(/\s/g, '_') + "_presenter_" + Date.now();
    currentPlayer.name = presenterName;

    db.collection('players').doc(currentPlayer.id).set({
        name: presenterName,
        color: currentPlayer.color,
        score: 0, 
        status: 'waiting', 
        role: currentPlayer.role
    })
    .then(() => {
        presenterIdDisplay.textContent = presenterName;
        showScreen('waiting-room-screen');
        waitingMessage.textContent = "Aguardando o Administrador (seminario) iniciar o jogo...";
        listenForGameStatus();
        listenForHints();
        listenForBan(); 
    });
});

// 3. Lógica de Escuta para Status do Jogo (Geral)
function listenForGameStatus() {
    db.collection('gameStatus').doc('main')
        .onSnapshot((doc) => {
            const status = doc.exists ? doc.data().status : 'waiting';
            
            if (currentPlayer.role === 'presenter') {
                gameStatusDisplay.textContent = status;
                if (status === 'started') {
                    showScreen('presenter-panel-screen');
                    presenterInitPanel();
                } else {
                    showScreen('waiting-room-screen');
                }
            } else if (currentPlayer.role === 'player') {
                 if (status === 'started') {
                    showScreen('game-screen');
                    listenForQuestionPublish(); 
                 } else {
                    showScreen('waiting-room-screen');
                    waitingMessage.textContent = "Aguardando o Apresentador publicar a pergunta...";
                 }
            }
        });
}

// --- LÓGICA DO APRESENTADOR ---

function presenterInitPanel() {
    fillQuestionSelects();
    listenForVotes();
    loadPlayersIntoPresenterList();
    
    presenterViewScoreboardButton.addEventListener('click', () => {
        loadScoreboard();
        showScreen('scoreboard-screen');
        document.getElementById('back-to-admin').textContent = 'Voltar (Apresentador)';
    });
}

function fillQuestionSelects() {
    levelSelect.innerHTML = '';
    for (const level in QUIZ_DATA) {
        const option = document.createElement('option');
        option.value = level.replace('level', '');
        option.textContent = QUIZ_DATA[level].name;
        levelSelect.appendChild(option);
    }
    levelSelect.value = 1;
    updateQuestionSelect();

    levelSelect.addEventListener('change', updateQuestionSelect);
}

function updateQuestionSelect() {
    const levelKey = `level${levelSelect.value}`;
    questionSelect.innerHTML = '<option value="">Selecione uma Pergunta</option>';
    
    if (QUIZ_DATA[levelKey]) {
        for (const qKey in QUIZ_DATA[levelKey].questions) {
            const question = QUIZ_DATA[levelKey].questions[qKey];
            const option = document.createElement('option');
            option.value = qKey;
            option.textContent = `${qKey}: ${question.text.substring(0, 70)}...`;
            questionSelect.appendChild(option);
        }
    }
}

// 4. Publicar Pergunta e Iniciar Votação
publishQuestionButton.addEventListener('click', () => {
    const level = levelSelect.value;
    const qKey = questionSelect.value;
    const duration = parseInt(timerDurationInput.value, 10);
    
    if (!qKey || isNaN(duration) || duration < 5) {
        alert("Selecione uma pergunta e insira uma duração válida (mínimo 5s).");
        return;
    }

    const questionData = QUIZ_DATA[`level${level}`].questions[qKey];
    
    // Reinicia o placar de votos na base de dados
    db.collection('votes').doc('current').set({
        level: level,
        qKey: qKey,
        questionText: questionData.text,
        options: questionData.options,
        answer: questionData.answer,
        points: questionData.points,
        startTime: fieldValue.serverTimestamp(),
        duration: duration,
        status: 'voting',
        votes: { a: 0, b: 0, c: 0, d: 0 },
        votedPlayers: [] 
    })
    .then(() => {
        alert(`Pergunta ${qKey} publicada! Votação iniciada por ${duration} segundos.`);
        publishQuestionButton.disabled = true;
        showAnswerButton.disabled = false;
    });
});

// 5. Ouvir Votos e Exibir Resultados
function listenForVotes() {
    db.collection('votes').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists && doc.data().status === 'voting') {
                const data = doc.data();
                const totalVotes = data.votedPlayers.length;
                voteCountDisplay.textContent = totalVotes;
                
                let results = [];
                for (const key in data.votes) {
                    results.push(`${key.toUpperCase()}: ${data.votes[key]}`);
                }
                voteResultsDisplay.textContent = results.join(', ');
            }
        });
}

// 6. Revelar Resposta e Pontuar
showAnswerButton.addEventListener('click', () => {
    db.collection('votes').doc('current').get().then(doc => {
        if (!doc.exists || doc.data().status !== 'voting') return;
        
        const voteData = doc.data();
        const correctAnswer = voteData.answer;
        const points = voteData.points;
        
        // 1. Atualizar status para pontuando
        db.collection('votes').doc('current').update({ status: 'scoring' });

        // 2. Pontuar jogadores que votaram corretamente
        db.collection('players').get().then(snapshot => {
            const batch = db.batch();
            
            snapshot.forEach(playerDoc => {
                // Filtra apenas jogadores com role 'player'
                if (playerDoc.data().role === 'player') {
                    const voted = voteData.votedPlayers.find(p => p.id === playerDoc.id);
                    
                    if (voted && voted.vote === correctAnswer) {
                        const playerRef = playerDoc.ref;
                        batch.update(playerRef, {
                            score: fieldValue.increment(points)
                        });
                    }
                }
            });
            return batch.commit();
        }).then(() => {
            alert(`Resposta correta: ${correctAnswer.toUpperCase()}. Pontuação distribuída.`);
            showAnswerButton.disabled = true;
            publishQuestionButton.disabled = false;
            
            // 3. Limpar a votação para a próxima rodada
            setTimeout(() => {
                 db.collection('votes').doc('current').set({ status: 'waiting' });
            }, 3000); 
        });
    });
});

// 7. Gerenciamento de Jogadores (Presenter) - Apenas lista e pode pedir dica
function loadPlayersIntoPresenterList() {
    db.collection('players').onSnapshot(snapshot => {
        presenterPlayerList.innerHTML = '<option value="">Selecione um jogador/apresentador</option>';
        snapshot.forEach(doc => {
            const player = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${player.name} (${player.role}) - ${player.score} pts`;
            presenterPlayerList.appendChild(option);
        });
    });
}

// O apresentador não pode banir ou punir diretamente (botões desabilitados no HTML).
// Ele só pode pedir dica.
presenterRequestHintButton.addEventListener('click', () => {
    db.collection('players').doc(currentPlayer.id).get().then(doc => {
        const score = doc.data().score || 0;
        if (score < 5) {
            alert("Você precisa de pelo menos 5 pontos para solicitar uma dica.");
            return;
        }

        db.collection('players').doc(currentPlayer.id).update({ 
            score: fieldValue.increment(-5)
        })
        .then(() => {
             db.collection('hintRequests').add({
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                role: currentPlayer.role,
                timestamp: new Date(),
                status: 'pending'
            });
            alert('Pedido de dica enviado ao Admin. Você perdeu 5 pontos.');
        });
    });
});

// --- LÓGICA DO JOGADOR (VOTAÇÃO) ---

// 8. Ouvir Pergunta Publicada
function listenForQuestionPublish() {
    db.collection('votes').doc('current')
        .onSnapshot((doc) => {
            if (!doc.exists) return;
            const data = doc.data();
            const votedPlayers = data.votedPlayers || [];
            const playerVoted = votedPlayers.some(p => p.id === currentPlayer.id);
            
            // 8a. Sala de Espera/Votação
            if (data.status === 'voting') {
                if (playerVoted) {
                    showScreen('waiting-room-screen');
                    waitingMessage.textContent = "Seu voto foi registrado! Aguarde o apresentador finalizar a rodada.";
                    return;
                }
                
                   // === CORREÇÃO 2: LÓGICA DO CAPTCHA ===
                if (data.qKey === 'q12') {
                    // Se for a pergunta 12, pule a votação e vá para o CAPTCHA
                    captchaPlayerId.textContent = currentPlayer.name;
                    showScreen('captcha-screen');
                    clearInterval(timerInterval); // Para o timer se estiver rodando
                    return; // Importante: Sai da função
                }
                // === FIM DA CORREÇÃO 2 ===


                showScreen('game-screen');
                startTimer(data.duration);
                document.getElementById('quiz-title').textContent = data.questionText;
                
                votingGroup.querySelector('.question-placeholder').style.display = 'none';
                const labels = votingGroup.querySelectorAll('label');
                
                // === CORREÇÃO 1: LÓGICA DOS BOTÕES DE RÁDIO ===
                labels.forEach(label => {
                    const input = label.querySelector('input'); // 1. Encontra o input
                    if (!input) return; // Segurança

                    const value = input.value;
                    const optionText = data.options[value] || "Opção inválida"; // Texto da opção

                    // 2. Limpa a label e define o novo texto
                    label.textContent = ` ${value.toUpperCase()}) ${optionText}`; 
                    
                    // 3. Re-insere o input no início da label
                    label.prepend(input); 
                    
                    input.disabled = false;
                    input.checked = false; // Garante que não venha pré-selecionado
                });
                // === FIM DA CORREÇÃO 1 ===
                
                submitVoteButton.disabled = false;

            } else if (data.status === 'scoring' || data.status === 'waiting') {
                clearInterval(timerInterval);
                showScreen('game-screen');
                document.getElementById('quiz-title').textContent = "MPB Nordestina Quiz";
                
                votingGroup.querySelector('.question-placeholder').style.display = 'block';
                votingGroup.querySelector('.question-placeholder').textContent = data.status === 'scoring' ? `RESPOSTA CORRETA: ${data.answer.toUpperCase()}` : "Aguardando o Apresentador publicar a próxima pergunta...";
                votingGroup.querySelectorAll('input').forEach(input => { input.disabled = true; input.checked = false; });
                submitVoteButton.disabled = true;
                timeLeftSpan.textContent = '00';
            }
        });
}

// 9. Submissão do Voto
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearInterval(timerInterval);

    const selectedVote = quizForm.querySelector('input[name="player-vote"]:checked');

    if (!selectedVote) {
        alert("Por favor, selecione uma opção antes de votar.");
        // Não reinicia o timer, apenas espera o player escolher e clicar
        return; 
    }
    
    // 1. Atualiza o voto no Firestore
    db.collection('votes').doc('current').update({
        [`votes.${selectedVote.value}`]: fieldValue.increment(1),
        votedPlayers: fieldValue.arrayUnion({ id: currentPlayer.id, vote: selectedVote.value })
    })
    .then(() => {
        // 2. Vai para a sala de espera
        showScreen('waiting-room-screen');
        waitingMessage.textContent = "Seu voto foi registrado! Aguarde o apresentador finalizar a rodada.";
        submitVoteButton.disabled = true;
    });
});

// 10. Timer Simplificado (Para o Jogador)
function startTimer(duration) {
    clearInterval(timerInterval); 
    let time = duration;
    
    timerInterval = setInterval(() => {
        let seconds = parseInt(time % 60, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timeLeftSpan.textContent = `00:${seconds}`;
        
        if (time <= 0) {
            clearInterval(timerInterval);
            submitVoteButton.disabled = true;
            // Se o tempo acabar, o voto é perdido
            showScreen('waiting-room-screen');
            waitingMessage.textContent = "O tempo acabou. Aguarde a próxima rodada.";
            return;
        }

        time--;
    }, 1000);
}

// 11. Solicitar Dica (Player)
requestHintPlayerButton.addEventListener('click', () => {
    db.collection('players').doc(currentPlayer.id).get().then(doc => {
        const score = doc.data().score || 0;
        if (score < 5) {
            alert("Você precisa de pelo menos 5 pontos para solicitar uma dica.");
            return;
        }

        db.collection('players').doc(currentPlayer.id).update({ 
            score: fieldValue.increment(-5)
        })
        .then(() => {
             db.collection('hintRequests').add({
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                role: currentPlayer.role,
                timestamp: new Date(),
                status: 'pending'
            });
            alert('Pedido de dica enviado ao Admin. Você perdeu 5 pontos.');
        });
    });
});

// 12. Ouvir Dicas do Admin e Banimento (Comum para Player/Presenter)
function listenForHints() {
    db.collection('hints').where('toPlayerId', '==', currentPlayer.id)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const hint = change.doc.data();
                    alert(`DICA DO ADMIN: \n"${hint.text}"`);
                    db.collection('hints').doc(change.doc.id).delete();
                }
            });
        });
}

function listenForBan() {
     db.collection('players').doc(currentPlayer.id)
        .onSnapshot((doc) => {
            if (!doc.exists) { // Se o documento for deletado (banido)
                alert('Você foi banido pelo administrador/apresentador e sua conta foi apagada.');
                clearInterval(timerInterval); 
                passwordInput.value = '';
                showScreen('login-screen'); 
            }
        });
}

// 13. Lógica do CAPTCHA Final (Permanece)
let captchaQ3Answer = null; 
captchaButtons.forEach(button => {
    button.addEventListener('click', () => {
        captchaButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        captchaQ3Answer = button.getAttribute('data-answer');
    });
});

submitCaptchaButton.addEventListener('click', () => {
    const q1 = document.getElementById('captcha-q1').value.trim();
    const q2_1 = document.getElementById('captcha-q2-1').value;
    const q2_2 = document.getElementById('captcha-q2-2').value;
    
    const q1_pass = (q1 === '1912');
    const validQ2Options = ['pernambuco', 'paraiba', 'bahia'];
    const q2_pass = validQ2Options.includes(q2_1) && validQ2Options.includes(q2_2) && q2_1 !== q2_2;
    const q3_pass = (captchaQ3Answer === 'Manguebeat');

    if (q1_pass && q2_pass && q3_pass) {
        // Se o jogador acertou tudo, dá 10 pontos
        db.collection('players').doc(currentPlayer.id).update({
            score: fieldValue.increment(10),
            status: 'completed_captcha',
        })
        .then(() => {
            alert('Parabéns, você concluiu o CAPTCHA! +10 Pontos. Sua pontuação foi registrada.');
            passwordInput.value = '';
            showScreen('login-screen'); 
        });
    } else {
        alert('Uma ou mais respostas do CAPTCHA estão incorretas. Tente novamente.');
    }
});


// --- LÓGICA DO ADMIN (INCLUI BANIR/PUNIR) ---

function adminInit() {
    listenForHintRequests();
    listenForGameStatusChanges();
    loadPlayersIntoAdminList(); // Carrega lista para Banir/Punir
}

function listenForGameStatusChanges() {
    db.collection('gameStatus').doc('main')
        .onSnapshot((doc) => {
            if (!doc.exists || doc.data().status === 'waiting') {
                startGameButton.textContent = '1. Iniciar o Jogo (Libera o Apresentador)';
                startGameButton.disabled = false;
            } else if (doc.data().status === 'started') {
                startGameButton.textContent = '1. Jogo em Andamento';
                startGameButton.disabled = true;
            }
        });
}

startGameButton.addEventListener('click', () => {
    db.collection('gameStatus').doc('main').set({ status: 'started' })
    .then(() => alert('Jogo Iniciado! Apresentador liberado.'));
});

viewScoreboardButton.addEventListener('click', () => {
    loadScoreboard();
    showScreen('scoreboard-screen');
    document.getElementById('back-to-admin').textContent = 'Voltar (Admin)';
});

// === CORREÇÃO 3: BOTÃO VOLTAR DO PLACAR ===
backToAdminButton.addEventListener('click', () => {
    // Verifica quem é o usuário e o envia para a tela correta
    if (currentPlayer.role === 'admin') {
        showScreen('admin-panel-screen');
    } else if (currentPlayer.role === 'presenter') {
        showScreen('presenter-panel-screen');
    } else {
        // Fallback, caso algo estranho aconteça
        showScreen('login-screen');
    }
});
// === FIM DA CORREÇÃO 3 ===

async function loadScoreboard() {
    const top3List = document.getElementById('top-3-list');
    const fullBody = document.getElementById('full-scoreboard-body');

    top3List.innerHTML = '';
    fullBody.innerHTML = '';

    // Inclui Apresentadores/Admins no placar, se tiverem pontos
    const snapshot = await db.collection('players').orderBy('score', 'desc').get();

    if (snapshot.empty) {
        fullBody.innerHTML = '<tr><td colspan="5">Nenhum jogador encontrado.</td></tr>'; 
        return;
    }

    let position = 1;
    snapshot.forEach(doc => {
        const player = doc.data();
        const playerColor = player.color || '#4a342a'; 

        if (position <= 3) {
            const li = document.createElement('li');
            li.textContent = `${player.name} (${player.role}) - ${player.score} pontos`;
            li.style.color = playerColor; 
            top3List.appendChild(li);
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${position}</td>
            <td style="color: ${playerColor}; font-weight: bold;">${player.name}</td>
            <td style="text-align: center;">
                 <span style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background-color: ${playerColor}; border: 2px solid #5d4037;"></span>
            </td>
            <td>${player.score}</td>
            <td>${player.status} (${player.role})</td>
        `;
        fullBody.appendChild(row);

        position++;
    });
}

function loadPlayersIntoAdminList() {
    // Escuta em tempo real a lista de jogadores (incluindo apresentadores)
    db.collection('players').onSnapshot(snapshot => {
        adminPlayerList.innerHTML = '<option value="">Selecione um jogador/apresentador</option>';
        snapshot.forEach(doc => {
            const player = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${player.name} (${player.role}) - ${player.score} pts`;
            adminPlayerList.appendChild(option);
        });
    });
}

// Implementação de Banir e Punir (Admin)
adminBanButton.addEventListener('click', () => {
    const playerId = adminPlayerList.value;
    const selectedOption = adminPlayerList.options[adminPlayerList.selectedIndex];
    const playerName = selectedOption ? selectedOption.text.split(' (')[0] : 'Jogador Desconhecido';

    if (playerId) {
        if (confirm(`Tem certeza que deseja BANIR e APAGAR permanentemente os dados de ${playerName}?`)) {
            // Remove o documento do jogador do Firestore
            db.collection('players').doc(playerId).delete()
            .then(() => alert(`Jogador ${playerName} foi BANIDO e a conta apagada.`))
            .catch(error => {
                console.error("Erro ao banir e apagar jogador:", error);
                alert("Erro ao banir e apagar jogador.");
            });
        }
    } else {
        alert('Selecione um jogador para banir.');
    }
});

adminPunishButton.addEventListener('click', () => {
    const playerId = adminPlayerList.value;
    if (playerId) {
        db.collection('players').doc(playerId).update({ score: fieldValue.increment(-5) })
        .then(() => alert(`Jogador ${playerId} punido (-5 pts).`));
    } else {
        alert('Selecione um jogador.');
    }
});

function listenForHintRequests() {
    db.collection('hintRequests').where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            adminHintRequestsList.innerHTML = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                const li = document.createElement('li');
                li.textContent = `Dica solicitada por: ${request.playerName} (${request.role})`;
                li.setAttribute('data-player-id', request.playerId);
                li.setAttribute('data-request-id', doc.id);
                li.addEventListener('click', () => {
                    document.querySelectorAll('#admin-hint-requests li').forEach(item => item.classList.remove('selected'));
                    li.classList.add('selected');
                    adminCurrentHintTarget.playerId = li.getAttribute('data-player-id');
                    adminCurrentHintTarget.requestId = li.getAttribute('data-request-id');
                    adminHintPrompt.placeholder = `Dica para ${request.playerName}...`;
                });
                adminHintRequestsList.appendChild(li);
            });
        });
}

adminSendHintButton.addEventListener('click', () => {
    const hintText = adminHintPrompt.value.trim();
    if (adminCurrentHintTarget.playerId && hintText) {
        db.collection('hints').add({
            toPlayerId: adminCurrentHintTarget.playerId,
            text: hintText,
            timestamp: new Date()
        })
        .then(() => {
            return db.collection('hintRequests').doc(adminCurrentHintTarget.requestId).delete();
        })
        .then(() => {
            alert(`Dica enviada para ${adminCurrentHintTarget.playerId}`);
            adminHintPrompt.value = '';
            adminCurrentHintTarget = { playerId: null, requestId: null };
        });
    } else {
        alert('Selecione um pedido de dica e digite o texto.');
    }
});

// --- INICIALIZAÇÃO ---
showScreen('login-screen');