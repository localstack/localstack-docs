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

1. **Select or create your Enterprise Application** — In the [Microsoft Entra admin center](https://entra.microsoft.com), go to **Identity → Applications → Enterprise applications** and select the application you want to enable SCIM provisioning for. If you don't have one yet, create a new non-gallery application.
2. **Navigate to Provisioning** — In the application's side menu, open **Manage → Provisioning**. On first setup, click **Get started** and set the **Provisioning Mode** to **Automatic**.
3. **Enter the SCIM connection details** under the **Connectivity** section (or **Admin Credentials** in the legacy view):
   - **Authentication method:** Select **Bearer authentication**.
   - **Tenant URL:** Paste the SCIM Base Connector URL from the LocalStack SCIM configuration panel.
   - **Secret Token:** Paste the SCIM bearer token from the LocalStack SCIM configuration panel.

   ![Entra ID SCIM connectivity configuration](/images/aws/SCIM-entra-connectivity.jpg)

4. **Test the connection** — Click **Test connection** to confirm Entra can reach LocalStack successfully.
5. **Save** — Save the connection settings.
6. **(Recommended) Set scope** — Under **Provisioning → Settings → Scope**, select **Sync only assigned users and groups** to limit provisioning to users and groups you explicitly assign to the application.
7. **Start provisioning** — Once the connection is verified, return to the Provisioning overview and click **Start provisioning**. Entra will begin syncing user and group changes to LocalStack on a 40-minute cycle.

:::note
Entra runs the provisioning cycle every ~40 minutes by default. To trigger an immediate sync for a specific user, use **Provision on Demand** from the application's Provisioning blade.
:::

:::caution
Do **NOT** enable the `aadOptscim062020` feature flag on the Entra provisioning configuration. This flag changes Entra's outbound `PATCH /Groups` semantics in a way that can cause destructive single-user member replacements. The default behavior (flag off) is what LocalStack expects.
:::

### Provisioning Individual Users

LocalStack supports full provisioning and deprovisioning of individual user accounts via SCIM.

:::note
For security reasons, SCIM can only provision user accounts for users who do not already exist in the LocalStack web app. If a user was originally created via SCIM and later removed from your workspace, you must invite them again through the LocalStack [**Users & Licenses**](https://app.localstack.cloud/settings/members). The user will receive an email invitation and must explicitly accept it to rejoin the workspace.
:::

1. **Create the user in Entra** (if not already present) — In **Microsoft Entra ID → Users**, click **+ New user → Create new user** and fill in the basic details (User principal name, Display name, etc).
   ![Creating a new user in Entra ID](/images/aws/SCIM-entra-create-user.jpg)

2. **Assign the user to the LocalStack application** — Open your Enterprise Application and go to **Manage → Users and groups**. Click **+ Add user/group**, search for the user, select them, and click **Select**.
   ![Selecting users to assign to the application](/images/aws/SCIM-entra-add-members.jpg)

3. **Wait for sync (or trigger Provision on Demand)** — On the next provisioning cycle, Entra will send a SCIM request to LocalStack to create the user account. To skip the wait, go to **Provisioning → Provision on Demand**, search for the user, and run an immediate provision.

:::tip
Legacy users (existing LocalStack accounts) can also be assigned to the Entra application, provided their email address matches the one they used to register with the LocalStack web app.
:::

### Updating User Accounts

Changes to user attributes (first name, last name, email) in Entra are automatically pushed to LocalStack via SCIM on the next sync cycle while the integration is active. Attributes are managed on the user's **Properties → Identity** tab in Microsoft Entra ID.

![Editing a user's identity properties in Entra ID](/images/aws/SCIM-entra-user-properties.jpg)

### Deprovisioning Users

1. In Entra, open the LocalStack Enterprise Application and go to **Manage → Users and groups**.
2. Find the user you want to remove and click **Remove**.
3. Confirm the action.

On the next sync cycle (or via Provision on Demand) Entra will send a SCIM deprovisioning request and the user will be removed from LocalStack.

:::note
Disabling the user account in the Entra directory itself (setting `accountEnabled = false`) also takes the user out of scope and triggers SCIM deprovisioning on the next sync cycle.
:::

### Provisioning Groups of Users

Groups in Microsoft Entra ID can be used to provision multiple users to LocalStack at once. To enable group provisioning, ensure the **Provision Microsoft Entra ID Groups** mapping is enabled in **Provisioning → Mappings**.

#### Assigning a Group

1. **Create a security group** — In **Microsoft Entra ID → Groups → All groups**, click **+ New group**. Choose **Security** as the group type, set the **Membership type** to **Assigned**, give the group a name, and (optionally) a description.
   ![Creating a new security group in Entra ID](/images/aws/SCIM-entra-new-group.jpg)
2. **Add members to the group** — In the same form (or after creation, via the group's **Members** tab), select the users you want to provision.
   ![Adding members to a group in Entra ID](/images/aws/SCIM-entra-group-members.jpg)
3. **Assign the group to the application** — Open your Enterprise Application, go to **Manage → Users and groups**, click **+ Add user/group**, select the group, and confirm.
4. **Wait for sync** — On the next provisioning cycle, Entra will send SCIM requests to LocalStack to provision each member of the group.

Changes to a group's membership in Entra are automatically pushed to LocalStack via SCIM on subsequent sync cycles.

#### Deprovisioning a Group

1. In Entra, open the LocalStack Enterprise Application and go to **Manage → Users and groups**.
2. Find the group and click **Remove**.
3. Confirm the action.

Entra will send SCIM requests to remove the group's users from LocalStack. Users who were provisioned solely through this group assignment will also be deprovisioned.

:::tip
Any changes in Entra (user/group attribute changes, group memberships, etc.) are automatically synchronized with LocalStack on subsequent sync cycles as long as the SCIM integration is active.
:::
