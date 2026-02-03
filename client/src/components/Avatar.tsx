import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Beautiful gradient combinations
const gradients = [
  'from-orange-400 to-amber-500',
  'from-amber-400 to-yellow-500',
  'from-rose-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
];

// Deterministic gradient based on name/email
function getGradient(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// Get initials from name or email
function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }
  
  if (email) {
    const localPart = email.split('@')[0];
    return localPart.substring(0, 2).toUpperCase();
  }
  
  return '?';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

export default function Avatar({ 
  name, 
  email, 
  imageUrl, 
  size = 'md', 
  className 
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name, email), [name, email]);
  const gradient = useMemo(() => getGradient(name || email || 'default'), [name, email]);

  // If we have a valid image URL (not base64 for now since we removed storage)
  if (imageUrl && !imageUrl.startsWith('data:')) {
    return (
      <div 
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center',
          sizeClasses[size],
          className
        )}
      >
        <img 
          src={imageUrl} 
          alt={name || 'User avatar'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Fallback gradient behind image */}
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-br flex items-center justify-center font-semibold text-white -z-10',
            gradient
          )}
        >
          {initials}
        </div>
      </div>
    );
  }

  // Default to beautiful initials avatar
  return (
    <div 
      className={cn(
        'relative rounded-full flex items-center justify-center font-semibold text-white shadow-md bg-gradient-to-br',
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-full bg-white/10" />
      
      {/* Initials */}
      <span className="relative z-10">{initials}</span>
    </div>
  );
}
