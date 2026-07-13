export type ExtractedIngredient = {
  name: string;
  confidence?: number;
  selected: boolean;
};

export type PendingCapture = {
  uri: string;
  base64: string;
};

export type CapturePhase = 'idle' | 'preview' | 'extracting' | 'review';
