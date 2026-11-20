import { Content, Header, Page, Link } from '@backstage/core-components';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';

const graph = (ref: string, relations: string[]) => `/catalog-graph?rootEntityRefs%5B%5D=${encodeURIComponent(ref)}&maxDepth=3&${relations.map(r => `selectedRelations%5B%5D=${r}`).join('&')}`;
export default function DemoHome() {
  return (
    <Page themeId="home">
      <Header title="AI Platform infrastructure" subtitle="Services, deployments, hosting and declared dependencies" />
      <Content>
        <Box mb={3}><Typography>Repository-configuration baseline from the infrastructure inventory. This is not a verified inventory of running services. Owners, effective settings and failure impact remain unverified.</Typography></Box>
        <Grid container spacing={3}>
          {(['dev', 'prod'] as const).map(env => (
            <Grid item xs={12} md={6} key={env}><Card variant="outlined"><CardContent>
              <Typography variant="overline">{env === 'dev' ? 'Development' : 'Production'} environment</Typography>
              <Typography variant="h5" gutterBottom>AI Platform / {env.toUpperCase()}</Typography>
              <Typography paragraph>Open WebUI, LiteLLM, Pipelines, Langfuse, Deep Research, M365, Revit services, Cutsheet to CAD and terminal orchestration. {env === 'dev' ? 'Repository Search and Codes Library are also declared in DEV.' : 'Separate master and worker deployments are retained.'}</Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 20 }}>
                <Link to={`/catalog/ai-platform/system/platform-${env}`}>Explore environment</Link>
                <Link to={`/catalog/ai-platform/component/open-webui-${env}`}>Open WebUI</Link>
                <Link to={graph(`component:ai-platform/open-webui-${env}`, ['dependsOn','dependencyOf'])}>Dependency graph</Link>
                <Link to={graph(`resource:ai-platform/aks-cluster-${env}`, ['runsOn','hosts'])}>AKS hosting graph</Link>
              </Box>
            </CardContent></Card></Grid>
          ))}
          <Grid item xs={12} md={6}><Card variant="outlined"><CardContent>
            <Typography variant="h6" gutterBottom>Change impact / PROD</Typography>
            <Typography paragraph>LiteLLM has declared direct dependents Open WebUI and Cutsheet to CAD. Revit Addin API and RevitCopilot are indirect dependents through declared chains. This models dependencies, not observed outage behavior.</Typography>
            <Box display="flex" flexWrap="wrap" style={{ gap: 20 }}>
              <Link to={graph('component:ai-platform/litellm-prod', ['dependencyOf'])}>LiteLLM dependents</Link>
              <Link to={graph('resource:ai-platform/postgres-prod', ['dependencyOf'])}>PostgreSQL dependents</Link>
              <Link to={graph('resource:ai-platform/tools-vm-prod', ['runsOn','hosts'])}>Tools VM hosting</Link>
            </Box>
          </CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card variant="outlined"><CardContent>
            <Typography variant="h6" gutterBottom>Evidence and relationship semantics</Typography>
            <Typography paragraph>partOf means containment; dependsOn means a declared dependency; runsOn/hosts preserves hosting separately. supports indicates a companion/integration relationship, not a confirmed dependency. Permission-only connections remain distinct.</Typography>
            <Typography paragraph>Logical records are not deployments. Firecrawl startup/hosting and Langfuse LLM-as-a-judge configuration are unverified. Source observations, deployment details and relationship evidence are retained in each entity's YAML.</Typography>
            <Link to="/catalog">Browse catalog</Link>
          </CardContent></Card></Grid>
        </Grid>
      </Content>
    </Page>
  );
}
