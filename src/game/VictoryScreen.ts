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
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const victoryBox = document.createElement('div');
  victoryBox.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    color: white;
    font-family: Arial, sans-serif;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    max-width: 400px;
    animation: slideIn 0.5s ease-out;
  `;

  const title = document.createElement('h1');
  title.textContent = i18n.t('ui.victory.title');
  title.style.cssText = `
    font-size: 48px;
    margin: 0 0 20px 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  `;

  const message = document.createElement('p');
  message.textContent = i18n.t('ui.victory.message');
  message.style.cssText = `
    font-size: 20px;
    margin: 0 0 30px 0;
  `;

  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    background: rgba(255,255,255,0.1);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
  `;

  if (isNewHighScore) {
    const badge = document.createElement('div');
    badge.textContent = `🏆 ${i18n.t('ui.victory.newHighScore')}`;
    badge.style.cssText = `
      font-size: 22px; font-weight: bold; color: #ffd700;
      margin-bottom: 15px; animation: pulse 1s ease-in-out infinite;
    `;
    statsContainer.appendChild(badge);
  }

  const scoreText = document.createElement('p');
  scoreText.textContent = `${i18n.t('ui.victory.score')} ${score}`;
  scoreText.style.cssText = `
    font-size: 24px;
    margin: 10px 0;
    font-weight: bold;
  `;

  const attemptsText = document.createElement('p');
  attemptsText.textContent = `${i18n.t('ui.victory.attempts')} ${attempts}`;
  attemptsText.style.cssText = `
    font-size: 18px;
    margin: 10px 0;
  `;

  const accuracyText = document.createElement('p');
  accuracyText.textContent = `${i18n.t('ui.victory.accuracy')} ${accuracy}%`;
  accuracyText.style.cssText = `
    font-size: 18px;
    margin: 10px 0;
  `;

  const streakText = document.createElement('p');
  streakText.textContent = `${i18n.t('ui.victory.bestStreak')} ${bestStreak}`;
  streakText.style.cssText = `
    font-size: 18px;
    margin: 10px 0;
  `;

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = i18n.t('ui.victory.playAgain');
  playAgainButton.style.cssText = `
    padding: 15px 40px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  `;
  playAgainButton.onmouseover = () => {
    playAgainButton.style.background = '#45a049';
    playAgainButton.style.transform = 'scale(1.05)';
  };
  playAgainButton.onmouseout = () => {
    playAgainButton.style.background = '#4CAF50';
    playAgainButton.style.transform = 'scale(1)';
  };
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
    timeText.style.cssText = 'font-size: 18px; margin: 10px 0;';
    statsContainer.appendChild(timeText);
  }

  victoryBox.appendChild(title);
  victoryBox.appendChild(message);
  victoryBox.appendChild(statsContainer);

  if (onNextLevel) {
    const nextLevelButton = document.createElement('button');
    nextLevelButton.textContent = i18n.t('game.nextLevel');
    nextLevelButton.style.cssText = `
      padding: 15px 40px; background: #2196F3; color: white; border: none;
      border-radius: 25px; font-size: 18px; cursor: pointer; margin-bottom: 10px;
      transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: block; width: 80%; margin: 0 auto 10px auto;
    `;
    nextLevelButton.onclick = () => {
      document.body.removeChild(overlay);
      onNextLevel();
    };
    victoryBox.appendChild(nextLevelButton);
  }

  victoryBox.appendChild(playAgainButton);

  // Share button
  const shareBtn = document.createElement('button');
  shareBtn.textContent = `📤 ${i18n.t('ui.victory.share')}`;
  shareBtn.style.cssText = `
    display: block; margin: 10px auto 0; padding: 10px 30px;
    background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3);
    border-radius: 20px; font-size: 14px; cursor: pointer; transition: all 0.2s ease;
  `;
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
