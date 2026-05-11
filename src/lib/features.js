/**
 * features.js
 * Converts 21 raw MediaPipe hand landmarks into structured feature descriptors.
 * Landmarks are indexed 0-20: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
 */

// Landmark indices for each finger
export const FINGER_INDICES = {
  thumb:  { mcp: 1, pip: 2, dip: 3, tip: 4 },
  index:  { mcp: 5, pip: 6, dip: 7, tip: 8 },
  middle: { mcp: 9, pip: 10, dip: 11, tip: 12 },
  ring:   { mcp: 13, pip: 14, dip: 15, tip: 16 },
  pinky:  { mcp: 17, pip: 18, dip: 19, tip: 20 },
};

const WRIST = 0;

/** Euclidean distance between two landmarks */
export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Normalize distance by hand size (wrist-to-middle-MCP diagonal) */
function handScale(lm) {
  return dist(lm[WRIST], lm[9]) || 1;
}

/** Angle at joint B (degrees) given three landmark points A-B-C */
export function angleBetween(A, B, C) {
  const BAx = A.x - B.x, BAy = A.y - B.y;
  const BCx = C.x - B.x, BCy = C.y - B.y;
  const dot = BAx * BCx + BAy * BCy;
  const magBA = Math.sqrt(BAx * BAx + BAy * BAy);
  const magBC = Math.sqrt(BCx * BCx + BCy * BCy);
  if (magBA * magBC === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (magBA * magBC)));
  return Math.acos(cos) * (180 / Math.PI);
}

/**
 * Returns true if a non-thumb finger is extended.
 * Strategy: tip y-coordinate is above (smaller y) than pip y-coordinate.
 * Also checks that the dip angle is not overly bent.
 */
function isFingerExtended(lm, finger) {
  const { pip, dip, tip } = FINGER_INDICES[finger];
  // In image coordinates y increases downward; "extended" means tip is above pip
  const extendedByY = lm[tip].y < lm[pip].y;
  const angle = angleBetween(lm[pip], lm[dip], lm[tip]);
  return extendedByY && angle > 130;
}

/**
 * Thumb extension check: uses x-axis distance from wrist,
 * since thumb moves laterally more than vertically.
 */
function isThumbExtended(lm) {
  const tipDist = dist(lm[4], lm[0]);
  const scale = handScale(lm);
  return (tipDist / scale) > 0.5;
}

/**
 * Extract all features from a set of 21 landmarks.
 * @param {Array} lm - array of {x, y, z} objects
 * @returns {object} features
 */
export function extractFeatures(lm) {
  const scale = handScale(lm);

  const fingers = {
    thumb:  isThumbExtended(lm),
    index:  isFingerExtended(lm, 'index'),
    middle: isFingerExtended(lm, 'middle'),
    ring:   isFingerExtended(lm, 'ring'),
    pinky:  isFingerExtended(lm, 'pinky'),
  };

  // Normalized distances between key points
  const thumbIndexDist  = dist(lm[4], lm[8])  / scale;
  const thumbMiddleDist = dist(lm[4], lm[12]) / scale;
  const thumbRingDist   = dist(lm[4], lm[16]) / scale;
  const thumbPinkyDist  = dist(lm[4], lm[20]) / scale;

  // Inter-fingertip spread
  const indexMiddleDist  = dist(lm[8],  lm[12]) / scale;
  const middleRingDist   = dist(lm[12], lm[16]) / scale;
  const ringPinkyDist    = dist(lm[16], lm[20]) / scale;
  const indexPinkyDist   = dist(lm[8],  lm[20]) / scale;

  // Max fingertip spread (for alapadma / ardhachandra)
  const spreadScore = (indexMiddleDist + middleRingDist + ringPinkyDist) / 3;

  // Joint angles at PIP for each non-thumb finger
  const angles = {
    index:  angleBetween(lm[5],  lm[6],  lm[7]),
    middle: angleBetween(lm[9],  lm[10], lm[11]),
    ring:   angleBetween(lm[13], lm[14], lm[15]),
    pinky:  angleBetween(lm[17], lm[18], lm[19]),
  };

  // Count extended fingers (excluding thumb)
  const extendedCount = [fingers.index, fingers.middle, fingers.ring, fingers.pinky]
    .filter(Boolean).length;

  return {
    fingers,
    thumbIndexDist,
    thumbMiddleDist,
    thumbRingDist,
    thumbPinkyDist,
    indexMiddleDist,
    middleRingDist,
    ringPinkyDist,
    indexPinkyDist,
    spreadScore,
    angles,
    extendedCount,
  };
}
