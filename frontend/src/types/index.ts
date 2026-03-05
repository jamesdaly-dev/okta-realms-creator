export interface RealmCreationResult {
  organization: string;
  success: boolean;
  realmId?: string;
  adminGroupId?: string;
  userGroupId?: string;
  resourceSetId?: string;
  error?: string;
}

export interface UploadResponse {
  message: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: RealmCreationResult[];
}
