import yaml from 'js-yaml';
import { Screen } from '@/stores/screensStore';

export class YAMLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YAMLParseError';
  }
}

export async function parseScreenConfig(url: string): Promise<Screen[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const documents = yaml.loadAll(text) as any[];

    return documents.map((data, index) => {
      if (!data.title || !Array.isArray(data.ui)) {
        throw new YAMLParseError(`Invalid YAML structure in document ${index + 1}`);
      }

      return {
        id: `${Date.now()}-${index}`,
        title: String(data.title ?? ''), // Ensure title is a string
        ui: data.ui.map((button: any) => ({
          label: String(button.label ?? ''), // Ensure label is a string
          // Ensure span is between 1 and 6, default to 1
          span: Math.min(Math.max(parseInt(String(button.span), 10) || 1, 1), 6),
          // Ensure height is at least 1, default to 1
          height: Math.max(parseInt(String(button.height), 10) || 1, 1),
          url: String(button.url ?? '') // Ensure url is always a string
        }))
      };
    });
  } catch (error) {
    throw new YAMLParseError(error instanceof Error ? error.message : 'Failed to parse YAML');
  }
}
