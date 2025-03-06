
export interface UserProject {
  id: string;
  name: string;
  language: string;
  lastEdited: Date;
  code: string;
}

export interface SaveProjectRequest {
  name: string;
  language: string;
  code: string;
}
