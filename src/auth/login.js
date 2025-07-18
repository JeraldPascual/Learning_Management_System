import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

export async function login(email, password) {
  try {
    const userCredential = await
     signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}
