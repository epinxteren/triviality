import { DomainEventConstructor } from '../Domain/DomainEvent';
import { filterByDecoratedHandlers } from './reactive/operators/filterByDecoratedHandlers';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { concatMap } from 'rxjs/operators';
import { handleByDecoratedHandlers } from './reactive/operators/handleByDecoratedHandlers';
import { SubscribeAwareEventListener } from './EventListener';

export const eventListenersDomainEvents = (listener: SubscribeAwareEventListener): DomainEventConstructor[] => {
  if (!listener.listenTo) {
    listener.listenTo = filterByDecoratedHandlers(listener);
  }
  return listener.listenTo();
};

export const subscribeByOfEventListener = (listener: SubscribeAwareEventListener): (events: DomainEventStream) => DomainEventStream => {
  if (!listener.subscribeBy) {
    listener.subscribeBy = (input) => input.pipe(concatMap(handleByDecoratedHandlers(listener)));
  }
  return listener.subscribeBy;
};
