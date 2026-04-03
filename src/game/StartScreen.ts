import { i18n } from '../services/TranslationService';
import { GameConfig, MathDifficulty, LEVELS, LevelDefinition } from './GameConfig';
import { stats } from './StatsManager';
import { SupportedLocale } from '../locales';

export class StartScreen {
  private overlay: HTMLDivElement | null = null;
  private localeChangeHandler: (() => void) | null = null;

  public show(onStart: (config: GameConfig) => void, currentLevel?: number): void {
    this.remove();

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #0d0d2b 0%, #1a1a3e 40%, #2d1b4e 100%);
      display: flex; justify-content: center; align-items: center;
      z-index: 2000; font-family: Arial, sans-serif;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: rgba(0,0,0,0.6); padding: 40px; border-radius: 20px;
      text-align: center; color: white; max-width: 500px; width: 90%;
      box-shadow: 0 0 40px rgba(150,87,227,0.3); border: 1px solid rgba(150,87,227,0.3);
    `;

    // Title
    const title = document.createElement('h1');
    title.textContent = i18n.t('game.title');
    title.style.cssText = `font-size: 32px; margin: 0 0 5px 0; color: #c9a0ff;`;
    box.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = i18n.t('game.welcome');
    subtitle.style.cssText = `font-size: 14px; color: #aaa; margin: 0 0 25px 0;`;
    box.appendChild(subtitle);

    // Level display if in progression mode
    if (currentLevel !== undefined) {
      const levelBadge = document.createElement('div');
      levelBadge.textContent = `${i18n.t('ui.level.label')} ${currentLevel}`;
      levelBadge.style.cssText = `
        display: inline-block; padding: 5px 20px; background: rgba(150,87,227,0.3);
        border-radius: 15px; font-size: 16px; margin-bottom: 20px;
        border: 1px solid rgba(150,87,227,0.5); color: #c9a0ff;
      `;
      box.appendChild(levelBadge);
    }

    // --- Maze size ---
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = i18n.t('ui.settings.mazeSize');
    sizeLabel.style.cssText = `display: block; font-size: 14px; margin-bottom: 6px; color: #ccc;`;
    box.appendChild(sizeLabel);

    const sizeGroup = this.createButtonGroup(
      [
        { value: '5',  label: `5×5 (${i18n.t('ui.settings.easy')})` },
        { value: '7',  label: '7×7' },
        { value: '9',  label: `9×9 (${i18n.t('ui.settings.medium')})` },
        { value: '11', label: '11×11' },
        { value: '13', label: `13×13 (${i18n.t('ui.settings.hard')})` },
      ],
      currentLevel !== undefined ? String(this.getLevelDef(currentLevel).mazeSize) : '9'
    );
    box.appendChild(sizeGroup.container);

    // --- Math difficulty ---
    const diffLabel = document.createElement('label');
    diffLabel.textContent = i18n.t('ui.settings.mathDifficulty');
    diffLabel.style.cssText = `display: block; font-size: 14px; margin: 18px 0 6px 0; color: #ccc;`;
    box.appendChild(diffLabel);

    const diffGroup = this.createButtonGroup(
      [
        { value: 'easy',   label: i18n.t('ui.settings.easy') },
        { value: 'medium', label: i18n.t('ui.settings.medium') },
        { value: 'hard',   label: i18n.t('ui.settings.hard') },
      ],
      currentLevel !== undefined ? this.getLevelDef(currentLevel).mathDifficulty : 'medium'
    );
    box.appendChild(diffGroup.container);

    // --- Timer ---
    const timerLabel = document.createElement('label');
    timerLabel.textContent = i18n.t('ui.settings.timer');
    timerLabel.style.cssText = `display: block; font-size: 14px; margin: 18px 0 6px 0; color: #ccc;`;
    box.appendChild(timerLabel);

    const timerGroup = this.createButtonGroup(
      [
        { value: '0',   label: i18n.t('ui.settings.timerOff') },
        { value: '120', label: '2 min' },
        { value: '180', label: '3 min' },
        { value: '300', label: '5 min' },
      ],
      currentLevel !== undefined ? String(this.getLevelDef(currentLevel).timerSeconds) : '0'
    );
    box.appendChild(timerGroup.container);

    // --- Start button ---
    const startBtn = document.createElement('button');
    startBtn.textContent = currentLevel !== undefined
      ? `${i18n.t('ui.settings.startLevel')} ${currentLevel}`
      : i18n.t('ui.settings.start');
    startBtn.style.cssText = `
      margin-top: 28px; padding: 14px 50px; background: #4CAF50; color: white;
      border: none; border-radius: 25px; font-size: 18px; cursor: pointer;
      transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    startBtn.onmouseover = () => { startBtn.style.background = '#45a049'; startBtn.style.transform = 'scale(1.05)'; };
    startBtn.onmouseout = () => { startBtn.style.background = '#4CAF50'; startBtn.style.transform = 'scale(1)'; };
    startBtn.onclick = () => {
      const timerVal = parseInt(timerGroup.getValue());
      const config: GameConfig = {
        mazeSize: parseInt(sizeGroup.getValue()),
        mathDifficulty: diffGroup.getValue() as MathDifficulty,
        timerEnabled: timerVal > 0,
        timerSeconds: timerVal,
      };
      this.remove();
      onStart(config);
    };
    box.appendChild(startBtn);

    // --- Tutorial link ---
    const tutorialLink = document.createElement('button');
    tutorialLink.textContent = `❓ ${i18n.t('ui.tutorial.howToPlay')}`;
    tutorialLink.style.cssText = `
      display: block; margin: 15px auto 0; background: none; border: none;
      color: #aaa; font-size: 13px; cursor: pointer; text-decoration: underline;
    `;
    tutorialLink.onclick = () => this.showTutorial();
    box.appendChild(tutorialLink);

    // --- Highscore link ---
    const highscoreLink = document.createElement('button');
    highscoreLink.textContent = `🏆 ${i18n.t('ui.highscore.title')}`;
    highscoreLink.style.cssText = `
      display: block; margin: 8px auto 0; background: none; border: none;
      color: #ffd700; font-size: 13px; cursor: pointer; text-decoration: underline;
    `;
    highscoreLink.onclick = () => this.showHighScores();
    box.appendChild(highscoreLink);

    // --- Stats summary ---
    const gameStats = stats.getStats();
    if (gameStats.totalGamesWon > 0) {
      const statsLine = document.createElement('p');
      statsLine.textContent = `${i18n.t('ui.stats.gamesWon')}: ${gameStats.totalGamesWon} | ${i18n.t('ui.stats.highestLevel')}: ${gameStats.highestLevel}`;
      statsLine.style.cssText = `font-size: 12px; color: #888; margin: 10px 0 0 0;`;
      box.appendChild(statsLine);
    }

    // --- Language switcher ---
    box.appendChild(this.createLanguageSwitcher(onStart, currentLevel));

    this.overlay.appendChild(box);
    document.body.appendChild(this.overlay);
  }

  public remove(): void {
    if (this.localeChangeHandler) {
      i18n.offChange(this.localeChangeHandler);
      this.localeChangeHandler = null;
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  private getLevelDef(level: number): LevelDefinition {
    const idx = Math.min(level - 1, LEVELS.length - 1);
    return LEVELS[Math.max(0, idx)];
  }

  private createButtonGroup(
    options: { value: string; label: string }[],
    defaultValue: string
  ): { container: HTMLDivElement; getValue: () => string } {
    let selected = defaultValue;
    const container = document.createElement('div');
    container.style.cssText = `display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;`;

    const buttons: HTMLButtonElement[] = [];
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.style.cssText = `
        padding: 6px 14px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2);
        cursor: pointer; font-size: 13px; transition: all 0.2s ease; color: white;
        background: ${opt.value === defaultValue ? '#9757e3' : 'rgba(255,255,255,0.08)'};
      `;
      btn.onclick = () => {
        selected = opt.value;
        buttons.forEach(b => { b.style.background = 'rgba(255,255,255,0.08)'; });
        btn.style.background = '#9757e3';
      };
      buttons.push(btn);
      container.appendChild(btn);
    });

    return { container, getValue: () => selected };
  }

  private static readonly localeNames: Record<string, string> = {
    sv: 'ui.language.swedish',
    en: 'ui.language.english',
    no: 'ui.language.norwegian',
    fi: 'ui.language.finnish',
    da: 'ui.language.danish',
  };

  private createLanguageSwitcher(onStart: (config: GameConfig) => void, currentLevel?: number): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-top: 18px; padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
    `;

    const label = document.createElement('span');
    label.textContent = i18n.t('ui.language.selectLanguage');
    label.style.cssText = 'font-size: 13px; color: #aaa;';
    container.appendChild(label);

    const locales = i18n.getSupportedLocales();
    locales.forEach((locale: SupportedLocale) => {
      const translationKey = StartScreen.localeNames[locale] || `ui.language.${locale}`;
      const btn = document.createElement('button');
      btn.textContent = i18n.t(translationKey);
      btn.style.cssText = `
        padding: 4px 12px;
        background: ${i18n.getLocale() === locale ? '#2196F3' : 'rgba(255,255,255,0.08)'};
        color: white; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 3px; cursor: pointer; font-size: 12px;
        transition: all 0.2s ease;
      `;
      btn.onclick = () => {
        if (i18n.getLocale() !== locale) {
          i18n.setLocale(locale);
        }
      };
      container.appendChild(btn);
    });

    // Re-render start screen when locale changes
    if (this.localeChangeHandler) {
      i18n.offChange(this.localeChangeHandler);
    }
    this.localeChangeHandler = () => {
      this.show(onStart, currentLevel);
    };
    i18n.onChange(this.localeChangeHandler);

    return container;
  }

  private showHighScores(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; justify-content: center;
      align-items: center; z-index: 3000;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #1a1a3e; padding: 35px; border-radius: 15px; color: white;
      max-width: 460px; width: 90%; font-family: Arial, sans-serif;
      border: 1px solid rgba(150,87,227,0.3); max-height: 80vh; overflow-y: auto;
    `;

    const title = document.createElement('h2');
    title.textContent = `🏆 ${i18n.t('ui.highscore.title')}`;
    title.style.cssText = `margin: 0 0 18px 0; font-size: 24px; color: #ffd700;`;
    box.appendChild(title);

    const highScores = stats.getHighScores();
    if (highScores.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = i18n.t('ui.highscore.empty');
      empty.style.cssText = `color: #aaa; font-size: 15px;`;
      box.appendChild(empty);
    } else {
      const table = document.createElement('table');
      table.style.cssText = `width: 100%; border-collapse: collapse; font-size: 14px;`;

      const header = document.createElement('tr');
      ['#', i18n.t('ui.victory.score'), i18n.t('ui.victory.accuracy'), i18n.t('ui.highscore.level'), i18n.t('ui.highscore.date')].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.cssText = `padding: 8px 6px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.2); color: #c9a0ff;`;
        header.appendChild(th);
      });
      table.appendChild(header);

      highScores.forEach((entry, idx) => {
        const row = document.createElement('tr');
        row.style.cssText = idx === 0 ? 'color: #ffd700;' : '';

        const cells = [
          `${idx + 1}`,
          `${entry.score}`,
          `${entry.accuracy}%`,
          `${entry.level}`,
          new Date(entry.date).toLocaleDateString(),
        ];
        cells.forEach(text => {
          const td = document.createElement('td');
          td.textContent = text;
          td.style.cssText = `padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);`;
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      box.appendChild(table);
    }

    const gameStats = stats.getStats();
    const summaryDiv = document.createElement('div');
    summaryDiv.style.cssText = `margin-top: 18px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 13px; color: #aaa;`;
    summaryDiv.innerHTML = `${i18n.t('ui.stats.gamesWon')}: ${gameStats.totalGamesWon} &nbsp;|&nbsp; ${i18n.t('ui.stats.highestLevel')}: ${gameStats.highestLevel}`;
    box.appendChild(summaryDiv);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = i18n.t('ui.tutorial.close');
    closeBtn.style.cssText = `
      margin-top: 20px; padding: 10px 30px; background: #9757e3; color: white;
      border: none; border-radius: 5px; font-size: 15px; cursor: pointer;
    `;
    closeBtn.onclick = () => overlay.parentNode?.removeChild(overlay);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  private showTutorial(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; justify-content: center;
      align-items: center; z-index: 3000;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #1a1a3e; padding: 35px; border-radius: 15px; color: white;
      max-width: 460px; width: 90%; font-family: Arial, sans-serif;
      border: 1px solid rgba(150,87,227,0.3); max-height: 80vh; overflow-y: auto;
    `;

    const title = document.createElement('h2');
    title.textContent = i18n.t('ui.tutorial.title');
    title.style.cssText = `margin: 0 0 18px 0; font-size: 24px; color: #c9a0ff;`;
    box.appendChild(title);

    const steps = [
      i18n.t('ui.tutorial.step1'),
      i18n.t('ui.tutorial.step2'),
      i18n.t('ui.tutorial.step3'),
      i18n.t('ui.tutorial.step4'),
      i18n.t('ui.tutorial.step5'),
    ];

    steps.forEach((step, idx) => {
      const p = document.createElement('p');
      p.style.cssText = `
        font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;
        padding-left: 30px; position: relative; color: #ddd;
      `;
      const num = document.createElement('span');
      num.textContent = `${idx + 1}`;
      num.style.cssText = `
        position: absolute; left: 0; top: 0; width: 22px; height: 22px;
        background: #9757e3; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; font-size: 12px; font-weight: bold;
      `;
      p.appendChild(num);
      p.appendChild(document.createTextNode(step));
      box.appendChild(p);
    });

    const tip = document.createElement('p');
    tip.textContent = `💡 ${i18n.t('ui.tutorial.tip')}`;
    tip.style.cssText = `font-size: 13px; color: #aaa; margin: 15px 0 0 0; font-style: italic;`;
    box.appendChild(tip);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = i18n.t('ui.tutorial.close');
    closeBtn.style.cssText = `
      margin-top: 20px; padding: 10px 30px; background: #9757e3; color: white;
      border: none; border-radius: 5px; font-size: 15px; cursor: pointer;
    `;
    closeBtn.onclick = () => overlay.parentNode?.removeChild(overlay);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }
}
