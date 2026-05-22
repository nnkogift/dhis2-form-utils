export type Dhis2ValueType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'INTEGER'
  | 'INTEGER_POSITIVE'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'ORGANISATION_UNIT'
  | 'FILE_RESOURCE';

export type DataElementRef = {
  id: string;
  displayName: string;
  valueType: Dhis2ValueType;
};

export type ProgramStageDataElement = {
  dataElement: DataElementRef;
};

export type ProgramStageMetadata = {
  id: string;
  displayName: string;
  programStageDataElements: ProgramStageDataElement[];
};
