import { i18n } from '../services/TranslationService';
import { GameConfig, MathDifficulty, LEVELS, LevelDefinition } from './GameConfig';
import { stats } from './StatsManager';
import { SupportedLocale } from '../locales';
import { LOCALE_NAMES } from '../shared/localeConfig';

export class StartScreen {
  private overlay: HTMLDivElement | null = null;
  private localeChangeHandler: (() => void) | null = null;

  public show(onStart: (config: GameConfig) => void, currentLevel?: number): void {
    this.remove();

    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay-backdrop overlay-backdrop--start';

    const box = document.createElement('div');
    box.className = 'modal-box modal-box--start';

    // Title
    const title = document.createElement('h1');
    title.textContent = i18n.t('game.title');
    title.className = 'text-title';
    box.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = i18n.t('game.welcome');
    subtitle.className = 'text-subtitle';
    box.appendChild(subtitle);

    // Level display if in progression mode
    if (currentLevel !== undefined) {
      const levelBadge = document.createElement('div');
      levelBadge.textContent = `${i18n.t('ui.level.label')} ${currentLevel}`;
      levelBadge.className = 'badge-level';
      box.appendChild(levelBadge);
    }

    // --- Maze size ---
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = i18n.t('ui.settings.mazeSize');
    sizeLabel.className = 'config-label';
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
    diffLabel.className = 'config-label config-label--spaced';
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
    timerLabel.className = 'config-label config-label--spaced';
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
    startBtn.className = 'btn btn-start';
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
    tutorialLink.className = 'btn btn-link';
    tutorialLink.onclick = () => this.showTutorial();
    box.appendChild(tutorialLink);

    // --- Highscore link ---
    const highscoreLink = document.createElement('button');
    highscoreLink.textContent = `🏆 ${i18n.t('ui.highscore.title')}`;
    highscoreLink.className = 'btn btn-link btn-link--gold';
    highscoreLink.onclick = () => this.showHighScores();
    box.appendChild(highscoreLink);

    // --- Stats summary ---
    const gameStats = stats.getStats();
    if (gameStats.totalGamesWon > 0) {
      const statsLine = document.createElement('p');
      statsLine.textContent = `${i18n.t('ui.stats.gamesWon')}: ${gameStats.totalGamesWon} | ${i18n.t('ui.stats.highestLevel')}: ${gameStats.highestLevel}`;
      statsLine.className = 'text-stats-summary';
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
    container.className = 'config-group';

    const buttons: HTMLButtonElement[] = [];
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.className = opt.value === defaultValue
        ? 'btn btn-option btn-option--active'
        : 'btn btn-option';
      btn.onclick = () => {
        selected = opt.value;
        buttons.forEach(b => { b.className = 'btn btn-option'; });
        btn.className = 'btn btn-option btn-option--active';
      };
      buttons.push(btn);
      container.appendChild(btn);
    });

    return { container, getValue: () => selected };
  }

  private createLanguageSwitcher(onStart: (config: GameConfig) => void, currentLevel?: number): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'language-switcher language-switcher--start';

    const label = document.createElement('span');
    label.textContent = i18n.t('ui.language.selectLanguage');
    label.className = 'language-label language-label--start';
    container.appendChild(label);

    const locales = i18n.getSupportedLocales();
    locales.forEach((locale: SupportedLocale) => {
      const translationKey = LOCALE_NAMES[locale] || `ui.language.${locale}`;
      const btn = document.createElement('button');
      btn.textContent = i18n.t(translationKey);
      btn.className = i18n.getLocale() === locale
        ? 'btn btn-lang btn-lang--active'
        : 'btn btn-lang';
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
    overlay.className = 'overlay-backdrop overlay-backdrop--modal';

    const box = document.createElement('div');
    box.className = 'modal-box modal-box--info';

    const title = document.createElement('h2');
    title.textContent = `🏆 ${i18n.t('ui.highscore.title')}`;
    title.className = 'heading-section heading-section--gold';
    box.appendChild(title);

    const highScores = stats.getHighScores();
    if (highScores.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = i18n.t('ui.highscore.empty');
      empty.className = 'text-muted';
      box.appendChild(empty);
    } else {
      const table = document.createElement('table');
      table.className = 'highscore-table';

      const header = document.createElement('tr');
      ['#', i18n.t('ui.victory.score'), i18n.t('ui.victory.accuracy'), i18n.t('ui.highscore.level'), i18n.t('ui.highscore.date')].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        header.appendChild(th);
      });
      table.appendChild(header);

      highScores.forEach((entry, idx) => {
        const row = document.createElement('tr');
        if (idx === 0) row.className = 'rank-first';

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
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      box.appendChild(table);
    }

    const gameStats = stats.getStats();
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary-section';
    summaryDiv.innerHTML = `${i18n.t('ui.stats.gamesWon')}: ${gameStats.totalGamesWon} &nbsp;|&nbsp; ${i18n.t('ui.stats.highestLevel')}: ${gameStats.highestLevel}`;
    box.appendChild(summaryDiv);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = i18n.t('ui.tutorial.close');
    closeBtn.className = 'btn btn-accent';
    closeBtn.onclick = () => overlay.parentNode?.removeChild(overlay);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  private showTutorial(): void {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-backdrop overlay-backdrop--modal';

    const box = document.createElement('div');
    box.className = 'modal-box modal-box--info';

    const title = document.createElement('h2');
    title.textContent = i18n.t('ui.tutorial.title');
    title.className = 'heading-section heading-section--accent';
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
      p.className = 'tutorial-step';
      const num = document.createElement('span');
      num.textContent = `${idx + 1}`;
      num.className = 'tutorial-step-number';
      p.appendChild(num);
      p.appendChild(document.createTextNode(step));
      box.appendChild(p);
    });

    const tip = document.createElement('p');
    tip.textContent = `💡 ${i18n.t('ui.tutorial.tip')}`;
    tip.className = 'tutorial-tip';
    box.appendChild(tip);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = i18n.t('ui.tutorial.close');
    closeBtn.className = 'btn btn-accent';
    closeBtn.onclick = () => overlay.parentNode?.removeChild(overlay);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }
}
