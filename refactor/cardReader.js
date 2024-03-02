
import { pokerCards, resetCards } from './const/pokerCards.js'
import useScanActions from './supabase/useScanActions.js'
import { calculateAndImportChancesIfValid } from './chance/chance.js'

let players = {};
let dealerCards = [];
const { importPlayerScanCardToDb, importDealerScanCardToDb, resetScanToDb, importPlayersCalculations, foldPlayersHandToDb } = useScanActions();

function getAllCardsInPlay() {
    return [...dealerCards, ...Object.values(players).flat()]
}

function importCardForPlayer(playerId, card) {
    if (!players[playerId]) {
        players[playerId] = []
    }

    if (players[playerId].length < 2) {
        players[playerId].push(card)
        importPlayerScanCardToDb(playerId, players[playerId])
    }
}

function importCardForDealer(card) {
    dealerCards.push(card)
    importDealerScanCardToDb(dealerCards)
}

function findAndFoldPlayersHand(cardToIdentify) {
    Object.keys(players).forEach(playerId => {
        if (players[playerId].find(card => card === cardToIdentify)) {
            foldPlayersHandToDb(playerId)
        }
    });
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

function checkForResetCard(uid) {
    if (resetCards.includes(uid)) {
        resetScanToDb()
        players = {};
        dealerCards = [];
        console.log('reset')
        return  
    }
}


export function executeCardReader(line, playerId, isDealer,isDealerTrash, activePlayersCount) {
    checkForResetCard(line)
    const unvalidatedCard = convertLineToCard(line)
    const card = convertLineToCardIfValid(line);

    if(isDealerTrash) {
        findAndFoldPlayersHand(unvalidatedCard)
    }

    if (!card) return

    if (isDealer) {
        importCardForDealer(card)
    } else {
        importCardForPlayer(playerId, card)
    }

    const playersChances = calculateAndImportChancesIfValid(dealerCards, players, activePlayersCount)
    
    if (playersChances) {
        importPlayersCalculations(playersChances)
    }
}



