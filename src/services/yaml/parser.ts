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
        title: data.title,
        ui: data.ui.map((button: any) => ({
          label: button.label,
          span: Math.min(Math.max(button.span || 1, 1), 6),
          height: button.height || 1, // Parse height, default to 1 if not provided
          url: button.url
        }))
      };
    });
  } catch (error) {
    throw new YAMLParseError(error instanceof Error ? error.message : 'Failed to parse YAML');
  }
}
