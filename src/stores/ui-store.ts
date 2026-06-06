import { create } from "zustand";
import { format } from "date-fns";

interface UIState {
  selectedDate: string; // "yyyy-MM-dd"
  setSelectedDate: (date: string) => void;

  foodFormOpen: boolean;
  setFoodFormOpen: (open: boolean) => void;

  workoutFormOpen: boolean;
  setWorkoutFormOpen: (open: boolean) => void;

  weightDialogOpen: boolean;
  setWeightDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  setSelectedDate: (date) => set({ selectedDate: date }),

  foodFormOpen: false,
  setFoodFormOpen: (open) => set({ foodFormOpen: open }),

  workoutFormOpen: false,
  setWorkoutFormOpen: (open) => set({ workoutFormOpen: open }),

  weightDialogOpen: false,
  setWeightDialogOpen: (open) => set({ weightDialogOpen: open }),
}));
