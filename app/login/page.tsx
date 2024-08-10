'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ReactTyped } from "react-typed";
import { GoogleIcon, GithubIcon, StockSenseLogo } from '@/components/icons';
import { Spinner } from '@/components/icons';
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/protected');
    }
  }, [user, loading, router]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        router.push('/protected');
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      if (result.user) {
        router.push('/protected');
      }
    } catch (error) {
      console.error("Github sign-in error:", error);
    }
  };

  if (loading) {
    return(
    <div className="flex flex-center justify-center">
      <Spinner />
    </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-start md:items-center p-8">
      <StockSenseLogo />
      <div className="text-5xl"> StockSense </div>
      <Card className="mt-6 w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign in with</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col">
          <Button className="w-full m-1 flex items-center justify-center" onClick={signInWithGoogle}>
            <GoogleIcon />
          </Button>
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>
          <Button className="w-full m-1 flex items-center justify-center" onClick={signInWithGithub}>
            <GithubIcon />
          </Button>
        </CardFooter>
      </Card>

      <ReactTyped
        strings={["Data Driven", "Seamless Updates", "Track Effortlessly", "Stock Smarter"]}
        typeSpeed={40}
        backSpeed={50}
        backDelay={4000}
        loop
        className="text-2xl mt-4"
      />
    </div>
  );
}
