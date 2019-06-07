/* tslint:disable:max-classes-per-file */

import { UuidIdentity } from '../ValueObject/UuidIdentity';
import { EventSourcingTestBench } from '../Testing';
import { DomainEvent } from '../Domain/DomainEvent';
import { Command } from '../CommandHandling/Command';
import { EventSourcedAggregateRoot } from '../EventSourcing/EventSourcedAggregateRoot';
import { CommandHandler } from '../CommandHandling/CommandHandler';
import { EventSourcingRepositoryInterface } from '../EventSourcing/EventSourcingRepositoryInterface';
import { HandleCommand } from '../CommandHandling/HandleCommand';
import { DomainMessage } from '../Domain/DomainMessage';
import { toArray } from 'rxjs/operators';
import { AggregateHandleEvent } from '../EventSourcing/AggregateHandleEvent';
import { QueryHandler } from '../QueryHandling/QueryHandler';

class OrderId extends UuidIdentity {

}

class CreateOrder implements Command {
  constructor(public readonly id: OrderId) {

  }
}

class ShipOrder implements Command {
  constructor(public readonly id: OrderId) {

  }
}

class OrderCreated implements DomainEvent {

}

class OrderShipped implements DomainEvent {

}

class Order extends EventSourcedAggregateRoot<OrderId> {

  public static create(id: OrderId) {
    const newOrder = new this(id);
    newOrder.apply(new OrderCreated());
    return newOrder;
  }

  private shipped = false;

  public ship() {
    if (this.shipped) {
      throw new Error('Product already shipped');
    }
    this.apply(new OrderShipped());
  }

  @AggregateHandleEvent
  public shipOrder(_event: OrderShipped) {
    this.shipped = true;
  }

}

class OrderCommandHandler implements CommandHandler {

  constructor(private orderRepository: EventSourcingRepositoryInterface<Order>) {

  }

  @HandleCommand
  public async handleCreateOrder(command: CreateOrder) {
    const order = Order.create(command.id);
    await this.orderRepository.save(order);
  }

  @HandleCommand
  public async handleShipOrder(command: ShipOrder) {
    const order = await this.orderRepository.load(command.id);
    order.ship();
    await this.orderRepository.save(order);
  }
}

it('Should able to handle command', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([new CreateOrder(id)])
    .thenMatchEvents([
      new OrderCreated(),
    ]);
});

it('Can do manual assert by callback', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([new CreateOrder(id)])
    .thenAssert(async (testBench) => {
      // Verify repository.
      const orderRepository = testBench.getAggregateRepository(Order);
      expect(await orderRepository.load(id)).toBeInstanceOf(Order);

      // Verify event store.
      const store = testBench.getEventStore(Order);
      const stream = await store.load(id);
      expect(await stream.pipe(toArray()).toPromise()).toEqual([
        new DomainMessage(id, 0, new OrderCreated(), testBench.getCurrentTime()),
      ]);

      // Verify all recorded messages
      const messages = await testBench.getRecordedMessages();
      expect(messages).toEqual([
        new DomainMessage(id, 0, new OrderCreated(), testBench.getCurrentTime()),
      ]);

      // Verify event by test bench.
      await testBench.thenMatchEvents([new OrderCreated()]);
    });
});

it('Should be able to give initial event', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .givenEvents(id, Order, [
      new ShipOrder(id),
    ])
    .whenCommands([new ShipOrder(id)])
    .thenMatchEvents([
      new OrderShipped(),
    ]);
});

it('Should be able to give multiple commands', async () => {
  const id = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([
      new CreateOrder(id),
      new ShipOrder(id),
    ])
    .thenMatchEvents([
      new OrderCreated(),
      new OrderShipped(),
    ]);
});

it('Can also check DomainMessages', async () => {
  const id = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([
      new CreateOrder(id),
      new ShipOrder(id),
    ])
    .thenMatchEvents([
      new DomainMessage(id, 0, new OrderCreated(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(id, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
    ]);
});

it('Can check with snapshots', async () => {
  const id = new OrderId('5ae2e4df-f5d5-4c69-b048-30fd9c04be5b');
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([
      new CreateOrder(id),
      new ShipOrder(id),
    ])
    .thenAggregatesShouldMatchSnapshot('thenAggregatesShouldMatchSnapshot')
    .thenEventsShouldMatchSnapshot('thenEventsShouldMatchSnapshot')
    .thenMessagesShouldMatchSnapshot('thenMessagesShouldMatchSnapshot')

    // Does everything.
    .thenShouldMatchSnapshot('thenMessagesShouldMatchSnapshot');

});

it('Can have multiple instances of an aggregate', async () => {
  const id1 = OrderId.create();
  const id2 = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .givenEvents(id1, Order, [
      new OrderCreated(),
    ])
    .givenEvents(id2, Order, [
      new OrderCreated(),
    ])
    .whenCommands([new ShipOrder(id1)])
    .whenCommands([new ShipOrder(id2)])
    .thenMatchEvents([
      new DomainMessage(id1, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(id2, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
    ]);
});

it('Can test different aggregates at the same time', async () => {
  class CustomerId extends UuidIdentity {

  }

  class CustomerOrdered implements Command {
    constructor(public readonly customerId: CustomerId, public readonly orderId: OrderId) {

    }
  }

  class CustomerCreatedAccount implements DomainEvent {
  }

  class CustomerHasOrdered implements DomainEvent {
    constructor(public readonly orderId: OrderId) {

    }
  }

  class Customer extends EventSourcedAggregateRoot<CustomerId> {
    public hasOrdered(orderId: OrderId) {
      this.apply(new CustomerHasOrdered(orderId));
    }
  }

  class CustomerOrderCommandHandler implements CommandHandler {
    constructor(
      private orderRepository: EventSourcingRepositoryInterface<Order>,
      private customerRepository: EventSourcingRepositoryInterface<Customer>,
    ) {

    }

    @HandleCommand
    public async handleCreateOrder(command: CustomerOrdered) {
      const customer = await this.customerRepository.load(command.customerId);
      const order = Order.create(command.orderId);
      await this.orderRepository.save(order);
      customer.hasOrdered(command.orderId);
      await this.customerRepository.save(customer);
    }
  }

  const orderId1 = OrderId.create();
  const customerId1 = CustomerId.create();

  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new CustomerOrderCommandHandler(
        testBench.getAggregateRepository(Order),
        testBench.getAggregateRepository(Customer),
      );
    })
    .givenEvents(customerId1, Customer, [
      new CustomerCreatedAccount(),
    ])
    .whenCommands([new CustomerOrdered(customerId1, orderId1)])
    .thenMatchEvents([
      new DomainMessage(orderId1, 0, new OrderCreated(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(customerId1, 1, new CustomerHasOrdered(orderId1), EventSourcingTestBench.defaultCurrentTime),
    ]);
});

it('Should able to handle aggregate errors', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .givenEvents(id, Order, [
      new OrderCreated(),
      new OrderShipped(),
    ])
    .throws('Product already shipped')
    .whenCommands([
      new ShipOrder(id),
    ]);
});

it('Should able to execute query handler', async () => {
  class CommandForWelcome implements Command {
    constructor(public readonly name: string) {

    }
  }

  class TestCommandHandler implements QueryHandler {

    @HandleCommand
    public handleCommand(command: CommandForWelcome) {
      return `Welcome ${command.name}`;
    }

  }

  await EventSourcingTestBench
    .create()
    .givenCommandHandler(new TestCommandHandler())
    .thenCommandHandlerShouldMatchResult(new CommandForWelcome('John'), 'Welcome John');
});
