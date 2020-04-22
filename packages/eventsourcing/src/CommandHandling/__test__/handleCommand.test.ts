/* tslint:disable:max-classes-per-file */

import { Command } from '../Command';
import { getHandleCommandMetadata, HandleCommand } from '../HandleCommand';
import { CommandHandler } from '../CommandHandler';

it('Can register a command handler', () => {
  class TestCommand implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handle(_command: TestCommand): void {
      // noop
    }
  }

  const commandHandler = new TestCommandHandler();
  const metadata = getHandleCommandMetadata(commandHandler);

  expect(metadata).toEqual([{
    functionName: 'handle',
    command: TestCommand,
  }]);
});

it('Can register multiple command handler', () => {
  class TestCommand1 implements Command {

  }

  class TestCommand2 implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handle1(_command: TestCommand1): void {
      // noop
    }

    @HandleCommand
    public handle2(_command: TestCommand2): void {
      // noop
    }
  }

  const commandHandler = new TestCommandHandler();
  const metadata = getHandleCommandMetadata(commandHandler);

  expect(metadata).toEqual([
    {
      functionName: 'handle1',
      command: TestCommand1,
    }, {
      functionName: 'handle2',
      command: TestCommand2,
    },
  ]);
});

it('Should have an argument', () => {
  expect(() => {
    class TestCommandHandler implements CommandHandler {
      @HandleCommand
      public handle(): void {
        // noop
      }
    }

    return new TestCommandHandler();
  }).toThrow('Missing command argument on Function.handle');
});

it('Should have an handle function', () => {
  class TestCommandHandler implements CommandHandler {
  }
  expect(() => {
    getHandleCommandMetadata(new TestCommandHandler());
  }).toThrow('Missing a command handler on TestCommandHandler. Don\'t forget @HandleCommand annotation');
});
