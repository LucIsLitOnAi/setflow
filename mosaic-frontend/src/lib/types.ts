export type Step =
  | 'landing'
  | 'quiz_recipient'
  | 'quiz_vibe'
  | 'quiz_occasion'
  | 'upload'
  | 'processing';

export interface LocalImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface OnboardingState {
  currentStep: Step;
  quiz: {
    recipient: string | null;
    vibe: string | null;
    occasion: string | null;
  };
  upload: {
    mainImage: LocalImage | null;
    tileImages: LocalImage[];
  };
}

export type OnboardingAction =
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_QUIZ_ANSWER'; payload: { question: keyof OnboardingState['quiz']; answer: string } }
  | { type: 'SET_MAIN_IMAGE'; payload: LocalImage | null }
  | { type: 'ADD_TILE_IMAGES'; payload: LocalImage[] }
  | { type: 'REMOVE_TILE_IMAGE'; payload: string }
  | { type: 'RESET' };
