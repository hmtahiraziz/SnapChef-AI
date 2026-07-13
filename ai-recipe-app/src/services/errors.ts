export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiKeyMissingError extends AppError {
  constructor() {
    super('Add EXPO_PUBLIC_API_BASE_URL to .env before using app features.');
    this.name = 'ApiKeyMissingError';
  }
}

export class PermissionDeniedError extends AppError {
  constructor(kind: 'camera' | 'library') {
    super(
      kind === 'camera'
        ? 'Camera permission is required. Enable it in Settings, then try again.'
        : 'Photo library permission is required. Enable it in Settings, then try again.',
    );
    this.name = 'PermissionDeniedError';
  }
}

export class VisionError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'VisionError';
  }
}

export class RecipeGenerationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'RecipeGenerationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'You appear to be offline. Check your internet connection and try again.') {
    super(message);
    this.name = 'NetworkError';
  }
}

