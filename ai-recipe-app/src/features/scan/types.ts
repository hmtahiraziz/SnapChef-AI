export type ExtractedIngredient = {
  name: string;
  confidence?: number;
  selected: boolean;
};

export type PendingCapture = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

export type CapturePhase = 'idle' | 'preview' | 'extracting' | 'review';
