import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ScanData {
  file?: File;
  url?: string;
  scanType?: 'deep' | 'quick' | 'custom';
  results?: CheckpointResult[];
  score?: number;
  verdict?: 'safe' | 'unsafe';
  officialUrl?: string;
}

interface CheckpointResult {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'pending';
}

interface ScanState {
  data: ScanData;
  isScanning: boolean;
  currentStep: number;
}

type ScanAction =
  | { type: 'SET_FILE'; payload: File }
  | { type: 'SET_URL'; payload: string }
  | { type: 'SET_SCAN_TYPE'; payload: 'deep' | 'quick' | 'custom' }
  | { type: 'START_SCAN' }
  | { type: 'UPDATE_RESULTS'; payload: CheckpointResult[] }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'SET_VERDICT'; payload: { verdict: 'safe' | 'unsafe'; officialUrl?: string } }
  | { type: 'COMPLETE_SCAN' }
  | { type: 'RESET' };

const initialState: ScanState = {
  data: {},
  isScanning: false,
  currentStep: 1,
};

function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, data: { ...state.data, file: action.payload, url: undefined } };
    case 'SET_URL':
      return { ...state, data: { ...state.data, url: action.payload, file: undefined } };
    case 'SET_SCAN_TYPE':
      return { ...state, data: { ...state.data, scanType: action.payload } };
    case 'START_SCAN':
      return { ...state, isScanning: true, currentStep: 2 };
    case 'UPDATE_RESULTS':
      return { ...state, data: { ...state.data, results: action.payload } };
    case 'SET_SCORE':
      return { ...state, data: { ...state.data, score: action.payload } };
    case 'SET_VERDICT':
      return { 
        ...state, 
        data: { 
          ...state.data, 
          verdict: action.payload.verdict,
          officialUrl: action.payload.officialUrl 
        } 
      };
    case 'COMPLETE_SCAN':
      return { ...state, isScanning: false, currentStep: 4 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ScanContext = createContext<{
  state: ScanState;
  dispatch: React.Dispatch<ScanAction>;
} | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, initialState);

  return (
    <ScanContext.Provider value={{ state, dispatch }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}