import { executeFile } from '../../__test__/expectOutput';

it('Make sure example is not broken', async () => {
  const output = await executeFile(__dirname, '../LogModuleContainer.ts');
  expect(output).toMatch('John: Hallo Jane!');
  expect(output).toMatch('Jane: Hi John!');
});
