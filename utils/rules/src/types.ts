export type FieldState = {
    hidden: boolean;
    mandatory: boolean;
    warning: string | null;
    error: string | null;
    warningOnComplete: string | null;
    errorOnComplete: string | null;
    assignedValue: unknown;
    hiddenOptions: Set<string>;
    hiddenOptionGroups: Set<string>;
};

export type FieldStateMap = Record<string, FieldState>;

export type SectionState = {
    hidden: boolean;
};

export type SectionStateMap = Record<string, SectionState>;

export type FeedbackLocation = 'feedback' | 'indicators';

export type FeedbackItem =
    | {
          type: 'text';
          content: string;
          value: string;
          location: FeedbackLocation;
      }
    | {
          type: 'keyValuePair';
          content: string;
          value: string;
          location: FeedbackLocation;
      };

export type FeedbackMap = Record<string, FeedbackItem>;

export const createEmptyFieldState = (): FieldState => ({
    hidden: false,
    mandatory: false,
    warning: null,
    error: null,
    warningOnComplete: null,
    errorOnComplete: null,
    assignedValue: null,
    hiddenOptions: new Set(),
    hiddenOptionGroups: new Set(),
});

export const createEmptySectionState = (): SectionState => ({
    hidden: false,
});
