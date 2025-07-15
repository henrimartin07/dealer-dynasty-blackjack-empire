import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlayingCard, Card } from './PlayingCard';
import { ChipStack } from './ChipStack';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GameState {
  dealerCards: Card[];
  playerCards: Card[];
  currentBet: number;
  playerMoney: number;
  gamePhase: 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'game-over';
  gameResult: 'win' | 'lose' | 'push' | 'blackjack' | null;
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

const dealerMessages = {
  welcome: "Welcome to my table! Place your bet to start.",
  dealing: "Dealing the cards...",
  playerTurn: "Your move. Hit or stand?",
  dealerTurn: "Dealer must hit on 16 and stand on 17.",
  playerWin: "Well played! You win this hand.",
  playerLose: "House wins. Better luck next time!",
  push: "It's a push. Your bet is returned.",
  blackjack: "Blackjack! Outstanding play!",
  bust: "Bust! The house always wins.",
  dealerBust: "Dealer busts! You win this round."
};

export const BlackjackGame = () => {
  const { toast } = useToast();
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    dealerCards: [],
    playerCards: [],
    currentBet: 0,
    playerMoney: 1000,
    gamePhase: 'betting',
    gameResult: null,
    dealerMessage: dealerMessages.welcome
  });

  const chipValues = [5, 10, 25, 50, 100];

  useEffect(() => {
    setDeck(createDeck());
  }, []);

  const placeBet = (amount: number) => {
    if (amount > gameState.playerMoney) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough money for this bet.",
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentBet: amount,
      playerMoney: prev.playerMoney - amount,
      gamePhase: 'dealing',
      dealerMessage: dealerMessages.dealing
    }));

    // Start dealing after a short delay
    setTimeout(() => dealInitialCards(), 1000);
  };

  const dealInitialCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop()!, newDeck.pop()!];
    const dealerHiddenCard = newDeck.pop()!;
    const dealerCards = [newDeck.pop()!, { ...dealerHiddenCard, hidden: true }];
    
    setDeck(newDeck);
    setGameState(prev => ({
      ...prev,
      playerCards,
      dealerCards,
      gamePhase: 'playing',
      dealerMessage: dealerMessages.playerTurn
    }));

    // Check for blackjack
    const playerValue = calculateHandValue(playerCards).value;
    if (playerValue === 21) {
      setTimeout(() => checkForBlackjack(playerCards, dealerCards), 500);
    }
  };

  const checkForBlackjack = (playerCards: Card[], dealerCards: Card[]) => {
    const dealerValue = calculateHandValue(dealerCards.map(c => ({ ...c, hidden: false }))).value;
    
    if (dealerValue === 21) {
      // Push
      endGame('push', dealerMessages.push, dealerCards.map(c => ({ ...c, hidden: false })));
    } else {
      // Player blackjack wins
      endGame('blackjack', dealerMessages.blackjack, dealerCards.map(c => ({ ...c, hidden: false })));
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newPlayerCards = [...gameState.playerCards, newCard];
    
    setDeck(newDeck);
    
    const { value } = calculateHandValue(newPlayerCards);
    
    if (value > 21) {
      setGameState(prev => ({
        ...prev,
        playerCards: newPlayerCards,
        gamePhase: 'game-over',
        gameResult: 'lose',
        dealerMessage: dealerMessages.bust,
        dealerCards: prev.dealerCards.map(c => ({ ...c, hidden: false }))
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        playerCards: newPlayerCards
      }));
    }
  };

  const stand = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'dealer-turn',
      dealerMessage: dealerMessages.dealerTurn,
      dealerCards: prev.dealerCards.map(c => ({ ...c, hidden: false }))
    }));
    
    setTimeout(() => playDealerHand(), 1000);
  };

  const playDealerHand = () => {
    let newDeck = [...deck];
    let dealerCards = gameState.dealerCards.map(c => ({ ...c, hidden: false }));
    
    while (calculateHandValue(dealerCards).value < 17) {
      const newCard = newDeck.pop()!;
      dealerCards.push({ ...newCard, hidden: false });
    }
    
    setDeck(newDeck);
    
    const dealerValue = calculateHandValue(dealerCards).value;
    const playerValue = calculateHandValue(gameState.playerCards).value;
    
    let result: GameState['gameResult'];
    let message: string;
    
    if (dealerValue > 21) {
      result = 'win';
      message = dealerMessages.dealerBust;
    } else if (dealerValue > playerValue) {
      result = 'lose';
      message = dealerMessages.playerLose;
    } else if (playerValue > dealerValue) {
      result = 'win';
      message = dealerMessages.playerWin;
    } else {
      result = 'push';
      message = dealerMessages.push;
    }
    
    endGame(result, message, dealerCards);
  };

  const endGame = (result: GameState['gameResult'], message: string, finalDealerCards: Card[]) => {
    let winnings = 0;
    
    if (result === 'win') {
      winnings = gameState.currentBet * 2;
    } else if (result === 'blackjack') {
      winnings = gameState.currentBet * 2.5;
    } else if (result === 'push') {
      winnings = gameState.currentBet;
    }
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'game-over',
      gameResult: result,
      dealerMessage: message,
      dealerCards: finalDealerCards,
      playerMoney: prev.playerMoney + winnings
    }));
  };

  const newGame = () => {
    setDeck(createDeck());
    setGameState(prev => ({
      ...prev,
      dealerCards: [],
      playerCards: [],
      currentBet: 0,
      gamePhase: 'betting',
      gameResult: null,
      dealerMessage: dealerMessages.welcome
    }));
  };

  const playerHandValue = calculateHandValue(gameState.playerCards);
  const dealerHandValue = calculateHandValue(gameState.dealerCards);

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-felt to-casino-felt-light p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 animate-gold-shimmer bg-gradient-to-r from-gold-dark via-gold to-gold-dark bg-[length:200%_auto] bg-clip-text text-transparent">
            Blackjack Tycoon
          </h1>
          <div className="text-gold-light text-lg">Money: ${gameState.playerMoney}</div>
        </div>

        {/* Game Table */}
        <div className="bg-gradient-to-br from-casino-felt-light to-casino-felt rounded-2xl p-8 shadow-2xl border border-gold/20">
          
          {/* Dealer Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gold mb-2">Dealer</h2>
              <div className="text-gold-light">
                {gameState.dealerCards.length > 0 && (
                  <>Value: {dealerHandValue.value}{dealerHandValue.soft ? ' (soft)' : ''}</>
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
                {gameState.playerCards.length > 0 && (
                  <>Value: {playerHandValue.value}{playerHandValue.soft ? ' (soft)' : ''}</>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mb-4 min-h-[100px]">
              {gameState.playerCards.map((card, index) => (
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
            <div className="text-center">
              <h3 className="text-lg text-gold mb-4">Place Your Bet</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {chipValues.map(value => (
                  <ChipStack
                    key={value}
                    amount={value}
                    onClick={() => placeBet(value)}
                    className={gameState.playerMoney < value ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Game Controls */}
          {gameState.gamePhase === 'playing' && (
            <div className="text-center">
              <div className="text-gold mb-4">Current Bet: ${gameState.currentBet}</div>
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
              <div className={cn(
                "text-2xl font-bold mb-4",
                gameState.gameResult === 'win' || gameState.gameResult === 'blackjack' ? 'text-green-400' : 
                gameState.gameResult === 'push' ? 'text-yellow-400' : 'text-red-400'
              )}>
                {gameState.gameResult === 'win' && 'You Win!'}
                {gameState.gameResult === 'lose' && 'You Lose!'}
                {gameState.gameResult === 'push' && 'Push!'}
                {gameState.gameResult === 'blackjack' && 'Blackjack!'}
              </div>
              
              <Button
                onClick={newGame}
                className="bg-gradient-to-r from-gold-dark to-gold hover:from-gold to-gold-light text-casino-felt font-bold px-8 py-3"
                disabled={gameState.playerMoney <= 0}
              >
                {gameState.playerMoney <= 0 ? 'Game Over - No Money Left' : 'New Game'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};