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
const playerColorOptions = document.querySelectorAll('#color-selection-container .color-option'); 
const namePreview = document.getElementById('name-preview');     

// Presenter Setup
const joinPresenterButton = document.getElementById('join-presenter-button');
const presenterNameInput = document.getElementById('presenter-name');
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
// ** NOVO: Flag para evitar pop-ups duplicados de "resposta correta" **
let hasShownAnswerAlert = false; 

// --- DADOS DO QUIZ (RESPOSTAS CORRETAS E PONTUAÇÃO) ---
// (Ocultado para economizar espaço, nenhuma mudança aqui)
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
// (Sem alterações)
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
    } else {
        loginError.textContent = 'Senha incorreta.';
    }
});

// --- LÓGICA DO JOGADOR / APRESENTADOR SETUP ---
// (Sem alterações)
function setupColorSelection(selector, previewElement, inputElement) {
    selector.forEach(button => {
        button.addEventListener('click', () => {
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
setupColorSelection(playerColorOptions, namePreview, playerNameInput);
setupColorSelection(presenterColorOptions, presenterNamePreview, presenterNameInput);

// 2. Entrar no Jogo (Player)
// (Sem alterações)
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
// (Sem alterações)
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
// *** MODIFICADO CONFORME SOLICITADO ***
function listenForGameStatus() {
    db.collection('gameStatus').doc('main')
        .onSnapshot((doc) => {
            const status = doc.exists ? doc.data().status : 'waiting';
            
            if (currentPlayer.role === 'presenter') {
                // (Lógica do Apresentador permanece a mesma)
                gameStatusDisplay.textContent = status;
                if (status === 'started') {
                    showScreen('presenter-panel-screen');
                    presenterInitPanel();
                } else {
                    showScreen('waiting-room-screen');
                }
            } else if (currentPlayer.role === 'player') {
                 // *** LÓGICA DO JOGADOR MODIFICADA ***
                 if (status === 'started') {
                    // 1. Permanece na sala de espera
                    showScreen('waiting-room-screen');
                    // 2. Muda a mensagem
                    waitingMessage.textContent = "Jogo iniciado! Aguardando o Apresentador publicar a pergunta...";
                    // 3. Começa a ouvir as perguntas (ESSENCIAL)
                    listenForQuestionPublish(); 
                 } else {
                    // (Continua aguardando o admin)
                    showScreen('waiting-room-screen');
                    waitingMessage.textContent = "Aguardando o Administrador iniciar o jogo...";
                 }
            }
        });
}

// --- LÓGICA DO APRESENTADOR ---
// (Toda a lógica do apresentador permanece a mesma, sem alterações)
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
function publishQuestionButton_click() {
    const level = levelSelect.value;
    const qKey = questionSelect.value;
    const duration = parseInt(timerDurationInput.value, 10);
    
    if (!qKey || isNaN(duration) || duration < 5) {
        alert("Selecione uma pergunta e insira uma duração válida (mínimo 5s).");
        return;
    }

    const questionData = QUIZ_DATA[`level${level}`].questions[qKey];
    
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
}
publishQuestionButton.addEventListener('click', publishQuestionButton_click);
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
function showAnswerButton_click() {
    db.collection('votes').doc('current').get().then(doc => {
        if (!doc.exists || doc.data().status !== 'voting') return;
        
        const voteData = doc.data();
        const correctAnswer = voteData.answer;
        const points = voteData.points;
        
        db.collection('votes').doc('current').update({ status: 'scoring' });

        db.collection('players').get().then(snapshot => {
            const batch = db.batch();
            snapshot.forEach(playerDoc => {
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
            
            setTimeout(() => {
                 db.collection('votes').doc('current').set({ status: 'waiting' });
            }, 3000); 
        });
    });
}
showAnswerButton.addEventListener('click', showAnswerButton_click);
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
// --- FIM DA LÓGICA DO APRESENTADOR ---


// --- LÓGICA DO JOGADOR (VOTAÇÃO) ---

// 8. Ouvir Pergunta Publicada
// *** MODIFICADO CONFORME SOLICITADO ***
function listenForQuestionPublish() {
    db.collection('votes').doc('current')
        .onSnapshot((doc) => {
            if (!doc.exists) return;
            const data = doc.data();
            const votedPlayers = data.votedPlayers || [];
            const playerVoted = votedPlayers.some(p => p.id === currentPlayer.id);
            
            // 8a. Votação Iniciada
            if (data.status === 'voting') {
                // Reseta a flag do pop-up para a próxima rodada
                hasShownAnswerAlert = false;
                
                if (playerVoted) {
                    // Se o jogador já votou, ele permanece na sala de espera
                    showScreen('waiting-room-screen');
                    waitingMessage.textContent = "Seu voto foi registrado! Aguarde o apresentador finalizar a rodada.";
                    return;
               }

                // 8b. Verifica se é o CAPTCHA
                if (data.qKey === 'q12') {
                    alert("CAPTCHA FINAL ATIVADO! Responda para finalizar.");
                    captchaPlayerId.textContent = currentPlayer.name;
                    showScreen('captcha-screen');
                    clearInterval(timerInterval); 
                    return; 
                }

                // 8c. Pergunta Normal Publicada
                
                // ** POP-UP ADICIONADO **
                alert("PERGUNTA NA TELA! Clique OK para responder.");
                
                // Move o jogador da sala de espera para a tela de jogo
                showScreen('game-screen');
                startTimer(data.duration);
                document.getElementById('quiz-title').textContent = data.questionText;
                
                votingGroup.querySelector('.question-placeholder').style.display = 'none';
                const labels = votingGroup.querySelectorAll('label');
                
                // (Correção de lógica do Radio Button - já estava correta)
                labels.forEach(label => {
                    const input = label.querySelector('input'); 
                    if (!input) return;
                    const value = input.value;
                    const optionText = data.options[value] || "Opção inválida"; 
                    label.textContent = ` ${value.toUpperCase()}) ${optionText}`; 
                    label.prepend(input); 
                    input.disabled = false;
                    input.checked = false; 
                });
                
                submitVoteButton.disabled = false;

            } 
            // 8d. Rodada Finalizada (Pontuando)
            else if (data.status === 'scoring') {
                clearInterval(timerInterval);
                
                // ** POP-UP ADICIONADO **
                // Usa a flag para mostrar o alerta apenas uma vez
                if (!hasShownAnswerAlert) {
                    alert(`Rodada finalizada! A resposta correta era: ${data.answer.toUpperCase()}.\nAguardando próxima pergunta.`);
                    hasShownAnswerAlert = true;
                }
                
                // Força o jogador a voltar para a sala de espera
                showScreen('waiting-room-screen');
                waitingMessage.textContent = "Rodada finalizada. Aguardando o Apresentador publicar a próxima pergunta...";
            } 
            // 8e. Esperando (Próxima rodada)
            else if (data.status === 'waiting') {
                clearInterval(timerInterval);
                // Força o jogador a voltar/permanecer na sala de espera
                showScreen('waiting-room-screen');
                waitingMessage.textContent = "Aguardando o Apresentador publicar a próxima pergunta...";
            }
        });
}

// 9. Submissão do Voto
// *** MODIFICADO CONFORME SOLICITADO ***
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearInterval(timerInterval);

    const selectedVote = quizForm.querySelector('input[name="player-vote"]:checked');

    if (!selectedVote) {
        alert("Por favor, selecione uma opção antes de votar.");
        return; 
    }
    
    db.collection('votes').doc('current').update({
        [`votes.${selectedVote.value}`]: fieldValue.increment(1),
        votedPlayers: fieldValue.arrayUnion({ id: currentPlayer.id, vote: selectedVote.value })
    })
    .then(() => {
        // ** POP-UP ADICIONADO **
        alert("Voto computado! Retornando à sala de espera.");
        
        // 2. Volta para a sala de espera
        showScreen('waiting-room-screen');
        waitingMessage.textContent = "Seu voto foi registrado! Aguarde o apresentador finalizar a rodada.";
        submitVoteButton.disabled = true;
    });
});

// 10. Timer Simplificado (Para o Jogador)
// *** MODIFICADO CONFORME SOLICITADO ***
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
            
            // ** POP-UP ADICIONADO **
            alert("O tempo acabou! Você não votou a tempo. Aguarde a próxima rodada.");
            
            // Se o tempo acabar, volta para a sala de espera
            showScreen('waiting-room-screen');
            waitingMessage.textContent = "O tempo acabou. Aguarde a próxima rodada.";
            return;
        }

        time--;
    }, 1000);
}

// 11. Solicitar Dica (Player)
// (Sem alterações)
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
// (Sem alterações)
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
            if (!doc.exists) { 
                alert('Você foi banido pelo administrador/apresentador e sua conta foi apagada.');
                clearInterval(timerInterval); 
                passwordInput.value = '';
                showScreen('login-screen'); 
            }
        });
}

// 13. Lógica do CAPTCHA Final
// (Sem alterações)
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


// --- LÓGICA DO ADMIN ---
// (Toda a lógica do Admin permanece a mesma, sem alterações)
function adminInit() {
    listenForHintRequests();
    listenForGameStatusChanges();
    loadPlayersIntoAdminList(); 
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
// (Correção do botão "Voltar" - já estava correta)
backToAdminButton.addEventListener('click', () => {
    if (currentPlayer.role === 'admin') {
        showScreen('admin-panel-screen');
    } else if (currentPlayer.role === 'presenter') {
        showScreen('presenter-panel-screen');
    } else {
        showScreen('login-screen');
    }
});
async function loadScoreboard() {
    const top3List = document.getElementById('top-3-list');
    const fullBody = document.getElementById('full-scoreboard-body');

    top3List.innerHTML = '';
    fullBody.innerHTML = '';

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
adminBanButton.addEventListener('click', () => {
    const playerId = adminPlayerList.value;
    const selectedOption = adminPlayerList.options[adminPlayerList.selectedIndex];
    const playerName = selectedOption ? selectedOption.text.split(' (')[0] : 'Jogador Desconhecido';

    if (playerId) {
        if (confirm(`Tem certeza que deseja BANIR e APAGAR permanentemente os dados de ${playerName}?`)) {
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
// --- FIM DA LÓGICA DO ADMIN ---

// --- INICIALIZAÇÃO ---
showScreen('login-screen');