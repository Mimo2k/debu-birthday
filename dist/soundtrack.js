class BirthdaySoundtrack {
  constructor(button) {
    this.button = button;
    this.context = null;
    this.master = null;
    this.reverb = null;
    this.timer = null;
    this.playing = false;
    this.beat = 0.42;
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
    warmth.frequency.value = 4400;
    warmth.Q.value = 0.35;

    this.reverb = this.context.createConvolver();
    this.reverb.buffer = this.makeImpulse(2.2, 2.5);
    const wet = this.context.createGain();
    wet.gain.value = 0.22;

    this.master.connect(warmth);
    warmth.connect(this.context.destination);
    warmth.connect(this.reverb);
    this.reverb.connect(wet);
    wet.connect(this.context.destination);
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

  tone(frequency, start, duration, volume = 0.055, type = 'triangle') {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const overtone = this.context.createOscillator();
    const gain = this.context.createGain();
    const overtoneGain = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(frequency * 2, start);
    overtoneGain.gain.value = 0.12;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.045);
    gain.gain.exponentialRampToValueAtTime(volume * 0.5, start + Math.max(0.09, duration * 0.55));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    overtone.start(start);
    oscillator.stop(start + duration + 0.06);
    overtone.stop(start + duration + 0.06);
  }

  scheduleSong() {
    if (!this.playing || !this.context) return;
    const now = this.context.currentTime + 0.08;
    const b = this.beat;
    const melody = [
      [392.00,.75],[392.00,.25],[440.00,1],[392.00,1],[523.25,1],[493.88,2],
      [392.00,.75],[392.00,.25],[440.00,1],[392.00,1],[587.33,1],[523.25,2],
      [392.00,.75],[392.00,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440.00,2],
      [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]
    ];

    let cursor = 0;
    melody.forEach(([frequency, beats], index) => {
      const duration = beats * b;
      this.tone(frequency, now + cursor, Math.max(0.16, duration * 0.92), index % 6 === 0 ? 0.072 : 0.058, 'triangle');
      cursor += duration;
    });

    const chords = [
      [0, [130.81,164.81,196.00]],
      [6*b, [98.00,123.47,146.83]],
      [12*b, [130.81,164.81,196.00]],
      [18*b, [87.31,110.00,130.81]],
      [24*b, [130.81,164.81,196.00]],
      [30*b, [98.00,123.47,146.83]]
    ];
    chords.forEach(([offset, chord]) => {
      chord.forEach((frequency) => this.tone(frequency, now + offset, 2.6*b, 0.018, 'sine'));
    });

    this.timer = window.setTimeout(() => this.scheduleSong(), (cursor + 1.2) * 1000);
  }

  async play() {
    this.createAudio();
    if (!this.context || this.playing) return;
    await this.context.resume();
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.34, this.context.currentTime + 0.7);
    this.scheduleSong();
    this.updateButton();
  }

  pause() {
    if (!this.context || !this.playing) return;
    this.playing = false;
    window.clearTimeout(this.timer);
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.45);
    this.updateButton();
  }

  async toggle() {
    if (this.playing) this.pause();
    else await this.play();
  }

  chime() {
    if (!this.context || !this.playing) return;
    const now = this.context.currentTime;
    [523.25, 659.25, 783.99].forEach((note, index) => this.tone(note, now + index * 0.11, 0.9, 0.05, 'triangle'));
  }

  updateButton() {
    if (!this.button) return;
    this.button.classList.toggle('is-playing', this.playing);
    this.button.setAttribute('aria-pressed', String(this.playing));
    this.button.setAttribute('aria-label', this.playing ? 'Pause Happy Birthday song' : 'Play Happy Birthday song');
    const label = this.button.querySelector('.music-label');
    if (label) label.textContent = this.playing ? 'song on' : 'play song';
  }
}

window.BirthdaySoundtrack = BirthdaySoundtrack;
