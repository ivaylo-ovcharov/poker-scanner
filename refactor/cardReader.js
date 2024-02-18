
import { pokerCards } from './const/pokerCards.js'
import { calculateAndImportChancesIfValid } from './chance/chance.js'

let players = {};
let dealerCards = [];

function getAllCardsInPlay() {
    return [...dealerCards, ...Object.values(players).flat()]
}

function importCardForPlayer(player, card) {
    if (!players[player.path]) {
        players[player.path] = []
    }

    if (players[player.path].length < 2)
        players[player.path].push(card)
}

function importCardForDealer(card) {
    dealerCards.push(card)
}

function convertLineToCardIfValid(line) {
    const card = convertLineToCard(line)
    const allCardsInPlay = getAllCardsInPlay()

    if (!card) return false
    if (allCardsInPlay.includes(card)) return false

    return card
}

function convertLineToCard(line) {
    return pokerCards.find((card) => String(line).includes(card.id))?.cardName || ''
}


export function executeCardReader(scanner, line, readers) {
    const card = convertLineToCardIfValid(line);
    if (!card) return

    if (scanner.isDealer) {
        importCardForDealer(card)
    } else {
        importCardForPlayer(scanner, card)
    }

    const playersChances = calculateAndImportChancesIfValid(dealerCards, players, readers)
}



