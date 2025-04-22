import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveScreens, loadScreens } from '../services/storage/screens';

export interface Button {
  label: string;
  span: number;
  // width: number; // Removed as it's not used and span dictates width percentage
  url: string;
  height?: number;
}

export interface Screen {
  id: string;
  title: string;
  ui: Button[];
}

interface ScreensState {
  screens: Screen[];
  currentScreenIndex: number;
}

type ScreensAction =
  | { type: 'ADD_SCREEN'; screen: Screen }
  | { type: 'REMOVE_SCREEN'; id: string }
  | { type: 'SET_CURRENT_SCREEN'; index: number }
  | { type: 'SET_SCREENS'; screens: Screen[] };

const initialState: ScreensState = {
  screens: [],
  currentScreenIndex: 0
};

const ScreensContext = createContext<{
  state: ScreensState;
  dispatch: React.Dispatch<ScreensAction>;
} | undefined>(undefined);

function screensReducer(state: ScreensState, action: ScreensAction): ScreensState {
  switch (action.type) {
    case 'ADD_SCREEN':
      return {
        ...state,
        screens: [...state.screens, action.screen]
      };
    case 'REMOVE_SCREEN':
      const newScreens = state.screens.filter(screen => screen.id !== action.id);
      const newIndex = Math.min(state.currentScreenIndex, Math.max(0, newScreens.length - 1));
      return {
        ...state,
        screens: newScreens, // Use the filtered list
        currentScreenIndex: newIndex
      };
    case 'SET_CURRENT_SCREEN':
      return {
        ...state,
        currentScreenIndex: action.index
      };
    case 'SET_SCREENS':
      return {
        ...state,
        screens: action.screens,
        // Reset index if current index is out of bounds after loading
        currentScreenIndex: Math.min(state.currentScreenIndex, Math.max(0, action.screens.length - 1))
      };
    default:
      return state;
  }
}

export function ScreensProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(screensReducer, initialState);

  // Load screens on mount
  useEffect(() => {
    loadScreens().then(screens => {
      if (screens && screens.length > 0) {
          dispatch({ type: 'SET_SCREENS', screens });
      }
    });
  }, []);

  // Save screens when they change
  useEffect(() => {
    saveScreens(state.screens);
  }, [state.screens]);
  return (
    <ScreensContext.Provider value={{ state, dispatch }}>
      {children}
    </ScreensContext.Provider>
  );
}

export function useScreens() {
  const context = useContext(ScreensContext);
  if (context === undefined) {
    throw new Error('useScreens must be used within a ScreensProvider');
  }
  return context;
}
