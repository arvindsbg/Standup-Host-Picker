/**
 * Sound Effects Utility
 * Generates simple beep sounds using Web Audio API
 * No external dependencies required
 */

interface AudioContext {
  createOscillator: () => any;
  createGain: () => any;
  destination: any;
  currentTime: number;
}

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (audioContext) return audioContext;

  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
      return audioContext;
    }
  } catch (e) {
    console.warn('Web Audio API not available');
  }

  return null;
};

/**
 * Play a beep sound
 * @param frequency - Frequency in Hz (default: 800)
 * @param duration - Duration in seconds (default: 0.1)
 * @param volume - Volume 0-1 (default: 0.3)
 */
export const playBeep = (frequency: number = 800, duration: number = 0.1, volume: number = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Error playing sound:', e);
  }
};

/**
 * Play a success sound (ascending beeps)
 */
export const playSuccess = () => {
  playBeep(523, 0.1, 0.2); // C5
  setTimeout(() => playBeep(659, 0.1, 0.2), 100); // E5
  setTimeout(() => playBeep(784, 0.15, 0.2), 200); // G5
};

/**
 * Play a spin start sound
 */
export const playSpinStart = () => {
  playBeep(440, 0.05, 0.15); // A4
};

/**
 * Play a spin end sound
 */
export const playSpinEnd = () => {
  playBeep(880, 0.08, 0.2); // A5
  setTimeout(() => playBeep(659, 0.08, 0.2), 80); // E5
};

/**
 * Play a click sound
 */
export const playClick = () => {
  playBeep(1000, 0.05, 0.1);
};

/**
 * Play a notification sound
 */
export const playNotification = () => {
  playBeep(600, 0.08, 0.15);
  setTimeout(() => playBeep(800, 0.08, 0.15), 100);
};
