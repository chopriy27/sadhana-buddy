import logoImage from "@assets/image_1751395028369.png";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <img 
      src={logoImage} 
      alt="Sadhana Buddy Logo" 
      width={size} 
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}