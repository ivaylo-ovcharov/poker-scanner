function convertCardName(cardName) {
    const splitName = cardName.split("_");
    const firstLetter =
        splitName[0].charAt(0) == 1 ? "T" : splitName[0].charAt(0).toUpperCase();
    return `${firstLetter}${splitName[1].charAt(0)}`;
}

const calculatePlayerChance = computed(() => {

    props.players.forEach(player => {
        if (player.cards !== 2) {
            return '0%'
        }
    });

    if (props.game.cards.length < 3) {
        return '0%'
    }

    const Table = new TexasHoldem();

    const convertedPlayerCards = props.players.map((player) => {
        return {
            id: player.id,
            cards: player.cards.map((card) => convertCardName(card))
        }
    });
    const covertedTableCards = props.game.cards.map((card) => convertCardName(card));

    // return { convertedPlayerCards, covertedTableCards }

    convertedPlayerCards.forEach(player => Table.addPlayer(player.cards));

    if (covertedTableCards.length) {
        Table.setBoard(covertedTableCards);
    }

    const Result = Table.calculate();

    return Result

    // const player1Wins = Result.getPlayers()[0].data.wins;
    // const player2Wins = Result.getPlayers()[1].data.wins;

    // const totalWins = player1Wins + player2Wins;

    // return {
    //     ivoChance: `${((player1Wins / totalWins) * 100).toFixed(0)}%`,
    //     doichiChance: `${((player2Wins / totalWins) * 100).toFixed(0)}%`,
    // };
})