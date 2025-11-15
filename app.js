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
const PLAYER_PASSWORD = 'mpbn'; // Senha única para todos os jogadores

// --- REFERÊNCIAS DO DOM ---
const screens = document.querySelectorAll('.screen');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');
const joinGameButton = document.getElementById('join-game-button');
const playerNameInput = document.getElementById('player-name');
const colorOptions = document.querySelectorAll('.color-option'); 
const namePreview = document.getElementById('name-preview');     

const quizForm = document.getElementById('quiz-form');
const captchaPlayerId = document.getElementById('captcha-player-id');
const submitCaptchaButton = document.getElementById('submit-captcha');
const requestHintButton = document.getElementById('request-hint');
const captchaButtons = document.querySelectorAll('.captcha-btn');

const quizTitle = document.getElementById('quiz-title');
const timerDisplay = document.getElementById('timer-display');
const timeLeftSpan = document.getElementById('time-left');
const levelGroups = document.querySelectorAll('.level-group');
const submitLevelButton = document.getElementById('submit-level-button');
const questionImage = document.getElementById('question-image');

// Admin
const passwordInput = document.getElementById('password-input');
const startGameButton = document.getElementById('start-game-button');
const viewScoreboardButton = document.getElementById('view-scoreboard-button');
const backToAdminButton = document.getElementById('back-to-admin');
const adminPlayerList = document.getElementById('admin-player-list');
const adminBanButton = document.getElementById('admin-ban-button');
const adminPunishButton = document.getElementById('admin-punish-button');
const adminHintRequestsList = document.getElementById('admin-hint-requests');
const adminHintPrompt = document.getElementById('admin-hint-prompt');
const adminSendHintButton = document.getElementById('admin-send-hint-button');

// --- ESTADO GLOBAL DO JOGO ---
let currentPlayer = {
    id: null,
    name: null,
    score: 0,
    color: '#4a342a' 
};
let currentLevel = 1;
let timerInterval;
let levelTimes = { 1: 40, 2: 60, 3: 80 }; 
let totalTimeElapsed = 0; 
let adminCurrentHintTarget = { playerId: null, requestId: null };
let captchaQ3Answer = null; 

// --- DADOS DO QUIZ (RESPOSTAS CORRETAS E PONTUAÇÃO) ---
const QUIZ_DATA = {
    level1: { // 3 perguntas (10 pontos cada)
        maxTime: 40 * 3, 
        questions: {
            q1: { answer: 'c', points: 10 }, 
            q2: { answer: 'c', points: 10 }, 
            q3: { answer: 'a', points: 10 }, 
        }
    },
    level2: { // 4 perguntas (15 pontos cada)
        maxTime: 60 * 4,
        questions: {
            q4: { answer: 'b', points: 15 }, 
            q5: { answer: 'd', points: 15 }, 
            q6: { answer: 'Gilberto Gil', points: 15, type: 'written' }, 
            q7: { answer: ['sanfona', 'zabumba', 'triangulo'], points: 15, type: 'written_list' }, 
        }
    },
    level3: { // 5 perguntas (20 pontos cada + Captcha Lock)
        maxTime: 80 * 5,
        questions: {
            q8: { answer: 'b', points: 20 }, 
            q9: { answer: 'pro Rio de Janeiro', points: 20, type: 'written' }, 
            q10: { answer: 'b', points: 20 }, 
            q11: { answer: ['alegria alegria', 'é proibido proibir', 'tropicália'], points: 20, type: 'written_list_fuzzy' }, 
            q12: { answer: '4', points: 0, type: 'captcha_lock' }, 
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

// --- LÓGICA DO LOGIN (ATUALIZADA) ---
loginButton.addEventListener('click', () => {
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) { 
        showScreen('admin-panel-screen');
        loginError.textContent = '';
        adminInit();
    } else if (password === PLAYER_PASSWORD) {
        showScreen('player-setup-screen');
        loginError.textContent = '';
        passwordInput.value = ''; // Limpa a senha
    } else {
        loginError.textContent = 'Senha incorreta.';
    }
});


// --- LÓGICA DO TEMPORIZADOR E NÍVEIS ---
function startTimer(duration) {
    clearInterval(timerInterval); 
    let time = duration;
    
    submitLevelButton.disabled = false;
    submitLevelButton.textContent = currentLevel < 3 ? "Próximo Nível" : "Enviar Respostas";
    
    timerInterval = setInterval(() => {
        let minutes = parseInt(time / 60, 10);
        let seconds = parseInt(time % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timeLeftSpan.textContent = `${minutes}:${seconds}`;
        
        if (time <= 0) {
            clearInterval(timerInterval);
            alert(`O tempo para o Nível ${currentLevel} acabou! Você não poderá avançar. Pontuação: ${currentPlayer.score}`);
            submitLevelButton.disabled = true;
            finishGame('time_out');
            return;
        }

        time--;
        totalTimeElapsed++; 

    }, 1000);
}

function displayLevel() {
    levelGroups.forEach(group => group.classList.remove('active'));

    let levelTitle;
    let imageSource = null;
    let maxTime;
    
    if (currentLevel === 1) {
        levelTitle = "MPB Nordestina Quiz - Nível 1 (Fácil)";
        document.getElementById('level-1-questions').classList.add('active');
        maxTime = QUIZ_DATA.level1.maxTime;
    } else if (currentLevel === 2) {
        levelTitle = "MPB Nordestina Quiz - Nível 2 (Médio)";
        document.getElementById('level-2-questions').classList.add('active');
        maxTime = QUIZ_DATA.level2.maxTime;
    } else if (currentLevel === 3) {
        levelTitle = "MPB Nordestina Quiz - Nível 3 (Difícil)";
        document.getElementById('level-3-questions').classList.add('active');
        maxTime = QUIZ_DATA.level3.maxTime;
        imageSource = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB7l_2Aex_jUagpwjYeC_euIfLpRVEZVIIIiaTvg_4OT1bccLJ75gpUR6_eZ2wTZJtAgb5xE6Tpgw-m0p_4ENEzuv-gOG7etzCp3fqwD8J&s=10"; 
    } else {
        clearInterval(timerInterval);
        submitLevelButton.disabled = true;
        showScreen('captcha-screen');
        return;
    }

    quizTitle.textContent = levelTitle;
    questionImage.src = imageSource ? imageSource : "https://via.placeholder.com/300/600075/FFFFFF?text=Imagem+da+Questao";
    startTimer(maxTime);
}

// --- LÓGICA DO JOGADOR ---

// 1. Listener para seleção de cor e pré-visualização de nome
colorOptions.forEach(button => {
    button.addEventListener('click', () => {
        colorOptions.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        
        const selectedColor = button.getAttribute('data-color');
        currentPlayer.color = selectedColor;
        namePreview.style.color = selectedColor;
        namePreview.textContent = playerNameInput.value || "[Seu Nome Aqui]";
    });
});

playerNameInput.addEventListener('input', () => {
    namePreview.textContent = playerNameInput.value || "[Seu Nome Aqui]";
    namePreview.style.color = currentPlayer.color; 
});


// 2. Entrar no Jogo (Após configurar nome e cor)
joinGameButton.addEventListener('click', () => {
    const playerName = playerNameInput.value;
    
    const selectedColorButton = document.querySelector('.color-option.selected');
    if (selectedColorButton) {
        currentPlayer.color = selectedColorButton.getAttribute('data-color');
    }
    
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
        status: 'waiting'
    })
    .then(() => {
        showScreen('waiting-room-screen');
        listenForGameStart(); 
        listenForHints(); 
        listenForBan(); 
    })
    .catch(error => {
        console.error("Erro ao registrar jogador: ", error);
    });
});

// 3. Sala de Espera (Escuta o início do jogo pelo Admin)
function listenForGameStart() {
    db.collection('gameStatus').doc('main')
        .onSnapshot((doc) => {
            if (doc.exists && doc.data().status === 'started') {
                db.collection('players').doc(currentPlayer.id).get().then(playerDoc => {
                    if (playerDoc.exists && playerDoc.data().status !== 'banned') {
                        currentLevel = 1;
                        showScreen('game-screen');
                        displayLevel();
                    }
                });
            }
        });
}

// 4. Lógica de Submissão de Nível
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearInterval(timerInterval); 
    let scoreGained = 0;
    const currentLevelKey = `level${currentLevel}`;
    const levelQuestions = QUIZ_DATA[currentLevelKey].questions;
    const form = e.target;
    let allAnswered = true;
    
    for (const qKey in levelQuestions) {
        const qData = levelQuestions[qKey];
        let userAnswer = null;
        
        if (qData.type === 'written' || qData.type === 'written_list' || qData.type === 'written_list_fuzzy' || qData.type === 'captcha_lock') {
            userAnswer = form.querySelector(`#${qKey}`).value.trim();
        } else { 
            const radio = form.querySelector(`input[name="${qKey}"]:checked`);
            if (radio) {
                userAnswer = radio.value;
            }
        }
        
        if (!userAnswer || userAnswer === "") {
            if (!(currentLevel === 3 && qKey === 'q12')) {
                allAnswered = false;
                break; 
            }
        }
        
        let isCorrect = false;
        
        const normalizedAnswer = userAnswer.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/\s/g, '');

        if (qData.type === 'written' || qData.type === 'captcha_lock') {
            const normalizedCorrect = qData.answer.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/\s/g, '');
            isCorrect = (normalizedAnswer === normalizedCorrect);
        } else if (qData.type === 'written_list') {
            isCorrect = qData.answer.some(a => normalizedAnswer.includes(a));
        } else if (qData.type === 'written_list_fuzzy') {
            isCorrect = qData.answer.some(a => normalizedAnswer.includes(a.toLowerCase().replace(/\s/g, '')));
        } else { 
            isCorrect = (userAnswer === qData.answer);
        }

        if (qData.type !== 'captcha_lock') {
            if (isCorrect) {
                scoreGained += qData.points;
            }
        } else if (qData.type === 'captcha_lock' && !isCorrect) {
            alert("A resposta para o Captcha Lock está incorreta! Não é possível avançar.");
            startTimer(QUIZ_DATA[currentLevelKey].maxTime); 
            return;
        }
    }
    
    if (!allAnswered) {
        alert("Por favor, responda todas as perguntas antes de avançar.");
        startTimer(QUIZ_DATA[currentLevelKey].maxTime); 
        return;
    }

    currentPlayer.score += scoreGained;
    
    db.collection('players').doc(currentPlayer.id).update({
        score: currentPlayer.score,
        [`level${currentLevel}Score`]: scoreGained,
        totalTime: totalTimeElapsed 
    });
    
    currentLevel++;
    if (currentLevel > 3) {
        finishGame('completed');
    } else {
        alert(`Nível ${currentLevel - 1} concluído! Pontos ganhos: ${scoreGained}. Pontuação total: ${currentPlayer.score}.`);
        displayLevel(); 
    }
});

function finishGame(status) {
    clearInterval(timerInterval);
    if (status === 'completed') {
        captchaPlayerId.textContent = currentPlayer.name;
        showScreen('captcha-screen');
    } else {
         db.collection('players').doc(currentPlayer.id).update({
            status: 'time_out',
            finalScore: currentPlayer.score
        })
        .then(() => {
            alert("Você não concluiu o quiz no tempo. Sua pontuação foi registrada.");
            passwordInput.value = '';
            showScreen('login-screen');
        });
    }
}

// 5. Lógica do CAPTCHA Final (Bônus de 10 pontos)
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
    const q2_pass = validQ2Options.includes(q2_1) && 
                    validQ2Options.includes(q2_2) && 
                    q2_1 !== q2_2;
    
    const q3_pass = (captchaQ3Answer === 'Manguebeat');

    if (q1_pass && q2_pass && q3_pass) {
        currentPlayer.score += 10; 

        db.collection('players').doc(currentPlayer.id).update({
            score: currentPlayer.score,
            status: 'completed',
            finalScore: currentPlayer.score
        })
        .then(() => {
            alert('Parabéns, você concluiu! Pontuação final: ' + currentPlayer.score);
            passwordInput.value = '';
            showScreen('login-screen'); 
        });
    } else {
        alert('Uma ou mais respostas do CAPTCHA estão incorretas. Tente novamente.');
    }
});

// 6. Pedir Dica (Auxílio)
requestHintButton.addEventListener('click', () => {
    if (currentPlayer.score < 5) {
        alert("Você precisa de pelo menos 5 pontos para solicitar uma dica.");
        return;
    }

    db.collection('players').doc(currentPlayer.id).update({ 
        score: fieldValue.increment(-5)
    })
    .then(() => {
         currentPlayer.score -= 5; 
         db.collection('hintRequests').add({
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            timestamp: new Date(),
            status: 'pending'
        });
        alert('Pedido de dica enviado ao Admin. Você perdeu 5 pontos.');
    });
});

// 7. Ouvir Dicas do Admin
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

// 8. Ouvir se foi Banido
function listenForBan() {
     db.collection('players').doc(currentPlayer.id)
        .onSnapshot((doc) => {
            if (doc.exists && doc.data().status === 'banned') {
                alert('Você foi banido pelo administrador.');
                clearInterval(timerInterval); 
                passwordInput.value = '';
                showScreen('login-screen'); 
            }
        });
}

// --- LÓGICA DO ADMIN ---

function adminInit() {
    loadPlayersIntoAdminList();
    listenForHintRequests();
    listenForGameStatusChanges();
}

function listenForGameStatusChanges() {
    db.collection('gameStatus').doc('main')
        .onSnapshot((doc) => {
            if (!doc.exists || doc.data().status === 'waiting') {
                startGameButton.textContent = '1. Iniciar o Jogo';
                startGameButton.disabled = false;
            } else if (doc.data().status === 'started') {
                startGameButton.textContent = '1. Jogo em Andamento';
                startGameButton.disabled = true;
            }
        });
}

startGameButton.addEventListener('click', () => {
    db.collection('gameStatus').doc('main').set({ status: 'started' })
    .then(() => {
        alert('Jogo Iniciado! Jogadores podem começar.');
    });
});

viewScoreboardButton.addEventListener('click', () => {
    loadScoreboard();
    showScreen('scoreboard-screen');
});

backToAdminButton.addEventListener('click', () => {
    showScreen('admin-panel-screen');
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
            li.textContent = `${player.name} - ${player.score} pontos`;
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
            <td>${player.status}</td>
        `;
        fullBody.appendChild(row);

        position++;
    });
}

function loadPlayersIntoAdminList() {
    db.collection('players').onSnapshot(snapshot => {
        adminPlayerList.innerHTML = '<option value="">Selecione um jogador</option>';
        snapshot.forEach(doc => {
            const player = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${player.name} (${player.status}) - ${player.score} pts`;
            adminPlayerList.appendChild(option);
        });
    });
}

// CÓDIGO NOVO (APAGA O DOCUMENTO INTEIRO)
adminBanButton.addEventListener('click', () => {
    const playerId = adminPlayerList.value;
    const playerName = adminPlayerList.options[adminPlayerList.selectedIndex].text.split(' (')[0];

    if (playerId) {
        if (confirm(`Tem certeza que deseja BANIR e APAGAR permanentemente os dados de ${playerName}?`)) {
            // Remove o documento do jogador do Firestore
            db.collection('players').doc(playerId).delete()
            .then(() => {
                alert(`Jogador ${playerName} (ID: ${playerId}) foi BANIDO e a conta apagada permanentemente.`);
                // O loadPlayersIntoAdminList() será acionado automaticamente 
                // pelo onSnapshot para atualizar a lista de jogadores.
            })
            .catch(error => {
                console.error("Erro ao banir e apagar jogador:", error);
                alert("Erro ao banir e apagar jogador. Verifique as regras do Firebase.");
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
                li.textContent = `Dica solicitada por: ${request.playerName}`;
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