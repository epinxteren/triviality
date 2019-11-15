import { ContainerFactory } from './ContainerFactory';

export * from './Container';
export * from './Context';
export * from './FeatureFactory';
export * from './ServiceFactory';
export * from './Features';
export * from './ContainerFactory';

export const triviality = ContainerFactory.create;
export default triviality;
