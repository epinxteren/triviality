/* tslint:disable:max-classes-per-file */

import { Query } from '../Query';
import { getHandleQueryMetadata, HandleQuery } from '../HandleQuery';
import { QueryHandler } from '../QueryHandler';

it('Can register a Query handler', () => {
  class TestQuery implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handle(_Query: TestQuery): void {
      // noop
    }
  }

  const queryHandler = new TestQueryHandler();
  const metadata = getHandleQueryMetadata(queryHandler);

  expect(metadata).toEqual([{
    functionName: 'handle',
    Query: TestQuery,
  }]);
});

it('Can register multiple Query handler', () => {
  class TestQuery1 implements Query {

  }

  class TestQuery2 implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handle1(_Query: TestQuery1): void {
      // noop
    }

    @HandleQuery
    public handle2(_Query: TestQuery2): void {
      // noop
    }
  }

  const queryHandler = new TestQueryHandler();
  const metadata = getHandleQueryMetadata(queryHandler);

  expect(metadata).toEqual([
    {
      functionName: 'handle1',
      Query: TestQuery1,
    }, {
      functionName: 'handle2',
      Query: TestQuery2,
    },
  ]);
});

it('Should have an argument', () => {
  expect(() => {
    class TestQueryHandler implements QueryHandler {
      @HandleQuery
      public handle(): void {
        // noop
      }
    }

    return new TestQueryHandler();
  }).toThrow('Missing Query argument on Function.handle');
});

it('Should have an handle function', () => {
  class TestQueryHandler implements QueryHandler {
  }
  expect(() => {
    getHandleQueryMetadata(new TestQueryHandler());
  }).toThrow('Missing a Query handler on TestQueryHandler. Don\'t forget @HandleQuery annotation');
});

it('Can register multiple Query handler by arguments', () => {
  class TestQuery1 implements Query {

  }

  class TestQuery2 implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery(TestQuery1, TestQuery2)
    public handle(_Query: TestQuery1 | TestQuery2): void {
      // noop
    }

    @HandleQuery(TestQuery1, TestQuery2)
    public handleExtra(_Query: TestQuery1 | TestQuery2): void {
      // noop
    }
  }

  const queryHandler = new TestQueryHandler();
  const metadata = getHandleQueryMetadata(queryHandler);

  expect(metadata).toEqual([
    {
      functionName: 'handle',
      Query: TestQuery1,
    }, {
      functionName: 'handle',
      Query: TestQuery2,
    },
    {
      functionName: 'handleExtra',
      Query: TestQuery1,
    }, {
      functionName: 'handleExtra',
      Query: TestQuery2,
    },
  ]);
});

it('Should pass Query to handler by arguments', () => {
  expect(() => {
    class TestQueryHandler implements QueryHandler {

      @HandleQuery()
      public handle(): void {
        // noop
      }
    }
    const handler = new TestQueryHandler();
    handler.handle();
  }).toThrow('Missing a Query in @HandleQuery(<here>) arguments Function.handle');
});
