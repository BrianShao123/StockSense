import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return NextResponse.json({ user: userCredential.user });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong!" }, { status: 400 });
  }
}
