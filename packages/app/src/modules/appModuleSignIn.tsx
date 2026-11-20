import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { SignInPage } from '@backstage/core-components';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

// ICTA: replace the default guest-only sign-in page with GitHub (Enterprise).
export const appModuleSignIn = createFrontendModule({
  pluginId: 'app',
  extensions: [
    SignInPageBlueprint.make({
      params: {
        loader: async () => props =>
          (
            <SignInPage
              {...props}
              provider={{
                id: 'github-auth-provider',
                title: 'GitHub',
                message: 'Sign in with your GitHub account',
                apiRef: githubAuthApiRef,
              }}
            />
          ),
      },
    }),
  ],
});
