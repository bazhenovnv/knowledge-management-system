export type SoundType = 'notification' | 'success' | 'alert' | 'chime';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

export const playSound = (type: SoundType = 'notification') => {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'notification':
        playNotificationSound(ctx);
        break;
      case 'success':
        playSuccessSound(ctx);
        break;
      case 'alert':
        playAlertSound(ctx);
        break;
      case 'chime':
        playChimeSound(ctx);
        break;
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

const playNotificationSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const playSuccessSound = (audioContext: AudioContext) => {
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime);
  oscillator1.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
  oscillator1.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
  
  oscillator2.frequency.setValueAtTime(523.25 * 2, audioContext.currentTime);
  oscillator2.frequency.setValueAtTime(659.25 * 2, audioContext.currentTime + 0.1);
  oscillator2.frequency.setValueAtTime(783.99 * 2, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.start(audioContext.currentTime);
  oscillator2.stop(audioContext.currentTime + 0.3);
};

const playAlertSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const playChimeSound = (audioContext: AudioContext) => {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
    
    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
  });
};

export const getSoundName = (type: SoundType): string => {
  switch (type) {
    case 'notification':
      return 'Уведомление';
    case 'success':
      return 'Успех';
    case 'alert':
      return 'Сигнал';
    case 'chime':
      return 'Колокольчик';
  }
};