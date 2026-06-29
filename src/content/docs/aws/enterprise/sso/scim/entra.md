---
title: SCIM with Entra ID
description: Configuring Microsoft Entra ID as the SCIM client for LocalStack user provisioning.
template: doc
tags: ['Enterprise']
sidebar:
  order: 3
---

This page covers configuring **Microsoft Entra ID** as your SCIM client to provision users and groups into LocalStack. Before starting, make sure you've completed the steps in the [SCIM overview](/aws/enterprise/sso/scim/) to enable SCIM and obtain the **SCIM Base Connector URL** and **Bearer Auth Token** from the LocalStack web app.

## Configuring SCIM with Microsoft Entra ID

Use the following steps to configure SCIM provisioning from a Microsoft Entra ID Enterprise Application.

1. **Select or create your Enterprise Application** - In the Microsoft Entra admin center, go to **Identity → Applications → Enterprise applications** and select the application you want to enable SCIM provisioning for. If you don't have one yet, create a new non-gallery application.
2. **Navigate to Provisioning** - In the application's side menu, open **Manage → Provisioning**. On first setup, click **Get started** and set the **Provisioning Mode** to **Automatic**.
3. **Enter the SCIM connection details** under the **Connectivity** section (or **Admin Credentials** in the legacy view):
   - **Authentication method:** Select **Bearer authentication**.
   - **Tenant URL:** Paste the SCIM Base Connector URL from the LocalStack SCIM configuration panel.
   - **Secret Token:** Paste the SCIM bearer token from the LocalStack SCIM configuration panel.

   ![Entra ID SCIM connectivity configuration](/images/aws/SCIM_entra_connectivity.png)

4. **Test the connection and save** - Click **Test connection** to confirm Entra can reach LocalStack, then save the settings.
5. **(Recommended) Set scope** - Under **Provisioning → Settings → Scope**, select **Sync only assigned users and groups** to limit provisioning to users and groups you explicitly assign to the application.
6. **Start provisioning** - Return to the Provisioning overview and click **Start provisioning**. Entra will sync user and group changes to LocalStack every ~40 minutes; for an immediate sync of a specific user, use **Provision on Demand** from the Provisioning blade.

:::caution
Do **NOT** enable the `aadOptscim062020` feature flag on the Entra provisioning configuration. This flag changes Entra's outbound `PATCH /Groups` semantics in a way that can cause destructive single-user member replacements. The default behavior (flag off) is what LocalStack expects.
:::

### User Management

#### Provisioning Individual Users

LocalStack supports full provisioning and deprovisioning of individual user accounts via SCIM.

1. **Create the user in Entra** (if not already present) - In **Microsoft Entra ID → Users**, click **+ New user → Create new user** and fill in the basic details (User principal name, Display name, etc).
   ![Creating a new user in Entra ID](/images/aws/SCIM_entra_create_new_user.png)

2. **Assign the user to the LocalStack application** - Open your Enterprise Application and go to **Manage → Users and groups**. Click **+ Add user/group**, search for the user, select them, and click **Select**.
   ![Selecting users to assign to the application](/images/aws/SCIM_entra_add_members_search.png)

3. **Wait for sync** - On the next provisioning cycle (or via **Provision on Demand**), Entra will send a SCIM request to LocalStack to create the user account.

:::tip
Legacy users (existing LocalStack accounts) can also be assigned to the Entra application, provided their email address matches the one they used to register with the LocalStack web app.
:::

:::note
For security reasons, SCIM can only provision user accounts for users who do not already exist in the LocalStack web app. If a user was originally created via SCIM and later removed from your workspace, you must invite them again through the LocalStack Users & Licenses. The user will receive an email invitation and must explicitly accept it to rejoin the workspace.
:::

#### Updating User Accounts

Changes to user attributes (first name, last name, email) in Entra are automatically pushed to LocalStack via SCIM while the integration is active.

#### Deprovisioning Users

1. In Entra, open the LocalStack Enterprise Application and go to **Manage → Users and groups**.
2. Find the user you want to remove and click **Remove**.
3. Confirm the action.

Entra will send a SCIM deprovisioning request and the user will be removed from LocalStack on the next sync cycle. Disabling the user in the Entra directory itself (`accountEnabled = false`) has the same effect.

:::caution
LocalStack will not let you deprovision the last remaining workspace admin. If the user being removed is the only admin, the request fails with `409 Cannot remove the last workspace admin`. Assign another admin in LocalStack first, then retry the deprovisioning.
:::

#### Provisioning Groups of Users

Groups in Microsoft Entra ID can be used to provision multiple users to LocalStack at once. To enable group provisioning, ensure the **Provision Microsoft Entra ID Groups** mapping is enabled in **Provisioning → Mappings**.

1. **Create a security group** - In **Microsoft Entra ID → Groups → All groups**, click **+ New group**. Choose **Security** as the group type, set the **Membership type** to **Assigned**, give the group a name, and (optionally) a description.
   ![Creating a new security group in Entra ID](/images/aws/SCIM_entra_new_group.png)
2. **Add members to the group** - In the same form (or after creation, via the group's **Members** tab), select the users you want to provision.
   ![Adding members to a group in Entra ID](/images/aws/SCIM_entra_create_group_member_popup.png)
3. **Assign the group to the application** - Open your Enterprise Application, go to **Manage → Users and groups**, click **+ Add user/group**, select the group, and confirm.
4. **Wait for sync** - Entra will send SCIM requests to LocalStack to provision each member on the next sync cycle.

Changes to a group's membership in Entra are automatically pushed to LocalStack via SCIM on subsequent sync cycles.

#### Deprovisioning Groups of Users

1. In Entra, open the LocalStack Enterprise Application and go to **Manage → Users and groups**.
2. Find the group and click **Remove**.
3. Confirm the action.

Entra will send SCIM requests to remove the group's users from LocalStack. Users who were provisioned solely through this group assignment will also be deprovisioned.

:::tip
Any changes in Entra (user/group attribute changes, group memberships, etc.) are automatically synchronized with LocalStack on subsequent sync cycles as long as the SCIM integration is active.
:::

#### Migrating an Existing Enterprise Application

If you enable SCIM provisioning on an Entra Enterprise Application that was already used for SSO, the users and groups already assigned to it are brought under SCIM management automatically - there's no separate migration step.

1. Enable provisioning on the existing application by following the [Configuring SCIM with Microsoft Entra ID](#configuring-scim-with-microsoft-entra-id) steps above.
2. The users and groups already assigned to the application are provisioned to LocalStack on the next sync cycle.
3. To sync them immediately rather than waiting for the cycle, use **Provision on Demand** from the Provisioning blade for each user.

### Role Management

LocalStack workspace roles (**admin** and **member**) are assigned to users by syncing SCIM groups whose name identifies the target role. The role groups themselves do not need to exist in LocalStack before the sync - they are synthetic SCIM groups keyed off the `displayName`.

:::caution
Each user can only be in **one** role group at a time. Attempting to add a user who is already in the admin role group to the member role group (or vice versa) returns a `409` conflict. Remove the user from the previous role group first, then add to the new one.
:::

#### Group Name Convention

Role groups are matched by `displayName` using a case-insensitive substring check:

- Any group whose name contains `admin` → admin role group
- Any group whose name contains `member` → member role group

All of the following are valid names for the admin role group:

- `LocalStack-Admin`
- `LocalStack-Admins-Prod`
- `ABC-ABC-AB1000_AuthLocalstackAdmin`

The first time you sync a role group from Entra, LocalStack persists that `displayName` so subsequent GET responses to your IdP reflect the name you sent. You can also rename the group later via SCIM and LocalStack will track the rename.

#### Creating a Role Group in Microsoft Entra ID

1. In **Microsoft Entra ID → Groups → All groups**, click **+ New group**. Create a **Security** group with **Membership type: Assigned** whose name contains either `Admin` (for the admin role) or `Member` (for the member role).
   ![Creating a role group in Entra ID](/images/aws/SCIM_entra_role_group.png)
2. Add users to the group (users must already be assigned to the LocalStack Enterprise Application).
3. Assign the group to the LocalStack Enterprise Application via **Manage → Users and groups**.
4. Confirm that **Provision Microsoft Entra ID Groups** is enabled under **Provisioning → Mappings**.
5. On the next provisioning cycle (or via **Provision on Demand**), Entra will sync the group to LocalStack and assign the corresponding role to all members.

#### Moving a User Between Roles

To change a user's role from member to admin (or vice versa), apply the two changes **in sequence**, letting the removal sync to LocalStack before adding the new group:

1. Remove the user from their current role group in Entra.
2. **Wait for the removal to sync to LocalStack** - either the next provisioning cycle, or use **Provision on Demand** on that user to commit it immediately.
3. Add the user to the target role group (and let it sync as in step 2).

:::caution
Don't change both groups at once. Entra may send the *add* and *remove* operations in any order within a single sync cycle. If the *add* reaches LocalStack before the *removal* has been committed, the user still carries their old role-group marker and the request is rejected with a `409` conflict. Committing the removal first guarantees the marker is cleared before the new role is applied.

The `409` is transient - Entra retries the failed operation on the next cycle, and the move eventually converges - but sequencing the changes avoids the error and the temporary inconsistency entirely.
:::

#### Last-Admin Protection

LocalStack will reject any SCIM request that would leave the workspace without an admin. If you attempt to remove the only admin from the admin role group, the request fails with `409 Cannot remove the last workspace admin`. Assign another admin in LocalStack first, then retry the removal.

:::note
License assignment via SCIM is not supported with Microsoft Entra ID. To assign licenses through SCIM, use [Okta](/aws/enterprise/sso/scim/okta/#license-management). Otherwise, manage license assignments directly in the LocalStack web app.
:::
