import { SerialPort } from 'serialport'
import { initializeApp } from "firebase/app";
import { TexasHoldem } from "poker-odds-calc";
import { ReadlineParser } from '@serialport/parser-readline'
import { getDatabase, onValue, ref, set, get, push } from "firebase/database";

import { getToday } from './useTime.js'
import { pokerCards, resetCards, bookmarkChips } from './usePokerCards.js'
import { isValidCardInput, isValidDealerInput } from './useCardValidator.js'
import { useYoutubeFetch } from './useYoutubeFetch.js'

const firebaseConfig = {
    databaseURL: "https://texas-arduino-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const videoId = 'Eu77r2b2FXU';

var bookmarked = false;
var firstCardRegisteredAt = '';
var recording = false;
var win = {}


// const gameWinRef = ref(database, "/game/win");
// onValue(gameWinRef, (snapshot) => {
//     const data = snapshot.val();
//     win = data
// });


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

function getTotalWins(resultPlayers) {
    var totalWins = 0;
    resultPlayers.forEach((resultPlayer) => {
        totalWins = totalWins + resultPlayer.data.wins
    })
    return totalWins
}

function calculateChances() {
    const Table = new TexasHoldem();

    players.forEach(player => {
        const playerCards = player.cards.map((card) => convertCardName(card));
        Table.addPlayer(playerCards);
    })

    if (dealer.cards.length === 3 || dealer.cards.length === 4 || dealer.cards.length === 5) {
        Table.setBoard(dealer.cards.map((card) => convertCardName(card)))
    }

    const Result = Table.calculate();
    const playersResults = Result.getPlayers();
    const totalWins = getTotalWins(playersResults)


    players.forEach((player, index) => {
        set(ref(database, `players/${player.firebaseId}/chance`), `${((playersResults[index].data.wins / totalWins) * 100).toFixed(0)}%`);
    })


    return {
        player1: `100%`,
    }
}

function scanPlayerLine(player, line) {
    checkForBookmark(line)

    const card = convertLineToCard(line)

    const playersCards = players.flatMap((player) => player.cards);
    const dealerCards = dealer.cards;
    const cardsInPlay = [...playersCards, ...dealerCards].flat();


    const cardInputIsValid = isValidCardInput(card, player.cards, cardsInPlay)

    if (!cardInputIsValid) {
        return
    }

    player.cards.push(card.cardName)
    set(ref(database, `/players/${player.firebaseId}/cards`), player.cards);
    console.log(`${player.name} - ${card.cardName}`)

    if (!firstCardRegisteredAt) {
        firstCardRegisteredAt = getToday()
        console.log(firstCardRegisteredAt)

    }

    const validForChanceCalculation = isValidForChanceCalculation(players.map((player) => player.cards))

    if (validForChanceCalculation) {
        calculateChances()
    }
}

async function recordGame() {
    if (recording) return
    recording = true;
    const recordingsRef = ref(database, '/recordings');
    const recordPlayers = players.map((player) => { return { id: player.firebaseId, cards: player.cards } })

    const videoSeconds = await useYoutubeFetch(videoId)
    var localWin = {};

    const dbRef = ref(getDatabase(app));
    await get(dbRef, `/game`).then((snapshot) => {
        if (snapshot.exists() && snapshot.val()?.game?.win) {
            localWin = snapshot.val().game.win;
        } else {
            console.log("No data available");
        }
    })
    console.log({ localWin })

    await push(recordingsRef, {
        players: recordPlayers,
        dealer: { cards: dealer.cards },
        bookmarked: bookmarked,
        win: localWin,
        video: {
            videoId: videoId,
            videoTime: videoSeconds
        },
        created: firstCardRegisteredAt,
    })
        .then(() => {
            recording = false;
            firstCardRegisteredAt = ''
            bookmarked = false;
            dealer.cards = [];
            win = {}
            set(ref(database, `/game/win`), {});

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
    })


    set(ref(database, `/game/cards`), []);

}

function dealerAction(line) {
    checkForBookmark(line)

    const isResetCard = resetCards.find((resetCard) => String(line).includes(resetCard))

    if (isResetCard) {
        reset()
        return;
    }

    const card = convertLineToCard(line)

    const playersCards = players.flatMap((player) => player.cards);
    const dealerCards = dealer.cards;
    const cardsInPlay = [...playersCards, ...dealerCards].flat();

    const dealerInputIsValid = isValidDealerInput(card, dealer.cards, cardsInPlay);

    if (!dealerInputIsValid) {
        return;
    }

    dealer.cards.push(card.cardName);
    set(ref(database, '/game/cards'), dealer.cards);

    if (dealer.cards.length === 3 || dealer.cards.length === 4 || dealer.cards.length === 5) {
        if (isValidForChanceCalculation(players.map((player) => player.cards))) {
            calculateChances()
        }

    }

    console.log(`dealer - ${line}`)
}



const players = [
    {
        name: 'dancho',
        // isDealer: true,
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
        firebaseId: 1,
        cards: [],
        port: new SerialPort({
            path: 'COM7',
            baudRate: 115200,
        })
    }
]

players.forEach(player => {
    player.port.pipe(player.parser).on('data', line => {
        console.log(line);
        scanPlayerLine(player, line);

        if (player.isDealer && player.cards.length === 2) {
            dealerAction(line);
        }
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

