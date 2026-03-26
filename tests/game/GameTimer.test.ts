/**
 * @jest-environment jsdom
 */

jest.mock('../../src/services/TranslationService', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

import { GameTimer } from '../../src/game/GameTimer';

describe('GameTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('construction', () => {
    it('should create a display element', () => {
      const timer = new GameTimer(120, jest.fn());
      const el = timer.getElement();
      expect(el).toBeInstanceOf(HTMLDivElement);
      expect(el.id).toBe('timer-display');
    });

    it('should show formatted initial time', () => {
      const timer = new GameTimer(125, jest.fn());
      expect(timer.getElement().textContent).toContain('2:05');
    });

    it('should show 0:00 for zero seconds', () => {
      const timer = new GameTimer(0, jest.fn());
      expect(timer.getElement().textContent).toContain('0:00');
    });
  });

  describe('getRemainingSeconds', () => {
    it('should return initial seconds before start', () => {
      const timer = new GameTimer(180, jest.fn());
      expect(timer.getRemainingSeconds()).toBe(180);
    });

    it('should decrease after ticks', () => {
      const timer = new GameTimer(60, jest.fn());
      timer.start();
      jest.advanceTimersByTime(5000);
      expect(timer.getRemainingSeconds()).toBe(55);
      timer.stop();
    });
  });

  describe('start', () => {
    it('should count down each second', () => {
      const timer = new GameTimer(10, jest.fn());
      timer.start();
      jest.advanceTimersByTime(3000);
      expect(timer.getRemainingSeconds()).toBe(7);
      expect(timer.getElement().textContent).toContain('0:07');
      timer.stop();
    });

    it('should not double-start', () => {
      const timer = new GameTimer(10, jest.fn());
      timer.start();
      timer.start(); // second call should be no-op
      jest.advanceTimersByTime(1000);
      expect(timer.getRemainingSeconds()).toBe(9); // still decremented by 1, not 2
      timer.stop();
    });
  });

  describe('stop', () => {
    it('should freeze the timer', () => {
      const timer = new GameTimer(60, jest.fn());
      timer.start();
      jest.advanceTimersByTime(5000);
      timer.stop();
      jest.advanceTimersByTime(5000);
      expect(timer.getRemainingSeconds()).toBe(55);
    });
  });

  describe('onTimeUp callback', () => {
    it('should call onTimeUp when reaching zero', () => {
      const onTimeUp = jest.fn();
      const timer = new GameTimer(3, onTimeUp);
      timer.start();
      jest.advanceTimersByTime(3000);
      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('should stop the timer after reaching zero', () => {
      const onTimeUp = jest.fn();
      const timer = new GameTimer(2, onTimeUp);
      timer.start();
      jest.advanceTimersByTime(5000);
      // Should only call once, not repeatedly
      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('display color changes', () => {
    it('should change color to orange at 60 seconds remaining', () => {
      const timer = new GameTimer(62, jest.fn());
      timer.start();
      jest.advanceTimersByTime(2000); // 60 remaining
      expect(timer.getElement().style.color).toBe('rgb(255, 170, 0)');
      timer.stop();
    });

    it('should change color to red at 30 seconds remaining', () => {
      const timer = new GameTimer(32, jest.fn());
      timer.start();
      jest.advanceTimersByTime(2000); // 30 remaining
      expect(timer.getElement().style.color).toBe('rgb(255, 68, 68)');
      timer.stop();
    });
  });
});
