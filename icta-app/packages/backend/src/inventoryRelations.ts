import { createBackendModule } from '@backstage/backend-plugin-api';
import { Entity, getCompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { CatalogProcessor, catalogProcessingExtensionPoint, processingResult } from '@backstage/plugin-catalog-node';

class InventoryRelationsProcessor implements CatalogProcessor {
  getProcessorName() { return 'InventoryRelationsProcessor'; }
  async postProcessEntity(entity: Entity, _location: any, emit: any): Promise<Entity> {
    if (entity.metadata.namespace !== 'ai-platform') return entity;
    const source = getCompoundEntityRef(entity);
    const edges = (entity.spec?.inventoryRelations ?? []) as unknown as Array<{type: string; target: string}>;
    const inverse: Record<string, string> = { partOf: 'hasPart', dependsOn: 'dependencyOf', runsOn: 'hosts', supports: 'supportedBy', permittedToDependOn: 'permitsDependencyFrom' };
    for (const edge of edges) {
      if (!inverse[edge.type]) throw new Error(`Unknown inventory relation ${edge.type}`);
      const target = parseEntityRef(edge.target);
      emit(processingResult.relation({ source, type: edge.type, target }));
      emit(processingResult.relation({ source: target, type: inverse[edge.type], target: source }));
    }
    return entity;
  }
}
export default createBackendModule({
  pluginId: 'catalog', moduleId: 'ai-platform-inventory-relations',
  register(env) { env.registerInit({
    deps: { processing: catalogProcessingExtensionPoint },
    async init({ processing }) { processing.addProcessor(new InventoryRelationsProcessor()); },
  }); },
});
