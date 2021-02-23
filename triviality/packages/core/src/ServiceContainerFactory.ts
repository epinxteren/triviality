import {
  FF, UFF
} from './Value';
import {retryUntilNoAsyncErrors} from "./Error";
import {GlobalInvokeStack} from "./GlobalInvokeStack";
import {FeatureGroupFactoryInterface} from "./FeatureGroupFactoryInterface";
import {FeatureGroupFactory} from "./FeatureGroupFactory";
import {KernelFeatureServices} from "./Feature";

export interface BuildOptions {
  validate: boolean;
  name: string;
}

/**
 * Immutable container factory.
 */
export class ServiceContainerFactory<S extends KernelFeatureServices> {
  public static create = (options?: BuildOptions): ServiceContainerFactory<KernelFeatureServices> => {
    return new ServiceContainerFactory<KernelFeatureServices>(
      new FeatureGroupFactory(),
      options
    );
  };

  protected featureFactories: UFF[] = [];

  public constructor(protected featureGroupFactory: FeatureGroupFactoryInterface,
                     protected options: BuildOptions = {validate: true, name: 'root'}) {
  }

  /**
   * Merge functional service factory.
   */
  public add<Services, Deps extends Partial<S>>(f1: FF<Services, Deps>): ServiceContainerFactory<S & Services> {
    const container = new ServiceContainerFactory(new FeatureGroupFactory(), this.options);
    container.featureFactories = [...this.featureFactories, f1] as UFF[];
    return container as ServiceContainerFactory<S & Services>;
  }

  public async build(): Promise<S> {
    const featureGroup = this.featureGroupFactory.build<S>(this.featureFactories, this.options.name);
    await featureGroup.compile();
    const container: Record<string, unknown> = {};
    for (const [name, sfr] of Object.entries(featureGroup.references)) {
      Object.defineProperty(container, name, {get: sfr as () => unknown});
    }
    return container as unknown as S;
  }
}
