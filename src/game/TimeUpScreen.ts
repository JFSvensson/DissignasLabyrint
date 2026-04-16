import { i18n } from '../services/TranslationService';

export function showTimeUpScreen(onRetry: () => void, onMenu: () => void): void {
  const overlay = document.createElement('div');
  overlay.className = 'overlay-backdrop';

  const box = document.createElement('div');
  box.className = 'modal-box modal-box--timeup';

  const title = document.createElement('h1');
  title.textContent = `⏱ ${i18n.t('ui.timeUp.title')}`;
  title.className = 'heading-timeup';
  box.appendChild(title);

  const msg = document.createElement('p');
  msg.textContent = i18n.t('ui.timeUp.message');
  msg.className = 'text-muted';
  box.appendChild(msg);

  [
    { text: i18n.t('ui.timeUp.tryAgain'), action: onRetry, cls: 'btn btn-block btn-primary' },
    { text: i18n.t('ui.timeUp.backToMenu'), action: onMenu, cls: 'btn btn-block btn-ghost' },
  ].forEach(({ text, action, cls }) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = cls;
    btn.onclick = () => { overlay.parentNode?.removeChild(overlay); action(); };
    box.appendChild(btn);
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
