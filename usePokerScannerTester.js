import { SerialPort } from 'serialport'
import { initializeApp } from "firebase/app";
import { ReadlineParser } from '@serialport/parser-readline'
import { pokerCards, resetCards } from './usePokerCards.js'
import { getDatabase, onValue, ref, set } from "firebase/database";
import { TexasHoldem } from "poker-odds-calc";

const firebaseConfig = {
    databaseURL: "https://texas-arduino-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const parser = new ReadlineParser()



function writeDealerData(type, body) {
    set(ref(database, `/dealer/${type}`), body);
}

function resetUsers() {
    set(ref(database, 'users/doichi'), "");
    set(ref(database, 'users/ivo'), "");
}


function isValidCardInput(card, cards) {
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

function isValidDealerInput(card, cards) {
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

function calculateChances() {
    const Table = new TexasHoldem();

    const player1ConvertedCards = player1.cards.map((card) => convertCardName(card));
    const player2ConvertedCards = player2.cards.map((card) => convertCardName(card));

    console.log({ player1ConvertedCards, player2ConvertedCards })

    Table.addPlayer(player1ConvertedCards).addPlayer(player2ConvertedCards);

    if (dealer.cards.length === 3 || dealer.cards.length === 4 || dealer.cards.length === 5) {
        Table.setBoard(dealer.cards.map((card) => convertCardName(card)))
    }

    const Result = Table.calculate();

    const player1Wins = Result.getPlayers()[0].data.wins;
    const player2Wins = Result.getPlayers()[1].data.wins;
    const totalWins = player1Wins + player2Wins;


    set(ref(database, 'players/1/chance'), `${((player1Wins / totalWins) * 100).toFixed(0)}%`);
    set(ref(database, 'players/2/chance'), `${((player2Wins / totalWins) * 100).toFixed(0)}%`);
}

function scanPlayerLine(player, line) {
    console.log(line)
    const card = convertLineToCard(line)
    const cardInputIsValid = isValidCardInput(card, player.cards)

    if (!cardInputIsValid) {
        return
    }

    player.cards.push(card.cardName)
    set(ref(database, player.firebaseCards), player.cards);
    console.log(`${player.name} - ${card.cardName}`)

    const validForChanceCalculation = isValidForChanceCalculation([player1.cards, player2.cards])

    if (validForChanceCalculation) {
        calculateChances()
    }
}


var player1 = {
    name: 'doichi',
    parser: new ReadlineParser(),
    firebaseCards: '/players/1/cards',
    cards: [],
    port: new SerialPort({
        path: 'COM5',
        baudRate: 115200,
    })
}

player1.port.pipe(player1.parser).on('data', line => {
    console.log(line)
    const card = convertLineToCard(line)
    console.log(card)

})


var player2 = {
    name: 'dancho',
    parser: new ReadlineParser(),
    cards: [],
    firebaseCards: '/players/2/cards',
    port: new SerialPort({
        path: 'COM3',
        baudRate: 115200,
    })
}

player2.port.pipe(player2.parser).on('data', line => {
    console.log(line)
    const card = convertLineToCard(line)
    console.log(card)
})


var dealer = {
    cards: [],
    parser: new ReadlineParser(),
    port: new SerialPort({
        path: 'COM4',
        baudRate: 115200,
    })
}

dealer.port.pipe(dealer.parser).on('data', line => {
    console.log(line)
    const card = convertLineToCard(line)
    console.log(card)
})
