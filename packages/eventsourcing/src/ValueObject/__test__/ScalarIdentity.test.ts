/* tslint:disable:max-classes-per-file */

import { ScalarIdentity } from '../ScalarIdentity';

it('Create identity', () => {
  const id = new ScalarIdentity('test');
  expect(id).toBeInstanceOf(ScalarIdentity);
  expect(id.toString()).toEqual('test');
  expect(id.getValue()).toEqual('test');
});

it('Create custom identity', () => {
  class UserId extends ScalarIdentity<number> {

  }

  const identity = new UserId(1);
  expect(identity).toBeInstanceOf(UserId);
  expect(identity.toString()).toEqual('1');
});

it('Convert to custom id', () => {
  class UserId extends ScalarIdentity<string> {

  }

  const identity = new ScalarIdentity('test');
  expect(UserId.of(identity)).toBeInstanceOf(UserId);

  const userId = new UserId('test');
  expect(UserId.of(userId)).toBe(userId);
});

it('Know its the same', () => {
  const identity = new ScalarIdentity('2');
  const identity2 = new ScalarIdentity('2');
  expect(identity.equals(identity2)).toBeTruthy();
});

it('Know its not the same', () => {
  const identity = new ScalarIdentity('2');
  const identity2 = new ScalarIdentity('3');
  expect(identity.equals(identity2)).toBeFalsy();
});
