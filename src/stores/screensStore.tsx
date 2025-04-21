import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveScreens, loadScreens } from '../services/storage/screens';

export interface Button {
  label: string;
  span: number;
  width: number;
  url: string;
  height?: number; // Add this line
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
  | { type: 'SET_CURRENT_SCREEN'; index: number };

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
      return {
        ...state,
        screens: state.screens.filter(screen => screen.id !== action.id),
        currentScreenIndex: Math.max(0, state.currentScreenIndex - 1)
      };
    case 'SET_CURRENT_SCREEN':
      return {
        ...state,
        currentScreenIndex: action.index
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
      screens.forEach(screen => {
        dispatch({ type: 'ADD_SCREEN', screen });
      });
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
