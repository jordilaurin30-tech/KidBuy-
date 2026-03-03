"use client";

import React, { useEffect } from "react";
import { emitAssistantMessage } from "../lib/kidbuyAssistant";
import { getDailyLogin } from "../lib/kidbuyDailySession";

export default function DailyWelcomeAssistant() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const greetedKey = "kidbuy_greeted_session";
    if (window.sessionStorage.getItem(greetedKey) === "1") return;

    const login = getDailyLogin();
    if (!login?.name) return;

    window.sessionStorage.setItem(greetedKey, "1");

    window.setTimeout(() => {
      emitAssistantMessage({
        text: `Hey ${login.name} 😊 Wie geht’s dir heute?`,
        emoji: "😄",
      });
    }, 350);
  }, []);

  return null;
}