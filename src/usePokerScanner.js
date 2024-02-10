import { SerialPort } from 'serialport'
import { initializeApp } from "firebase/app";
import { TexasHoldem } from "poker-odds-calc";
import PokerSolver from 'pokersolver';
import { ReadlineParser } from '@serialport/parser-readline'
import { getDatabase, ref, set, onValue, push } from "firebase/database";

import { getToday } from './useTime.js'
import { pokerCards, resetCards, bookmarkChips } from './usePokerCards.js'
import { isValidCardInput, isValidDealerInput } from './useCardValidator.js'


const firebaseConfig = {
    databaseURL: "https://texas-arduino-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


var gameId = '-NqHfuyN_464lIPwayde';
var firebaseGame = {}
var bookmarked = false;
var firstCardRegisteredAt = '';
var canRecord = false;

const gameRef = ref(database, "/game");
onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    firebaseGame = data;
});


function convertLineToCard(line) {
    checkForBookmark(line)
    return pokerCards.find((card) => String(line).includes(card.id))
}

function isValidForChanceCalculation(player1Cards = [], player2Cards = [], dealerCards = []) {
    if (player1Cards?.length !== 2 || player2Cards?.length !== 2) {
        return false
    }

    if (dealerCards.length === 3 || dealerCards.length === 4 || dealerCards.length === 5 || dealerCards.length === 0) {
        return true
    }
    return false
}

function checkForBookmark(line) {
    const isBookmarkCard = bookmarkChips.find((bookmarkCard) => String(line).includes(bookmarkCard))
    if (isBookmarkCard) {
        bookmarked = true;
    }
}

function getTotalWins(resultPlayers) {
    var totalWins = 0;
    resultPlayers.forEach((resultPlayer) => {
        totalWins = totalWins + resultPlayer.data.wins
    })
    return totalWins
}

function identifyHand(playerCards, boardCards) {
    const convertedPlayerCards = playerCards
    const convertedBoardCards = boardCards
    var hand = PokerSolver.Hand.solve([...convertedPlayerCards, ...convertedBoardCards]);

    return {
        name: hand.name,
        description: hand.descr,
        bestCards: hand.cards.map((card) => `${card.value}${card.suit}`)
    }
}

function calculateChances(player1Cards, player2Cards, board) {
    const Table = new TexasHoldem();

    players.forEach(player => {
        Table.addPlayer(player.cards);
    })

    if (dealer.cards?.length !== 0) {
        Table.setBoard(dealer.cards)

    }

    const Result = Table.calculate();
    const playersResults = Result.getPlayers();
    const totalWins = getTotalWins(playersResults)

    players.forEach((player, index) => {
        set(ref(database, `players/${player.firebaseId}/chance`), `${((playersResults[index].data.wins / totalWins) * 100).toFixed(0)}%`);
        set(ref(database, `players/${player.firebaseId}/hand`), identifyHand(player.cards, dealer.cards));
    })

    return {
        player1: (playersResults[0].data.wins / totalWins * 100).toFixed(0),
        player2: (playersResults[1].data.wins / totalWins * 100).toFixed(0)
    }
}

function resetRecordGame() {
    firstCardRegisteredAt = ''
    bookmarked = false;
    dealer.cards = [];
    set(ref(database, `/game/win`), {});
    console.log("New recording added successfully");
}



async function recordGame() {
    if (!canRecord) return
    canRecord = false;

    const percentages = calculateChances()

    const handsRef = ref(database, '/hands');
    await push(handsRef, {
        gameId: gameId,
        board: { cards: dealer.cards },
        player_1: {
            cards: players[0].cards,
            percentage: percentages.player1,
            hand: identifyHand(players[0].cards, dealer.cards)
        },
        player_2: {
            cards: players[1].cards,
            percentage: percentages.player2,
            hand: identifyHand(players[1].cards, dealer.cards)
        },
        winnerId: firebaseGame?.win?.winnerId || 0,
        winAmount: firebaseGame?.win?.amount || 0,
        bookmarked: bookmarked,
        created: firstCardRegisteredAt,
    })
        .then(() => {
            resetRecordGame()
            dealer.cards = [];
            console.log("New recording added successfully");
        })

}

async function reset() {
    await recordGame()
    console.log('reset')

    players.forEach(player => {
        player.cards = [];
        set(ref(database, `/players/${player.firebaseId}/cards`), []);
        set(ref(database, `/players/${player.firebaseId}/chance`), '');
        set(ref(database, `/players/${player.firebaseId}/isPlaying`), true);
        set(ref(database, `/players/${player.firebaseId}/hand`), true);
    })
    dealer.cards = []

    set(ref(database, `/game/cards`), []);
    set(ref(database, `/game/win`), {});

}

function updateDealerCards(card) {

    const playersCards = players.flatMap((player) => player.cards);
    const dealerCards = dealer.cards;
    const cardsInPlay = [...playersCards, ...dealerCards].flat();

    const dealerInputIsValid = isValidDealerInput(card, dealer.cards, cardsInPlay);

    if (dealerInputIsValid) {
        dealer.cards.push(card.cardName);
        set(ref(database, '/game/cards'), dealer.cards);
    }
}

function dealerAction(line) {
    checkForBookmark(line)

    const isResetCard = resetCards.find((resetCard) => String(line).includes(resetCard))

    if (isResetCard) {
        reset()
        return;
    }
    const card = convertLineToCard(line)
    updateDealerCards(card)

    const validForChanceCalculation = isValidForChanceCalculation(players[0]?.cards, players[1]?.cards, dealer.cards)
    if (validForChanceCalculation) {
        calculateChances()
    }

    console.log(`dealer - ${line}`)
}

function validatePlayerCard(card, player) {
    const playersCards = players.flatMap((player) => player.cards);
    const dealerCards = dealer.cards;
    const cardsInPlay = [...playersCards, ...dealerCards].flat();

    return isValidCardInput(card, player.cards, cardsInPlay)
}

function updatePlayerCards(card, player) {
    player.cards.push(card.cardName)
    set(ref(database, `/players/${player.firebaseId}/cards`), player.cards);
    console.log(`${player.name} - ${card.cardName}`)

    if (!firstCardRegisteredAt) {
        firstCardRegisteredAt = getToday()
    }
}


function scanPlayerLine(player, line) {
    const card = convertLineToCard(line)
    const cardInputIsValid = validatePlayerCard(card, player)

    if (cardInputIsValid) {
        updatePlayerCards(card, player)
    }

    const validForChanceCalculation = isValidForChanceCalculation(players[0]?.cards, players[1]?.cards, dealer.cards)

    if (validForChanceCalculation) {
        canRecord = true
        calculateChances()
    }
}

const players = [
    {
        name: 'dancho',
        parser: new ReadlineParser(),
        cards: [],
        firebaseId: 2,
        port: new SerialPort({
            path: 'COM5',
            baudRate: 115200,
        })
    },
    {
        name: 'ivo',
        parser: new ReadlineParser(),
        firebaseId: 3,
        cards: [],
        port: new SerialPort({
            path: 'COM8',
            baudRate: 115200,
        })
    }
]

players.forEach(player => {
    player.port.pipe(player.parser).on('data', line => {
        console.log(line);
        scanPlayerLine(player, line);
    });
});


var dealer = {
    cards: [],
    parser: new ReadlineParser(),
    port: new SerialPort({
        path: 'COM6',
        baudRate: 115200,
    })
}

dealer.port.pipe(dealer.parser).on('data', line => {
    console.log(line);
    dealerAction(line);
});

