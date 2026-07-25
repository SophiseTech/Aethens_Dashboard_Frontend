import { useCallback, useEffect, useState } from 'react';

function useFormDraft(storageKey) {
    const [draft, setDraft] = useState(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setDraft(JSON.parse(saved));
        } catch {
            setDraft(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveDraft = useCallback((values) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(values));
        } catch {
            // ignore storage errors (quota exceeded, private mode, etc.)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(storageKey);
        setDraft(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    return { draft, saveDraft, clearDraft };
}

export default useFormDraft;
