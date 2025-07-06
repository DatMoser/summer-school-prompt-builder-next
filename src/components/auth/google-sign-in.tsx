'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

interface GoogleSignInProps {
  onAuthChange?: (isAuthenticated: boolean, accessToken?: string) => void;
}

export default function GoogleSignIn({ onAuthChange }: GoogleSignInProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: false 
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      onAuthChange?.(false);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Notify parent of auth changes using useEffect to avoid render-time state updates
  useEffect(() => {
    if (session?.accessToken && onAuthChange) {
      console.log('GoogleSignIn: Session has access token, notifying parent');
      onAuthChange(true, session.accessToken);
    } else if (!session && onAuthChange) {
      console.log('GoogleSignIn: No session, notifying parent');
      onAuthChange(false);
    }
  }, [session, onAuthChange]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <User className="w-4 h-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (session?.user) {
    console.log('GoogleSignIn: Session data:', { 
      user: session.user, 
      accessToken: session.accessToken ? 'present' : 'missing',
      error: session.error 
    });
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
          <User className="w-5 h-5 text-green-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-400 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-green-300 truncate">
              {session.user.email}
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-transparent border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>


        {session.error && (
          <div className="p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
            <p className="text-sm text-red-400">
              ⚠️ Authentication error. Please sign in again.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <LogIn className="w-4 h-4 mr-2" />
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>

    </div>
  );
}