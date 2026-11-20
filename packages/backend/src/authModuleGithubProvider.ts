/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { findAllowedOrg } from './githubOrgMembership';

export default createBackendModule({
  pluginId: 'auth',
  moduleId: 'githubProvider',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ providers, config, logger }) {
        // ICTA: only members of these orgs may sign in (see githubOrgMembership.ts).
        const apiUrl =
          config.getOptionalString('icta.githubSignIn.apiUrl') ??
          'https://api.github.com';
        const allowedOrgs =
          config.getOptionalStringArray('icta.githubSignIn.allowedOrgs') ?? [];
        // Explicit opt-out for hosts where every account is an employee (GHE.com managed users).
        const allowAnyUser =
          config.getOptionalBoolean('icta.githubSignIn.allowAnyUser') ?? false;
        providers.registerProvider({
          providerId: 'github',
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,
            async signInResolver({ result: { fullProfile, session } }, ctx) {
              const userId = fullProfile.username;
              if (!userId) {
                throw new Error(
                  `GitHub user profile does not contain a username`,
                );
              }

              const org =
                allowAnyUser ||
                (await findAllowedOrg({
                  apiUrl,
                  accessToken: session.accessToken,
                  allowedOrgs,
                }));
              if (!org) {
                logger.warn(`Rejected GitHub sign-in for ${userId}`);
                throw new Error(
                  'Sign-in requires membership in an allowed GitHub organization',
                );
              }

              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: userId,
                namespace: DEFAULT_NAMESPACE,
              });

              return ctx.issueToken({
                claims: {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                },
              });
            },
          }),
        });
      },
    });
  },
});
