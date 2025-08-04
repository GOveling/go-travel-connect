import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  size?: number;
}

export const Loader = ({ className, size = 24 }: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin`} size={size} />
    </div>
  );
};