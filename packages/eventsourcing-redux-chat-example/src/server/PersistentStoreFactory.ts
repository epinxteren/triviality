import { StoreFactory } from 'eventsourcing-redux-bridge/Redux/Store/StoreFactory';
import { AnyAction, Store, StoreEnhancer } from 'redux';
import { ValueStoreInterface } from './ValueStoreInterface';

export class PersistentStoreFactory<S, A extends AnyAction> {

  constructor(private factory: StoreFactory<S, any>, private keyValueStore: ValueStoreInterface<S>) {

  }

  public create(enhancer?: StoreEnhancer): Store<S, A> {
    const state = this.keyValueStore.get();
    if (state) {
      return this.attachListener(this.factory.createFromState(state as any, enhancer));
    }
    return this.attachListener(this.factory.create(enhancer));
  }

  private attachListener(store: Store<S, A>) {
    store.subscribe(() => {
      this.keyValueStore.set(store.getState());
    });
    return store;
  }
}
