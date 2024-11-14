import { unique } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { getIndexComponents } from './getIndexComponents';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Unwraps an {@link Config.indexes | index} into deduped, sorted, ungenerated index component elements.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 * @param omit - Array of index components or elements to omit from the output value.
 *
 * @returns Deduped, sorted array of ungenerated index component elements.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function unwrapIndex<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  indexToken: string,
  omit: string[] = [],
): C['TranscodedProperties'][] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);
    validateIndexToken(entityManager, indexToken);

    const { sharded, unsharded } = entityManager.config.generatedProperties;

    const unwrapped = unique(
      getIndexComponents(entityManager, indexToken)
        .filter((component) => !omit.includes(component))
        .map((component) =>
          component === entityManager.config.hashKey
            ? entityManager.config.entities[entityToken].timestampProperty
            : component === entityManager.config.rangeKey
              ? entityManager.config.entities[entityToken].uniqueProperty
              : component in sharded
                ? sharded[component]
                : component in unsharded
                  ? unsharded[component]
                  : component,
        )
        .flat()
        .filter((element) => !omit.includes(element)),
    ).sort() as C['TranscodedProperties'][];

    entityManager.logger.debug('unwrapped index', {
      entityToken,
      indexToken,
      omit,
      unwrapped,
    });

    return unwrapped;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        indexToken,
        omit,
      });

    throw error;
  }
}
