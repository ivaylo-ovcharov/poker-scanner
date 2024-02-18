
import { executeCardReader } from './cardReader.js'
import { generateReader } from './reader/serialport.js'
import { useCurrentGameLoader } from './supabase/useCurrentGameLoader.js'
import { useCurrentHandLoader } from './supabase/useCurrentHandLoader.js'

const readers = [
    generateReader({ path: 'COM5', playerId: 1 }),
    generateReader({ path: 'COM8', playerId: 2 }),
    generateReader({ path: 'COM6' }, true)
]

const game = await useCurrentGameLoader()
const hand = await useCurrentHandLoader(game)


readers.forEach(reader => {
    reader.port.pipe(reader.parser).on('data', line => {
        console.log({ path: reader.path, line })
        executeCardReader(reader, line, readers, hand)
    });
});