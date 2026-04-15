import { i18n } from '../services/TranslationService';

export function showTimeUpScreen(onRetry: () => void, onMenu: () => void): void {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex; justify-content: center;
    align-items: center; z-index: 1000; font-family: Arial, sans-serif;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: linear-gradient(135deg, #8b0000, #4a0000); padding: 40px;
    border-radius: 20px; text-align: center; color: white; max-width: 400px;
  `;

  const title = document.createElement('h1');
  title.textContent = `⏱ ${i18n.t('ui.timeUp.title')}`;
  title.style.cssText = `font-size: 36px; margin: 0 0 15px 0;`;
  box.appendChild(title);

  const msg = document.createElement('p');
  msg.textContent = i18n.t('ui.timeUp.message');
  msg.style.cssText = `font-size: 16px; margin: 0 0 25px 0; color: #ccc;`;
  box.appendChild(msg);

  [
    { text: i18n.t('ui.timeUp.tryAgain'), action: onRetry, bg: '#4CAF50' },
    { text: i18n.t('ui.timeUp.backToMenu'), action: onMenu, bg: 'rgba(255,255,255,0.15)' },
  ].forEach(({ text, action, bg }) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      display: block; width: 100%; margin: 8px 0; padding: 12px; background: ${bg};
      color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
    `;
    btn.onclick = () => { overlay.parentNode?.removeChild(overlay); action(); };
    box.appendChild(btn);
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
