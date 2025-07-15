import { cn } from "@/lib/utils";

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
  hidden?: boolean;
}

interface PlayingCardProps {
  card: Card;
  className?: string;
  isDealing?: boolean;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

export const PlayingCard = ({ card, className, isDealing = false }: PlayingCardProps) => {
  if (card.hidden) {
    return (
      <div className={cn(
        "w-16 h-24 rounded-lg shadow-lg flex items-center justify-center",
        "bg-gradient-to-br from-blue-900 to-blue-800",
        "border border-gold/30",
        "transform transition-all duration-300",
        isDealing && "animate-deal-card",
        className
      )}>
        <div className="text-gold text-xs font-bold">🂠</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-16 h-24 rounded-lg shadow-lg flex flex-col justify-between p-1",
      "bg-card-bg border border-gray-300",
      "transform transition-all duration-300 hover:scale-105",
      isDealing && "animate-deal-card",
      className
    )}>
      {/* Top left */}
      <div className={cn("text-xs font-bold leading-none", suitColors[card.suit])}>
        <div>{card.rank}</div>
        <div className="text-center">{suitSymbols[card.suit]}</div>
      </div>
      
      {/* Center symbol */}
      <div className={cn("text-2xl text-center", suitColors[card.suit])}>
        {suitSymbols[card.suit]}
      </div>
      
      {/* Bottom right (rotated) */}
      <div className={cn("text-xs font-bold leading-none transform rotate-180 text-right", suitColors[card.suit])}>
        <div>{card.rank}</div>
        <div className="text-center">{suitSymbols[card.suit]}</div>
      </div>
    </div>
  );
};