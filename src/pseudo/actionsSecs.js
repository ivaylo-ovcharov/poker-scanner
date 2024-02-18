// 08:47:22 - First Card was scanned (COM4 Under the gun)
// 08:47:22 - Ace of Clubs scaned on COM4
// 08:47:24 - King of Clubs scanned on COM4
// 08:47:23 - Queen of Hearts scanned on COM5
// 08:47:26 - 5 of Hearts scanned on COM5
// 08:47:26 - 74% calculated for COM4 / 26% Calculated for COM5
// 08:47:29 - Dealer starts timer - COM4 under the gun
// 08:47:36 - Dealer stops timer - COM5 under the gun (COM4 - Action)
// 08:47:44 - Dealer stops timer FINAL  - Waiting for Flop (COM5 Action)
// 08:47:55 - 2 of Hearts scanned on DEALER
// 08:47:56 - 3 of Clubs scanend on DEALER
// 08:47:56 - 5 of Hearts scanned on DEALER
// 08:47:56 - 56% calculated for COM4 / 44% Calculated for COM5
// 08:47:58 - Dealer starts timer - COM4 Under the gun
// 08:48:21 - Dealer stops timer - COM5 Under the gun (COM4 Action)
// 08:48:33 - Dealer clicks timer NEXT - COM4 Under the gun (COM5 Action)
// 08:48:44 - Dealer clicks timer - COM5 Under the gun (COM4 Action)
// 08:48:56 - Dealer clicks timer FINAL - Waiting for River (COM5 Action)
// 08:49:02 - 8 of Hearts is scanned on DEALER
// 08:49:05 - Dealer clicks timer - COM4 Under the gun
// 08:49:09 - Dealer clicks timer - COM5 Under the gun
// 08:49:22 - Dealer clicks win for COM5
// 08:49:28 - COM5 Assign $40 win

// App
const appAction1 = {
    createdBy: 'APP',
    createdAt: '08:47:22',
    action: 'FirstCardScanned'
}

// Player Actions
const playerAction1 = {
    createdBy: 'COM4',
    createdAt: '08:47:22',
    type: 'SCAN',
    card: 'Ac'
}

const playerAction2 = {
    createdBy: 'COM4',
    createdAt: '08:47:24',
    type: 'SCAN',
    card: 'Kc'
}