let express = require('express'),
    request = require('request-promise'),
    dateFormat = require('dateformat'),
    _ = require('lodash'),
    app = express();

const stocksSymbols = ['MSFT', 'AAPL', 'FB', 'EA', 'IBM'];
const apiKey = 'J0ERJON5ON2X8K7P';

app.get('/stocks', (req, res) => res.send({stocksSymbols}));

app.get('/stocks/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    let uri = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    request({uri, json: true, method: 'GET'})
        .then((resp) => {
            let arr = [];
            const series = resp['Time Series (Daily)'];
            let tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
            for (let date in series) {
                // filtering out data
                if (series.hasOwnProperty(date) && dateFormat(tenDaysAgo, 'yyyy-mm-dd') < date) {
                    arr.push({
                        date: date,
                        ..._.transform(series[date], (result, val, key) => result[key.split(' ').pop()] = val)
                    })
                }
            }
            return arr;
        })
        .then((resp) => {
            // We are simulating request failure here, It is here by design, so please don't touch this if.
            if (Math.random() < 0.3) {
                return Promise.reject(`Something went wrong with getting ${symbol}!`)
            }
            return res.send(resp)
        });
});

app.listen(3000, () => console.log('Server is running!'));