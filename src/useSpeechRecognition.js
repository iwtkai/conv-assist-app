import { useCallback, useEffect, useRef, useState } from "react";

const MIN_STOPPING_MS = 400;

export function useSpeechRecognition({ lang, langCode, autoAnalyze, onAutoAnalyze }) {
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const langRef = useRef(lang);
  const stopRequestedAtRef = useRef(0);
  const stopTimeoutRef = useRef(null);

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.lang = langCode;
    rec.continuous = true;
    rec.interimResults = true;

    const scheduleAnalyze = (text) => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        onAutoAnalyze(text, langRef.current);
      }, 2000);
    };

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) {
        setInput(prev => {
          const updated = (prev + " " + finalText).trim();
          if (autoAnalyze) scheduleAnalyze(updated);
          return updated;
        });
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== "no-speech") setError("マイクエラー: " + e.error);
      stopRequestedAtRef.current = 0;
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      setListening(false);
      setStopping(false);
    };
    rec.onend = () => {
      const requestedAt = stopRequestedAtRef.current;
      stopRequestedAtRef.current = 0;
      const elapsed = requestedAt ? performance.now() - requestedAt : Infinity;
      const remaining = MIN_STOPPING_MS - elapsed;
      if (remaining > 0) {
        stopTimeoutRef.current = setTimeout(() => { setListening(false); setStopping(false); }, remaining);
      } else {
        setListening(false);
        setStopping(false);
      }
    };
    recognitionRef.current = rec;

    return () => {
      rec.stop();
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [langCode, autoAnalyze, onAutoAnalyze]);

  // 録音を止めて「停止処理中」を最低MIN_STOPPING_MS表示する。言語切替・自動解析トグルなど、
  // 録音中に設定を変えてrecを再生成させる操作は必ずこれを経由すること。
  const stopForReconfigure = useCallback(() => {
    if (!listening) return;
    stopRequestedAtRef.current = performance.now();
    setStopping(true);
    recognitionRef.current?.stop();
    setInterim("");
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  }, [listening]);

  const toggleListen = useCallback((onStart) => {
    const rec = recognitionRef.current;
    if (!rec || stopping) return;
    if (listening) {
      stopForReconfigure();
    } else {
      onStart?.();
      setInput("");
      setInterim("");
      setError(null);
      rec.start();
      setListening(true);
    }
  }, [stopping, listening, stopForReconfigure]);

  const resetInput = useCallback(() => {
    setInput("");
    setError(null);
  }, []);

  return {
    input, setInput,
    interim, listening, stopping, supported, error, setError,
    toggleListen, stopForReconfigure, resetInput,
  };
}
