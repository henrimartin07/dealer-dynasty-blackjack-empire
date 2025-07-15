import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CasinoTable } from './CasinoTable';
import { cn } from "@/lib/utils";

interface TableInfo {
  id: string;
  name: string;
  minBet: number;
  maxBet: number;
  players: number;
  maxPlayers: number;
  status: 'open' | 'playing' | 'full';
}

const mockTables: TableInfo[] = [
  {
    id: 'VIP-1',
    name: 'High Roller VIP',
    minBet: 100,
    maxBet: 5000,
    players: 2,
    maxPlayers: 6,
    status: 'playing'
  },
  {
    id: 'REG-1',
    name: 'Regular Table 1',
    minBet: 5,
    maxBet: 500,
    players: 1,
    maxPlayers: 6,
    status: 'open'
  },
  {
    id: 'REG-2',
    name: 'Regular Table 2',
    minBet: 5,
    maxBet: 500,
    players: 4,
    maxPlayers: 6,
    status: 'playing'
  },
  {
    id: 'BEG-1',
    name: 'Beginner Friendly',
    minBet: 1,
    maxBet: 100,
    players: 6,
    maxPlayers: 6,
    status: 'full'
  },
  {
    id: 'REG-3',
    name: 'Regular Table 3',
    minBet: 10,
    maxBet: 1000,
    players: 0,
    maxPlayers: 6,
    status: 'open'
  }
];

export const TableLobby = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  if (selectedTable) {
    return (
      <CasinoTable 
        tableId={selectedTable} 
        onLeaveTable={() => setSelectedTable(null)} 
      />
    );
  }

  const getStatusColor = (status: TableInfo['status']) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'playing': return 'text-yellow-400';
      case 'full': return 'text-red-400';
      default: return 'text-gold-light';
    }
  };

  const getStatusText = (status: TableInfo['status']) => {
    switch (status) {
      case 'open': return 'Open';
      case 'playing': return 'In Game';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-felt to-casino-felt-light p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 animate-gold-shimmer bg-gradient-to-r from-gold-dark via-gold to-gold-dark bg-[length:200%_auto] bg-clip-text text-transparent">
            Blackjack Tycoon Casino
          </h1>
          <p className="text-gold-light text-lg">Choose your table and start playing!</p>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTables.map((table) => (
            <Card 
              key={table.id}
              className={cn(
                "bg-gradient-to-br from-casino-felt-light to-casino-felt",
                "border border-gold/20 shadow-xl hover:shadow-2xl transition-all duration-300",
                "hover:scale-105 cursor-pointer"
              )}
              onClick={() => table.status !== 'full' && setSelectedTable(table.id)}
            >
              <div className="p-6">
                {/* Table Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gold mb-1">{table.name}</h3>
                    <div className="text-sm text-gold-light">Table {table.id}</div>
                  </div>
                  <div className={cn("text-sm font-semibold", getStatusColor(table.status))}>
                    {getStatusText(table.status)}
                  </div>
                </div>

                {/* Table Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gold-light">Min Bet:</span>
                    <span className="text-gold font-semibold">${table.minBet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gold-light">Max Bet:</span>
                    <span className="text-gold font-semibold">${table.maxBet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gold-light">Players:</span>
                    <span className="text-gold font-semibold">{table.players}/{table.maxPlayers}</span>
                  </div>
                </div>

                {/* Player indicator */}
                <div className="flex space-x-1 mb-6">
                  {Array.from({ length: table.maxPlayers }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full border",
                        i < table.players 
                          ? "bg-gold border-gold" 
                          : "bg-transparent border-gold/30"
                      )}
                    />
                  ))}
                </div>

                {/* Join Button */}
                <Button
                  className={cn(
                    "w-full font-bold py-3",
                    table.status === 'full'
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-gold-dark to-gold hover:from-gold to-gold-light text-casino-felt"
                  )}
                  disabled={table.status === 'full'}
                >
                  {table.status === 'full' ? 'Table Full' : 'Join Table'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="text-gold-light text-sm">
            Choose your table based on your bankroll and experience level
          </div>
        </div>
      </div>
    </div>
  );
};