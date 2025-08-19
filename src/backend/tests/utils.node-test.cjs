const test = require('node:test');
const assert = require('node:assert');
const { readJsonFile } = require('../utils/fileUtils');

// Simple test to verify the readJsonFile utility works

test('readJsonFile parses JSON files', async () => {
  const data = await readJsonFile('seed/users.json');
  assert.ok(Array.isArray(data), 'Expected an array of users');
  assert.ok(data.length > 0, 'User array should not be empty');
});
