/**
 * classifier.js
 * Rule-based classifier for 8 classical mudras.
 * Each rule returns a confidence score (0-1) based on satisfied sub-conditions.
 * The final prediction is the mudra with the highest confidence above threshold.
 *
 * Each mudra entry also carries rich educational metadata for the tutorial panel.
 */

import { extractFeatures } from './features.js';

/** Weighted score: count of truthy conditions / total conditions */
function score(conditions) {
  const passed = conditions.filter(Boolean).length;
  return passed / conditions.length;
}

// ─── Individual mudra classifiers ─────────────────────────────────────────────

function classifyPataka(f) {
  return score([
    f.fingers.index,
    f.fingers.middle,
    f.fingers.ring,
    f.fingers.pinky,
    !f.fingers.thumb,
    f.extendedCount === 4,
    f.spreadScore < 0.25,
    f.indexMiddleDist < 0.22,
    f.middleRingDist < 0.22,
    f.ringPinkyDist < 0.22,
  ]);
}

function classifyTripataka(f) {
  return score([
    f.fingers.index,
    f.fingers.middle,
    !f.fingers.ring,
    f.fingers.pinky,
    f.extendedCount === 3,
    f.angles.ring < 120,
    f.angles.index > 140,
    f.angles.middle > 140,
    f.angles.pinky > 130,
    f.spreadScore < 0.3,
  ]);
}

function classifyArdhachandra(f) {
  return score([
    f.fingers.index,
    f.fingers.middle,
    f.fingers.ring,
    f.fingers.pinky,
    f.fingers.thumb,
    f.extendedCount === 4,
    f.spreadScore > 0.2,
    f.spreadScore < 0.5,
    f.thumbIndexDist > 0.4,
    f.thumbIndexDist < 0.8,
  ]);
}

function classifyKatakamukha(f) {
  return score([
    !f.fingers.index,
    !f.fingers.middle,
    f.fingers.ring,
    f.fingers.pinky,
    f.extendedCount === 2,
    f.angles.index < 130,
    f.angles.middle < 130,
    f.thumbIndexDist < 0.35,
    f.thumbMiddleDist < 0.4,
  ]);
}

function classifyAlapadma(f) {
  return score([
    f.fingers.index,
    f.fingers.middle,
    f.fingers.ring,
    f.fingers.pinky,
    f.fingers.thumb,
    f.extendedCount === 4,
    f.spreadScore > 0.45,
    f.indexMiddleDist > 0.3,
    f.middleRingDist > 0.3,
    f.ringPinkyDist > 0.3,
    f.indexPinkyDist > 0.8,
  ]);
}

function classifyChandrakala(f) {
  return score([
    f.fingers.thumb,
    f.fingers.index,
    !f.fingers.middle,
    !f.fingers.ring,
    !f.fingers.pinky,
    f.extendedCount === 1,
    f.thumbIndexDist > 0.25,
    f.thumbIndexDist < 0.65,
    f.angles.middle < 140,
    f.angles.ring < 140,
  ]);
}

function classifyMrigashirsha(f) {
  return score([
    f.fingers.index,
    !f.fingers.middle,
    !f.fingers.ring,
    f.fingers.pinky,
    f.extendedCount === 2,
    f.angles.middle < 120,
    f.angles.ring < 120,
    f.angles.index > 140,
    f.angles.pinky > 130,
    f.indexPinkyDist > 0.4,
  ]);
}

function classifyHamsasya(f) {
  return score([
    f.thumbIndexDist < 0.15,
    f.fingers.middle,
    f.fingers.ring,
    f.fingers.pinky,
    f.extendedCount >= 3,
    f.angles.middle > 140,
    f.angles.ring > 130,
    f.thumbMiddleDist > 0.25,
    f.spreadScore > 0.15,
  ]);
}

// ─── Mudra registry ───────────────────────────────────────────────────────────

export const MUDRAS = [
  {
    id: 'pataka',
    name: 'Pataka',
    devanagari: 'पताक',
    telugu: 'పతాక',
    meaning: 'Flag',
    navarasa: 'Vīra · Raudra',
    rasaDesc: 'Heroism and righteous fury',
    usage:
      'Used to represent a flowing river, the sky, a horse, or a royal blessing. ' +
      'In Kuchipudi, Pataka opens many compositions and is used to portray the divine radiance of Krishna.',
    fingerGuide: [
      'Extend all four fingers straight and hold them close together',
      'Fold your thumb across the palm so it lies flat',
      'Keep the palm facing outward, fingers pointing up',
      'Do not let any finger splay to the side',
    ],
    hint: 'Hold all four fingers straight and close together, thumb folded',
    color: '#f59e0b',
    classify: classifyPataka,
  },
  {
    id: 'tripataka',
    name: 'Tripataka',
    devanagari: 'त्रिपताक',
    telugu: 'త్రిపతాక',
    meaning: 'Three-part flag',
    navarasa: 'Shringāra · Vīra',
    rasaDesc: 'Love and courageous devotion',
    usage:
      'Symbolises a crown, a tree, a lightning bolt, or the sacred fire. ' +
      'Kuchipudi dancers use Tripataka to depict the trimūrti and in abhinaya for marriage rites.',
    fingerGuide: [
      'Extend your index, middle, and pinky fingers fully',
      'Curl the ring finger down onto the palm — only the ring finger bends',
      'Keep the three extended fingers together and upright',
      'Hold the thumb gently across the palm',
    ],
    hint: 'Extend all fingers except the ring finger — fold it down',
    color: '#10b981',
    classify: classifyTripataka,
  },
  {
    id: 'ardhachandra',
    name: 'Ardhachandra',
    devanagari: 'अर्धचन्द्र',
    telugu: 'అర్ధచంద్ర',
    meaning: 'Half moon',
    navarasa: 'Shānta · Adbhuta',
    rasaDesc: 'Serenity and divine wonder',
    usage:
      'Represents the crescent moon, the waist, a spear, or the start of a prayer. ' +
      'In Kuchipudi Tarangam, Ardhachandra evokes Lord Shiva wearing the moon as an ornament.',
    fingerGuide: [
      'Open your hand fully with all five fingers extended',
      'Spread the fingers moderately apart — not too tight, not at full splay',
      'Angle the thumb away from the index finger to create a slight arc',
      'The palm can face forward or slightly outward',
    ],
    hint: 'Open your hand fully with fingers moderately spread apart',
    color: '#6366f1',
    classify: classifyArdhachandra,
  },
  {
    id: 'katakamukha',
    name: 'Katakamukha',
    devanagari: 'कटकामुख',
    telugu: 'కటకముఖ',
    meaning: 'Opening in a bracelet',
    navarasa: 'Shringāra',
    rasaDesc: 'Delicate love and graceful beauty',
    usage:
      'Used to depict picking flowers, holding a garland, pulling a bowstring, or the delicate gesture of a woman adorning herself. ' +
      'Prominent in Kuchipudi Yakshagana scenes involving the heroines Satyabhama and Rukmini.',
    fingerGuide: [
      'Curl your index and middle fingers inward toward the thumb',
      'Extend your ring finger and pinky finger straight out',
      'Bring the thumb close to the curled index and middle fingers',
      'Imagine you are delicately holding a flower stem',
    ],
    hint: 'Curl index and middle toward thumb, extend ring and pinky',
    color: '#ec4899',
    classify: classifyKatakamukha,
  },
  {
    id: 'alapadma',
    name: 'Alapadma',
    devanagari: 'अलपद्म',
    telugu: 'అలపద్మ',
    meaning: 'Full-blown lotus',
    navarasa: 'Adbhuta · Shringāra',
    rasaDesc: 'Wonder, abundance, and sacred beauty',
    usage:
      'Represents a fully bloomed lotus, the earth, the face of the beloved, or cosmic abundance. ' +
      'Central to Kuchipudi Pushpanjali (flower offering) sequences and in depicting Goddess Lakshmi.',
    fingerGuide: [
      'Spread all five fingers as wide apart as possible',
      'Curve each finger slightly outward like lotus petals',
      'Fan your thumb out away from the index finger fully',
      'Hold the wrist steady — the gesture radiates outward like a blooming flower',
    ],
    hint: 'Spread all five fingers as wide apart as possible',
    color: '#f43f5e',
    classify: classifyAlapadma,
  },
  {
    id: 'chandrakala',
    name: 'Chandrakala',
    devanagari: 'चन्द्रकला',
    telugu: 'చంద్రకళ',
    meaning: 'Digit of the moon',
    navarasa: 'Shānta · Karuna',
    rasaDesc: 'Peaceful serenity and tender compassion',
    usage:
      'Depicts the crescent moon, Lord Shiva\'s head ornament, or a single digit of moonlight. ' +
      'Used in Kuchipudi to evoke the meditative stillness of Shiva in Nataraja pose.',
    fingerGuide: [
      'Extend your index finger upward and slightly curve it',
      'Bring your thumb out and away from the index finger forming a crescent arc',
      'Gently curl your middle, ring, and pinky fingers inward',
      'The space between thumb and index should look like a crescent moon',
    ],
    hint: 'Extend thumb and index with a slight curve, curl the others in',
    color: '#8b5cf6',
    classify: classifyChandrakala,
  },
  {
    id: 'mrigashirsha',
    name: 'Mrigashīrsha',
    devanagari: 'मृगशीर्ष',
    telugu: 'మృగశీర్ష',
    meaning: "Deer's head",
    navarasa: 'Hasya · Bhayanaka',
    rasaDesc: 'Playful humour and gentle fear',
    usage:
      'Represents a deer, a woman\'s gentle face, beckoning, or the shy glance of a devotee. ' +
      'Used in Kuchipudi to portray the gentle deer in forest scenes and in depicting Goddess Saraswati.',
    fingerGuide: [
      'Extend your index finger and pinky finger fully upright like two horns',
      'Fold your middle and ring fingers firmly down onto the palm',
      'Keep the index and pinky slightly apart — like deer antlers',
      'Your thumb can rest loosely at the side',
    ],
    hint: 'Extend index and pinky like horns, fold middle and ring down',
    color: '#d97706',
    classify: classifyMrigashirsha,
  },
  {
    id: 'hamsasya',
    name: 'Hamsāsya',
    devanagari: 'हंसास्य',
    telugu: 'హంసాస్య',
    meaning: "Swan's beak",
    navarasa: 'Shringāra · Adbhuta',
    rasaDesc: 'Graceful love and wonder',
    usage:
      'Depicts a swan, applying a bindi or tilak, stringing flower garlands, or delicate painting. ' +
      'Used extensively in Kuchipudi abhinaya sequences where the heroine adorns herself for her beloved.',
    fingerGuide: [
      'Touch the tips of your thumb and index finger together to form a small "O"',
      'Extend your middle, ring, and pinky fingers straight outward',
      'Keep the three extended fingers close together but relaxed',
      'Imagine you are holding a fine paintbrush between your thumb and index',
    ],
    hint: 'Touch thumb and index tips together, extend the other three fingers',
    color: '#0ea5e9',
    classify: classifyHamsasya,
  },
];

export const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Classify a set of hand landmarks.
 */
export function classifyMudra(landmarks, practiceTarget = null) {
  if (!landmarks || landmarks.length < 21) {
    return { mudra: null, confidence: 0, scores: {} };
  }

  const features = extractFeatures(landmarks);
  const scores = {};

  for (const mudra of MUDRAS) {
    scores[mudra.id] = mudra.classify(features);
  }

  let best = null;
  let bestScore = 0;

  for (const mudra of MUDRAS) {
    const s = scores[mudra.id];
    if (s > bestScore) {
      bestScore = s;
      best = mudra;
    }
  }

  if (bestScore >= CONFIDENCE_THRESHOLD) {
    return { mudra: best, confidence: bestScore, scores };
  }

  return { mudra: null, confidence: bestScore, scores };
}
