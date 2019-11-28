import { createImmutableContainer, createMutableLockableContainer, MutableContainer } from '../Container';
import { fromPairs, includes, keys } from 'ramda';
import { ComposeContext, createFeatureFactoryComposeContext } from './ComposeContext';
import { ConstructContext, createFeatureFactoryConstructContext } from './ConstructContext';
import { createFeatureFactoryOverrideContext, OverrideContext } from './OverrideContext';
import { createFeatureFactoryRegistryContext, RegistryContext } from './RegistryContext';
import { createFeatureFactoryServicesContext, ServicesContext } from './ServicesContext';
import { createServiceFactoryReferenceContext, ReferenceContext } from './ReferenceContext';
import { ServicesAsFactories, ServiceTag } from '../ServiceFactory';
import { createFeatureMergeContext, MergeFeatureContext } from './MergeFeatureContext';
import { invokeFeatureFactory } from '../invokeFeatureFactory';

export interface FeatureFactoryContext<T> extends ReferenceContext,
  RegistryContext<T>,
  ComposeContext<T>,
  ServicesContext<T>,
  ConstructContext<T>,
  OverrideContext<T>,
  MergeFeatureContext<T> {
}

export const createFeatureFactoryContext = <OwnServices, Dependencies>(container: MutableContainer, invoke: typeof invokeFeatureFactory):
  FeatureFactoryContext<OwnServices & Dependencies> & ServicesAsFactories<Dependencies> => ({
  ...fromPairs(container.services()),
  ...createServiceFactoryReferenceContext(container),
  ...createFeatureFactoryOverrideContext(container),
  ...createFeatureFactoryComposeContext(container),
  ...createFeatureFactoryServicesContext(container),
  ...createFeatureFactoryConstructContext(container),
  ...createFeatureFactoryRegistryContext(container),
  ...createFeatureMergeContext(container, invoke),
}) as any;

const FACTORY_CONTEXT_TAGS: string[] = keys(
  createFeatureFactoryContext(createMutableLockableContainer(createImmutableContainer()), () => null as any)) as any;

export const hasContextTag = (tag: ServiceTag) => includes(tag, FACTORY_CONTEXT_TAGS);
