import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { detectScript } from '@/lib/corpus/reader';

export default function ScriptAutoDetect() {
  const applyAutoScript = useReaderPreferences((s) => s.applyAutoScript);

  useEffect(() => {
    applyAutoScript(detectScript());
  }, [applyAutoScript]);

  return null;
}
