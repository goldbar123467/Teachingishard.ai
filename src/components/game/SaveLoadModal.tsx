'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  getSavesList,
  saveGame,
  loadGame,
  deleteSave,
  exportSave,
  importSave,
  getStorageInfo,
  type SaveMetadata,
} from '@/lib/game/persistence';
import type { GameState } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface SaveLoadModalProps {
  currentState: GameState;
  onLoad: (state: GameState) => void;
  onSave?: () => void;
  trigger?: React.ReactNode;
}

export function SaveLoadModal({
  currentState,
  onLoad,
  onSave,
  trigger,
}: SaveLoadModalProps) {
  const [open, setOpen] = useState(false);
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
  const [saveName, setSaveName] = useState('');
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: true });
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      refreshSaves();
    }
  }, [open]);

  const refreshSaves = () => {
    setSaves(getSavesList());
    setStorageInfo(getStorageInfo());
    setError(null);
    setSuccess(null);
  };

  const handleSave = () => {
    const result = saveGame(currentState, saveName || undefined);
    if (result) {
      setSuccess('Game saved successfully!');
      setSaveName('');
      refreshSaves();
      onSave?.();
      setTimeout(() => setSuccess(null), 2000);
    } else {
      setError('Failed to save game');
    }
  };

  const handleLoad = (saveId: string) => {
    const state = loadGame(saveId);
    if (state) {
      onLoad(state);
      setOpen(false);
    } else {
      setError('Failed to load save');
    }
  };

  const handleDelete = (saveId: string) => {
    if (deleteSave(saveId)) {
      refreshSaves();
      setSuccess('Save deleted');
      setTimeout(() => setSuccess(null), 2000);
    } else {
      setError('Failed to delete save');
    }
  };

  const handleExport = (saveId: string) => {
    const json = exportSave(saveId);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classroom-sim-save-${saveId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    try {
      const state = importSave(importText);
      if (state) {
        setSuccess('Save imported successfully!');
        setImportText('');
        setShowImport(false);
        refreshSaves();
      } else {
        setError('Invalid save data');
      }
    } catch {
      setError('Failed to parse save file');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Save/Load</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save & Load Game</DialogTitle>
          <DialogDescription>
            Manage your saved games. Storage used: {formatBytes(storageInfo.used)}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'save' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('save')}
          >
            Save Game
          </Button>
          <Button
            variant={activeTab === 'load' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('load')}
          >
            Load Game
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            {success}
          </div>
        )}

        {/* Save Tab */}
        {activeTab === 'save' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Save Name (optional)</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`Week ${currentState.turn.week} - ${currentState.turn.dayOfWeek}`}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Current: Week {currentState.turn.week}, {currentState.turn.dayOfWeek} ({currentState.turn.phase})
              <br />
              Class Average: {currentState.classAverage}%
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Game
            </Button>
          </div>
        )}

        {/* Load Tab */}
        {activeTab === 'load' && (
          <div className="space-y-3">
            {saves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved games found
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {saves.map((save) => (
                  <Card
                    key={save.id}
                    className={cn(
                      'cursor-pointer hover:bg-accent transition-colors',
                      save.id === currentState.saveId && 'border-primary'
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {save.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Week {save.week} • {save.day} • Avg: {save.classAverage}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(save.lastSavedAt)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {save.id === currentState.saveId && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleLoad(save.id)}
                          className="flex-1"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(save.id)}
                        >
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(save.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Import Section */}
            <div className="border-t pt-3">
              {!showImport ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImport(true)}
                  className="w-full"
                >
                  Import from File
                </Button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste exported save JSON here..."
                    className="w-full h-24 px-3 py-2 text-xs border rounded-md bg-background font-mono"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleImport} className="flex-1">
                      Import
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowImport(false);
                        setImportText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
