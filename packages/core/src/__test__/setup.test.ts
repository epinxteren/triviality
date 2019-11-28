import { FF, triviality } from '../index';
import { SetupFeatureServices } from '../Feature';

it('Execute setup step', async () => {
  const spySetup = jest.fn().mockResolvedValue(void 0);

  const MyService: FF<void, SetupFeatureServices> = ({ registers: { setup } }) => setup(() => spySetup);

  await triviality()
    .add(MyService)
    .build();
  expect(spySetup).toBeCalled();
});

it('Catches setup step error', async () => {
  const spySetup = jest.fn().mockRejectedValue('Some error');
  const MyService: FF<void, SetupFeatureServices> = ({ registers: { setup } }) => setup(() => spySetup);

  const promise = triviality()
    .add(MyService)
    .build();
  expect(spySetup).toBeCalled();

  await expect(promise).rejects.toEqual('Some error');
  expect(spySetup).toBeCalled();
});
