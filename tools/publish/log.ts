import {Signale} from 'signale';


const logger = new Signale({
    config: {
        underlineLabel: false,
        uppercaseLabel: true
    }
})

const log = {
    info(msg: string) {
        logger.info(msg, {foo:'bar'})

        logger.note('a note: '+msg)
        logger.star(msg)
    }
}


export default log;
