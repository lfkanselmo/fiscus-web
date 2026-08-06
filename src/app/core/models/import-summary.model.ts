export interface ImportRowError {
  line_number: number;
  reason: string;
}

export interface ImportSummary {
  created: number;
  duplicated: number;
  errors: ImportRowError[];
}
