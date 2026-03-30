import { createContext } from 'react';

import type { ContextValue } from './types';

export default createContext<ContextValue | null>(null);
