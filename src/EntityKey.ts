// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Database-facing record key type from a {@link BaseConfigMap | `ConfigMap`} with required hash & range keys.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 * @protected
 */
export type EntityKey<C extends BaseConfigMap> = Record<
  C['HashKey'] | C['RangeKey'],
  string
>;
