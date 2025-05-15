"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useOpenAISettings } from "@/contexts/openai-provider";

interface OpenAISettingsProps {
  onClose?: () => void;
  compact?: boolean;
}

export function OpenAISettingsPanel({
  onClose,
  compact = false,
}: OpenAISettingsProps) {
  const { settings, updateSettings, resetSettings } = useOpenAISettings();

  const models = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ];

  return (
    <Card className={compact ? "w-full" : "w-full max-w-md"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">AI Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select
            value={settings.model}
            onValueChange={(value) => updateSettings({ model: value })}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="temperature">
              Temperature: {settings.temperature.toFixed(1)}
            </Label>
          </div>
          <Slider
            id="temperature"
            value={[settings.temperature]}
            min={0}
            max={2}
            step={0.1}
            onValueChange={(values) =>
              updateSettings({ temperature: values[0] })
            }
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Controls randomness: Lower values are more focused and
            deterministic, higher values are more creative.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="presence-penalty">
                Presence Penalty: {settings.presencePenalty.toFixed(1)}
              </Label>
            </div>
            <Slider
              id="presence-penalty"
              value={[settings.presencePenalty]}
              min={-2}
              max={2}
              step={0.1}
              onValueChange={(values) =>
                updateSettings({ presencePenalty: values[0] })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Positive values discourage the model from repeating the same
              content.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="frequency-penalty">
                Frequency Penalty: {settings.frequencyPenalty.toFixed(1)}
              </Label>
            </div>
            <Slider
              id="frequency-penalty"
              value={[settings.frequencyPenalty]}
              min={-2}
              max={2}
              step={0.1}
              onValueChange={(values) =>
                updateSettings({ frequencyPenalty: values[0] })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Positive values discourage the model from repeating tokens.
            </p>
          </div>
        </div>

        {!compact && (
          <div className="space-y-2">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Input
              id="max-tokens"
              type="number"
              min={1}
              max={8000}
              value={settings.maxTokens || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateSettings({ maxTokens: isNaN(value) ? undefined : value });
              }}
              placeholder="Unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of tokens to generate. Leave empty for model
              default.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          {onClose && (
            <Button variant="default" size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
