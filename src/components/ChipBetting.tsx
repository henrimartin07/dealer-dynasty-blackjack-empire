import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChipStack } from './ChipStack';
import { cn } from "@/lib/utils";

interface ChipBettingProps {
  playerMoney: number;
  onBet: (amount: number) => void;
  disabled?: boolean;
}

export const ChipBetting = ({ playerMoney, onBet, disabled = false }: ChipBettingProps) => {
  const [selectedBet, setSelectedBet] = useState(0);
  const chipValues = [5, 10, 25, 50, 100];

  const addChip = (value: number) => {
    if (selectedBet + value <= playerMoney) {
      setSelectedBet(prev => prev + value);
    }
  };

  const clearBet = () => {
    setSelectedBet(0);
  };

  const allIn = () => {
    setSelectedBet(playerMoney);
  };

  const placeBet = () => {
    if (selectedBet > 0) {
      onBet(selectedBet);
      setSelectedBet(0);
    }
  };

  return (
    <div className={cn("text-center space-y-4", disabled && "opacity-50 pointer-events-none")}>
      <h3 className="text-lg text-gold">Place Your Bet</h3>
      
      {/* Current bet display */}
      <div className="bg-casino-felt-light p-4 rounded-lg border border-gold/30">
        <div className="text-gold-light mb-2">Current Bet:</div>
        <div className="text-2xl font-bold text-gold">${selectedBet}</div>
      </div>

      {/* Chip selection */}
      <div className="flex justify-center gap-4 flex-wrap">
        {chipValues.map(value => (
          <ChipStack
            key={value}
            amount={value}
            onClick={() => addChip(value)}
            className={cn(
              playerMoney < value && "opacity-50 cursor-not-allowed",
              selectedBet + value > playerMoney && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>

      {/* Betting controls */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          onClick={clearBet}
          variant="outline"
          className="border-gold text-gold hover:bg-gold hover:text-casino-felt"
          disabled={selectedBet === 0}
        >
          Clear
        </Button>
        
        <Button
          onClick={allIn}
          variant="outline"
          className="border-chip-red text-chip-red hover:bg-chip-red hover:text-white"
          disabled={playerMoney === 0}
        >
          All In
        </Button>
        
        <Button
          onClick={placeBet}
          className="bg-gradient-to-r from-gold-dark to-gold hover:from-gold to-gold-light text-casino-felt font-bold px-8"
          disabled={selectedBet === 0}
        >
          Deal
        </Button>
      </div>
    </div>
  );
};