import { Signale } from 'signale';

export const log = new Signale({
    config: {
        uppercaseLabel: true,
        underlineLabel: false,
    },
});
