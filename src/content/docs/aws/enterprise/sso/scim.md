---
title: SCIM User Provisioning
description: Automating user and license provisioning in LocalStack using SCIM (System for Cross-domain Identity Management).
template: doc
tags: ["Enterprise"]
---

SCIM (System for Cross-domain Identity Management) allows you to automate user provisioning, deprovisioning, and license assignment in LocalStack through your identity provider (IdP). LocalStack's SCIM implementation follows the SCIM v2.0 specification and has been developed and tested with the Okta SCIM client.

SCIM is a sub-feature of SSO and requires an active SSO configuration with at least one Identity Provider already set up. See the [Single Sign-On](/aws/enterprise/sso/) documentation before proceeding.

All integration details — including the SCIM Base Connector URL, Bearer Auth Token, and group names per subscription — are available in the LocalStack web app under **Settings → Single Sign-On** ([app.localstack.cloud/settings/sso](https://app.localstack.cloud/settings/sso)).

## Prerequisites

- An active Enterprise subscription with the SCIM feature enabled
- A configured SSO Identity Provider (OIDC or SAML)
- Admin access to your organization in the LocalStack web app

## Enabling SCIM

In the LocalStack web app, navigate to **Settings → Single Sign-On**. For each configured Identity Provider, you will see a **SCIM User Provisioning** toggle. Enable it for the IdP you want to use for SCIM provisioning.

> **Note:** Only one Identity Provider can have SCIM active at a time.

Once enabled, click **View SCIM Configuration** to access the SCIM Base Connector URL and Bearer Auth Token needed to configure your IdP.

## Authenticating the SCIM Client

### SCIM API Base URL

The SCIM API base URL is displayed in the SCIM configuration panel in the LocalStack web app. It takes the form:

```
https://api.localstack.cloud/scim/v2
```

### Bearer Auth Token

SCIM clients authenticate using a long-lived bearer token. The token starts with `scim-` and is displayed (masked) in the SCIM configuration panel. Use the copy icon to copy it to your clipboard.

You can regenerate the token at any time using the refresh icon. Regenerating the token immediately invalidates the previous one — update your IdP configuration with the new token to avoid interruptions.

## Configuring Okta

### New SCIM Application

1. **Select your application** — Go to **Applications → Applications** and select the application you want to enable SCIM provisioning for.

2. **Navigate to Provisioning settings** — In the application settings, go to the **Provisioning** tab and click **Integration** or **Edit Integration**.

3. **Enter SCIM connection details:**
   - **SCIM connector base URL:** Paste the SCIM Base Connector URL from the LocalStack SCIM configuration panel.
   - **Authentication Mode:** Select **HTTP Header**.
   - **Bearer Token:** Paste the SCIM bearer token (starts with `scim-`) from the LocalStack SCIM configuration panel.

4. **Test the connection** — Click **Test Connector Configuration** to confirm Okta can connect successfully.

5. **Enable provisioning features** — Once the connection succeeds, enable the desired provisioning actions (Create Users, Update User Attributes, Deactivate Users) under the **To App** settings tab. There is no need to enable Sync Password, as SSO does not require a password.

6. **Save** — Save and apply the integration settings.

> **Note:** The exact menu names may vary depending on Okta's UI version and app type, but the key settings are always the SCIM Base Connector URL and Bearer Auth Token under the provisioning or integration section.

### Migrating an Existing OpenID Connect or SAML Application

If you have an existing OIDC or SAML app in Okta that already has SSO users assigned, follow these steps to add SCIM provisioning:

1. On the **General** tab of your Okta application, set **Provisioning** to **SCIM**.

2. Go to the **Provisioning** tab and click **Edit** to configure the SCIM connection:
   - **SCIM connector base URL:** Paste the URL from LocalStack.
   - **Unique identifier field for users:** Enter `userName` (the Okta default).
   - **Supported provisioning actions:** Enable all available options.

3. Select **HTTP Header** as the Authentication Mode and paste the Bearer token from the LocalStack SCIM configuration panel. Click **Save**.

4. After a successful connection test, go to the **To App** tab, click **Edit**, and enable **Create Users**, **Update User Attributes**, and **Deactivate Users**. Save your changes.

5. Click the **Assignments** tab. Okta will show error messages for users who were assigned before provisioning was enabled. Click **Provision User** and confirm the action to sync all existing users. If the task fails, you can retry it under **Dashboard → Tasks**.

6. After syncing completes, refresh the page — the error messages should be gone and all users will be fully managed via Okta SCIM.

## Provisioning Users

LocalStack supports full provisioning and deprovisioning of user accounts via SCIM.

> **Note:** For security reasons, SCIM can only provision user accounts for users who do not already exist in the LocalStack web app. If a user was originally created via SCIM and later removed from your workspace, you must invite them again through the LocalStack **Users & Licenses** page ([app.localstack.cloud/settings/members](https://app.localstack.cloud/settings/members)). The user will receive an email invitation and must explicitly accept it to rejoin.

### Provisioning Individual Users

1. In the Okta Admin Console, go to your application and click the **Assignments** tab.
2. Select **Assign → Assign to People**.
3. Search for and select the users you want to provision, then click **Assign** and **Done**.
4. Okta will automatically send a SCIM request to LocalStack to create each user account.

> **Note:** Legacy users (existing LocalStack accounts) can also be assigned to the Okta application, provided their email address matches the one they used to register with the LocalStack web app.

### Updating User Accounts

Changes to a user's attributes (first name, last name, email) in Okta are automatically pushed to LocalStack via SCIM while the integration is active.

### Deprovisioning Users

1. In Okta, go to your application's **Assignments** tab.
2. Find the user you want to remove and click **Remove** next to their name.
3. Confirm the action.

Okta will send a SCIM deprovisioning request and the user will be removed from LocalStack.

## Provisioning Groups of Users

Groups in Okta can be used to provision multiple users to LocalStack at once.

### Assigning a Group

1. In the Okta Admin Console, go to your application and click the **Assignments** tab.
2. Select **Assign → Assign to Groups**.
3. Search for and select the groups you want to provision, then click **Assign** and **Done**.
4. Okta will send a SCIM request to LocalStack to create a user account for each member of the group.

Changes to a group's membership in Okta are automatically pushed to LocalStack via SCIM.

### Removing a Group

1. In Okta, return to your application's **Assignments** tab.
2. Find the group and click **Remove** next to its name.
3. Confirm the action.

Okta will send a SCIM request to remove the group's users from LocalStack. Users who were provisioned solely through this group assignment will also be deprovisioned.

## License Assignment

Licenses are assigned to users by pushing specifically named SCIM groups that correspond to your LocalStack subscriptions.

### Group Name Format

License group names follow this format:

```
{PLAN}-{EMULATOR}-{SUBSCRIPTION_ID}
```

For example: `Enterprise Plan-AWS-sub_1RqpMYGCs0LNOzY9UszOGJkL`

The exact group name for each subscription is displayed in the SCIM configuration panel in the LocalStack web app. Use the subscription dropdown to select the plan you want to manage, and the correct group name will be shown for you to copy.

> **Note:** Legacy users can be added to a license assignment group in Okta, provided their email address matches their LocalStack registration email, they have been assigned to the Okta application, and the group name matches the correct subscription.

> **Important:** Each user can only be a member of one license group (subscription) per organization. Assigning a user to multiple license groups will result in an error and provisioning will fail for that user.

### Creating and Pushing a License Group in Okta

1. Create a new Okta group named exactly as shown in the LocalStack SCIM configuration panel.
2. Add users to the group (users must already be assigned to the LocalStack SCIM application).
3. In your application, go to the **Push Groups** tab.
4. Push the group to LocalStack via SCIM.
5. Once synced, LocalStack will recognize the group and assign the corresponding license to all members.

> **Important:** Never manually push an empty group using the **Push now** option from the Push Status dropdown. Doing so will remove the licenses of all users synced through SCIM. Always ensure a group contains users before pushing it manually.

### Migrating Users with Existing Licenses

If your organization already has users with assigned licenses and you want to manage them through SCIM:

1. Create a license group in Okta with the correct name.
2. Add it to the application via the **Push Groups** tab.
3. Add the existing licensed users to that group through the application. Once added, they will be automatically synced (Push Status becomes **Active**) and managed through SCIM going forward.

## Web App Roles and Permissions

LocalStack supports configuring default roles and permissions that are applied when a user is provisioned via SCIM. These settings are inherited from the SSO Identity Provider configuration and can be set in the LocalStack web app:

- **Default User Role:** The role assigned to users who join via SCIM (default: Member).
- **Default User Permissions:** Additional permissions assigned upon provisioning, such as the ability to invite team members or manage API keys.

Assigning users to roles or groups (e.g., Member, Admin) directly via SCIM is not supported.

## Limitations

- **One license group per user:** Each user can be assigned to only one license group (subscription) per organization.
- **One SCIM provider at a time:** Only one Identity Provider can have SCIM enabled at a time.
- **Provisioning is one-way:** SCIM sync goes from your IdP to LocalStack only. There is no synchronization from LocalStack back to your IdP.
- **LocalStack UI does not block manual edits:** The LocalStack web app does not prevent you from manually editing SCIM-provisioned users or their license assignments. It is strongly recommended to manage SCIM-provisioned users exclusively through your IdP to avoid inconsistencies.
- **Re-provisioning removed users requires re-invitation:** If a user was provisioned via SCIM and later removed, they cannot be re-provisioned via SCIM directly. They must be re-invited through the LocalStack **Users & Licenses** page and accept the invitation before being reassigned.

## API Reference

LocalStack's SCIM API is available at `/scim/v2` and implements the SCIM v2.0 specification (RFC 7644).

### User Endpoints (`/scim/v2/Users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scim/v2/Users` | Create a SCIM user, or idempotently return an existing member when the email matches. Enforces global email uniqueness and `userName` uniqueness per org and IdP. |
| `GET` | `/scim/v2/Users` | List active SCIM-provisioned users. Supports `filter=userName eq "..."`, `startIndex`, and `count` for pagination. |
| `GET` | `/scim/v2/Users/{id}` | Retrieve a SCIM user only if they are SCIM-provisioned and active in the org; returns `404` otherwise. |
| `PATCH` | `/scim/v2/Users/{id}` | RFC 7644 PatchOp for selected fields (`name`, `emails`) and deactivation via `active:false`. Reactivation via SCIM is not supported. Patching `userName` or `externalId` is not supported. |
| `PUT` | `/scim/v2/Users/{id}` | Full replace of mutable fields (name, email) with support for deactivation via `active:false`. Reactivation via SCIM is ignored. |

### Group Endpoints (`/scim/v2/Groups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scim/v2/Groups` | Bind an existing subscription as a SCIM group via `displayName` (format: `{PLAN}-{EMULATOR}-{subscription_id}`). Optionally assign members. Validates membership and enforces one-group-per-user per org. Returns `201` on success; `409` for insufficient seats or conflicts. |
| `GET` | `/scim/v2/Groups` | List groups (subscriptions) with their SCIM members. Supports `filter=displayName eq "..."`, `startIndex`, and `count` (max 1000). |
| `GET` | `/scim/v2/Groups/{id}` | Retrieve a group by its subscription ID with SCIM members. Returns `404` if not found. |
| `PATCH` | `/scim/v2/Groups/{id}` | RFC 7644 PatchOp (`add`, `remove`, `replace`) for members. Supports capacity checks and rollback on partial failures. |
| `PUT` | `/scim/v2/Groups/{id}` | Full replace of group membership. Omitting or passing an empty `members` array clears all members. Supports rollback on errors. |
| `DELETE` | `/scim/v2/Groups/{id}` | Delete the group binding and unassign SCIM members. Non-SCIM assignments are unaffected. Returns `204` on success. |

### Metadata Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/scim/v2/ResourceTypes` | List all supported SCIM resource types (`User`, `Group`). |
| `GET` | `/scim/v2/Schemas` | List supported SCIM schemas for user and group resources. |
| `GET` | `/scim/v2/ServiceProviderConfig` | Return service provider configuration and supported capabilities. |
