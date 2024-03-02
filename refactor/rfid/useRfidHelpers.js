export function extractUidAntenna(logLine) {
    const pattern = /UID: ([0-9A-F]+), antenna: (\d+)/;
    const match = logLine.match(pattern);
    
    if (match) {
        const uid = match[1];
        const antenna = parseInt(match[2]);
        
        return { uid, antenna };
    } else {
        return null;
    }
}


export function mapAntenaIdToPlayer(antenaId) {
    if (antenaId === 3) return 0
    if (antenaId === 8) return 3
    if (antenaId === 2) return 2
    if (antenaId === 4) return 1
    return null
  }