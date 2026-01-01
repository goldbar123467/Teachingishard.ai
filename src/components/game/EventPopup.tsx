'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { GameEvent, EventChoice } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface EventPopupProps {
  event: GameEvent | null;
  onResolve: (eventId: string, choiceId: string) => void;
  onDismiss?: () => void;
}

export function EventPopup({ event, onResolve, onDismiss }: EventPopupProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Reset state when event changes
  useEffect(() => {
    setSelectedChoice(null);
    setIsResolving(false);
  }, [event?.id]);

  const handleResolve = () => {
    if (!event || !selectedChoice) return;
    setIsResolving(true);
    // Small delay for animation
    setTimeout(() => {
      onResolve(event.id, selectedChoice);
    }, 300);
  };

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'random':
        return '🎲';
      case 'scheduled':
        return '📅';
      case 'student-triggered':
        return '👋';
      default:
        return '❗';
    }
  };

  const getEffectPreview = (choice: EventChoice) => {
    const effects: string[] = [];
    for (const effect of choice.effects) {
      const sign = effect.modifier > 0 ? '+' : '';
      const target = effect.target === 'student' ? '👤' : effect.target === 'class' ? '👥' : '🧑‍🏫';
      effects.push(`${target} ${effect.attribute} ${sign}${effect.modifier}`);
    }
    return effects;
  };

  if (!event) return null;

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onDismiss?.()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEventIcon(event.type)}</span>
            <Badge
              variant="outline"
              className={cn(
                'capitalize',
                event.type === 'random' && 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
                event.type === 'student-triggered' && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                event.type === 'scheduled' && 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
              )}
            >
              {event.type.replace('-', ' ')}
            </Badge>
          </div>
          <SheetTitle className="text-xl">{event.title}</SheetTitle>
          <SheetDescription className="text-base">
            {event.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 py-4">
          <div className="text-sm font-medium text-muted-foreground">
            How do you respond?
          </div>

          {event.choices.map((choice) => (
            <Card
              key={choice.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                selectedChoice === choice.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/50 hover:bg-accent/50'
              )}
              onClick={() => setSelectedChoice(choice.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
                      selectedChoice === choice.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {selectedChoice === choice.id && (
                      <svg
                        className="w-full h-full text-primary-foreground p-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{choice.label}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getEffectPreview(choice).map((effect, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleResolve}
            disabled={!selectedChoice || isResolving}
            className="flex-1"
          >
            {isResolving ? 'Resolving...' : 'Confirm Choice'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Compact notification for events in the corner
interface EventNotificationProps {
  event: GameEvent;
  onClick: () => void;
}

export function EventNotification({ event, onClick }: EventNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-50 transition-all duration-300 transform',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-amber-500 max-w-xs animate-pulse-subtle"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">❗</span>
            <div>
              <div className="font-medium text-sm">{event.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Click to respond
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
