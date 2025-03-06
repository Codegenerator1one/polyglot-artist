
import React from 'react';
import { Code, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm py-4 px-6 flex items-center justify-between animate-fade-in">
      <div className="flex items-center space-x-2">
        <Code className="w-6 h-6 text-primary animate-pulse-subtle" />
        <h1 className="text-xl font-medium">CodeGenius</h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full">
          Powered by Gemini
        </div>
        
        {isSignedIn ? (
          <div className="flex items-center ml-4 space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/my-projects')}
            >
              My Projects
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex items-center ml-4 space-x-2">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
