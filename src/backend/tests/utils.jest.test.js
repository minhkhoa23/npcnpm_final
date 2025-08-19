const { readJsonFile } = require('../utils/fileUtils');

test('readJsonFile parses JSON files', async () => {
  const data = await readJsonFile('seed/users.json');
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});
