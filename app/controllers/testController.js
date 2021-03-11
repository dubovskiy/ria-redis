const
    request = require('request-promise')
;

module.exports = {
    /**
     * @example curl -XGET "http://localhost:8081/test"
     */
    async getHello (ctx, next) {
        let Hello = 'World'

        // if (ctx.query['name'] != undefined && ctx.query['name'].length) {
        //     Hello = ctx.query['name']
        // }
        if (ctx.params.name != undefined && ctx.params.name.length) {
            Hello = ctx.params.name
        }

        ctx.body = { Hello };
        await next();
    },

    async getTicker (ctx, next) {
        let ticker = ctx.params.ticker;
        let json = JSON.parse(await request('https://iss.moex.com/iss/engines/stock/markets/shares/securities/' + ticker + '.json'));
        console.log(json);

        //ctx.body = json.marketdata.data.filter(function(d) { return ['TQBR', 'TQTF'].indexOf(d[1]) !== -1; })[0][12];
        ctx.body = json.marketdata;
        await next();
    }
}