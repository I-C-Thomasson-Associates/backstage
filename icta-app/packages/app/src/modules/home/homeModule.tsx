import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { HomePageLayoutBlueprint } from '@backstage/plugin-home-react/alpha';

const demoLayout = HomePageLayoutBlueprint.make({
  params: {
    loader: () => import('./DemoHome').then(m => m.default),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [demoLayout],
});
