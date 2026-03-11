const { createClient } = require('next-sanity');
const client = createClient({
  projectId: 'placeholder',
  dataset: 'placeholder',
  apiVersion: '2024-03-03',
  useCdn: false
});
console.log("projectId:", client.config().projectId);
console.log("dataset:", client.config().dataset);
