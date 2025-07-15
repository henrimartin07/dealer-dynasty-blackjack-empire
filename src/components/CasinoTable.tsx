import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlayingCard, Card } from './PlayingCard';
import { ChipBetting } from './ChipBetting';
import { VisualDeck } from './VisualDeck';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  money: number;
  cards: Card[];
  bet: number;
  isActive: boolean;
  hasBust: boolean;
  hasStood: boolean;
}

interface GameState {
  dealerCards: Card[];
  players: Player[];
  currentPlayerIndex: number;
  gamePhase: 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'game-over';
  deck: Card[];
  dealerMessage: string;
}

const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      let value = parseInt(rank);
      if (rank === 'A') value = 11;
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      
      deck.push({ suit, rank, value, hidden: false });
    }
  }
  
  return deck.sort(() => Math.random() - 0.5);
};

const calculateHandValue = (cards: Card[]): { value: number; soft: boolean } => {
  let value = 0;
  let aces = 0;
  
  for (const card of cards.filter(c => !c.hidden)) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return { value, soft: aces > 0 };
};

interface CasinoTableProps {
  tableId: string;
  onLeaveTable: () => void;
}

export const CasinoTable = ({ tableId, onLeaveTable }: CasinoTableProps) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    dealerCards: [],
    players: [
      { id: 'player1', name: 'You', money: 1000, cards: [], bet: 0, isActive: true, hasBust: false, hasStood: false }
    ],
    currentPlayerIndex: 0,
    gamePhase: 'betting',
    deck: createDeck(),
    dealerMessage: "Welcome to Table " + tableId + "! Place your bets to start."
  });

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const playerHand = calculateHandValue(currentPlayer?.cards || []);
  const dealerHand = calculateHandValue(gameState.dealerCards);

  const placeBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === 'player1' 
          ? { ...player, bet: amount, money: player.money - amount }
          : player
      ),
      gamePhase: 'dealing',
      dealerMessage: "Dealing the cards..."
    }));

    setTimeout(() => dealInitialCards(), 1000);
  };

  const dealInitialCards = () => {
    const newDeck = [...gameState.deck];
    const updatedPlayers = gameState.players.map(player => {
      if (player.bet > 0) {
        return {
          ...player,
          cards: [newDeck.pop()!, newDeck.pop()!]
        };
      }
      return player;
    });

    const dealerHiddenCard = newDeck.pop()!;
    const dealerCards = [newDeck.pop()!, { ...dealerHiddenCard, hidden: true }];

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      players: updatedPlayers,
      dealerCards,
      gamePhase: 'playing',
      currentPlayerIndex: 0,
      dealerMessage: "Your turn! Hit or stand?"
    }));
  };

  const hit = () => {
    if (!currentPlayer) return;

    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newCards = [...currentPlayer.cards, newCard];
    const handValue = calculateHandValue(newCards);

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      players: prev.players.map(player =>
        player.id === currentPlayer.id
          ? { ...player, cards: newCards, hasBust: handValue.value > 21 }
          : player
      ),
      dealerMessage: handValue.value > 21 ? "Bust! You lose." : "Hit or stand?"
    }));

    if (handValue.value > 21) {
      setTimeout(() => nextPlayer(), 1500);
    }
  };

  const stand = () => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === currentPlayer.id
          ? { ...player, hasStood: true }
          : player
      )
    }));

    setTimeout(() => nextPlayer(), 500);
  };

  const nextPlayer = () => {
    const activePlayers = gameState.players.filter(p => p.bet > 0 && !p.hasBust && !p.hasStood);
    
    if (activePlayers.length === 0) {
      // All players done, dealer's turn
      setGameState(prev => ({
        ...prev,
        gamePhase: 'dealer-turn',
        dealerMessage: "Dealer must hit on 16 and stand on 17.",
        dealerCards: prev.dealerCards.map(c => ({ ...c, hidden: false }))
      }));
      
      setTimeout(() => playDealerHand(), 1000);
    } else {
      // Continue with other players (in this single-player version, just end turn)
      setGameState(prev => ({
        ...prev,
        gamePhase: 'dealer-turn',
        dealerMessage: "Your turn is over. Dealer's turn.",
        dealerCards: prev.dealerCards.map(c => ({ ...c, hidden: false }))
      }));
      
      setTimeout(() => playDealerHand(), 1000);
    }
  };

  const playDealerHand = () => {
    let newDeck = [...gameState.deck];
    let dealerCards = gameState.dealerCards.map(c => ({ ...c, hidden: false }));
    
    while (calculateHandValue(dealerCards).value < 17) {
      const newCard = newDeck.pop()!;
      dealerCards.push({ ...newCard, hidden: false });
    }

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      dealerCards,
      gamePhase: 'game-over'
    }));

    setTimeout(() => determineWinners(dealerCards), 1000);
  };

  const determineWinners = (finalDealerCards: Card[]) => {
    const dealerValue = calculateHandValue(finalDealerCards).value;
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => {
        if (player.bet === 0) return player;

        const playerValue = calculateHandValue(player.cards).value;
        let winnings = 0;
        let message = "";

        if (player.hasBust) {
          message = "Bust!";
        } else if (dealerValue > 21) {
          winnings = player.bet * 2;
          message = "Dealer busts! You win!";
        } else if (playerValue > dealerValue) {
          winnings = player.bet * 2;
          message = "You win!";
        } else if (playerValue === dealerValue) {
          winnings = player.bet;
          message = "Push!";
        } else {
          message = "Dealer wins.";
        }

        return {
          ...player,
          money: player.money + winnings
        };
      }),
      dealerMessage: dealerValue > 21 ? "Dealer busts!" : `Dealer has ${dealerValue}.`
    }));
  };

  const newGame = () => {
    setGameState(prev => ({
      ...prev,
      dealerCards: [],
      players: prev.players.map(player => ({
        ...player,
        cards: [],
        bet: 0,
        hasBust: false,
        hasStood: false
      })),
      currentPlayerIndex: 0,
      gamePhase: 'betting',
      deck: createDeck(),
      dealerMessage: "New game! Place your bets."
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-felt to-casino-felt-light p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gold animate-gold-shimmer">
              Table {tableId}
            </h1>
            <div className="text-gold-light">Money: ${currentPlayer?.money || 0}</div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={onLeaveTable}
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-casino-felt"
            >
              Leave Table
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-casino-felt-light to-casino-felt rounded-2xl p-8 shadow-2xl border border-gold/20">
          
          {/* Deck */}
          <div className="absolute top-4 right-4">
            <VisualDeck cardCount={gameState.deck.length} />
          </div>

          {/* Dealer Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gold mb-2">Dealer</h2>
              <div className="text-gold-light">
                {gameState.dealerCards.length > 0 && (
                  <>Value: {dealerHand.value}{dealerHand.soft ? ' (soft)' : ''}</>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mb-4 min-h-[100px]">
              {gameState.dealerCards.map((card, index) => (
                <PlayingCard 
                  key={index} 
                  card={card} 
                  isDealing={gameState.gamePhase === 'dealing'}
                />
              ))}
            </div>
          </div>

          {/* Dealer Message */}
          <div className="text-center mb-8 p-4 bg-casino-felt rounded-lg border border-gold/30">
            <p className="text-gold-light text-lg italic">"{gameState.dealerMessage}"</p>
          </div>

          {/* Player Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gold mb-2">Your Hand</h2>
              <div className="text-gold-light">
                {currentPlayer?.cards.length > 0 && (
                  <>Value: {playerHand.value}{playerHand.soft ? ' (soft)' : ''}</>
                )}
              </div>
              {currentPlayer?.bet > 0 && (
                <div className="text-gold">Current Bet: ${currentPlayer.bet}</div>
              )}
            </div>
            
            <div className="flex justify-center gap-2 mb-4 min-h-[100px]">
              {currentPlayer?.cards.map((card, index) => (
                <PlayingCard 
                  key={index} 
                  card={card} 
                  isDealing={gameState.gamePhase === 'dealing'}
                />
              ))}
            </div>
          </div>

          {/* Betting Area */}
          {gameState.gamePhase === 'betting' && (
            <ChipBetting
              playerMoney={currentPlayer?.money || 0}
              onBet={placeBet}
            />
          )}

          {/* Game Controls */}
          {gameState.gamePhase === 'playing' && !currentPlayer?.hasBust && !currentPlayer?.hasStood && (
            <div className="text-center">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={hit}
                  className="bg-gradient-to-r from-gold-dark to-gold hover:from-gold to-gold-light text-casino-felt font-bold px-8 py-3"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  className="bg-gradient-to-r from-chip-red to-red-400 hover:from-red-400 to-red-300 text-white font-bold px-8 py-3"
                >
                  Stand
                </Button>
              </div>
            </div>
          )}

          {/* New Game */}
          {gameState.gamePhase === 'game-over' && (
            <div className="text-center">
              <Button
                onClick={newGame}
                className="bg-gradient-to-r from-gold-dark to-gold hover:from-gold to-gold-light text-casino-felt font-bold px-8 py-3"
                disabled={(currentPlayer?.money || 0) <= 0}
              >
                {(currentPlayer?.money || 0) <= 0 ? 'Game Over - No Money Left' : 'New Game'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};