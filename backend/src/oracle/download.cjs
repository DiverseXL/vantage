const fs = require('fs');
const https = require('https');
https.get('https://raw.githubusercontent.com/txodds/tx-on-chain/main/examples/devnet/idl/txoracle.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => fs.writeFileSync(__dirname + '/txoracle.json', data));
});
