export function isValidCardInput(card, playerCards, cardsInPlay) {
    if (!card?.cardName) {
        return false;
    }

    if (cardsInPlay.includes(card.cardName)) {
        return false;
    }

    if (playerCards.length > 1) {
        return false;
    }

    return true;
}

export function isValidDealerInput(card, dealerCards, cardsInPlay) {
    console.log({ first: !card?.cardName, second: cardsInPlay.includes(card?.cardName), third: dealerCards.length > 4 })
    if (!card?.cardName) {
        return false;
    }
    if (cardsInPlay.includes(card?.cardName)) {
        return false;
    }

    if (dealerCards.length > 4) {
        return false;
    }

    return true;
}
