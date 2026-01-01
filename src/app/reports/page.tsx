'use client';

import { MainLayout } from '@/components/layout';
import { ReportsPanel } from '@/components/panels';
import { SaveLoadModal } from '@/components/game/SaveLoadModal';
import { useGame } from '@/hooks/useGame';
import { useState } from 'react';
import type { GameState } from '@/lib/game/types';

export default function ReportsPage() {
  const { state, loadGame } = useGame();
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleLoadGame = (loadedState: GameState) => {
    loadGame(loadedState);
  };

  return (
    <MainLayout onSaveClick={() => setShowSaveModal(true)}>
      <SaveLoadModal
        currentState={state}
        onLoad={handleLoadGame}
        trigger={<span />}
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
      />
      <div className="container mx-auto px-4 py-6 lg:px-6">
        <ReportsPanel />
      </div>
    </MainLayout>
  );
}
