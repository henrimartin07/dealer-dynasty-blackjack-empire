import { cn } from "@/lib/utils";

interface VisualDeckProps {
  cardCount: number;
  className?: string;
}

export const VisualDeck = ({ cardCount, className }: VisualDeckProps) => {
  const stackHeight = Math.min(Math.floor(cardCount / 4), 12);
  
  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: stackHeight }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-16 h-24 rounded-lg absolute",
            "bg-gradient-to-br from-blue-900 to-blue-800",
            "border border-gold/30 shadow-lg"
          )}
          style={{
            bottom: `${i * 1}px`,
            left: `${i * 0.5}px`,
            zIndex: stackHeight - i
          }}
        />
      ))}
      
      {/* Card count */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-casino-felt-light px-2 py-1 rounded text-gold text-xs font-bold">
          {cardCount} cards
        </div>
      </div>
    </div>
  );
};