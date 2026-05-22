export type FieldState = {
  hidden: boolean;
  mandatory: boolean;
  warning: string | null;
  error: string | null;
  assignedValue: unknown;
  hiddenOptions: Set<string>;
  hiddenOptionGroups: Set<string>;
};

export type FieldStateMap = Record<string, FieldState>;

export const createEmptyFieldState = (): FieldState => ({
  hidden: false,
  mandatory: false,
  warning: null,
  error: null,
  assignedValue: null,
  hiddenOptions: new Set(),
  hiddenOptionGroups: new Set(),
});
