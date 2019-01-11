/**
 * @file
 *
 * Moved Feature types to this file instead of Feature.ts, so users won't be distracted of complex types they don't need to use.
 */

import { NoDuplicates, Omit, PromiseType } from '../util/Types';
import { Feature } from '../Feature';
import { HasRegistries, RegistriesMap } from './Registry';

export const FeatureExcludes: Array<keyof Feature> = [('container') as any, 'registries', 'setup', 'serviceOverrides'];

/**
 * Define type with all registries as optional and allow new registries to be defined.
 */
export type FeatureOptionalRegistries<C, R> = Feature<C, R & RegistriesMap>;

/**
 * Feature constructor with type guard it never return a duplicate service of the container.
 */
export type FeatureConstructor<T, Container, Registries> = new (container: Container & HasRegistries<Registries>) => T & NoDuplicates<Container>;

/**
 * Only return the feature service types.
 */
export type FeatureServices<T extends Feature> = T extends { container: any } ? Omit<T, 'container' | 'registries' | 'setup' | 'serviceOverrides'> : Omit<T, 'registries' | 'setup' | 'serviceOverrides'>;

/**
 * Return type of feature registries.
 */
export type FeatureRegistries<T extends Feature> = T extends HasRegistries<{}> ? PromiseType<ReturnType<NonNullable<T['registries']>>> : {};

/**
 * Feature can be null. {@see FeatureServices}
 */
export type OptionalFeatureServices<T extends (null | Feature)> = T extends null ? {} : FeatureServices<NonNullable<T>>;

/**
 * Feature can be null. {@see FeatureRegistries}
 */
export type OptionalFeatureRegistries<T extends (null | Feature)> = T extends null ? {} : FeatureRegistries<NonNullable<T>>;
