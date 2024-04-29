import { Prompt } from "@scoopika/types";

export interface Model {
  id: string;
  options: Record<
    string,
    { min: number; max: number; default: number; step: number }
  >;
}

interface Engine {
  name: string;
  models: Record<"text" | "image" | "json", Model[]>;
}

interface SpecificEngines {
  openai: Engine;
  google: Engine;
  together: Engine;
  [x: string]: Engine;
}

const engines: SpecificEngines = {
  openai: {
    name: "OpenAI",
    models: {
      text: [
        {
          id: "gpt-3.5-turbo",
          options: {
            max_tokens: { min: 50, max: 4096, default: 500, step: 1 },
            temperature: { min: 0, max: 1, default: 0.5, step: 0.01 },
            top_p: { min: 0, max: 1, default: 1, step: 0.01 },
            frequency_penalty: { min: 0, max: 1, default: 1, step: 0.01 },
            presence_penalty: { min: 0, max: 1, default: 1, step: 0.01 },
          },
        },
        {
          id: "gpt-3.5-turbo-instruct",
          options: {
            max_tokens: { min: 50, max: 4096, default: 200, step: 1 },
            temperature: { min: 0, max: 1, default: 0.5, step: 0.01 },
            top_p: { min: 0, max: 1, default: 1, step: 0.01 },
            frequency_penalty: { min: 0, max: 1, default: 0, step: 0.01 },
            presence_penalty: { min: 0, max: 1, default: 0, step: 0.01 },
          },
        },
      ],
      image: [],
      json: [],
    },
  },
  google: {
    name: "Google Gemini",
    models: {
      text: [
        {
          id: "gemini-1.5-pro",
          options: {
            max_tokens: { min: 50, max: 1000000, default: 900000, step: 1 },
            temperature: { min: 0, max: 1, default: 0.7, step: 0.01 },
            top_p: { min: 0, max: 1, default: 0.4, step: 0.01 },
            top_k: { min: 0, max: 64, default: 32, step: 1 },
          },
        },
      ],
      image: [],
      json: [],
    },
  },
  together: {
    name: "Together AI",
    models: {
      text: [],
      image: [],
      json: [],
    },
  },
};

export const getEngines = (type: Prompt["type"]) => {
  if (type === "json") {
    type = "text";
  }

  if (type !== "text" && type !== "image") {
    return {};
  }

  const wanted: Record<string, Engine> = {};

  Object.keys(engines).map((key) => {
    const thisEngine = engines[key];

    if ((thisEngine.models[type] || []).length > 0) {
      wanted[key] = thisEngine;
    }
  });

  return wanted;
};

export const getOptions = (prompt: Prompt): Model["options"] => {
  const wantedEngines = getEngines(prompt.type);
  if (Object.keys(wantedEngines).length < 1) {
    return {};
  }

  const engine = wantedEngines[prompt.llm_client];
  if (!engine) return {};

  const model = engine.models[prompt.type].filter(
    (m) => m.id === prompt.model
  )[0];
  if (!model) return {};

  return model.options;
};

export const getDefaultOptions = (options: Model["options"]) => {
  const defaultValues: Record<string, any> = {};

  Object.keys(options).map(
    (key) => (defaultValues[key] = options[key].default)
  );

  return defaultValues;
};

export default engines;
