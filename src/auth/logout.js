import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

export async function logout() {
  await signOut(auth);
}