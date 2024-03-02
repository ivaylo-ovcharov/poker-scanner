import { TexasHoldem } from "poker-odds-calc";

export function calculateChances(dealerCards, players) {
    const Table = new TexasHoldem();

    Object.values(players).forEach(playerCards => {
        Table.addPlayer(playerCards);
    })

    if (dealerCards.length) {
        Table.setBoard(dealerCards)
    }

    const result = Table.calculate();
    const playersResults = result.getPlayers();
    const totalWins = getTotalWins(playersResults)

    let playersChances = {}

    const playersKeys = Object.keys(players)
    playersResults.forEach((playerResult, index) => {
        playersChances[playersKeys[index]] = (playerResult.data.wins / totalWins * 100).toFixed(0)
    });

    return playersChances
}

function getTotalWins(resultPlayers) {
    var totalWins = 0;
    resultPlayers.forEach((resultPlayer) => {
        totalWins = totalWins + resultPlayer.data.wins
    })
    return totalWins
}