import { SoundManager } from '../../src/game/SoundManager';

class FakeAudioParam {
  setValueAtTime = jest.fn();
  exponentialRampToValueAtTime = jest.fn();
}

class FakeGainNode {
  gain = new FakeAudioParam();
  connect = jest.fn();
  disconnect = jest.fn();
}

class FakeOscillatorNode {
  type = 'sine';
  frequency = new FakeAudioParam();
  connect = jest.fn();
  start = jest.fn();
  stop = jest.fn();
}

class FakeAudioContext {
  currentTime = 0;
  destination = {};
  createGain = jest.fn(() => new FakeGainNode());
  createOscillator = jest.fn(() => new FakeOscillatorNode());
}

class FailingAudioContext extends FakeAudioContext {
  override createOscillator = jest.fn(() => {
    throw new Error('Audio unavailable');
  });
}

describe('SoundManager', () => {
  const originalAudioContext = globalThis.AudioContext;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.AudioContext = FakeAudioContext as unknown as typeof AudioContext;
  });

  afterAll(() => {
    globalThis.AudioContext = originalAudioContext;
  });

  it('should enable and disable sound', () => {
    const manager = new SoundManager();

    expect(manager.isEnabled()).toBe(true);
    manager.setEnabled(false);
    expect(manager.isEnabled()).toBe(false);
    manager.setEnabled(true);
    expect(manager.isEnabled()).toBe(true);
  });

  it('should create tones for game sounds', () => {
    const manager = new SoundManager();
    const context = new FakeAudioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;

    manager.playCorrect();
    manager.playIncorrect();
    manager.playVictory();
    manager.playMove();

    expect(context.createOscillator).toHaveBeenCalledTimes(9);
  });

  it('should start and stop ambient music', () => {
    const manager = new SoundManager();
    const context = new FakeAudioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;

    manager.startMusic();
    manager.startMusic();

    expect(manager.isMusicPlaying()).toBe(true);
    expect(context.createOscillator).toHaveBeenCalledTimes(3);

    manager.stopMusic();
    expect(manager.isMusicPlaying()).toBe(false);
    manager.toggleMusic();
    expect(manager.isMusicPlaying()).toBe(true);
  });

  it('should stop music when sound is disabled', () => {
    const manager = new SoundManager();
    const context = new FakeAudioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;

    manager.startMusic();
    manager.setEnabled(false);

    expect(manager.isMusicPlaying()).toBe(false);
  });

  it('should report audio errors without throwing', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    globalThis.AudioContext = FailingAudioContext as unknown as typeof AudioContext;
    const manager = new SoundManager();

    expect(() => manager.playMove()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      '[SoundManager] Could not play tone',
      expect.any(Error)
    );

    warnSpy.mockRestore();
  });
});
