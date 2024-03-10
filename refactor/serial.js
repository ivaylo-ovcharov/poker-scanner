import http from 'http';
import { executeCardReader } from './cardReader.js'
import { extractUidAntenna, mapAntenaIdToPlayer } from './rfid/useRfidHelpers.js'

const server = http.createServer((req, res) => {
  let data = '';    

  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    const result = extractUidAntenna(data)
    const isDealer = [7, 6, 5, 1].includes(result?.antenna)
    const isDealerTrash = result?.antenna === 1;
    const playerId = mapAntenaIdToPlayer(result?.antenna)
    executeCardReader(result?.uid, playerId, isDealer, isDealerTrash)
  });
});

server.listen(3001, () => {
  console.log(`Server listening on port ${3000}`);
});