---
title: Single-Sign On
description: Configuring Custom Single-Sign On (SSO) Providers in LocalStack Web Application.
template: doc
tags: ["Enterprise"]
sidebar:
  order: 1
---

Custom Single-Sign On (SSO) Identity providers, can be enabled to facilitate the process of quickly onboarding team members from your organization.

In order to configure SSO access, first sign in to the LocalStack Web application under [app.localstack.cloud](https://app.localstack.cloud/).
In your profile settings, navigate to the Single Sign-on tab which will list existing SSO Identity Providers (if any exist).

![Adding SSO Identity providers in LocalStack Settings](/images/aws/localstack-setting-sso.png)

Next, click the button to create a new identity provider (IdP), where you can choose between the two leading industry standards:

- OpenID Connect (OIDC): [openid.net/connect](https://openid.net/connect/)
- SAML: [saml.xml.org/saml-specifications](http://saml.xml.org/saml-specifications)

## Configuring SSO using OpenID Connect (OIDC)

In the form illustrated below, you can then enter the main information for the new IdP (using OpenID Connect):

- Name of your identity provider
- Client ID, Client Secret, Attributes request method, OIDC issues, Authorize scopes, and more.
  - You should be able to find these attributes in your OIDC IdP configuration.

![Configuring SSO using OpenID Connect (OIDC)](/images/aws/oidc-sso.png)

## Configuring SSO using SAML

When configuring SSO using SAML, you can configure the settings of the Identity Provider via a standard SAML metadata file (see illustration below).
The SAML metadata file can be specified either via URL or via a file upload.

Select **Enable IdP sign out flow** if you want your users to be logged out from our app and your SAML IdP when they log out from your our Web Application.

![Configuring SSO using SAML](/images/aws/saml-sso.png)


## Configuring SSO with Okta

This section provides a reference configuration for setting up SAML-based SSO with **Okta**. 

The steps below mirror the fields required in the LocalStack UI and can be used as a template when configuring your Okta application.

### 1. Create a SAML 2.0 App in Okta

In your Okta Admin Dashboard, create a new application under:

> **Applications → Create App Integration → SAML 2.0**

During setup, Okta will ask for:

* **Single sign-on URL**
* **Audience URI (SP Entity ID)**

You can copy these values directly from your LocalStack SSO provider creation screen.

Example mapping:

| LocalStack name        | Okta field name             |
| ---------------------- | --------------------------- |
| Callback URL           | Single sign-on URL          |
| Identifier (Entity Id) | Audience URI (SP Entity ID) |


### 2. Configure SAML Attribute Statements

LocalStack supports mapping the following user attributes:

* **email**
* **firstName**
* **lastName**

In Okta, add these under **Attribute Statements (optional)**:

| Name      | Name format | Value            |
| --------- | ----------- | ---------------- |
| email     | Unspecified | `user.email`     |
| firstName | Unspecified | `user.firstName` |
| lastName  | Unspecified | `user.lastName`  |

> **Note:** In some setups, Okta may not always populate `firstName` or `lastName` during signup. This is usually a configuration mismatch on the IdP side. Users can still manually enter these fields during signup if needed.

![Configuring SSO using Okta with SAML Attribute Statements](/images/aws/sso-okta-attribute-statements.png)

![Configuring SSO using Okta with SAML Attribute Statements](/images/aws/sso-okta-attribute-statements-2.png)

### 3. Retrieve the Okta Metadata URL

Once the application is created, navigate to:

> **Applications → Sign On → SAML 2.0 → Metadata URL**

Copy this URL.

![Retrieve Okta Metadata URL](/images/aws/retrieve-okta-metadata-url.png)

This URL should be used in the LocalStack UI under:

> **Metadata File → URL**

LocalStack will automatically import the SAML metadata and map the endpoints required for SSO.

### 4. Configure LocalStack Identity Provider

In the LocalStack SSO configuration screen:

* Select **Provider type: SAML**
* Enter an **Identity provider name** (e.g., “Okta”)
* Paste the **Metadata URL** from Okta
* Fill in attribute mappings:

| Your attributes (from Okta) | LocalStack attributes |
| --------------------------- | --------------------- |
| email                       | Email                 |
| firstName                   | First Name            |
| lastName                    | Last Name             |

Once completed, LocalStack will display:

* **Callback URL**
* **Identifier (Entity Id)**
* **Sign Up Portal URL**

These values are used in the Okta app configuration and for distributing the signup link to end-users.

![Place Okta Metadata URL in LocalStack UI](/images/aws/import-metadata-file.png)

### 5. Assign Users to the Okta Application

Ensure that the correct users and groups have access to the Okta SAML app. Only assigned users will be able to authenticate into LocalStack via SSO.



## SSO for JumpCloud

This example outlines the required configuration when using **JumpCloud** as a SAML Identity Provider for LocalStack.

### 1. Create a Custom SAML Application

In the JumpCloud Admin Portal:

1. Go to **SSO Applications → Add New Application**
2. Select **Custom Application**
3. Open **Manage Single Sign-On (SSO)** and choose **Configure SSO with SAML**

![JumpCloud Admin Portal Custom Application](/images/aws/jumpcloud-step1.jpg)


### 2. Map Required Fields

Copy the fields from the LocalStack SSO configuration screen into the corresponding JumpCloud fields.

| JumpCloud field   | LocalStack value       |
| ----------------- | ---------------------- |
| **IdP Entity ID** | Identity provider name |
| **SP Entity ID**  | Identifier (Entity Id) |
| **ACS URLs**      | Callback URL           |
| **Login URL**     | Sign Up Portal         |

![JumpCloud Map Required Fields](/images/aws/jumpcloud-step2.png)


### 3. Attribute Mapping

Add the following user attributes:

| Service Provider Attribute | JumpCloud Attribute |
| -------------------------- | ------------------- |
| email                      | email               |
| firstname                  | firstname           |
| lastname                   | lastname            |


### 4. Required Options

Ensure the following options are enabled:

* **Declare Redirect Endpoint**
* **Include Group Attribute** with the name:

  ```
  memberOf
  ```

![JumpCloud Map Required Fields](/images/aws/jumpcloud-step4.png)


### 5. Assign Users

Save the application and assign users or groups who should access LocalStack via SSO.



## SSO for Google Workspace

This example outlines the required configuration when using **Google Workspace** as a SAML Identity Provider for LocalStack.

### 1. Create a custom SAML app

In the Google Workspace Admin Console, navigate to **Apps → Web and mobile apps** in the left side menu.

![Navigate to Web and mobile apps in Google Workspace Admin Console](/images/aws/google-sso/google-sso-1.png)

Select **Add app**, then **Add custom SAML app**.

![Add a custom SAML app in Google Workspace](/images/aws/google-sso/google-sso-2.png)

Fill out a name for your custom app (e.g., "LocalStack"), then continue to the next page and download the IdP metadata file. You'll upload this to LocalStack in a later step.

![Download the IdP metadata file from Google Workspace](/images/aws/google-sso/google-sso-3.png)

### 2. Configure service provider details

Navigate to our web application, or follow this [link](https://app.localstack.cloud/workspace/sso), and create a new Identity provider to retrieve your **Callback URL** and **Identifier (Entity Id)**.

![Callback URL and Identifier (Entity Id) in the LocalStack Web Application](/images/aws/google-sso/google-sso-4.png)

Back in the Google SAML app wizard, on the **Service provider details** step:

* Paste the Callback URL into **ACS URL**
* Paste the Identifier (Entity Id) into **Entity ID**
* Set **Name ID format** to `EMAIL`
* Set **Name ID** to `Basic Information > Primary email`

![Google Workspace Service provider details, including ACS URL, Entity ID, and Name ID](/images/aws/google-sso/google-sso-5.png)

Example mapping:

| LocalStack name        | Google field name |
| ----------------------- | ------------------ |
| Callback URL            | ACS URL             |
| Identifier (Entity Id)  | Entity ID           |

### 3. Configure SAML attribute mapping

On the **Attribute mapping** step, map the following Google Directory attributes to service provider attributes:

| Google Directory attribute        | App attribute |
| ---------------------------------- | -------------- |
| Basic Information > First name     | `firstName`    |
| Basic Information > Last name      | `lastName`     |
| Basic Information > Primary email  | `email`        |

![Google Workspace Attribute mapping](/images/aws/google-sso/google-sso-6.png)

### 4. Configure LocalStack Identity Provider

In the LocalStack SSO configuration screen:

* Select **Provider type: SAML**
* Enter an **Identity provider name** (e.g., "Google-Workspace")
* Upload the metadata file you downloaded from Google in step 1

![Uploading the Google Workspace metadata file in the LocalStack Web Application](/images/aws/google-sso/google-sso-7.png)

Then fill in the attribute mappings:

| Your attributes (from Google) | LocalStack attributes |
| ------------------------------ | ----------------------- |
| email                          | Email                   |
| firstName                      | First Name               |
| lastName                       | Last Name                |

![Attribute mapping in the LocalStack Web Application](/images/aws/google-sso/google-sso-8.png)

### 5. Assign Users to the Google Workspace Application

Ensure the correct users and groups have access to the custom SAML app in Google Workspace. Only assigned users will be able to authenticate into LocalStack via SSO.



## Attribute mapping

These attributes can be defined to automatically map attributes of user entities in your internal IdP to user attributes in the LocalStack platform.

The following user attribute mappings can currently be configured:

- Email
- First name
- Last name

The Email should be configured to ensure correct functionality.

![Attribute Mapping](/images/aws/attribute-mapping.png)

## Callback URL, Sign Up Portal URL and Identifier (Entity Id)

After configuring the base details for your Identity Provider (IdP), the following additional information can be copied from the UI:

- **Callback URL**: The Callback URL that you may need to configure  in the settings of your IdP.
- **Identifier (Entity Id)**: The Identifier (Entity Id) that you may need to configure in the settings of your IdP.
- **Sign Up Portal URL**: This is the URL that can be shared with your users to start the SSO signup flow for the LocalStack Web Application.
  The format of this endpoint is `https://app.localstack.cloud/auth/sso/<organizationId>/<ssoName>`

![Callback URL, Sign Up Portal URL, and Identifier (Entity Id)](/images/aws/additional-information-page.png)

## Strict SSO Mode

Strict SSO Mode is an optional security enhancement that requires all members of your organization to authenticate exclusively through the configured Identity Provider (IdP). Once enabled, standard username/password login is disabled for your organization and the configured IdP becomes the only permitted way to sign in.

This provides two key security benefits:

- **Leaked credential protection**: Even if a user's LocalStack password is compromised, attackers cannot log in without going through your IdP.
- **Revocation enforcement**: When an employee's account is removed or suspended in your IdP, they immediately lose access to LocalStack.

### Enabling Strict SSO Mode

To enable strict mode, open the identity provider configuration in your LocalStack Web Application profile settings under **Single Sign-on**, and toggle the **Enable Strict SSO Mode** checkbox in the identity provider settings.

:::caution
Before enabling strict mode, ensure all team members have linked their accounts to the configured Identity Provider. Once strict mode is active, any user who has not completed SSO setup will be unable to sign in via password.
:::

## User Roles and Permissions

For each new member that joins your org, you can specify user roles and permissions that should be assigned to them.
- **Default User Role**:  The Role that should be assigned to users of your organization signing up via SSO.
  In most cases, this should be a Member.
- **Default User Permissions**: Use this to define which permissions should be assigned to users of your organization signing up via SSO.
  - Tip: In order to enable self-serve licences (i.e., allowing your users to allocate themselves their own license), make sure to select the **Allow member to issue a license for themselves** permission.


![User Roles and Permissions](/images/aws/roles-permissions.png)
