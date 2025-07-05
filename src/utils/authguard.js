import { auth } from "./firebase";

// Returns a promise that resolves if user is logged in, rejects otherwise
export function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error("Not authenticated"));
      }
    });
  });
}