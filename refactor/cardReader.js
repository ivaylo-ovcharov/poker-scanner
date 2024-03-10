import { pokerCards, resetCards } from "./const/pokerCards.js";
import useScanActions from "./supabase/useScanActions.js";
import useHandActions from "./supabase/useHandActions.js";
import { calculateAndImportChancesIfValid } from "./chance/chance.js";

let players = {};
let dealerCards = [];
const {
  importPlayerScanCardToDb,
  importDealerScanCardToDb,
  resetScanToDb,
  importPlayersCalculations,
  foldPlayersHandToDb,
} = useScanActions();

const { createHandRecord } = useHandActions()

function getAllCardsInPlay() {
  return [...dealerCards, ...Object.values(players).flat()];
}

function importCardForPlayer(playerId, card) {
  if (!players[playerId]) {
    players[playerId] = [];
  }

  if (players[playerId].length < 2) {
    players[playerId].push(card);
    importPlayerScanCardToDb(playerId, players[playerId]);
  }
}

function importCardForDealer(card) {
  if (dealerCards.length >= 5) return;
  dealerCards.push(card);
  importDealerScanCardToDb(dealerCards);
}

function findAndFoldPlayersHand(cardToIdentify) {
  Object.keys(players).forEach((playerId) => {
    if (players[playerId].find((card) => card === cardToIdentify)) {
      foldPlayersHandToDb(playerId);
      delete players[playerId];
      importCalculations();
    }
  });
}

function convertLineToCardIfValid(line) {
  const card = convertLineToCard(line);
  const allCardsInPlay = getAllCardsInPlay();

  if (!card) return false;
  if (allCardsInPlay.includes(card)) return false;

  return card;
}

function convertLineToCard(line) {
  return (
    pokerCards.find((card) => String(line).includes(card.id))?.cardName || ""
  );
}

async function checkForResetCard(uid) {
  if (resetCards.includes(uid)) {

    const allPlayerCards = Object.values(players).flat()

    if (Object.keys(players).length * 2 === allPlayerCards.length) {
      await createHandRecord({ game_id: 16, dealer_cards: dealerCards, players_cards: players })
    }

    resetScanToDb();
    players = {};
    dealerCards = [];
    return;
  }
}

function importCalculations() {
  const activePlayersCount = Object.keys(players).length;
  const playersChances = calculateAndImportChancesIfValid(
    dealerCards,
    players,
    activePlayersCount
  );

  if (playersChances) {
    importPlayersCalculations(playersChances);
  }
}

export function executeCardReader(line, playerId, isDealer, isDealerTrash) {
  checkForResetCard(line);
  const unvalidatedCard = convertLineToCard(line);
  const card = convertLineToCardIfValid(line);

  if (isDealerTrash) {
    findAndFoldPlayersHand(unvalidatedCard);
    return;
  }

  if (!card) return;

  if (isDealer) {
    importCardForDealer(card);
  } else {
    importCardForPlayer(playerId, card);
  }
  importCalculations();
}
