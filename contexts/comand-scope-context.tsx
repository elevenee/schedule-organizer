"use client";

import React, { createContext, useContext, useRef } from "react";

/**
 * Setiap command yang mount akan register ke stack.
 * Yang paling terakhir register = priority tertinggi
 */
type CommandStackContextType = {
  register: (id: string) => void;
  unregister: (id: string) => void;
  isTop: (id: string) => boolean;
};

const CommandStackContext =
  createContext<CommandStackContextType | null>(null);

export function CommandStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const stack = useRef<string[]>([]);

  const register = (id: string) => {
    stack.current = stack.current.filter((x) => x !== id);
    stack.current.push(id);
  };

  const unregister = (id: string) => {
    stack.current = stack.current.filter((x) => x !== id);
  };

  const isTop = (id: string) => {
    const last = stack.current.at(-1);
    return last === id;
  };

  return (
    <CommandStackContext.Provider
      value={{ register, unregister, isTop }}
    >
      {children}
    </CommandStackContext.Provider>
  );
}

export function useCommandStack() {
  const ctx = useContext(CommandStackContext);
  if (!ctx) {
    throw new Error(
      "useCommandStack must be used inside CommandStackProvider"
    );
  }
  return ctx;
}
