import { i18n } from '../services/TranslationService';

export interface VictoryScreenOptions {
  score: number;
  attempts: number;
  accuracy: number;
  bestStreak: number;
  onPlayAgain: () => void;
  timeRemaining?: number;
  onNextLevel?: () => void;
  isNewHighScore?: boolean;
}

export function showVictoryScreen(opts: VictoryScreenOptions): void {
  const { score, attempts, accuracy, bestStreak, onPlayAgain, timeRemaining, onNextLevel, isNewHighScore } = opts;

  const overlay = document.createElement('div');
  overlay.className = 'overlay-backdrop';

  const victoryBox = document.createElement('div');
  victoryBox.className = 'modal-box modal-box--victory';

  const title = document.createElement('h1');
  title.textContent = i18n.t('ui.victory.title');
  title.className = 'heading-victory';

  const message = document.createElement('p');
  message.textContent = i18n.t('ui.victory.message');
  message.className = 'text-body';

  const statsContainer = document.createElement('div');
  statsContainer.className = 'stats-container';

  if (isNewHighScore) {
    const badge = document.createElement('div');
    badge.textContent = `🏆 ${i18n.t('ui.victory.newHighScore')}`;
    badge.className = 'badge-highscore';
    statsContainer.appendChild(badge);
  }

  const scoreText = document.createElement('p');
  scoreText.textContent = `${i18n.t('ui.victory.score')} ${score}`;
  scoreText.className = 'stat-lg';

  const attemptsText = document.createElement('p');
  attemptsText.textContent = `${i18n.t('ui.victory.attempts')} ${attempts}`;
  attemptsText.className = 'stat-md';

  const accuracyText = document.createElement('p');
  accuracyText.textContent = `${i18n.t('ui.victory.accuracy')} ${accuracy}%`;
  accuracyText.className = 'stat-md';

  const streakText = document.createElement('p');
  streakText.textContent = `${i18n.t('ui.victory.bestStreak')} ${bestStreak}`;
  streakText.className = 'stat-md';

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = i18n.t('ui.victory.playAgain');
  playAgainButton.className = 'btn btn-primary';
  playAgainButton.onclick = () => {
    document.body.removeChild(overlay);
    onPlayAgain();
  };

  statsContainer.appendChild(scoreText);
  statsContainer.appendChild(attemptsText);
  statsContainer.appendChild(accuracyText);
  statsContainer.appendChild(streakText);

  if (timeRemaining !== undefined) {
    const timeText = document.createElement('p');
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeText.textContent = `${i18n.t('ui.victory.timeRemaining')} ${minutes}:${seconds.toString().padStart(2, '0')}`;
    timeText.className = 'stat-md';
    statsContainer.appendChild(timeText);
  }

  victoryBox.appendChild(title);
  victoryBox.appendChild(message);
  victoryBox.appendChild(statsContainer);

  if (onNextLevel) {
    const nextLevelButton = document.createElement('button');
    nextLevelButton.textContent = i18n.t('game.nextLevel');
    nextLevelButton.className = 'btn btn-next-level';
    nextLevelButton.onclick = () => {
      document.body.removeChild(overlay);
      onNextLevel();
    };
    victoryBox.appendChild(nextLevelButton);
  }

  victoryBox.appendChild(playAgainButton);

  const shareBtn = document.createElement('button');
  shareBtn.textContent = `📤 ${i18n.t('ui.victory.share')}`;
  shareBtn.className = 'btn btn-share';
  shareBtn.onclick = () => {
    const text = `${i18n.t('game.title')} — ${i18n.t('ui.victory.score')} ${score} | ${i18n.t('ui.victory.accuracy')} ${accuracy}% | ${i18n.t('ui.victory.bestStreak')} ${bestStreak}`;
    if (navigator.share) {
      navigator.share({ title: i18n.t('game.title'), text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        shareBtn.textContent = `✅ ${i18n.t('ui.victory.copied')}`;
        setTimeout(() => { shareBtn.textContent = `📤 ${i18n.t('ui.victory.share')}`; }, 2000);
      }).catch(() => {});
    }
  };
  victoryBox.appendChild(shareBtn);

  overlay.appendChild(victoryBox);
  document.body.appendChild(overlay);
}
