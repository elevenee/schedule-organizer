import { create } from "zustand";

interface ModalData {
  isOpen: boolean;
  data?: any;
}

interface ModalState {
  modals: Record<string, ModalData>;
  open: (name: string, data?: any) => void;
  close: (name: string) => void;
  isOpen: (name: string) => boolean;
  getData: (name: string) => any;
}

export const useModalManager = create<ModalState>((set, get) => ({
  modals: {},

  open: (name, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [name]: { isOpen: true, data },
      },
    })),

  close: (name) =>
    set((state) => {
      if (!state.modals[name]) return state;
      return {
        modals: {
          ...state.modals,
          [name]: { isOpen: false, data: undefined },
        },
      };
    }),

  isOpen: (name) => !!get().modals[name]?.isOpen,
  getData: (name) => get().modals[name]?.data,
}));
