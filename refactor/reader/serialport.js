import { SerialPortMock, SerialPort  } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export function generateReader({ path, playerId }, isDealer = false) {
    return {
        isDealer,
        path,
        playerId,
        parser: new ReadlineParser(),
        port: new SerialPort({
            path,
            baudRate: 115200,
        })
    }
}
