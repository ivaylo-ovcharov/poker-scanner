import { calculateChances } from './oddsCalculator.js';


export function calculateAndImportChancesIfValid(dealerCards, players, readers) {
    const dealerIsValid = dealerCardsAreValidToCalculate(dealerCards)
    const playersAreValid = allPlayersHaveScannedCards(players, readers)

    console.log({ dealerCards, players })

    if (dealerIsValid && playersAreValid) {
        calculateChances(dealerCards, players)
    }
}


function dealerCardsAreValidToCalculate(dealerCards) {
    if (dealerCards.length === 0 || dealerCards.length === 3 || dealerCards.length === 4 || dealerCards.length === 5) {
        return true
    }

    return false
}

function allPlayersHaveScannedCards(players, readers) {
    const allPlayerCards = Object.values(players).flat()

    if (allPlayerCards.length === (readers.length - 1) * 2) {
        return true
    }

    return false
}

