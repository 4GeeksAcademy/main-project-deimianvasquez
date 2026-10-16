export type ApiRecord = Record<string, unknown> & {
  id?: string | number;
  _id?: string | number;
  uuid?: string;
};

export type ApiNote = {
  id?: string | number;
  _id?: string | number;
  note_id?: string | number;
  noteId?: string | number;
  content?: string;
  text?: string;
  body?: string;
  note?: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  [key: string]: unknown;
};

export type PaginatedRecordsResponse = {
  records?: ApiRecord[];
  data?: ApiRecord[] | { records?: ApiRecord[]; results?: ApiRecord[]; [key: string]: unknown };
  results?: ApiRecord[];
  candidates?: ApiRecord[];
  pagination?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  stage: string;
  date: string;
  raw: ApiRecord;
};

export type CandidateFormPayload = {
  name?: string;
  full_name?: string;
  email: string;
  phone: string;
  position: string;
  linkedin?: string;
  resume?: string;
  status: string;
  stage: string;
  experience_years: number;
  applied_at?: string;
};
