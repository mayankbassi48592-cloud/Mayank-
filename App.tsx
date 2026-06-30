import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Globe, 
  Award, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Square, 
  Sparkles, 
  Music, 
  RotateCcw
} from 'lucide-react';

// ==========================================
// 1. SOUND & MUSIC SYNTH ENGINE (Web Audio API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;
  private timeouts: any[] = [];

  private init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (err) {
        console.warn('Web Audio API not supported', err);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playStar() {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Play a lovely major scale child arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.22);
    });
  }

  playRhymeMelody(
    notes: { note: string; duration: number }[], 
    onNotePlayed?: (noteName: string) => void, 
    onFinished?: () => void
  ) {
    this.init();
    this.stopMelody();
    if (!this.ctx) return;

    let time = this.ctx.currentTime + 0.05;
    const noteFreqs: Record<string, number> = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77, 'C6': 1046.50,
      'R': 0 // Rest
    };

    const playSingleNote = (freq: number, startTime: number, duration: number) => {
      if (freq === 0 || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle'; // Smooth child flute sound
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    notes.forEach((item) => {
      const freq = noteFreqs[item.note] || 0;
      const duration = item.duration;
      playSingleNote(freq, time, duration);
      
      // Calculate delay in ms to sync with real-time UI
      const noteDelay = (time - this.ctx!.currentTime) * 1000;
      const t = setTimeout(() => {
        if (onNotePlayed) onNotePlayed(item.note);
      }, Math.max(0, noteDelay));
      this.timeouts.push(t);
      
      time += duration;
    });

    const finishDelay = (time - this.ctx.currentTime) * 1000;
    const endTimeout = setTimeout(() => {
      if (onFinished) onFinished();
    }, Math.max(0, finishDelay));
    this.timeouts.push(endTimeout);
  }

  stopMelody() {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];
  }
}

const synth = new SoundSynth();

// ==========================================
// 2. ENRICHED MULTI-LANGUAGE DATASETS
// ==========================================
interface ToyItem {
  id: string;
  letter: string;
  word: string;
  emoji: string;
  speak: string;
  color: string;
}

const getEnglishNumberWord = (num: number): string => {
  const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num < 20) return ones[num];
  const digit = num % 10;
  return tens[Math.floor(num / 10)] + (digit > 0 ? " " + ones[digit] : "");
};

const getHindiNumberWord = (num: number): string => {
  const hindiNumbers = [
    "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
    "ग्यारह", "बारह", "तेरह", "चौदह", "पन्द्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
    "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाइस", "उनतीस", "तीस",
    "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
    "इकतालीस", "बयालीस", "तैंतालीस", "चौंतालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
    "इक्यावन", "बावन", "तिरेपन", "चौवन", "पचपन", "छप्पन", "सतावन", "अठावन", "उनसठ", "साठ",
    "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सरसठ", "अड़सठ", "उनहत्तर", "सत्तर",
    "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छियाहत्तर", "सतहत्तर", "अठहत्तर", "उनासी", "अस्सी",
    "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अठासी", "नवासी", "नब्बे",
    "इक्यानवे", "बयानवे", "तिस्यानवे", "चौरानवे", "पचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे"
  ];
  return hindiNumbers[num] || num.toString();
};

const getHindiDigits = (num: number): string => {
  const hindiDigitsMap = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().split('').map(digit => hindiDigitsMap[parseInt(digit, 10)]).join('');
};

const generateEnglishNumbers = (): ToyItem[] => {
  const numberEmojis = ['🎈', '🧸', '⭐', '🍬', '🦆', '🌸', '🐝', '🍎', '🧁', '🍦', '🍩', '🍪', '🍓', '🍇', '🎨', '🚀', '🚗', '✈️', '⛵', '⚽', '🎸', '🔔', '🎁', '💎', '💡'];
  const cardColors = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#B983FF', '#FF8AAE', '#1DD1A1', '#F38181', '#95E1D3', '#EA9999', '#A2D5F2', '#FFE3B3'];
  
  const numbers: ToyItem[] = [];
  for (let i = 1; i <= 99; i++) {
    const word = getEnglishNumberWord(i);
    const emojiBase = numberEmojis[(i - 1) % numberEmojis.length];
    
    let emojiDisplay = '';
    if (i <= 8) {
      emojiDisplay = emojiBase.repeat(i);
    } else {
      emojiDisplay = `${emojiBase} × ${i}`;
    }

    numbers.push({
      id: `en-${i}`,
      letter: i.toString(),
      word: `${word} ${i === 1 ? 'Item' : 'Items'}`,
      emoji: emojiDisplay,
      speak: `${i}! ${word}`,
      color: cardColors[(i - 1) % cardColors.length]
    });
  }
  return numbers;
};

const generateHindiNumbers = (): ToyItem[] => {
  const numberEmojis = ['🎈', '🧸', '⭐', '🍬', '🦆', '🌸', '🐝', '🍎', '🧁', '🍦', '🍩', '🍪', '🍓', '🍇', '🎨', '🚀', '🚗', '✈️', '⛵', '⚽', '🎸', '🔔', '🎁', '💎', '💡'];
  const cardColors = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#B983FF', '#FF8AAE', '#1DD1A1', '#F38181', '#95E1D3', '#EA9999', '#A2D5F2', '#FFE3B3'];
  
  const numbers: ToyItem[] = [];
  for (let i = 1; i <= 99; i++) {
    const word = getHindiNumberWord(i);
    const hindiDigits = getHindiDigits(i);
    const emojiBase = numberEmojis[(i - 1) % numberEmojis.length];
    
    let emojiDisplay = '';
    if (i <= 8) {
      emojiDisplay = emojiBase.repeat(i);
    } else {
      emojiDisplay = `${emojiBase} × ${hindiDigits}`;
    }

    numbers.push({
      id: `hn-${i}`,
      letter: hindiDigits,
      word: `${word}`,
      emoji: emojiDisplay,
      speak: `${word}`,
      color: cardColors[(i - 1) % cardColors.length]
    });
  }
  return numbers;
};

const LOCALIZED_DATA = {
  English: {
    welcome: "Welcome to Toy Land!",
    abcTitle: "Alpha Pets",
    numTitle: "Number Pop",
    songTitle: "Song Corner",
    home: "🏠 Home",
    tapStars: "Tap For Stars!",
    greatJob: "Great Job!",
    resetProgress: "Reset Stars",
    alphabets: [
      { id: 'ea', letter: 'A a', word: 'Apple', emoji: '🍎', speak: 'A is for Apple', color: '#FF6B6B' },
      { id: 'eb', letter: 'B b', word: 'Bear', emoji: '🐻', speak: 'B is for Bear', color: '#4D96FF' },
      { id: 'ec', letter: 'C c', word: 'Cat', emoji: '🐱', speak: 'C is for Cat', color: '#FFD93D' },
      { id: 'ed', letter: 'D d', word: 'Dog', emoji: '🐶', speak: 'D is for Dog', color: '#6BCB77' },
      { id: 'ee', letter: 'E e', word: 'Elephant', emoji: '🐘', speak: 'E is for Elephant', color: '#B983FF' },
      { id: 'ef', letter: 'F f', word: 'Frog', emoji: '🐸', speak: 'F is for Frog', color: '#1DD1A1' },
      { id: 'eg', letter: 'G g', word: 'Grapes', emoji: '🍇', speak: 'G is for Grapes', color: '#FF8AAE' },
      { id: 'eh', letter: 'H h', word: 'Hippo', emoji: '🦛', speak: 'H is for Hippo', color: '#F38181' },
      { id: 'ei', letter: 'I i', word: 'Ice Cream', emoji: '🍦', speak: 'I is for Ice Cream', color: '#95E1D3' },
      { id: 'ej', letter: 'J j', word: 'Jellyfish', emoji: '🪼', speak: 'J is for Jellyfish', color: '#EA9999' },
      { id: 'ek', letter: 'K k', word: 'Koala', emoji: '🐨', speak: 'K is for Koala', color: '#A2D5F2' },
      { id: 'el', letter: 'L l', word: 'Lion', emoji: '🦁', speak: 'L is for Lion', color: '#FFE3B3' },
      { id: 'em', letter: 'M m', word: 'Monkey', emoji: '🐵', speak: 'M is for Monkey', color: '#FF9F43' },
      { id: 'en', letter: 'N n', word: 'Nest', emoji: '🪹', speak: 'N is for Nest', color: '#4D96FF' },
      { id: 'eo', letter: 'O o', word: 'Owl', emoji: '🦉', speak: 'O is for Owl', color: '#FFD93D' },
      { id: 'ep', letter: 'P p', word: 'Penguin', emoji: '🐧', speak: 'P is for Penguin', color: '#6BCB77' },
      { id: 'eq', letter: 'Q q', word: 'Queen', emoji: '👑', speak: 'Q is for Queen', color: '#B983FF' },
      { id: 'er', letter: 'R r', word: 'Rabbit', emoji: '🐰', speak: 'R is for Rabbit', color: '#FF8AAE' },
      { id: 'es', letter: 'S s', word: 'Sun', emoji: '☀️', speak: 'S is for Sun', color: '#1DD1A1' },
      { id: 'et', letter: 'T t', word: 'Tiger', emoji: '🐯', speak: 'T is for Tiger', color: '#F38181' },
      { id: 'eu', letter: 'U u', word: 'Unicorn', emoji: '🦄', speak: 'U is for Unicorn', color: '#95E1D3' },
      { id: 'ev', letter: 'V v', word: 'Violin', emoji: '🎻', speak: 'V is for Violin', color: '#EA9999' },
      { id: 'ew', letter: 'W w', word: 'Whale', emoji: '🐋', speak: 'W is for Whale', color: '#A2D5F2' },
      { id: 'ex', letter: 'X x', word: 'Xylophone', emoji: '🪘', speak: 'X is for Xylophone', color: '#FFE3B3' },
      { id: 'ey', letter: 'Y y', word: 'Yak', emoji: '🐂', speak: 'Y is for Yak', color: '#FF6B6B' },
      { id: 'ez', letter: 'Z z', word: 'Zebra', emoji: '🦓', speak: 'Z is for Zebra', color: '#4D96FF' }
    ] as ToyItem[],
    numbers: generateEnglishNumbers()
  },
  Hindi: {
    welcome: "खिलौना नगरी में आपका स्वागत है!",
    abcTitle: "वर्णमाला",
    numTitle: "गिनती खेल",
    songTitle: "गाना कोना",
    home: "🏠 मुख्य",
    tapStars: "तारे जीतो!",
    greatJob: "बहुत बढ़िया!",
    resetProgress: "तारे हटाए",
    alphabets: [
      { id: 'ha', letter: 'अ', word: 'अनार', emoji: '🍎', speak: 'अ से अनार', color: '#FF6B6B' },
      { id: 'ha2', letter: 'आ', word: 'आम', emoji: '🥭', speak: 'आ से आम', color: '#FF9F43' },
      { id: 'hi', letter: 'इ', word: 'इमली', emoji: '🪵', speak: 'इ से इमली', color: '#FFD93D' },
      { id: 'hi2', letter: 'ई', word: 'ईख', emoji: '🎋', speak: 'ई से ईख', color: '#6BCB77' },
      { id: 'hu', letter: 'उ', word: 'उल्लू', emoji: '🦉', speak: 'उ से उल्लू', color: '#B983FF' },
      { id: 'hu2', letter: 'ऊ', word: 'ऊन', emoji: '🧶', speak: 'ऊ से ऊन', color: '#1DD1A1' },
      { id: 'hr', letter: 'ऋ', word: 'ऋषि', emoji: '🧘‍♂️', speak: 'ऋ से ऋषि', color: '#FF8AAE' },
      { id: 'he', letter: 'ए', word: 'एड़ी', emoji: '🦶', speak: 'ए से एड़ी', color: '#F38181' },
      { id: 'he2', letter: 'ऐ', word: 'ऐनक', emoji: '👓', speak: 'ऐ से ऐनक', color: '#95E1D3' },
      { id: 'ho', letter: 'ओ', word: 'ओखली', emoji: '🥣', speak: 'ओ से ओखली', color: '#EA9999' },
      { id: 'ho2', letter: 'औ', word: 'औरत', emoji: '👩', speak: 'औ से औरत', color: '#A2D5F2' },
      { id: 'ham', letter: 'अं', word: 'अंगूर', emoji: '🍇', speak: 'अं से अंगूर', color: '#FFE3B3' },
      { id: 'hk', letter: 'क', word: 'कबूतर', emoji: '🐦', speak: 'क से कबूतर', color: '#FF6B6B' },
      { id: 'hkh', letter: 'ख', word: 'खरगोश', emoji: '🐰', speak: 'ख से खरगोश', color: '#FF9F43' },
      { id: 'hg', letter: 'ग', word: 'गमला', emoji: '🪴', speak: 'ग से गमला', color: '#6BCB77' },
      { id: 'hh', letter: 'घ', word: 'घर', emoji: '🏠', speak: 'घ से घर', color: '#B983FF' },
      { id: 'hc', letter: 'च', word: 'चम्मच', emoji: '🥄', speak: 'च से चम्मच', color: '#F38181' },
      { id: 'hch', letter: 'छ', word: 'छाता', emoji: '☂️', speak: 'छ से छाता', color: '#95E1D3' },
      { id: 'hj', letter: 'ज', word: 'जहाज', emoji: '🚢', speak: 'ज से जहाज', color: '#A2D5F2' },
      { id: 'hjh', letter: 'झ', word: 'झंडा', emoji: '🇮🇳', speak: 'झ से झंडा', color: '#FF8AAE' },
      { id: 'ht', letter: 'ट', word: 'टमाटर', emoji: '🍅', speak: 'ट से टमाटर', color: '#EA9999' },
      { id: 'hth', letter: 'ठ', word: 'ठठेरा', emoji: '🔨', speak: 'ठ से ठठेरा', color: '#FFE3B3' },
      { id: 'hd', letter: 'ड', word: 'डमरू', emoji: '🪘', speak: 'ड से डमरू', color: '#FF6B6B' },
      { id: 'hdh', letter: 'ढ', word: 'ढक्कन', emoji: '🫙', speak: 'ढ से ढक्कन', color: '#4D96FF' },
      { id: 'hta', letter: 'त', word: 'तरबूज', emoji: '🍉', speak: 'त से तरबूज', color: '#FFD93D' },
      { id: 'htha', letter: 'थ', word: 'थर्मामीटर', emoji: '🌡️', speak: 'थ से थर्मामीटर', color: '#6BCB77' }
    ] as ToyItem[],
    numbers: generateHindiNumbers()
  }
};

// ==========================================
// 3. SAFE PLAYLIST CORNER RHYMES (With Melodies)
// ==========================================
const RHYMES_PLAYLIST = [
  {
    title: "ABC Phonics Song",
    id: "abc_phonics",
    emoji: "🔤",
    themeColor: "#FF6B6B",
    notes: [
      { note: 'C4', duration: 0.35 }, { note: 'C4', duration: 0.35 }, 
      { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 },
      { note: 'A4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, 
      { note: 'G4', duration: 0.7 },
      { note: 'F4', duration: 0.35 }, { note: 'F4', duration: 0.35 }, 
      { note: 'E4', duration: 0.35 }, { note: 'E4', duration: 0.35 },
      { note: 'D4', duration: 0.35 }, { note: 'D4', duration: 0.35 }, 
      { note: 'C4', duration: 0.7 }
    ]
  },
  {
    title: "Five Little Ducks",
    id: "five_ducks",
    emoji: "🦆",
    themeColor: "#FFD93D",
    notes: [
      { note: 'E4', duration: 0.35 }, { note: 'D4', duration: 0.35 }, 
      { note: 'C4', duration: 0.35 }, { note: 'D4', duration: 0.35 },
      { note: 'E4', duration: 0.35 }, { note: 'E4', duration: 0.35 }, 
      { note: 'E4', duration: 0.7 },
      { note: 'D4', duration: 0.35 }, { note: 'D4', duration: 0.35 }, 
      { note: 'D4', duration: 0.7 },
      { note: 'E4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, 
      { note: 'G4', duration: 0.7 }
    ]
  },
  {
    title: "Johny Johny Yes Papa",
    id: "johny_johny",
    emoji: "👦",
    themeColor: "#4D96FF",
    notes: [
      { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, 
      { note: 'E4', duration: 0.7 },
      { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, 
      { note: 'E4', duration: 0.7 },
      { note: 'A4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, 
      { note: 'F4', duration: 0.35 }, { note: 'E4', duration: 0.35 },
      { note: 'D4', duration: 0.35 }, { note: 'C4', duration: 0.7 }
    ]
  }
];

// ==========================================
// 4. STAR BURST COLLISION TYPE DEFINITIONS
// ==========================================
interface FloatingStar {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  delay: number;
}

// Custom Speech Engine with dynamic voices matching system configuration
const speakText = (text: string, language: 'English' | 'Hindi') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-select correct locale voices
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;
    
    if (language === 'Hindi') {
      utterance.lang = 'hi-IN';
      preferredVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('IN'));
    } else {
      utterance.lang = 'en-US';
      preferredVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('US'));
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.pitch = 1.45; // Cute kid-friendly pitch
    utterance.rate = 0.75;  // Slower, clearer cadence for toddlers
    
    window.speechSynthesis.speak(utterance);
  }
};

export default function App() {
  // --- Global State ---
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'alphabet' | 'numbers' | 'rhymes'>('hub');
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('toyland_stars');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Track child's interactive clicks per category
  const [interactions, setInteractions] = useState<{ alphabets: number; numbers: number }>(() => {
    const saved = localStorage.getItem('toyland_interactions');
    try {
      return saved ? JSON.parse(saved) : { alphabets: 0, numbers: 0 };
    } catch {
      return { alphabets: 0, numbers: 0 };
    }
  });

  // --- Game Stage States ---
  const [alphabetIndex, setAlphabetIndex] = useState(0);
  const [numberIndex, setNumberIndex] = useState(0);
  const [starBurstList, setStarBurstList] = useState<FloatingStar[]>([]);

  // --- Song Corner States ---
  const [activeRhymeId, setActiveRhymeId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string>('R');
  const [isRhymePlaying, setIsRhymePlaying] = useState(false);

  const currentStrings = LOCALIZED_DATA[language];

  // Sync stars score with local storage
  useEffect(() => {
    localStorage.setItem('toyland_stars', stars.toString());
  }, [stars]);

  // Sync category interactions with local storage
  useEffect(() => {
    localStorage.setItem('toyland_interactions', JSON.stringify(interactions));
  }, [interactions]);

  // Clean speech synthesis list voices change event
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Trigger TTS voice whenever card or view indices changes
  useEffect(() => {
    if (currentScreen === 'alphabet') {
      const activeItem = currentStrings.alphabets[alphabetIndex];
      if (activeItem) {
        speakText(activeItem.speak, language);
      }
    } else if (currentScreen === 'numbers') {
      const activeItem = currentStrings.numbers[numberIndex];
      if (activeItem) {
        speakText(activeItem.speak, language);
      }
    }
  }, [alphabetIndex, numberIndex, currentScreen, language]);

  // Handle Card tap interaction
  const handleCardInteraction = (e: React.MouseEvent<HTMLDivElement>, item: ToyItem) => {
    synth.playPop();
    setStars(prev => prev + 1);

    // Track interaction count for categories
    if (currentScreen === 'alphabet') {
      setInteractions(prev => ({ ...prev, alphabets: prev.alphabets + 1 }));
    } else if (currentScreen === 'numbers') {
      setInteractions(prev => ({ ...prev, numbers: prev.numbers + 1 }));
    }

    // Compute relative pointer position to anchor star burst
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Generate cute burst of stars shooting outwards
    const newStars: FloatingStar[] = Array.from({ length: 8 }).map((_, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random()}`,
      x: clickX,
      y: clickY,
      angle: (idx * 45) + (Math.random() * 20 - 10), // Even distribution
      distance: 60 + Math.random() * 70,
      delay: Math.random() * 0.15
    }));

    setStarBurstList(prev => [...prev, ...newStars]);

    // Speak word with congratulatory tone
    speakText(`${item.word}! ${currentStrings.greatJob}`, language);

    // Filter out stars after visual completion
    setTimeout(() => {
      setStarBurstList(prev => prev.filter(s => !newStars.find(ns => ns.id === s.id)));
    }, 1200);
  };

  // Nav actions
  const nextCard = (type: 'alphabet' | 'numbers') => {
    synth.playPop();
    if (type === 'alphabet') {
      setAlphabetIndex((prev) => (prev + 1) % currentStrings.alphabets.length);
    } else {
      setNumberIndex((prev) => (prev + 1) % currentStrings.numbers.length);
    }
  };

  const prevCard = (type: 'alphabet' | 'numbers') => {
    synth.playPop();
    if (type === 'alphabet') {
      setAlphabetIndex((prev) => (prev - 1 + currentStrings.alphabets.length) % currentStrings.alphabets.length);
    } else {
      setNumberIndex((prev) => (prev - 1 + currentStrings.numbers.length) % currentStrings.numbers.length);
    }
  };

  // Safe Rhyme Player triggers
  const playRhyme = (rhymeId: string) => {
    const rhyme = RHYMES_PLAYLIST.find(r => r.id === rhymeId);
    if (!rhyme) return;

    synth.stopMelody();
    setActiveRhymeId(rhymeId);
    setIsRhymePlaying(true);
    synth.playRhymeMelody(
      rhyme.notes,
      (note) => {
        setActiveNote(note);
      },
      () => {
        setIsRhymePlaying(false);
        setActiveNote('R');
        synth.playSuccess();
      }
    );
  };

  const stopRhyme = () => {
    synth.stopMelody();
    setIsRhymePlaying(false);
    setActiveRhymeId(null);
    setActiveNote('R');
  };

  const handleScreenChange = (screen: 'hub' | 'alphabet' | 'numbers' | 'rhymes') => {
    synth.playPop();
    stopRhyme();
    setCurrentScreen(screen);
    
    // Cheer kids on screen changes
    if (screen === 'hub') {
      speakText(LOCALIZED_DATA[language].welcome, language);
    } else if (screen === 'alphabet') {
      speakText(LOCALIZED_DATA[language].abcTitle, language);
    } else if (screen === 'numbers') {
      speakText(LOCALIZED_DATA[language].numTitle, language);
    } else if (screen === 'rhymes') {
      speakText(LOCALIZED_DATA[language].songTitle, language);
    }
  };

  const toggleLanguage = () => {
    synth.playPop();
    const nextLang = language === 'English' ? 'Hindi' : 'English';
    setLanguage(nextLang);
    speakText(LOCALIZED_DATA[nextLang].welcome, nextLang);
  };

  const resetProgress = () => {
    synth.playPop();
    setStars(0);
    setInteractions({ alphabets: 0, numbers: 0 });
    speakText("Ready to start again!", language);
  };

  const currentRhymeData = RHYMES_PLAYLIST.find(r => r.id === activeRhymeId);

  return (
    <div className="min-h-screen w-full bg-[#FFFBF0] font-sans text-gray-800 flex flex-col relative overflow-hidden select-none bg-bubble-pattern">
      
      {/* Dynamic Background clouds */}
      <div className="absolute top-10 left-10 w-24 h-12 bg-white/60 rounded-full blur-[2px] animate-float opacity-70 pointer-events-none" />
      <div className="absolute top-28 right-16 w-32 h-16 bg-white/60 rounded-full blur-[2px] animate-float-delayed opacity-70 pointer-events-none" />
      <div className="absolute bottom-16 left-20 w-28 h-14 bg-white/60 rounded-full blur-[3px] animate-float-delayed opacity-50 pointer-events-none" />

      {/* ==========================================
          TOP NAVIGATION BAR (SHARED CORE INTERFACE)
          ========================================== */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-3">
          {currentScreen !== 'hub' && (
            <motion.button
              id="btn-back-home"
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScreenChange('hub')}
              className="w-12 h-12 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-lg border-4 border-white transition-all cursor-pointer"
            >
              <Home className="w-6 h-6" />
            </motion.button>
          )}
          <motion.div 
            id="brand-logo"
            whileHover={{ scale: 1.05 }}
            onClick={() => synth.playPop()}
            className="flex items-center gap-2 cursor-pointer bg-white/80 py-2 px-4 rounded-2xl border-2 border-[#FFE8CC] shadow-sm"
          >
            <span className="text-2xl md:text-3xl animate-bounce">🎈</span>
            <span className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-amber-500">
              TOY LAND
            </span>
          </motion.div>
        </div>

        {/* Global Controls Panel */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switcher Button */}
          <motion.button
            id="btn-language-selector"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white hover:bg-[#FFF9EC] text-amber-600 px-4 py-2.5 rounded-2xl font-bold shadow-md border-3 border-amber-200 transition-all cursor-pointer text-sm md:text-base"
          >
            <Globe className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>{language === 'English' ? 'English 🇬🇧' : 'हिंदी 🇮🇳'}</span>
          </motion.button>

          {/* Glowing Stars Badge Reward HUD */}
          <motion.div
            id="star-counter"
            key={stars}
            initial={{ scale: 1.3, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-md border-3 border-white text-base md:text-lg"
          >
            <Sparkles className="w-5 h-5 text-yellow-100 animate-pulse fill-amber-100" />
            <span>{stars}</span>
          </motion.div>
        </div>
      </header>

      {/* ==========================================
          MAIN PAGE CONTENT AREA (ROUTED VIEWS)
          ========================================== */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 pb-12 flex flex-col justify-center items-center z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              VIEW A: TOY ROOM HUB SCREEN
              ========================================== */}
          {currentScreen === 'hub' && (
            <motion.div
              key="hub-screen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center gap-8 md:gap-12"
            >
              <div className="text-center max-w-2xl px-4 mt-4">
                <motion.h1 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="font-display font-extrabold text-3xl md:text-5xl text-[#FF9F43] drop-shadow-sm mb-2"
                >
                  {currentStrings.welcome}
                </motion.h1>
                <p className="text-gray-500 font-medium text-sm md:text-base">
                  {language === 'English' ? 'Choose an interactive toy zone to start your magical learning path!' : 'सीखने की जादुई दुनिया में जाने के लिए कोई भी खिलौना चुनें!'}
                </p>
              </div>

              {/* Cute Interactive Progress Bar Chart Widget */}
              <motion.div
                id="learning-progress-widget"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.15 }}
                className="w-full max-w-md bg-white/95 border-4 border-amber-200/60 p-5 rounded-[32px] shadow-xl flex flex-col items-center relative overflow-hidden"
              >
                {/* Background bubbles decoration inside chart */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-full blur-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-sky-100/40 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-3 z-10">
                  <span className="text-lg">📊</span>
                  <h3 className="font-display font-black text-lg md:text-xl text-amber-600 tracking-tight">
                    {language === 'English' ? '✨ Learning Progress Board' : '✨ प्रगति रिपोर्ट'}
                  </h3>
                </div>

                {/* SVG Bar Chart with Framer Motion animations */}
                <div className="w-full relative h-[180px] flex items-center justify-center z-10">
                  <svg 
                    viewBox="0 0 400 180" 
                    className="w-full h-full max-w-[360px]"
                  >
                    {/* Define cute gradients for bars */}
                    <defs>
                      <linearGradient id="lettersGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B6B" />
                        <stop offset="100%" stopColor="#FF9F43" />
                      </linearGradient>
                      <linearGradient id="numbersGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4D96FF" />
                        <stop offset="100%" stopColor="#00C4FF" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="40" y1="30" x2="360" y2="30" stroke="#FFF0E0" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="40" y1="80" x2="360" y2="80" stroke="#FFF0E0" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="40" y1="130" x2="360" y2="130" stroke="#FFE5CC" strokeWidth="3" />

                    {(() => {
                      const maxVal = Math.max(interactions.alphabets, interactions.numbers, 5);
                      const letHeight = (interactions.alphabets / maxVal) * 100;
                      const numHeight = (interactions.numbers / maxVal) * 100;

                      return (
                        <>
                          {/* Letters / Alphabets Bar */}
                          <g>
                            <motion.rect
                              x="100"
                              width="50"
                              rx="15"
                              fill="url(#lettersGrad)"
                              cursor="pointer"
                              whileHover={{ 
                                scaleY: 1.06, 
                                scaleX: 1.15, 
                                opacity: 0.85, 
                                originY: "130px", 
                                originX: "125px" 
                              }}
                              initial={{ height: 0, y: 130 }}
                              animate={{ height: letHeight, y: 130 - letHeight }}
                              transition={{ type: "spring", stiffness: 100, damping: 12 }}
                              onClick={() => {
                                synth.playPop();
                                speakText(
                                  language === 'English' 
                                    ? `You have interacted with letters ${interactions.alphabets} times` 
                                    : `आपने वर्णमाला को ${interactions.alphabets} बार छुआ है`, 
                                  language
                                );
                              }}
                            />
                            {/* Animated floating numbers above bar */}
                            <motion.text
                              x="125"
                              textAnchor="middle"
                              className="font-display font-black text-sm fill-rose-500"
                              initial={{ opacity: 0, y: 130 }}
                              animate={{ opacity: 1, y: 130 - letHeight - 8 }}
                              transition={{ delay: 0.15 }}
                            >
                              {interactions.alphabets}
                            </motion.text>
                            {/* Cute label under the letters bar */}
                            <text
                              x="125"
                              y="155"
                              textAnchor="middle"
                              className="font-sans font-extrabold text-xs fill-slate-500"
                            >
                              {language === 'English' ? 'Letters 🦁' : 'वर्णमाला 🦁'}
                            </text>
                          </g>

                          {/* Numbers Bar */}
                          <g>
                            <motion.rect
                              x="250"
                              width="50"
                              rx="15"
                              fill="url(#numbersGrad)"
                              cursor="pointer"
                              whileHover={{ 
                                scaleY: 1.06, 
                                scaleX: 1.15, 
                                opacity: 0.85, 
                                originY: "130px", 
                                originX: "275px" 
                              }}
                              initial={{ height: 0, y: 130 }}
                              animate={{ height: numHeight, y: 130 - numHeight }}
                              transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.05 }}
                              onClick={() => {
                                synth.playPop();
                                speakText(
                                  language === 'English' 
                                    ? `You have interacted with numbers ${interactions.numbers} times` 
                                    : `आपने गिनती को ${interactions.numbers} बार छुआ है`, 
                                  language
                                );
                              }}
                            />
                            {/* Animated floating numbers above bar */}
                            <motion.text
                              x="275"
                              textAnchor="middle"
                              className="font-display font-black text-sm fill-sky-500"
                              initial={{ opacity: 0, y: 130 }}
                              animate={{ opacity: 1, y: 130 - numHeight - 8 }}
                              transition={{ delay: 0.2 }}
                            >
                              {interactions.numbers}
                            </motion.text>
                            {/* Cute label under the numbers bar */}
                            <text
                              x="275"
                              y="155"
                              textAnchor="middle"
                              className="font-sans font-extrabold text-xs fill-slate-500"
                            >
                              {language === 'English' ? 'Numbers 🎈' : 'गिनती 🎈'}
                            </text>
                          </g>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Info Text Helper */}
                <div className="text-center mt-1 z-10">
                  {interactions.alphabets === 0 && interactions.numbers === 0 ? (
                    <motion.p
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs font-semibold text-amber-500/90 italic"
                    >
                      {language === 'English' ? 'Tap cards in the zones to grow your bars! 🌱' : 'तारे जीतने के लिए खिलौनों को छुएं! 🌱'}
                    </motion.p>
                  ) : (
                    <p className="text-xs font-bold text-slate-400">
                      {language === 'English' 
                        ? `Total Category Actions: ${interactions.alphabets + interactions.numbers} ✨` 
                        : `कुल गतिविधियां: ${interactions.alphabets + interactions.numbers} ✨`}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Bento Level Select Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
                
                {/* Alpha Pets Card Selection */}
                <motion.div
                  id="card-alpha-pets"
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleScreenChange('alphabet')}
                  className="bg-gradient-to-br from-rose-400 to-orange-400 border-b-8 border-rose-600 rounded-[32px] p-6 text-white cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between aspect-square md:aspect-auto md:h-72"
                >
                  <div className="absolute top-[-20px] right-[-20px] w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
                  <div className="text-5xl md:text-6xl mb-4">🦁</div>
                  <div>
                    <h3 className="font-display font-black text-2xl md:text-3xl mb-1 tracking-tight">
                      {currentStrings.abcTitle}
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm font-semibold">
                      {language === 'English' ? 'Explore playful words & alphabets!' : 'वर्णमाला और नए शब्द सीखें!'}
                    </p>
                  </div>
                </motion.div>

                {/* Number Pop Card Selection */}
                <motion.div
                  id="card-number-pop"
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleScreenChange('numbers')}
                  className="bg-gradient-to-br from-sky-400 to-blue-400 border-b-8 border-sky-600 rounded-[32px] p-6 text-white cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between aspect-square md:aspect-auto md:h-72"
                >
                  <div className="absolute top-[-20px] right-[-20px] w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
                  <div className="text-5xl md:text-6xl mb-4">🎈</div>
                  <div>
                    <h3 className="font-display font-black text-2xl md:text-3xl mb-1 tracking-tight">
                      {currentStrings.numTitle}
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm font-semibold">
                      {language === 'English' ? 'Count colorful balloons & sweets!' : 'रंगीन गुब्बारे और टॉफियां गिनें!'}
                    </p>
                  </div>
                </motion.div>

                {/* Song Corner Selection Card */}
                <motion.div
                  id="card-song-corner"
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleScreenChange('rhymes')}
                  className="bg-gradient-to-br from-teal-400 to-emerald-400 border-b-8 border-teal-600 rounded-[32px] p-6 text-white cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between aspect-square md:aspect-auto md:h-72"
                >
                  <div className="absolute top-[-20px] right-[-20px] w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
                  <div className="text-5xl md:text-6xl mb-4">🎵</div>
                  <div>
                    <h3 className="font-display font-black text-2xl md:text-3xl mb-1 tracking-tight">
                      {currentStrings.songTitle}
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm font-semibold">
                      {language === 'English' ? 'Listen to cheerful synthesizers!' : 'मजेदार बाल गीत और संगीत!'}</p>
                  </div>
                </motion.div>

              </div>

              {/* Reset progress button */}
              {stars > 0 && (
                <motion.button
                  id="btn-reset-stars"
                  whileHover={{ scale: 1.05 }}
                  onClick={resetProgress}
                  className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold px-4 py-2 rounded-2xl text-xs transition-colors cursor-pointer mt-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{currentStrings.resetProgress}</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ==========================================
              VIEW B: ALPHABET GAME STAGE
              ========================================== */}
          {currentScreen === 'alphabet' && (
            <motion.div
              key="alphabet-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md flex flex-col items-center gap-6 md:gap-8"
            >
              {/* Category Header Label */}
              <div className="bg-rose-100 text-rose-600 font-display font-black tracking-widest px-6 py-2 rounded-full border-2 border-rose-300 uppercase shadow-sm text-sm">
                🦁 {currentStrings.abcTitle}
              </div>

              {/* Main Interactive Flash Card */}
              <motion.div
                id="alphabet-flashcard"
                className="relative w-full aspect-[4/5] bg-white rounded-[40px] shadow-2xl border-4 border-[#FFF] cursor-pointer overflow-hidden p-8 flex flex-col items-center justify-between transition-all"
                style={{
                  boxShadow: `0 20px 40px -15px ${currentStrings.alphabets[alphabetIndex]?.color || '#FF6B6B'}44`
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={(e) => handleCardInteraction(e, currentStrings.alphabets[alphabetIndex])}
              >
                {/* Visual colored card bounding frame border */}
                <div 
                  className="absolute inset-4 rounded-[30px] border-8 pointer-events-none transition-colors duration-500"
                  style={{ borderColor: currentStrings.alphabets[alphabetIndex]?.color }}
                />

                {/* Stars Burst Particles Overlay Box */}
                <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
                  {starBurstList.map((star) => {
                    const radians = (star.angle * Math.PI) / 180;
                    const xOffset = Math.cos(radians) * star.distance;
                    const yOffset = Math.sin(radians) * star.distance - 40; // upward bias

                    return (
                      <motion.div
                        key={star.id}
                        initial={{ x: star.x, y: star.y, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{ 
                          x: star.x + xOffset, 
                          y: star.y + yOffset, 
                          scale: [0.8, 1.6, 1.2, 0], 
                          opacity: [1, 1, 0.8, 0],
                          rotate: 360
                        }}
                        transition={{ duration: 1, ease: "easeOut", delay: star.delay }}
                        className="absolute text-yellow-400 font-bold text-3xl drop-shadow"
                      >
                        ⭐
                      </motion.div>
                    );
                  })}
                </div>

                {/* Card Elements: Giant Emoji & Letters */}
                <div className="flex flex-col items-center justify-center flex-grow mt-6">
                  {/* Floating wiggling emoji container */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-[120px] leading-none mb-4 select-none drop-shadow-md"
                  >
                    {currentStrings.alphabets[alphabetIndex]?.emoji}
                  </motion.div>
                  
                  <h2 className="font-display font-black text-6xl text-gray-800 tracking-tight select-none">
                    {currentStrings.alphabets[alphabetIndex]?.letter}
                  </h2>

                  <h4 className="font-display font-extrabold text-3xl text-gray-500 mt-2 tracking-wide select-none">
                    {currentStrings.alphabets[alphabetIndex]?.word}
                  </h4>
                </div>

                {/* Click action tooltip indicator */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-4 text-xs font-bold tracking-wider text-gray-400 select-none uppercase flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
                  {currentStrings.tapStars}
                </motion.div>
              </motion.div>

              {/* Primary Game Controller Buttons */}
              <div className="w-full flex justify-between items-center px-4 mt-2">
                <motion.button
                  id="btn-alphabet-prev"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => prevCard('alphabet')}
                  className="w-16 h-16 flex items-center justify-center bg-white hover:bg-[#FFF9EC] text-amber-500 border-4 border-amber-100 rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-8 h-8 stroke-[3]" />
                </motion.button>

                <motion.button
                  id="btn-alphabet-speak"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  onClick={() => {
                    synth.playPop();
                    speakText(currentStrings.alphabets[alphabetIndex]?.speak, language);
                  }}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-white rounded-full shadow-xl border-4 border-white transition-all cursor-pointer"
                >
                  <Volume2 className="w-10 h-10 stroke-[2.5]" />
                </motion.button>

                <motion.button
                  id="btn-alphabet-next"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => nextCard('alphabet')}
                  className="w-16 h-16 flex items-center justify-center bg-white hover:bg-[#FFF9EC] text-[#10B981] border-4 border-[#D1FAE5] rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ArrowRight className="w-8 h-8 stroke-[3]" />
                </motion.button>
              </div>

              {/* Card index indicators */}
              <div className="flex gap-1.5 justify-center mt-2">
                {currentStrings.alphabets.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-3 rounded-full transition-all duration-300 ${idx === alphabetIndex ? 'w-8' : 'w-3'}`}
                    style={{
                      backgroundColor: idx === alphabetIndex 
                        ? (currentStrings.alphabets[alphabetIndex]?.color || '#FF6B6B') 
                        : '#E2E8F0'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ==========================================
              VIEW C: NUMBER POP GAME STAGE
              ========================================== */}
          {currentScreen === 'numbers' && (
            <motion.div
              key="numbers-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md flex flex-col items-center gap-6 md:gap-8"
            >
              {/* Category Header Label */}
              <div className="bg-sky-100 text-sky-600 font-display font-black tracking-widest px-6 py-2 rounded-full border-2 border-sky-300 uppercase shadow-sm text-sm">
                🎈 {currentStrings.numTitle}
              </div>

              {/* Main Interactive Flash Card */}
              <motion.div
                id="number-flashcard"
                className="relative w-full aspect-[4/5] bg-white rounded-[40px] shadow-2xl border-4 border-[#FFF] cursor-pointer overflow-hidden p-8 flex flex-col items-center justify-between transition-all"
                style={{
                  boxShadow: `0 20px 40px -15px ${currentStrings.numbers[numberIndex]?.color || '#4D96FF'}44`
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={(e) => handleCardInteraction(e, currentStrings.numbers[numberIndex])}
              >
                {/* Visual colored card bounding frame border */}
                <div 
                  className="absolute inset-4 rounded-[30px] border-8 pointer-events-none transition-colors duration-500"
                  style={{ borderColor: currentStrings.numbers[numberIndex]?.color }}
                />

                {/* Stars Burst Particles Overlay Box */}
                <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
                  {starBurstList.map((star) => {
                    const radians = (star.angle * Math.PI) / 180;
                    const xOffset = Math.cos(radians) * star.distance;
                    const yOffset = Math.sin(radians) * star.distance - 40;

                    return (
                      <motion.div
                        key={star.id}
                        initial={{ x: star.x, y: star.y, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{ 
                          x: star.x + xOffset, 
                          y: star.y + yOffset, 
                          scale: [0.8, 1.6, 1.2, 0], 
                          opacity: [1, 1, 0.8, 0],
                          rotate: 360
                        }}
                        transition={{ duration: 1, ease: "easeOut", delay: star.delay }}
                        className="absolute text-yellow-400 font-bold text-3xl drop-shadow"
                      >
                        ⭐
                      </motion.div>
                    );
                  })}
                </div>

                {/* Card Elements: Giant Emoji & Numbers */}
                <div className="flex flex-col items-center justify-center flex-grow mt-6">
                  {/* Floating/wiggling emojis group container */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-5xl leading-tight mb-6 select-none drop-shadow-md text-center tracking-wider max-w-[280px] break-all"
                  >
                    {currentStrings.numbers[numberIndex]?.emoji}
                  </motion.div>
                  
                  <h2 className="font-display font-black text-7xl text-gray-800 tracking-tight select-none">
                    {currentStrings.numbers[numberIndex]?.letter}
                  </h2>

                  <h4 className="font-display font-extrabold text-3xl text-gray-500 mt-2 tracking-wide select-none">
                    {currentStrings.numbers[numberIndex]?.word}
                  </h4>
                </div>

                {/* Click action tooltip indicator */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-4 text-xs font-bold tracking-wider text-gray-400 select-none uppercase flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
                  {currentStrings.tapStars}
                </motion.div>
              </motion.div>

              {/* Primary Game Controller Buttons */}
              <div className="w-full flex justify-between items-center px-4 mt-2">
                <motion.button
                  id="btn-numbers-prev"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => prevCard('numbers')}
                  className="w-16 h-16 flex items-center justify-center bg-white hover:bg-[#FFF9EC] text-amber-500 border-4 border-amber-100 rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-8 h-8 stroke-[3]" />
                </motion.button>

                <motion.button
                  id="btn-numbers-speak"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  onClick={() => {
                    synth.playPop();
                    speakText(currentStrings.numbers[numberIndex]?.speak, language);
                  }}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-white rounded-full shadow-xl border-4 border-white transition-all cursor-pointer"
                >
                  <Volume2 className="w-10 h-10 stroke-[2.5]" />
                </motion.button>

                <motion.button
                  id="btn-numbers-next"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => nextCard('numbers')}
                  className="w-16 h-16 flex items-center justify-center bg-white hover:bg-[#FFF9EC] text-[#10B981] border-4 border-[#D1FAE5] rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ArrowRight className="w-8 h-8 stroke-[3]" />
                </motion.button>
              </div>

              {/* Card index indicators */}
              <div className="flex gap-1.5 justify-center mt-2">
                {currentStrings.numbers.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-3 rounded-full transition-all duration-300 ${idx === numberIndex ? 'w-8' : 'w-3'}`}
                    style={{
                      backgroundColor: idx === numberIndex 
                        ? (currentStrings.numbers[numberIndex]?.color || '#4D96FF') 
                        : '#E2E8F0'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ==========================================
              VIEW D: RHYMES SONG CORNER STAGE
              ========================================== */}
          {currentScreen === 'rhymes' && (
            <motion.div
              key="rhymes-screen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4"
            >
              
              {/* Left Column: Interactive Toy TV Screen Player */}
              <div className="flex flex-col items-center">
                
                {/* Retro Wooden TV Box Frame */}
                <div className="w-full max-w-sm aspect-[4/3] bg-[#E89B55] rounded-[36px] p-5 shadow-2xl border-4 border-[#C97B34] flex flex-col justify-between relative overflow-hidden">
                  
                  {/* TV Dials Panel Left-Right */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-4 bg-[#C97B34]/40 px-6 py-1 rounded-full border border-orange-200">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-inner animate-pulse" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-inner" />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-inner" />
                  </div>

                  {/* Inner TV Screen CRT Glow Tube */}
                  <div className="flex-grow w-full bg-[#1e2330] rounded-[24px] border-6 border-[#3e2c1c] shadow-inner overflow-hidden relative flex flex-col items-center justify-center mt-4">
                    
                    {/* Retro Grid Screen Overlay scanlines */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_70%,rgba(0,0,0,0.4))] pointer-events-none" />

                    {isRhymePlaying ? (
                      <div className="flex flex-col items-center justify-center p-4">
                        {/* Jumping Music bouncing emoji item */}
                        <motion.div
                          animate={{
                            y: [0, -25, 0],
                            scale: [1, 1.3, 1],
                            rotate: [0, -10, 10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="text-8xl mb-4 select-none drop-shadow-lg filter hue-rotate-15"
                        >
                          {currentRhymeData?.emoji || '🎵'}
                        </motion.div>

                        {/* Interactive note display visualizer */}
                        <motion.div
                          key={activeNote}
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="bg-purple-500/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-mono text-sm tracking-widest border border-purple-300 shadow"
                        >
                          🎵 {activeNote !== 'R' ? `NOTE: ${activeNote}` : 'REST'} 🎵
                        </motion.div>

                        {/* Animated Equalizer Wave lines */}
                        <div className="flex gap-1.5 items-end h-8 mt-5">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                height: [10, 32, 10]
                              }}
                              transition={{
                                duration: 0.4 + i * 0.1,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              className="w-1.5 bg-gradient-to-t from-teal-400 to-yellow-300 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <Music className="w-16 h-16 mb-4 animate-bounce text-slate-600" />
                        <h4 className="font-display font-black text-xl text-[#FFB800] tracking-wide mb-1 uppercase">
                          {language === 'English' ? 'Singing Corner' : 'गाने का कोना'}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-[200px]">
                          {language === 'English' ? 'Select a nursery rhyme song from the list to start!' : 'बाल गीत सुनने के लिए नीचे दी गई सूची से कोई गीत चुनें!'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rotary Knobs, Speakers & Power Light Drawer */}
                  <div className="flex justify-between items-center w-full px-2 py-1 mt-2">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-[#AD621D] rounded-full border-2 border-[#5C3005] cursor-pointer shadow-md flex items-center justify-center hover:rotate-45 transition-transform">
                        <div className="w-1.5 h-3 bg-white/70 rounded-full" />
                      </div>
                      <div className="w-7 h-7 bg-[#AD621D] rounded-full border-2 border-[#5C3005] cursor-pointer shadow-md flex items-center justify-center hover:rotate-90 transition-transform">
                        <div className="w-1.5 h-3 bg-white/70 rounded-full" />
                      </div>
                    </div>
                    {/* Grid Speaker Dots */}
                    <div className="flex gap-1 flex-grow justify-center px-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-[#8C4A0B] rounded-full" />
                      ))}
                    </div>
                    {/* TV Power red bulb */}
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#5C3005] shadow-inner ${isRhymePlaying ? 'bg-red-500 animate-ping' : 'bg-red-800'}`} />
                  </div>

                </div>

                {/* Stopped controllers overlay drawer */}
                {isRhymePlaying && (
                  <motion.button
                    id="btn-rhymes-stop"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRhyme}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg border-3 border-white mt-6 cursor-pointer text-sm"
                  >
                    <Square className="w-4 h-4 fill-white text-white" />
                    <span>{language === 'English' ? 'STOP PLAYING' : 'संगीत बंद करें'}</span>
                  </motion.button>
                )}

              </div>

              {/* Right Column: Safe Children Playlist Collection Selection */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-rose-500 font-display font-black text-2xl px-2">
                  <Award className="w-6 h-6 animate-pulse" />
                  <h2>{currentStrings.songTitle}</h2>
                </div>

                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {RHYMES_PLAYLIST.map((track) => {
                    const isCurrent = activeRhymeId === track.id;

                    return (
                      <motion.div
                        id={`playlist-item-${track.id}`}
                        key={track.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => playRhyme(track.id)}
                        className={`flex justify-between items-center p-5 rounded-[24px] border-3 shadow-md cursor-pointer transition-all ${
                          isCurrent 
                            ? 'bg-amber-100/90 border-amber-400 shadow-amber-200' 
                            : 'bg-white border-slate-100 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{track.emoji}</span>
                          <div>
                            <h4 className="font-display font-extrabold text-lg text-slate-800">
                              {track.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium">
                              {language === 'English' 
                                ? `${track.notes.length} Playable Note Chimes` 
                                : `${track.notes.length} बजाने योग्य सुर`}
                            </p>
                          </div>
                        </div>

                        {/* Cute circle play arrow */}
                        <div 
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCurrent 
                              ? 'bg-amber-500 border-amber-400 text-white' 
                              : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-amber-400 hover:text-white'
                          }`}
                        >
                          {isCurrent ? <Square className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footnote simple branding copyright (No tech-larping diagnostics, port numbers, or system logs!) */}
      <footer className="w-full text-center py-4 text-slate-400/80 font-semibold text-xs mt-auto">
        <span>© Toy Land Playroom Interactive 🎈 Handmade with love & care</span>
      </footer>

    </div>
  );
}
