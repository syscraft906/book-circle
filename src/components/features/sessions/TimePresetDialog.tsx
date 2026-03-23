'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimePresetDialogProps {
  open: boolean;
  onSelectPreset: (minutes: number) => void;
  onCancel: () => void;
}

const PRESETS = [
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
] as const;

export function TimePresetDialog({ open, onSelectPreset, onCancel }: TimePresetDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Choose Reading Time
          </DialogTitle>
          <DialogDescription>
            Set your reading goal for this session
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {PRESETS.map(({ minutes, label }) => (
            <Button
              key={minutes}
              variant="outline"
              size="lg"
              onClick={() => onSelectPreset(minutes)}
              className="min-h-[44px] min-w-[44px] text-lg font-medium hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
              data-testid={`preset-${minutes}`}
            >
              {label}
            </Button>
          ))}

          <Button
            variant="ghost"
            onClick={onCancel}
            className="min-h-[44px] min-w-[44px] mt-2"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
