class BirthdaySoundtrack {
  constructor(button) {
    this.button = button;
    this.context = null;
    this.master = null;
    this.reverb = null;
    this.timer = null;
    this.playing = false;
    this.bar = 0;
    this.barLength = 6.4;
  }

  createAudio() {
    if (this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.0001;

    const warmth = this.context.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 3600;
    warmth.Q.value = 0.4;

    this.reverb = this.context.createConvolver();
    this.reverb.buffer = this.makeImpulse(2.8, 2.3);
    const reverbGain = this.context.createGain();
    reverbGain.gain.value = 0.3;

    this.master.connect(warmth);
    warmth.connect(this.context.destination);
    warmth.connect(this.reverb);
    this.reverb.connect(reverbGain);
    reverbGain.connect(this.context.destination);
  }

  makeImpulse(duration, decay) {
    const length = this.context.sampleRate * duration;
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  tone(frequency, start, duration, volume = 0.045, type = 'sine') {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.08);
  }

  scheduleBar() {
    if (!this.playing || !this.context) return;
    const now = this.context.currentTime + 0.08;
    const melodyA = [392, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440];
    const melodyB = [329.63, 392, 440, 523.25, 493.88, 440, 392, 329.63];
    const melody = this.bar % 2 ? melodyB : melodyA;
    const chords = this.bar % 2
      ? [[220, 261.63, 329.63], [174.61, 220, 261.63]]
      : [[130.81, 164.81, 196], [146.83, 174.61, 220]];

    chords.forEach((chord, chordIndex) => {
      chord.forEach((note) => this.tone(note, now + chordIndex * 3.2, 3.7, 0.018, 'sine'));
    });

    melody.forEach((note, index) => {
      this.tone(note, now + index * 0.8, 1.12, index % 4 === 0 ? 0.052 : 0.036, 'triangle');
      if (index % 2 === 0) this.tone(note * 2, now + index * 0.8, 0.5, 0.008, 'sine');
    });

    [65.41, 73.42, 87.31, 98].forEach((note, index) => {
      this.tone(note, now + index * 1.6, 1.8, 0.022, 'sine');
    });

    this.bar += 1;
    this.timer = window.setTimeout(() => this.scheduleBar(), this.barLength * 1000 - 180);
  }

  async play() {
    this.createAudio();
    if (!this.context || this.playing) return;
    await this.context.resume();
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.27, this.context.currentTime + 1.6);
    this.scheduleBar();
    this.updateButton();
  }

  pause() {
    if (!this.context || !this.playing) return;
    this.playing = false;
    window.clearTimeout(this.timer);
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.6);
    this.updateButton();
  }

  async toggle() {
    if (this.playing) this.pause();
    else await this.play();
  }

  chime() {
    if (!this.context || !this.playing) return;
    const now = this.context.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
      this.tone(note, now + index * 0.13, 1.8, 0.055, 'sine');
    });
  }

  updateButton() {
    if (!this.button) return;
    this.button.classList.toggle('is-playing', this.playing);
    this.button.setAttribute('aria-pressed', String(this.playing));
    this.button.setAttribute('aria-label', this.playing ? 'Pause birthday music' : 'Play birthday music');
    const label = this.button.querySelector('.music-label');
    if (label) label.textContent = this.playing ? 'playing' : 'music';
  }
}

window.BirthdaySoundtrack = BirthdaySoundtrack;
