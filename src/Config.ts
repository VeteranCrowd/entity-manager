import type {
  Entity,
  Exactify,
  PropertiesOfType,
  StringifiableTypes,
  TypeMap,
} from '@karmaniverous/entity-tools';

/**
 * The base EntityMap type. All EntityMaps should extend this type.
 */
export type EntityMap = Record<string, Entity>;

/**
 * Tests a string literal type to determine whether it is a key of any {@link Entity | `Entity`} in an {@link EntityMap | `EntityMap`} or is a member of a union of reserved keys.
 *
 * @typeParam K - The string literal type to test.
 * @typeParam M - The {@link EntityMap | `EntityMap`}.
 * @typeParam R - The reserved set of string literal types.
 *
 * @returns `K` if `K` is exclusive or `never` otherwise.
 */
export type ExclusiveKey<
  K extends string,
  M extends EntityMap,
  R extends string = never,
> = keyof {
  [E in keyof Exactify<M> as K extends keyof Exactify<M[E]> | R
    ? K
    : never]: never;
} extends never
  ? K
  : never;

/**
 * Extracts a union of indexable property names from an Entity in an EntityMap.
 *
 * @typeParam EntityToken - The {@link Entity | `Entity`} token.
 * @typeParam M - The {@link EntityMap | `EntityMap`}.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed.
 */
export type IndexableProperties<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  IndexableTypes extends TypeMap,
> = PropertiesOfType<
  M[EntityToken],
  IndexableTypes[keyof Exactify<IndexableTypes>]
>;

/**
 * Returns the `generated` property of a Config entity.
 *
 * @typeParam EntityToken - The {@link Entity | `Entity`} token.
 * @typeParam M - The {@link EntityMap | `EntityMap`}.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed.
 *
 * @remarks
 * All Entity properties of type `never` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityGenerated<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  IndexableTypes extends TypeMap,
> =
  | ([PropertiesOfType<M[EntityToken], never>] extends [never]
      ? never
      : Record<
          PropertiesOfType<M[EntityToken], never>,
          {
            atomic?: boolean;
            elements: IndexableProperties<EntityToken, M, IndexableTypes>[];
            sharded?: boolean;
          }
        >)
  | ([PropertiesOfType<M[EntityToken], never>] extends [never]
      ? Record<string, never>
      : never);

/**
 * Returns the `types` property of a Config entity.
 *
 * @typeParam EntityToken - The {@link Entity | `Entity`} token.
 * @typeParam M - The {@link EntityMap | `EntityMap`}.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed..
 *
 * @remarks
 * This property supports typing of values decoded from generated properties.
 *
 * All Entity properties of types `string`, `number`, `boolean`, or `bigint` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityTypes<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  IndexableTypes extends TypeMap,
> =
  | ([IndexableProperties<EntityToken, M, IndexableTypes>] extends [never]
      ? never
      : Record<
          IndexableProperties<EntityToken, M, IndexableTypes>,
          keyof IndexableTypes
        >)
  | ([IndexableProperties<EntityToken, M, IndexableTypes>] extends [never]
      ? Record<string, never>
      : never);

/**
 * Defines a single time period in an {@link Entity | `Entity`} sharding strategy.
 */
export interface ShardBump {
  /**
   * The timestamp marking the beginning of the time period. Must be a non-negative integer.
   *
   * This value must be unique across all {@link ShardBump | `ShardBumps`} for the {@link Entity | `Entity`}.
   */
  timestamp: number;

  /**
   * The number of bits per character in the bump's shard space. For example, `0` yields a single shard per character, and a value of `2` would yield 4 shards per character.
   *
   * This value must be an integer between `1` and `5` inclusive.
   */
  charBits: number;

  /**
   * The number of characters used to represent the bump's shard key.
   *
   * This value must be an integer between `0` and `40` inclusive. Note that more than a few characters will result in an impossibly large shard space!   *
   * A ShardBump with `chars` of `2` and `charBits` of `3` would yield a two-character shard key with a space of 16 shards.
   */
  chars: number;
}

/**
 * Returns a Config entity type.
 *
 * @typeParam EntityToken - The {@link Entity | `Entity`} token.
 * @typeParam M - The {@link EntityMap | `EntityMap`}.
 * @typeParam HashKey - The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam RangeKey - The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed. Only {@link Entity | `Entity`} properties of these types can be components of an {@link ConfigEntity.indexes | index} or a {@link ConfigEntityGenerated | generated property}. 

 * @remarks
 * `generated` is optional if `E` has no properties of type `never`.
 */
export type ConfigEntity<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
> = {
  /**
   * The default maximum number of records to return from a query.
   *
   * @defaultValue `10`
   *
   * @remarks
   * Can be overridden at {@link QueryOptions.limit | `QueryOptions.limit`}.
   *
   * In cross-shard queries, the actual number of records returned is heavily influenced by {@link QueryOptions.pageSize | query pageSize} and the number of shards queried. Actual results may significantly exceed this limit.
   */
  defaultLimit?: number;

  /**
   * The default maximum number of records to return per data page on an individual shard query.
   *
   * @defaultValue `10`
   *
   * @remarks
   * Shard queries will be repeated internally until either the shard is exhausted or the number of records returned exceeds the {@link QueryOptions.limit | query limit}.
   *
   * Can be overridden at {@link QueryOptions.pageSize | `QueryOptions.pageSize`}.
   */
  defaultPageSize?: number;

  /**
   * Indexes defined for the {@link Entity | `Entity`}. Should reflect the underlying database table indexes.
   *
   * Each key is the name of an index, and each value is a non-empty array of {@link Entity | `Entity`} property names that define the index.
   *
   * Related property types must be align with the {@link Config | `Config`} `IndexableTypes` type parameter. Note tha all {@link ConfigEntityGenerated | generated property} types are indexable by definition.
   */
  indexes?: Record<
    string,
    (
      | IndexableProperties<EntityToken, M, IndexableTypes>
      | PropertiesOfType<M[EntityToken], never>
      | HashKey
      | RangeKey
    )[]
  >;

  /**
   * An array of {@link ShardBump | `ShardBump`} objects representing the {@link Entity | `Entity`}'s sharding strategy.
   *
   * If omitted, or if configured without a zero-{@link ShardBump.timestamp | `timestamp`} {@link ShardBump | `ShardBump`}, this array will be initialized with the following {@link ShardBump | `ShardBump`} as its first member:
   *
   * ```
   * { timestamp: 0, charBits: 0, chars: 1 }
   * ```
   *
   * Members must be unique by {@link ShardBump.timestamp | `timestamp`}.
   *
   * {@link ShardBump.chars | `chars`} must increase monotonically with {@link ShardBump.timestamp | `timestamp`}
   *
   * Array will be sorted in ascending order by {@link ShardBump.timestamp | `timestamp`} on initialization.
   *
   * Future {@link ShardBump | `ShardBumps`} can be changed as required, but past {@link ShardBump | `ShardBumps`} should not be modified or data integrity will be compromised!
   */
  shardBumps?: ShardBump[];

  /**
   * Identifies the {@link Entity | `Entity`} property used as the timestamp for shard key calculations.
   *
   * This property must be of type `number`. Its value should not change over the life of the record. A `created` timestamp is ideal.
   *
   * Once in production, this configuration property should not be changed or data integrity will be compromised!
   */
  timestampProperty: PropertiesOfType<M[EntityToken], number>;

  /**
   * Identifies the {@link Entity | `Entity`} used as the basis for both shard key calculations and the table's {@link ConfigKeys.rangeKey | range key}.
   *
   * This property must be of type `string` or `number`. Its value should be a unique record identifier and should not change over the life of the record.
   *
   * Once in production, this configuration property should not be changed or data integrity will be compromised!
   */
  uniqueProperty: PropertiesOfType<M[EntityToken], number | string>;
} & ([PropertiesOfType<M[EntityToken], never>] extends [never]
  ? {
      generated?: ConfigEntityGenerated<EntityToken, M, IndexableTypes>;
    }
  : {
      /**
       * {@link Entity | `Entity`} properties whose values will be generated by EntityManager.
       *
       * These properties should be indicated by a `never` type in the {@link Config | `Config`} `EntityMap` type parameter.
       *
       * All such properties must be accounted for in the `generated` object, and no additional properties are permitted..
       */
      generated: ConfigEntityGenerated<EntityToken, M, IndexableTypes>;
    }) &
  ([IndexableProperties<EntityToken, M, IndexableTypes>] extends [never]
    ? { types?: ConfigEntityTypes<EntityToken, M, IndexableTypes> }
    : {
        /**
         * This object defines that types of {@link Entity | `Entity`} indexable properties in a way that is accessible at runtime. It is used to rehydrate PageKeyMap objects from highly compressed, URL-safe string values.
         *
         * The keys of this object must exactly match the indexable properties of the {@link Entity | `Entity`}. Note that all {@link ConfigEntityGenerated | generated properties} are indexable by definition and need not be included.
         *
         * The values of this object must be one of the keys of the {@link Config | `Config`} `IndexableTypes` type parameter, and should match the associted property type.
         *
         * @example
         * ```
         * // Default indexable types.
         * interface StringifiableTypes extends TypeMap {
         *   string: string;
         *   number: number;
         *   boolean: boolean;
         *   bigint: bigint;
         * }
         *
         * interface MyEntityMap extends EntityMap {
         *   user: {
         *    created: number;
         *    data?: Json; // Not a Stringifiable type
         *    userId: string;
         *   };
         * }
         *
         * // IndexableTypes type param defaults to StringifiableTypes.
         * const config: Config<MyEntityMap> = {
         *   entities: {
         *     user: {
         *       ...,
         *       types: { // All Stringafiable properties required!
         *         created: 'number',
         *         userId: 'string',
         *         // 'data' not allowed: not a Stringifiable type
         *       }
         *     }
         *   },
         *   ...
         * };
         * ```
         */
        types: ConfigEntityTypes<EntityToken, M, IndexableTypes>;
      });

/**
 * Returns the `entities` property of the {@link Config | `Config`} tyoe.
 *
 * @typeParam M - The {@link EntityMap | `EntityMap`} type that identitfies the {@link Entity | `Entity`} & related property types to be managed by EntityManager.
 * @typeParam HashKey - The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam RangeKey - The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed. Only {@link Entity | `Entity`} properties of these types can be components of an {@link ConfigEntity.indexes | index} or a {@link ConfigEntityGenerated | generated property}.
 *
 * @remarks
 * All properties of `M` must be represented, and no extra properties are allowed.
 */
export type ConfigEntities<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
> =
  | ([keyof Exactify<M>] extends [never]
      ? never
      : {
          [E in keyof Exactify<M>]: ConfigEntity<
            E,
            M,
            HashKey,
            RangeKey,
            IndexableTypes
          >;
        })
  | Record<string, never>;

/**
 * Returns variably-optional properties of the {@link Config | `Config`} type as optional.

 * @typeParam M - The {@link EntityMap | `EntityMap`} type that identitfies the {@link Entity | `Entity`} & related property types to be managed by EntityManager.
 * @typeParam HashKey - The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam RangeKey - The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key. Must not conflict with any {@link Entity | `Entity`} property.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed. Only {@link Entity | `Entity`} properties of these types can be components of an {@link ConfigEntity.indexes | index} or a {@link ConfigEntityGenerated | generated property}. 
 */
export interface ConfigKeys<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
> {
  /**
   * Defines options for each {@link Entity | `Entity`} in the {@link Config | `Config`} `EntityMap` type parameter.
   *
   * The properties of this object must exactly match the keys of the {@link Config | `Config`} `EntityMap` type parameter.
   */
  entities?: ConfigEntities<M, HashKey, RangeKey, IndexableTypes>;

  /**
   * The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key.
   *
   * This value must exactly match the {@link Config | `Config`} `HashKey` type parameter, and must not conflict with any {@link Entity | `Entity`} property.
   *
   * @defaultValue `'hashKey'`
   */
  hashKey?: ExclusiveKey<HashKey, M, RangeKey>;

  /**
   * The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key.
   *
   * This value must exactly match the {@link Config | `Config`} `RangeKey` type parameter, and must not conflict with any {@link Entity | `Entity`} property.
   *
   * @defaultValue `'rangeKey'`
   */
  rangeKey?: ExclusiveKey<RangeKey, M, HashKey>;
}

/**
 * EntityManager Config type.
 *
 * @typeParam M - The {@link EntityMap | `EntityMap`} type that identitfies the {@link Entity | `Entity`} & related property types to be managed by EntityManager.
 * @typeParam HashKey - The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key. Must not conflict with any {@link Entity | `Entity`} property. Defaults to `'hashKey'`.
 * @typeParam RangeKey - The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key. Must not conflict with any {@link Entity | `Entity`} property. Defaults to `'rangeKey'`.
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed. Only {@link Entity | `Entity`} properties of these types can be components of an {@link ConfigEntity.indexes | index} or a {@link ConfigEntityGenerated | generated property}. Defaults to {@link StringifiableTypes | `StringifiableTypes`}.
 *
 * @remarks
 * `entities` is optional if `M` is empty.
 */
export type Config<
  M extends EntityMap = Record<string, never>,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  IndexableTypes extends TypeMap = StringifiableTypes,
> = ([keyof Exactify<M>] extends [never]
  ? ConfigKeys<M, HashKey, RangeKey, IndexableTypes>
  : Required<ConfigKeys<M, HashKey, RangeKey, IndexableTypes>>) & {
  /**
   * Defines the delimiter used to separate key-value pairs in a generated property value.
   *
   * Must consist of one or more non-word characters, and must not intersect with {@link Config.generatedValueDelimiter | `generatedValueDelimiter`} or {@link Config.shardKeyDelimiter | `shardKeyDelimiter`}.
   *
   * @defaultValue `'|'`
   */
  generatedKeyDelimiter?: string;

  /**
   * Defines the delimiter used to separate keys & values in a generated property value.
   *
   * Must consist of one or more non-word characters, and must not intersect with {@link Config.generatedKeyDelimiter | `generatedKeyDelimiter`} or {@link Config.shardKeyDelimiter | `shardKeyDelimiter`}.
   *
   * @defaultValue `'#'`
   */
  generatedValueDelimiter?: string;

  /**
   * Defines the delimiter used to construct an Entity's hashKey value from its Entity key and shard key.
   *
   * Must consist of one or more non-word characters, and must not intersect with {@link Config.generatedKeyDelimiter | `generatedKeyDelimiter`} or {@link Config.generatedValueDelimiter | `generatedValueDelimiter`}.
   *
   * @defaultValue `'!'`
   */
  shardKeyDelimiter?: string;

  /**
   * The default maximum number of shards to query in parallel. Can be overridden at {@link QueryOptions.throttle | `QueryOptions.throttle`}.
   *
   * @defaultValue `10`
   */
  throttle?: number;
};

/**
 * Flattens the top layer of logic in a type.
 */
export type Unwrap<T> = { [P in keyof T]: T[P] };

/**
 * Extracts an {@link Entity | `Entity`} item type decorated with {@link ConfigKeys.hashKey | hashKey}, {@link ConfigKeys.rangeKey | rangeKey}, and {@link ConfigEntityGenerated | generated properties}.
 *
 * @typeParam EntityToken - The key of the {@link Entity | `Entity`} in `M`.
 * @typeParam M - The {@link EntityMap | `EntityMap`} type that identitfies the {@link Entity | `Entity`} & related property types to be managed by EntityManager.
 * @typeParam HashKey - The property used across the configuration to store an {@link Entity | `Entity`}'s sharded hash key. Should be configured as the table hash key. Must not conflict with any {@link Entity | `Entity`} property. Defaults to `'hashKey'`.
 * @typeParam RangeKey - The property used across the configuration to store an {@link Entity | `Entity`}'s range key. Should be configured as the table range key. Must not conflict with any {@link Entity | `Entity`} property. Defaults to `'rangeKey'`.
 */
export type EntityItem<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
> = Unwrap<
  {
    [P in keyof Exactify<M[EntityToken]>]: [
      NonNullable<M[EntityToken][P]>,
    ] extends [never]
      ? string
      : M[EntityToken][P];
  } & {
    [P in HashKey | RangeKey]?: string;
  }
>;
