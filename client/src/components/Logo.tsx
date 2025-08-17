import logoImage from "@assets/ChatGPT Image Aug 13, 2025, 10_03_33 AM_1755104655512.png";

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