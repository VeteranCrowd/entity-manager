/**
 * @module entity-manager
 */
export type {
  Config,
  ConfigEntities,
  ConfigEntity,
  ConfigEntityGenerated,
  ConfigKeys,
  ConfigTranscodes,
  EntityMap,
  ExclusiveKey,
  ItemMap,
  ShardBump,
  Unwrap,
} from './Config';
export { EntityManager } from './EntityManager';
export type { ParsedConfig } from './ParsedConfig';
export type { QueryOptions } from './QueryOptions';
export type { QueryResult } from './QueryResult';
export type { ShardQueryFunction } from './ShardQueryFunction';
export type { ShardQueryResult } from './ShardQueryResult';
export type {
  DefaultTranscodeMap,
  defaultTranscodes,
  Entity,
  PropertiesOfType,
  SortOrder,
  TranscodableProperties,
  TranscodeMap,
  Transcodes,
} from '@karmaniverous/entity-tools';
