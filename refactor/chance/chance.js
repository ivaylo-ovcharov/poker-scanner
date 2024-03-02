import { calculateChances } from './oddsCalculator.js';


export function calculateAndImportChancesIfValid(dealerCards, players, activePlayersCount) {
    const dealerIsValid = dealerCardsAreValidToCalculate(dealerCards)
    const playersAreValid = allPlayersHaveScannedCards(players, activePlayersCount)

    if (dealerIsValid && playersAreValid) {
        return calculateChances(dealerCards, players)
    }

    return null
}


function dealerCardsAreValidToCalculate(dealerCards) {
    if (dealerCards.length === 0 || dealerCards.length === 3 || dealerCards.length === 4 || dealerCards.length === 5) {
        return true
    }

    return false
}

function allPlayersHaveScannedCards(players, activePlayersCount) {
    const allPlayerCards = Object.values(players).flat()

    if (allPlayerCards.length === activePlayersCount * 2) {
        return true
    }

    return false
}

