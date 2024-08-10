import { GoogleAuthProvider, signInWithPopup, getAuth, GithubAuthProvider } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const signInWithGoogle = async () => {
  const auth = getAuth();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

export const signInWithGitHub = async () => {
  const auth = getAuth();
  try {
    await signInWithPopup(auth, githubProvider);
  } catch (error) {
    console.error("GitHub sign-in error:", error);
  }
};
