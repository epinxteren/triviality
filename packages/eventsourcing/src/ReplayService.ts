import { Subject } from 'rxjs';
import { EventStore } from './EventStore/EventStore';
import { EventBus } from './EventHandling/EventBus';
import { SimpleDomainEventStream } from './Domain/SimpleDomainEventStream';
import { DomainMessage } from './Domain/DomainMessage';

export class ReplayService {

  constructor(private readonly eventStore: EventStore,
              private readonly messageBus: EventBus) {
  }

  public async replay(): Promise<void> {
    return new Promise<void>((accept, reject) => {
      const subject = new Subject<DomainMessage>();
      this.messageBus.publish(new SimpleDomainEventStream(subject));
      const stream = this.eventStore.loadAll();
      stream.subscribe(subject.next.bind(subject), reject, () => {
        subject.complete();
        accept();
      });
    });
  }

}
