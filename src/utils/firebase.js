import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, increment, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuMmp4a_TVzS2AzWaS_LO9ibYBa0CM3c4",
  authDomain: "ducksquack.firebaseapp.com",
  databaseURL: "https://ducksquack-default-rtdb.firebaseio.com",
  projectId: "ducksquack",
  storageBucket: "ducksquack.firebasestorage.app",
  messagingSenderId: "998001273117",
  appId: "1:998001273117:web:41307739907261436fd9f4"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.warn('Firebase not configured:', error.message);
}

/**
 * Increment view count for a writing
 * @param {string} slug - The writing slug
 */
export async function incrementViewCount(slug) {
  if (!database) return;

  try {
    const viewRef = ref(database, `views/${slug}`);
    await set(viewRef, increment(1));
  } catch (error) {
    console.error('Failed to increment view:', error);
  }
}

/**
 * Get view count for a single writing
 * @param {string} slug - The writing slug
 * @returns {Promise<number>} View count
 */
export async function getViewCount(slug) {
  if (!database) return 0;

  try {
    const viewRef = ref(database, `views/${slug}`);
    const snapshot = await get(viewRef);
    return snapshot.exists() ? snapshot.val() : 0;
  } catch (error) {
    console.error('Failed to get view count:', error);
    return 0;
  }
}

/**
 * Get all view counts
 * @returns {Promise<Object>} Object mapping slug to view count
 */
export async function getAllViewCounts() {
  if (!database) return {};

  try {
    const viewsRef = ref(database, 'views');
    const snapshot = await get(viewsRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Failed to get view counts:', error);
    return {};
  }
}

/**
 * Subscribe to real-time view count updates
 * @param {function} callback - Called with updated view counts object
 * @returns {function} Unsubscribe function
 */
export function subscribeToViewCounts(callback) {
  if (!database) {
    callback({});
    return () => {};
  }

  const viewsRef = ref(database, 'views');
  return onValue(viewsRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
}

export { database };
