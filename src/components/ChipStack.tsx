import { cn } from "@/lib/utils";

interface ChipStackProps {
  amount: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const getChipColor = (amount: number) => {
  if (amount >= 100) return 'chip-black';
  if (amount >= 25) return 'chip-green';
  if (amount >= 10) return 'chip-blue';
  return 'chip-red';
};

const getChipColorClass = (amount: number) => {
  if (amount >= 100) return 'bg-chip-black border-gray-600';
  if (amount >= 25) return 'bg-chip-green border-green-400';
  if (amount >= 10) return 'bg-chip-blue border-blue-400';
  return 'bg-chip-red border-red-400';
};

export const ChipStack = ({ amount, isSelected = false, onClick, className }: ChipStackProps) => {
  const chipCount = Math.min(Math.floor(amount / 5), 8) + 1;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        "hover:scale-110 active:scale-95",
        isSelected && "scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]",
        "animate-chip-stack",
        className
      )}
    >
      {/* Chip stack */}
      <div className="relative">
        {Array.from({ length: chipCount }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-12 h-3 rounded-full border-2 absolute",
              getChipColorClass(amount),
              "shadow-md"
            )}
            style={{
              bottom: `${i * 2}px`,
              left: '0px',
              zIndex: chipCount - i
            }}
          />
        ))}
      </div>
      
      {/* Amount label */}
      <div className="text-gold text-xs font-bold text-center mt-2 bg-casino-felt-light px-2 py-1 rounded">
        ${amount}
      </div>
    </div>
  );
};