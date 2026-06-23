'use client';

import * as React from 'react';

import { detectScript } from '@/lib/corpus/detect-script';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';

export function ScriptAutoDetect() {
  const applyAutoScript = useReaderPreferences((s) => s.applyAutoScript);

  React.useEffect(() => {
    applyAutoScript(detectScript());
  }, [applyAutoScript]);

  return null;
}
