import PokerSolver from 'pokersolver';

export function identifyHand(playerCards, boardCards) {
    const convertedPlayerCards = playerCards
    const convertedBoardCards = boardCards
    var hand = PokerSolver.Hand.solve([...convertedPlayerCards, ...convertedBoardCards]);

    return {
        name: hand.name,
        description: hand.descr,
        bestCards: hand.cards.map((card) => `${card.value}${card.suit}`)
    }
}