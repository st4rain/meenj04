"use client";

import { createContext, useContext, useState } from "react";

type UIVisibilityContextType = {
  hideUI: boolean;
  toggleHideUI: () => void;
};

const UIVisibilityContext = createContext<UIVisibilityContextType>({
  hideUI: false,
  toggleHideUI: () => {},
});

export const UIVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [hideUI, setHideUI] = useState(false);
  const toggleHideUI = () => setHideUI((v) => !v);

  return (
    <UIVisibilityContext.Provider value={{ hideUI, toggleHideUI }}>
      {children}
    </UIVisibilityContext.Provider>
  );
};

export const useUIVisibility = () => useContext(UIVisibilityContext);
