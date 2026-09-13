import { useCallback, useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = { transcript: string };

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorLike = { error?: string };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Browser voice recognition — used for the artisan "tell your story" flow.
 *
 * The transcript is the artisan's own words and feeds directly into listing
 * generation, so it has to survive real use: recognition runs continuously,
 * interim words are shown live and flushed as final when the mic stops, and
 * permission/device failures surface as an `error` the UI can explain instead
 * of failing silently.
 */
export function useSpeechRecognition(lang: string) {
  const supported =
    typeof window !== "undefined" && getSpeechRecognition() !== null;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const interimRef = useRef("");

  const append = useCallback((chunk: string) => {
    finalRef.current = `${finalRef.current} ${chunk}`
      .replace(/\s+/g, " ")
      .trim();
    setTranscript(finalRef.current);
  }, []);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("unsupported");
      return;
    }
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (event) => {
      let finished = "";
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finished += `${text} `;
        else pending += text;
      }
      if (finished.trim()) append(finished);
      interimRef.current = pending.trim();
      setInterim(interimRef.current);
    };
    rec.onerror = (event) => {
      const code = event?.error ?? "unknown";
      // Silence and manual stops are normal — anything else is worth telling
      // the artisan about so they can allow the mic or type instead.
      if (code === "no-speech" || code === "aborted") return;
      setError(code);
      setListening(false);
    };
    rec.onend = () => {
      // Flush unfinished words so nothing the artisan said is lost.
      if (interimRef.current) {
        append(interimRef.current);
        interimRef.current = "";
        setInterim("");
      }
      setListening(false);
    };
    recRef.current = rec;
    setError(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [append, lang]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    if (interimRef.current) {
      append(interimRef.current);
      interimRef.current = "";
      setInterim("");
    }
    setListening(false);
  }, [append]);

  const reset = useCallback(() => {
    finalRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    reset,
  };
}
