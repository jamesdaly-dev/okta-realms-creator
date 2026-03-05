import okta from '@okta/okta-sdk-nodejs';
import axios from 'axios';
import { PartnerOrganization, RealmCreationResult } from '../types/index';
import { escapeRegexChars } from '../middleware/inputValidation';

const { Client } = okta;

export class OktaService {
  private client: Client;
  private oktaProfileSourceId: string | null = null;
  private partnerPortalAppId: string | null = null;
  private partnerAdminRoleId: string | null = null;
  private apiToken: string;
  private orgUrl: string;

  constructor(orgUrl: string, token: string) {
    this.apiToken = token;
    this.orgUrl = `https://${orgUrl}`;
    this.client = new Client({
      orgUrl: this.orgUrl,
      token: token,
    });
  }

  /**
   * Gets the Okta profile source ID (Okta directory)
   * Caches the result for subsequent calls
   */
  async getOktaProfileSourceId(): Promise<string> {
    if (this.oktaProfileSourceId) {
      return this.oktaProfileSourceId;
    }

    try {
      // Get org settings which contains the org ID
      const orgSettings = await this.client.orgSettingApi.getOrgSettings({});

      console.log('Org settings response:', JSON.stringify(orgSettings, null, 2));

      // The Okta profile source ID is the org ID
      this.oktaProfileSourceId = (orgSettings as any).id;

      if (!this.oktaProfileSourceId) {
        throw new Error('Could not extract org ID from settings');
      }

      console.log(`✓ Using Okta profile source ID: ${this.oktaProfileSourceId}`);
      return this.oktaProfileSourceId;
    } catch (error: any) {
      console.error('Error getting org settings:', error.message);
      throw new Error('Failed to get Okta profile source ID. Please check API token permissions.');
    }
  }

  /**
   * Gets the Partner Admin role ID by name
   * Caches the result for subsequent calls
   */
  async getPartnerAdminRoleId(): Promise<string> {
    if (this.partnerAdminRoleId) {
      return this.partnerAdminRoleId;
    }

    try {
      // List all roles and find Partner Admin
      const response = await axios.get(
        `${this.orgUrl}/api/v1/iam/roles`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `SSWS ${this.apiToken}`
          }
        }
      );

      const roles = response.data.roles || [];
      const partnerAdminRole = roles.find((role: any) => role.label === 'Partner Admin');

      if (!partnerAdminRole) {
        throw new Error('Partner Admin role not found. Please ensure it exists in your Okta org.');
      }

      this.partnerAdminRoleId = partnerAdminRole.id;

      return this.partnerAdminRoleId;
    } catch (error: any) {
      console.error('Error finding Partner Admin role:', error.message);
      throw new Error('Failed to find Partner Admin role.');
    }
  }

  /**
   * Gets the Partner Portal application ID by name
   * Caches the result for subsequent calls
   */
  async getPartnerPortalAppId(): Promise<string> {
    if (this.partnerPortalAppId) {
      return this.partnerPortalAppId;
    }

    try {
      // Search for the Partner Portal app by name using axios
      const response = await axios.get(
        `${this.orgUrl}/api/v1/apps`,
        {
          params: { q: 'Partner Portal' },
          headers: {
            'Accept': 'application/json',
            'Authorization': `SSWS ${this.apiToken}`
          }
        }
      );

      const apps = response.data;

      // Find the exact match
      const partnerPortalApp = apps.find((app: any) => app.label === 'Partner Portal');

      if (!partnerPortalApp) {
        throw new Error('Partner Portal application not found. Please create it in Okta first.');
      }

      this.partnerPortalAppId = partnerPortalApp.id;

      return this.partnerPortalAppId;
    } catch (error: any) {
      console.error('Error finding Partner Portal app:', error.message);
      throw new Error('Failed to find Partner Portal application.');
    }
  }

  /**
   * Creates admin and user groups for a realm
   */
  async createGroupsForRealm(organizationName: string): Promise<{ adminGroupId: string; userGroupId: string }> {
    try {
      // Create admin group
      const adminGroup = await this.client.groupApi.createGroup({
        group: {
          profile: {
            name: `${organizationName}-Admins`,
            description: `Administrator group for ${organizationName} realm`
          }
        }
      });

      console.log(`  ↳ Created admin group: ${adminGroup.profile.name} (ID: ${adminGroup.id})`);

      // Create user group
      const userGroup = await this.client.groupApi.createGroup({
        group: {
          profile: {
            name: `${organizationName}-Users`,
            description: `User group for ${organizationName} realm`
          }
        }
      });

      console.log(`  ↳ Created user group: ${userGroup.profile.name} (ID: ${userGroup.id})`);

      return {
        adminGroupId: adminGroup.id!,
        userGroupId: userGroup.id!
      };
    } catch (error: any) {
      console.error(`  ✗ Failed to create groups:`, error.message);
      throw error;
    }
  }

  /**
   * Creates a resource set for realm administration
   */
  async createResourceSet(
    realmId: string,
    organizationName: string,
    adminGroupId: string,
    userGroupId: string
  ): Promise<string> {
    try {
      // Use axios directly since SDK's http client isn't returning responses properly
      // Extract organization name without "Corporation" or similar suffixes for cleaner label
      const cleanOrgName = organizationName.replace(/\s+(Corporation|Corp|Inc|LLC|Ltd)\.?$/i, '').trim();

      const bodyData = {
        label: `${cleanOrgName} Partner Realm`,
        description: `Resource set for ${organizationName} realm administration`,
        resources: [
          // Admin group
          `${this.orgUrl}/api/v1/groups/${adminGroupId}`,
          // User group
          `${this.orgUrl}/api/v1/groups/${userGroupId}`,
          // Realm
          `${this.orgUrl}/api/v1/realms/${realmId}`
        ]
      };

      const response = await axios.post(
        `${this.orgUrl}/api/v1/iam/resource-sets`,
        bodyData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SSWS ${this.apiToken}`
          }
        }
      );

      const resourceSet = response.data;

      console.log(`  ↳ Created resource set: ${resourceSet.label} (ID: ${resourceSet.id})`);

      return resourceSet.id;
    } catch (error: any) {
      console.error(`  ✗ Failed to create resource set:`, error.message);
      throw error;
    }
  }

  /**
   * Assigns the Partner Admin role to a group with a resource set
   */
  async assignPartnerAdminRole(
    resourceSetId: string,
    adminGroupId: string,
    organizationName: string
  ): Promise<void> {
    try {
      // Get the Partner Admin role ID
      const roleId = await this.getPartnerAdminRoleId();

      // Use REST URL format for group member - members is a flat array
      const bodyData = {
        role: roleId,
        members: [`${this.orgUrl}/api/v1/groups/${adminGroupId}`]
      };

      await axios.post(
        `${this.orgUrl}/api/v1/iam/resource-sets/${resourceSetId}/bindings`,
        bodyData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SSWS ${this.apiToken}`
          }
        }
      );

      console.log(`  ↳ Assigned Partner Admin role to ${organizationName}-Admins group with resource set`);
    } catch (error: any) {
      const errorDetails = error.response?.data || error.message;
      console.error(`  ✗ Failed to assign Partner Admin role:`, JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to assign role: ${JSON.stringify(errorDetails)}`);
    }
  }

  /**
   * Assigns a group to the Partner Portal application
   */
  async assignGroupToPartnerPortal(groupId: string, organizationName: string): Promise<void> {
    try {
      const appId = await this.getPartnerPortalAppId();

      // Assign the group to the Partner Portal app
      await this.client.applicationApi.assignGroupToApplication({
        appId: appId,
        groupId: groupId
      });

      console.log(`  ↳ Assigned ${organizationName}-Admins group to Partner Portal app`);
    } catch (error: any) {
      console.error(`  ✗ Failed to assign group to Partner Portal:`, error.message);
      throw error;
    }
  }

  /**
   * Creates a realm assignment rule that automatically assigns users to a realm based on email domain
   */
  async createRealmAssignment(realmId: string, organization: PartnerOrganization, priority: number = 1): Promise<void> {
    try {
      // Get the Okta profile source ID
      const profileSourceId = await this.getOktaProfileSourceId();

      // Create realm assignment rule
      // Use matches operator with regex pattern, following the documentation example format
      // Escape domain to prevent regex injection
      const escapedDomain = escapeRegexChars(organization.domain);

      const assignment = await this.client.realmAssignmentApi.createRealmAssignment({
        body: {
          name: `Assign @${organization.domain} usernames to ${organization.name} realm`,
          conditions: {
            expression: {
              // Use regex pattern to match email domain (properly escaped)
              value: `user.profile.login matches ".*@${escapedDomain}"`
            },
            profileSourceId: profileSourceId
          },
          actions: {
            assignUserToRealm: {
              realmId: realmId
            }
          },
          priority: priority
        }
      });

      console.log(`  ↳ Created realm assignment rule: ${assignment.id}`);

      // Activate the realm assignment
      await this.client.realmAssignmentApi.activateRealmAssignment({
        assignmentId: assignment.id
      });

      console.log(`  ↳ Activated realm assignment rule`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create/activate realm assignment:`, error.message);
      throw error;
    }
  }

  /**
   * Creates a realm for a partner organization and sets up automatic user assignment
   * Uses the Okta Realm API to create actual realms (not authorization servers)
   */
  async createRealm(organization: PartnerOrganization, priority: number = 1): Promise<RealmCreationResult> {
    try {
      // Create a Realm using the Realm API
      // The ObjectRealmApi wrapper expects params in the format { body: {...} }
      const realm = await this.client.realmApi.createRealm({
        body: {
          profile: {
            name: organization.name,
            domains: [organization.domain],
            realmType: 'PARTNER' as const, // Standard type for partner organizations
          },
          // Enable the partner admin portal
          createPortal: true,
        } as any // Use 'as any' to allow additional properties not in TypeScript definitions
      });

      console.log(`✓ Created realm for ${organization.name} (ID: ${realm.id})`);

      // Create and activate realm assignment rule
      await this.createRealmAssignment(realm.id!, organization, priority);

      // Create admin and user groups
      const { adminGroupId, userGroupId } = await this.createGroupsForRealm(organization.name);

      // Create resource set
      const resourceSetId = await this.createResourceSet(
        realm.id!,
        organization.name,
        adminGroupId,
        userGroupId
      );

      // Assign Partner Admin role to the admin group with the resource set
      await this.assignPartnerAdminRole(resourceSetId, adminGroupId, organization.name);

      // Assign admin group to Partner Portal app
      await this.assignGroupToPartnerPortal(adminGroupId, organization.name);

      return {
        organization: organization.name,
        success: true,
        realmId: realm.id,
        adminGroupId,
        userGroupId,
        resourceSetId,
      };
    } catch (error: any) {
      console.error(`✗ Failed to create realm for ${organization.name}:`, error.message);
      return {
        organization: organization.name,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Creates realms for multiple organizations
   */
  async createMultipleRealms(organizations: PartnerOrganization[]): Promise<RealmCreationResult[]> {
    const results: RealmCreationResult[] = [];

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      // Use index + 1 as priority (higher number = lower priority in Okta)
      const result = await this.createRealm(org, i + 1);
      results.push(result);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Lists all realms
   */
  async listRealms() {
    try {
      const realms = await this.client.realmApi.listRealms();
      return realms;
    } catch (error: any) {
      console.error('Failed to list realms:', error.message);
      throw error;
    }
  }
}
