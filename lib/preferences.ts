import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ExtensionFilter = "all" | "active" | "inactive";
export type ColorTheme = "light" | "dark";

type PreferencesState = {
  filter: ExtensionFilter;
  theme: ColorTheme;
  setFilter: (filter: ExtensionFilter) => void;
  toggleTheme: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      filter: "all",
      theme: "light",
      setFilter: (filter) => set({ filter }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "extensions-manager-preferences",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ filter: state.filter, theme: state.theme }),
    },
  ),
);
