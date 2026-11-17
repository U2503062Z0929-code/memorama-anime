// Cartas con temática Anime (8 parejas = 16 cartas)
const animeItems = [
  { id: 'ninja', icon: '🍥', name: 'Ninja' },
  { id: 'katana', icon: '⚔️', name: 'Katana' },
  { id: 'kitsune', icon: '🦊', name: 'Kitsune' },
  { id: 'dragon', icon: '🐉', name: 'Dragón' },
  { id: 'sakura', icon: '🌸', name: 'Sakura' },
  { id: 'mecha', icon: '🤖', name: 'Mecha' },
  { id: 'mahou', icon: '🪄', name: 'Mahō' },
  { id: 'onigiri', icon: '🍙', name: 'Onigiri' }
];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let secondsElapsed = 0;
let timerInterval = null;
let gameStarted = false;

// Elementos del DOM
const gameBoard = document.getElementById('gameBoard');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const bestTimeDisplay = document.getElementById('bestTime');
const winModal = document.getElementById('winModal');
const finalTimeDisplay = document.getElementById('finalTime');
const finalMovesDisplay = document.getElementById('finalMoves');
const btnRestart = document.getElementById('btnRestart');
const btnPlayAgain = document.getElementById('btnPlayAgain');

// Algoritmo Fisher-Yates para barajar aleatoriamente
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerDisplay.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function loadBestTime() {
  const best = localStorage.getItem('animeMatchBestTime');
  bestTimeDisplay.textContent = best ? formatTime(Number(best)) : '--:--';
}

function saveBestTime(currentSeconds) {
  const best = localStorage.getItem('animeMatchBestTime');
  if (!best || currentSeconds < Number(best)) {
    localStorage.setItem('animeMatchBestTime', currentSeconds);
    bestTimeDisplay.textContent = formatTime(currentSeconds);
  }
}

function setupGame() {
  stopTimer();
  gameBoard.innerHTML = '';
  winModal.classList.add('hidden');

  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  secondsElapsed = 0;
  gameStarted = false;

  timerDisplay.textContent = '00:00';
  movesDisplay.textContent = '0';
  pairsDisplay.textContent = `0 / ${animeItems.length}`;
  loadBestTime();

  cards = shuffle([...animeItems, ...animeItems]);

  cards.forEach((item) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-face card-back"></div>
      <div class="card-face card-front">
        <span class="card-emoji">${item.icon}</span>
        <span class="card-title">${item.name}</span>
      </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    gameBoard.appendChild(card);
  });
}

function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains('matched')) return;

  // Inicia el cronómetro en el primer clic
  startTimer();

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesDisplay.textContent = moves;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;

  if (isMatch) {
    disableMatchedCards();
  } else {
    unflipCards();
  }
}

function disableMatchedCards() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  matchedPairs++;
  pairsDisplay.textContent = `${matchedPairs} / ${animeItems.length}`;

  resetTurn();

  if (matchedPairs === animeItems.length) {
    stopTimer();
    saveBestTime(secondsElapsed);
    setTimeout(() => {
      finalTimeDisplay.textContent = formatTime(secondsElapsed);
      finalMovesDisplay.textContent = moves;
      winModal.classList.remove('hidden');
    }, 500);
  }
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetTurn();
  }, 850);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Eventos de botones
btnRestart.addEventListener('click', setupGame);
btnPlayAgain.addEventListener('click', setupGame);

// Inicializar juego al cargar
document.addEventListener('DOMContentLoaded', setupGame);

// ==========================================
// CONFIGURACIÓN PWA: SERVICE WORKER E INSTALACIÓN
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => console.log('✅ Service Worker registrado con éxito:', reg.scope))
      .catch((err) => console.error('❌ Error al registrar Service Worker:', err));
  });
}

// Botón de instalación manual de la PWA
let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = 'inline-block';
});

btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Resultado de instalación:', outcome);
  deferredPrompt = null;
  btnInstall.style.display = 'none';
});
