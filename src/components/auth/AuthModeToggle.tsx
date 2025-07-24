import React from "react";
import { Button } from "@/components/ui/button";

interface AuthModeToggleProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

const AuthModeToggle = ({ isSignUp, onToggleMode }: AuthModeToggleProps) => {
  return (
    <div className="text-center text-sm text-gray-600">
      {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
      <Button
        variant="link"
        onClick={onToggleMode}
        className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
      >
        {isSignUp ? "Sign in" : "Sign up"}
      </Button>
    </div>
  );
};

export default AuthModeToggle;
