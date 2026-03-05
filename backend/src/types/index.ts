export interface PartnerOrganization {
  name: string;
  domain: string;
  description?: string;
}

export interface RealmCreationResult {
  organization: string;
  success: boolean;
  realmId?: string;
  adminGroupId?: string;
  userGroupId?: string;
  resourceSetId?: string;
  error?: string;
}

export interface OktaConfig {
  domain: string;
  apiToken: string;
  clientId: string;
  clientSecret: string;
}
