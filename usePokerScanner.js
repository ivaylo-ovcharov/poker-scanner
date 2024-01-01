import { SerialPort } from 'serialport'
import { initializeApp } from "firebase/app";
import { TexasHoldem } from "poker-odds-calc";
import { ReadlineParser } from '@serialport/parser-readline'
import { getDatabase, onValue, ref, set, get, push } from "firebase/database";

import { getToday } from './useTime.js'
import { pokerCards, resetCards, bookmarkChips } from './usePokerCards.js'
import { isValidCardInput, isValidDealerInput } from './useCardValidator.js'


const firebaseConfig = {
    databaseURL: "https://texas-arduino-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);




function convertLineToCard(line) {
    return pokerCards.find((card) => String(line).includes(card.id))
}

function convertCardName(cardName) {
    const splitName = cardName.split("_");
    const firstLetter =
        splitName[0].charAt(0) == 1 ? "T" : splitName[0].charAt(0).toUpperCase();
    return `${firstLetter}${splitName[1].charAt(0)}`;
}

function isValidForChanceCalculation(playersCards) {
    for (let index = 0; index < playersCards.length; index++) {
        const cards = playersCards[index];
        if (cards.length !== 2) {
            return false
        }

    }
    return true;
}

function checkForBookmark(line) {
    const isBookmarkCard = bookmarkChips.find((bookmarkCard) => String(line).includes(bookmarkCard))
    if (isBookmarkCard) {
        bookmarked = true;
    }
}

function calculateChances() {
    const Table = new TexasHoldem();

    const player1ConvertedCards = player1.cards.map((card) => convertCardName(card));
    const player2ConvertedCards = player2.cards.map((card) => convertCardName(card));
    const player3ConvertedCards = player3.cards.map((card) => convertCardName(card));

    Table.addPlayer(player1ConvertedCards).addPlayer(player2ConvertedCards).addPlayer(player3ConvertedCards);

    if (dealer.cards.length === 3 || dealer.cards.length === 4 || dealer.cards.length === 5) {
        Table.setBoard(dealer.cards.map((card) => convertCardName(card)))
    }

    const Result = Table.calculate();

    const player1Wins = Result.getPlayers()[0].data.wins;
    const player2Wins = Result.getPlayers()[1].data.wins;
    const player3Wins = Result.getPlayers()[2].data.wins;

    const totalWins = player1Wins + player2Wins + player3Wins;

    set(ref(database, 'players/1/chance'), `${((player1Wins / totalWins) * 100).toFixed(0)}%`);
    set(ref(database, 'players/0/chance'), `${((player2Wins / totalWins) * 100).toFixed(0)}%`);
    // set(ref(database, 'players/3/chance'), `${((player3Wins / totalWins) * 100).toFixed(0)}%`);
    return {
        player1: `${((player1Wins / totalWins) * 100).toFixed(0)}%`,
        player2: `${((player2Wins / totalWins) * 100).toFixed(0)}%`
    }
}

function scanPlayerLine(player, line) {
    const card = convertLineToCard(line)
    const cardInputIsValid = isValidCardInput(card, player.cards)

    checkForBookmark(line)

    if (!cardInputIsValid) {
        return
    }

    player.cards.push(card.cardName)
    set(ref(database, player.firebaseCards), player.cards);
    console.log(`${player.name} - ${card.cardName}`)

    if (!firstCardRegisteredAt) {
        firstCardRegisteredAt = getToday()
    }

    const validForChanceCalculation = isValidForChanceCalculation([player1.cards, player2.cards, player3.cards])

    if (validForChanceCalculation) {
        calculateChances()
    }
}

async function recordGame() {
    const recordingsRef = ref(database, '/recordings');

    await push(recordingsRef, {
        player1: { cards: player1.cards },
        player2: { cards: player2.cards },
        player3: { cards: player3.cards },

        dealer: { cards: dealer.cards },
        bookmarked: bookmarked,
        created: firstCardRegisteredAt,
    })
        .then(() => {
            console.log("New recording added successfully");
        })

}

async function reset() {

    await recordGame()
    console.log('reset')
    player1.cards = [];
    set(ref(database, `/players/1/cards`), []);
    set(ref(database, `/players/1/chance`), '');
    set(ref(database, `/players/1/isPlaying`), true);

    player2.cards = [];
    set(ref(database, `/players/2/cards`), []);
    set(ref(database, `/players/2/chance`), '');
    set(ref(database, `/players/2/isPlaying`), true);

    player3.cards = [];
    set(ref(database, `/players/3/cards`), []);
    set(ref(database, `/players/3/chance`), '');
    set(ref(database, `/players/3/isPlaying`), true);

    player2.cards = [];
    set(ref(database, `/players/0/cards`), []);
    set(ref(database, `/players/0/chance`), '');
    set(ref(database, `/players/0/isPlaying`), true);

    dealer.cards = [];
    set(ref(database, `/game/cards`), []);
    bookmarked = false;
    firstCardRegisteredAt = '';
}

function dealerAction(line) {
    const isResetCard = resetCards.find((resetCard) => String(line).includes(resetCard))

    checkForBookmark(line)

    if (isResetCard) {
        reset()
        return;
    }

    const card = convertLineToCard(line)
    const dealerInputIsValid = isValidDealerInput(card, dealer.cards);

    if (!dealerInputIsValid) {
        return;
    }

    dealer.cards.push(card.cardName);
    set(ref(database, '/game/cards'), dealer.cards);

    if (dealer.cards.length === 3 || dealer.cards.length === 4 || dealer.cards.length === 5) {
        if (isValidForChanceCalculation([player1.cards, player2.cards, player3.cards])) {
            calculateChances()
        }

    }

    console.log(`dealer - ${line}`)
}

var bookmarked = false;
var firstCardRegisteredAt = '';

var player1 = {
    name: 'doichi',
    parser: new ReadlineParser(),
    firebaseCards: '/players/1/cards',
    cards: [],
    port: new SerialPort({
        path: 'COM6',
        baudRate: 115200,
    })
}

player1.port.pipe(player1.parser).on('data', line => {
    console.log(line)
    scanPlayerLine(player1, line)
})


var player2 = {
    name: 'dancho',
    parser: new ReadlineParser(),
    cards: [],
    firebaseCards: '/players/0/cards',
    port: new SerialPort({
        path: 'COM4',
        baudRate: 115200,
    })
}

player2.port.pipe(player2.parser).on('data', line => {
    console.log(line)
    scanPlayerLine(player2, line)

    if (player2.cards < 2) return
    dealerAction(line)
})



var dealer = {
    cards: [],
}
