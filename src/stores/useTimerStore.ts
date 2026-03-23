import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/idb-storage';

interface TimerState {
  // Persisted state
  startTime: number | null;
  currentBookId: string | null;
  currentBookTitle: string | null;
  presetDuration: number | null; // Preset duration in seconds (e.g., 30 * 60 for 30 mins)
  mode: 'countdown' | 'manual'; // Timer mode

  // Runtime-only state (NOT persisted)
  isRunning: boolean;
  _hasHydrated: boolean;

  // Actions
  start: (bookId: string, bookTitle: string, presetMinutes?: number) => void;
  stop: () => void;
  reset: () => void;

  // Computed
  getElapsedSeconds: () => number;
  getRemainingSeconds: () => number; // Countdown mode: remaining time
  isActive: () => boolean;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      startTime: null,
      currentBookId: null,
      currentBookTitle: null,
      presetDuration: null,
      mode: 'manual',
      isRunning: false,
      _hasHydrated: false,

      start: (bookId: string, bookTitle: string, presetMinutes?: number) =>
        set({
          isRunning: true,
          startTime: Date.now(),
          currentBookId: bookId,
          currentBookTitle: bookTitle,
          presetDuration: presetMinutes ? presetMinutes * 60 : null,
          mode: presetMinutes ? 'countdown' : 'manual',
        }),

      stop: () => set({ isRunning: false }),

      reset: () =>
        set({
          isRunning: false,
          startTime: null,
          currentBookId: null,
          currentBookTitle: null,
          presetDuration: null,
          mode: 'manual',
        }),

      getElapsedSeconds: () => {
        const { startTime } = get();
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },

      getRemainingSeconds: () => {
        const { mode, presetDuration, startTime } = get();
        if (mode !== 'countdown' || !presetDuration || !startTime) return 0;

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = presetDuration - elapsed;
        return Math.max(0, remaining); // Never return negative
      },

      isActive: () => {
        const { isRunning, currentBookId } = get();
        return isRunning && currentBookId !== null;
      },
    }),
    {
      name: 'timer-store',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        startTime: state.startTime,
        currentBookId: state.currentBookId,
        currentBookTitle: state.currentBookTitle,
        presetDuration: state.presetDuration,
        mode: state.mode,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state?.startTime) {
            useTimerStore.setState({ isRunning: true });
          }
          useTimerStore.setState({ _hasHydrated: true });
        };
      },
    }
  )
);
