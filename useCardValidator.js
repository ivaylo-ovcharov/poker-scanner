export function isValidCardInput(card, cards) {
    if (!card?.cardName) {
        return false;
    }

    if (cards.includes(card?.cardName)) {
        return false;
    }

    if (cards.length > 1) {
        return false;
    }

    return true;
}

export function isValidDealerInput(card, cards) {
    if (player2.cards.includes(card?.cardName)) {
        return false;
    }

    if (!card?.cardName) {
        return false;
    }

    if (cards.includes(card?.cardName)) {
        return false;
    }

    if (cards.length > 4) {
        return false;
    }

    return true;
}
