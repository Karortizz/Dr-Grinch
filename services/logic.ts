import { Participant, DrawResult, AppState } from '../types';

// Improved obfuscation that handles UTF-8 characters (accents, emojis) correctly
export const encodeState = (state: AppState): string => {
  try {
    const json = JSON.stringify(state);
    // encodeURIComponent + btoa handles UTF-8 strings correctly in browser envs
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error("Error encoding state", e);
    return "";
  }
};

export const decodeState = (hash: string): AppState | null => {
  try {
    // Remove leading # if present
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!cleanHash) return null;
    
    // decodeURIComponent + atob reverses the process
    const json = decodeURIComponent(atob(cleanHash));
    return JSON.parse(json) as AppState;
  } catch (e) {
    console.error("Error decoding state", e);
    return null;
  }
};

export const generateDraw = (participants: Participant[]): DrawResult | null => {
  const ids = participants.map(p => p.id);
  
  // Try to find a valid permutation
  // We use a randomized backtracking approach with a limit to prevent infinite loops
  const MAX_ATTEMPTS = 1000;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const pool = [...ids];
    const result: DrawResult = {};
    let valid = true;

    // Shuffle the order in which we assign givers to increase randomness
    const shuffledGivers = [...participants].sort(() => Math.random() - 0.5);

    for (const giver of shuffledGivers) {
      // Find valid receivers for this giver
      // A valid receiver is someone in the pool who is NOT the giver, and NOT in giver's exclusions
      const validReceivers = pool.filter(receiverId => 
        receiverId !== giver.id && 
        !giver.exclusions.includes(receiverId)
      );

      if (validReceivers.length === 0) {
        valid = false;
        break; // Dead end, retry
      }

      // Pick a random valid receiver
      const pickedIndex = Math.floor(Math.random() * validReceivers.length);
      const receiverId = validReceivers[pickedIndex];
      
      result[giver.id] = receiverId;
      
      // Remove chosen receiver from pool
      const poolIndex = pool.indexOf(receiverId);
      if (poolIndex > -1) {
        pool.splice(poolIndex, 1);
      }
    }

    if (valid) {
      return result;
    }
  }

  return null; // Could not find a solution
};