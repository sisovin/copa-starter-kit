"use client";

import { OpenAIRequestType } from "@/lib/openai-schema";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface OpenAISettings {
  model: string;
  temperature: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens?: number;
}

interface OpenAIContextType {
  settings: OpenAISettings;
  updateSettings: (newSettings: Partial<OpenAISettings>) => void;
  resetSettings: () => void;
  isConfigured: boolean;
}

const defaultSettings: OpenAISettings = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

const OpenAIContext = createContext<OpenAIContextType | undefined>(undefined);

export function OpenAIProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<OpenAISettings>(defaultSettings);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Check if the API is configured on mount
  React.useEffect(() => {
    // Simple ping to check if the API is configured
    fetch("/api/openai/config", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(!!data.configured);
        if (data.defaults) {
          setSettings((prev) => ({
            ...prev,
            model: data.defaults.model || prev.model,
            // Add other defaults if provided by the API
          }));
        }
      })
      .catch(() => {
        setIsConfigured(false);
      });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<OpenAISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return (
    <OpenAIContext.Provider
      value={{ settings, updateSettings, resetSettings, isConfigured }}
    >
      {children}
    </OpenAIContext.Provider>
  );
}

export function useOpenAISettings() {
  const context = useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error("useOpenAISettings must be used within an OpenAIProvider");
  }
  return context;
}

// Helper to create request payload with current settings
export function useCreateOpenAIPayload() {
  const { settings } = useOpenAISettings();

  return useCallback(
    (
      messages: OpenAIRequestType["messages"],
      overrides: Partial<OpenAIRequestType> = {}
    ) => {
      const payload: OpenAIRequestType = {
        messages,
        model: overrides.model || settings.model,
        temperature: overrides.temperature ?? settings.temperature,
        presencePenalty: overrides.presencePenalty ?? settings.presencePenalty,
        frequencyPenalty:
          overrides.frequencyPenalty ?? settings.frequencyPenalty,
        maxTokens: overrides.maxTokens ?? settings.maxTokens,
        stream: overrides.stream ?? true,
      };
      return payload;
    },
    [settings]
  );
}
