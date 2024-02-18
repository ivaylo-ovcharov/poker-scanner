function generateReader(path, { isDealer = false }) {
    return {
        isDealer,
        path,
        parser: new ReadlineParser(),
        port: new SerialPort({
            path,
            baudRate: 115200,
        })
    }
}

const readers = [
    generateReader('COM4'),
    generateReader('COM5'),
    generateReader('COM6', { isDealer: true })
]

readers.forEach(reader => {
    reader.port.pipe(reader.parser).on('data', line => {
        scanLine({ path: reader.path, isDealer: reader.isDealer }, line)
    });
});

// Scanner Logic new File name here
let players = {}
let dealer = {}

function scanLine(reader, line) {
    const card = convertToCardIfValid(line)
    if (!card) return

    if (reader.isDealer) {
        setDealerCard(card)
    } else {
        setPlayerCard(reader.path, card)
    }
}

async function setDealerCard(card) {
    const scannedAt = getNow()
    await supabase.rpc('insert_dealer_hand', { scannedAt, card })
}

async function setPlayerCard(path, card) {
    const scannedAt = getNow()
    await supabase.rpc('insert_player_card', { scannedAt, path, card })
}

function convertToCardIfValid(line) {
    const card = convertLineToCard(line)
    if (!card) return false

    Object.values(players).forEach(playerCards => {
        if (playerCards.includes(card)) {
            return false
        }
    });

    if (dealer.includes(card)) {
        return false
    }

    return card
}