
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
    databaseURL: "https://texas-arduino-default-rtdb.europe-west1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export default function useScanActions() {

    return {
        importPlayerScanCardToDb(playerId, playerCards) {
            set(ref(database, `/players/${playerId}/cards`), playerCards);
        },
        importDealerScanCardToDb(dealerCards) {
            set(ref(database, `/game/cards`), dealerCards);
        },
        importPlayersCalculations(playersChances) {
            Object.keys(playersChances).forEach(playerId => {
                set(ref(database, `/players/${playerId}/chance`), playersChances[playerId]);
            });
        },
        foldPlayersHandToDb(playerId) {
            set(ref(database, `/players/${playerId}/action`), 'fold');
        },
        resetScanToDb() {
            set(ref(database, `/players/0/cards`), []);
            set(ref(database, `/players/0/chance`), null);
            set(ref(database, `/players/0/action`), null);

            set(ref(database, `/players/1/cards`), []);
            set(ref(database, `/players/1/chance`), null);
            set(ref(database, `/players/1/action`), null);

            set(ref(database, `/players/2/cards`), []);
            set(ref(database, `/players/2/chance`), null);
            set(ref(database, `/players/2/action`), null);

            set(ref(database, `/players/3/cards`), []);
            set(ref(database, `/players/3/chance`), null);
            set(ref(database, `/players/3/action`), null);
            
            set(ref(database, `/game/cards`), []);
        },
    };
};
