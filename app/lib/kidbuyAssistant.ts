// app/lib/kidbuyAssistant.ts

export type AssistantMessage = {
  text: string;
  emoji: string;
};

// (Alias) manche Komponenten benutzen den Namen AssistantPayload
export type AssistantPayload = AssistantMessage;

const POSITIVE_EMOJIS = ["😊", "😄", "✨", "🔥", "🥳", "💛", "✅", "🙂"];

function pickEmoji() {
  return POSITIVE_EMOJIS[Math.floor(Math.random() * POSITIVE_EMOJIS.length)];
}

const EVENT_NAME = "kidbuy_assistant_message";

/** ✅ sendet eine Message (Overlay/Banner hören darauf) */
export function emitAssistantMessage(message: AssistantMessage) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: message }));
}

/** ✅ Listener-Helper (damit KidBuyAssistantBanner sauber abonnieren kann) */
export function onAssistantMessage(cb: (msg: AssistantMessage) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const ce = e as CustomEvent<AssistantMessage>;
    if (ce?.detail) cb(ce.detail);
  };

  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
}

/** ✅ Message in der Mitte (Startseite) */
export function getStartCenterMessage(): AssistantMessage {
  return {
    text: "Hi, schön dass du da bist 😊 Was möchtest du heute machen?",
    emoji: pickEmoji(),
  };
}

/** ✅ Message in der Mitte (Warenkorb/Kauf) */
export function getCartCenterMessage(): AssistantMessage {
  return {
    text: "Wow – echt gute Wahl! 😊",
    emoji: pickEmoji(),
  };
}

/** ✅ Alias (falls irgendwo so importiert) */
export function getPurchaseMessage(): AssistantMessage {
  return getCartCenterMessage();
}

/** ✅ Message über der Suchleiste */
export function getSearchHint(query: string): AssistantMessage {
  const q = (query || "").trim();
  if (!q) return { text: "Such dir was Cooles aus! 😊", emoji: pickEmoji() };

  return {
    text: `Nice! "${q}" klingt nach einer guten Idee 😊`,
    emoji: pickEmoji(),
  };
}

/** ✅ Alias (falls irgendwo so importiert) */
export function getSearchMessage(query: string): AssistantMessage {
  return getSearchHint(query);
}