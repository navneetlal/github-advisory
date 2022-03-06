import log4js from 'log4js'

log4js.configure({
    appenders: { 'out': { type: 'stdout', layout: { type: 'coloured' } } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});

export default log4js