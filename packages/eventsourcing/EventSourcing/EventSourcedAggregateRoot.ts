import { EventSourcedEntity } from './EventSourcedEntity';
import { Identity } from '../ValueObject/Identity';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { DomainEvent } from '../Domain/DomainEvent';
import { SimpleDomainEventStream } from '../Domain/SimpleDomainEventStream';
import { DomainMessage } from '../Domain/DomainMessage';

export type EventSourcedAggregateRootConstructor<T extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> = new(id: Id) => T;

export function isEventSourcedAggregateRootConstructor(constructor: any): constructor is EventSourcedAggregateRootConstructor<any> {
  return typeof constructor === 'function' && constructor.prototype instanceof EventSourcedAggregateRoot;
}

export class EventSourcedAggregateRoot<Id extends Identity = Identity> extends EventSourcedEntity {

  private playhead = -1;
  private uncommittedEvents: DomainMessage[] = [];

  constructor(public readonly aggregateId: Id) {
    super(null as any);
  }

  public getAggregateRootId(): Id {
    return this.aggregateId;
  }

  public getUncommittedEvents(): DomainEventStream {
    const stream = SimpleDomainEventStream.of(this.uncommittedEvents);
    this.uncommittedEvents = [];
    return stream;
  }

  /**
   * Initializes the aggregate using the given "history" of events.
   */
  public async initializeState(stream: DomainEventStream) {
    await stream.forEach(message => {
      this.playhead += 1;
      this.handleRecursively(message.payload);
    });
  }

  protected apply(event: DomainEvent) {
    this.handleRecursively(event);
    this.playhead += 1;
    this.uncommittedEvents.push(DomainMessage.recordNow(
      this.aggregateId,
      this.playhead,
      event,
    ));
  }

  protected handleRecursively(event: DomainEvent) {
    super.handleRecursively(event, this as any);
  }

}
