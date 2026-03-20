import { ScoreTracker } from '../../src/game/ScoreTracker';

describe('ScoreTracker', () => {
  let tracker: ScoreTracker;

  beforeEach(() => {
    tracker = new ScoreTracker();
  });

  describe('basic scoring', () => {
    it('should start with zero score', () => {
      expect(tracker.getScore()).toBe(0);
      expect(tracker.getAttempts()).toBe(0);
      expect(tracker.getCorrectAnswers()).toBe(0);
      expect(tracker.getIncorrectAnswers()).toBe(0);
    });

    it('should add 10 points for correct answer', () => {
      tracker.recordAnswer(true);
      expect(tracker.getScore()).toBe(10);
      expect(tracker.getCorrectAnswers()).toBe(1);
    });

    it('should not add points for incorrect answer', () => {
      tracker.recordAnswer(false);
      expect(tracker.getScore()).toBe(0);
      expect(tracker.getIncorrectAnswers()).toBe(1);
    });

    it('should count attempts', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(false);
      tracker.recordAnswer(true);
      expect(tracker.getAttempts()).toBe(3);
    });
  });

  describe('streak tracking', () => {
    it('should start with zero streak', () => {
      expect(tracker.getStreak()).toBe(0);
      expect(tracker.getBestStreak()).toBe(0);
    });

    it('should increment streak on correct answers', () => {
      tracker.recordAnswer(true);
      expect(tracker.getStreak()).toBe(1);
      tracker.recordAnswer(true);
      expect(tracker.getStreak()).toBe(2);
    });

    it('should reset streak on incorrect answer', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      tracker.recordAnswer(false);
      expect(tracker.getStreak()).toBe(0);
    });

    it('should track best streak', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      tracker.recordAnswer(true); // streak = 3
      tracker.recordAnswer(false); // streak reset
      tracker.recordAnswer(true); // streak = 1
      expect(tracker.getStreak()).toBe(1);
      expect(tracker.getBestStreak()).toBe(3);
    });
  });

  describe('streak bonus', () => {
    it('should not give bonus for first 2 correct in a row', () => {
      tracker.recordAnswer(true); // 10
      tracker.recordAnswer(true); // 10
      expect(tracker.getScore()).toBe(20);
    });

    it('should give 5 bonus on 3rd consecutive correct', () => {
      tracker.recordAnswer(true); // 10
      tracker.recordAnswer(true); // 10
      tracker.recordAnswer(true); // 10 + 5 = 15
      expect(tracker.getScore()).toBe(35);
    });

    it('should increase bonus with longer streaks', () => {
      tracker.recordAnswer(true); // 10 (streak 1)
      tracker.recordAnswer(true); // 10 (streak 2)
      tracker.recordAnswer(true); // 15 (streak 3, bonus 5)
      tracker.recordAnswer(true); // 20 (streak 4, bonus 10)
      expect(tracker.getScore()).toBe(55);
    });

    it('should reset bonus after incorrect', () => {
      tracker.recordAnswer(true);  // 10
      tracker.recordAnswer(true);  // 10
      tracker.recordAnswer(true);  // 15
      tracker.recordAnswer(false); // 0
      tracker.recordAnswer(true);  // 10 (streak restarted)
      expect(tracker.getScore()).toBe(45);
    });
  });

  describe('accuracy', () => {
    it('should return 0 with no attempts', () => {
      expect(tracker.getAccuracy()).toBe(0);
    });

    it('should calculate accuracy correctly', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      tracker.recordAnswer(false);
      expect(tracker.getAccuracy()).toBe(67); // 2/3 ≈ 67%
    });

    it('should return 100 for all correct', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      expect(tracker.getAccuracy()).toBe(100);
    });
  });

  describe('reset', () => {
    it('should reset all values', () => {
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      tracker.recordAnswer(true);
      tracker.reset();

      expect(tracker.getScore()).toBe(0);
      expect(tracker.getAttempts()).toBe(0);
      expect(tracker.getCorrectAnswers()).toBe(0);
      expect(tracker.getIncorrectAnswers()).toBe(0);
      expect(tracker.getStreak()).toBe(0);
      expect(tracker.getBestStreak()).toBe(0);
    });
  });
});
