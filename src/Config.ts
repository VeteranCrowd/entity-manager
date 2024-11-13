import type {
  ConditionalProperty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  Exactify,
  FlattenEntityMap,
  PropertiesOfType,
  TranscodableProperties,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeMap, // imported to support API docs
  Transcodes,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ShardBump } from './ShardBump';

/**
 * Configuration object for an {@link EntityManager | `EntityManager`} instance.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines the configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 */
export type Config<C extends BaseConfigMap = BaseConfigMap> =
  ConditionalProperty<
    'entities',
    keyof Exactify<C['EntityMap']>,
    {
      [E in keyof Exactify<C['EntityMap']>]: {
        defaultLimit?: number;
        defaultPageSize?: number;
        shardBumps?: ShardBump[];
        timestampProperty: C['TranscodedProperties'] &
          PropertiesOfType<C['EntityMap'][E], number> &
          TranscodableProperties<C['EntityMap'], C['TranscodeMap']>;
        uniqueProperty: C['TranscodedProperties'] &
          keyof C['EntityMap'][E] &
          TranscodableProperties<C['EntityMap'], C['TranscodeMap']>;
      };
    }
  > &
    ConditionalProperty<
      'generatedProperties',
      C['ShardedKeys'] | C['UnshardedKeys'],
      ConditionalProperty<
        'sharded',
        C['ShardedKeys'],
        Record<
          C['ShardedKeys'],
          (C['TranscodedProperties'] &
            TranscodableProperties<C['EntityMap'], C['TranscodeMap']>)[]
        >
      > &
        ConditionalProperty<
          'unsharded',
          C['UnshardedKeys'],
          Record<
            C['UnshardedKeys'],
            (C['TranscodedProperties'] &
              TranscodableProperties<C['EntityMap'], C['TranscodeMap']>)[]
          >
        >
    > &
    ConditionalProperty<
      'propertyTranscodes',
      C['TranscodedProperties'] &
        TranscodableProperties<C['EntityMap'], C['TranscodeMap']>,
      {
        [P in C['TranscodedProperties'] &
          TranscodableProperties<
            C['EntityMap'],
            C['TranscodeMap']
          >]: PropertiesOfType<
          C['TranscodeMap'],
          FlattenEntityMap<C['EntityMap']>[P]
        >;
      }
    > &
    ConditionalProperty<
      'transcodes',
      keyof C['TranscodeMap'],
      Transcodes<C['TranscodeMap']>
    > & {
      generatedKeyDelimiter?: string;
      generatedValueDelimiter?: string;
      hashKey: C['HashKey'];
      indexes?: Record<
        string,
        {
          hashKey: C['HashKey'] | C['ShardedKeys'];
          rangeKey:
            | C['RangeKey']
            | C['UnshardedKeys']
            | (C['TranscodedProperties'] &
                TranscodableProperties<C['EntityMap'], C['TranscodeMap']>);
          projections?: string[];
        }
      >;
      rangeKey: C['RangeKey'];
      shardKeyDelimiter?: string;
      throttle?: number;
    };
