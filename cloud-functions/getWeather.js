const http = require("http");
const parser = require('xml2json');
const agent = new http.Agent({keepAlive: true});

const Icon = {
    SOL: 1,
    SOL_BAK_SKY: 2,
    OVERSKYET: 3,
    REGN: 4,
    SNOW: 5,
    LYN: 6,
};

const IconMapping = {
    "Sol": Icon.SOL,
    "Klarvær": Icon.SOL,
    "Lettskyet": Icon.SOL_BAK_SKY,
    "Delvis skyet": Icon.SOL_BAK_SKY,
    "Tåke": Icon.OVERSKYET,
    "Skyet": Icon.OVERSKYET,
    "Lett regn": Icon.REGN,
    "Regn": Icon.REGN,
    "Kraftig regn": Icon.REGN,
    "Lett sludd": Icon.SNOW,
    "Sludd": Icon.SNOW,
    "Kraftig sludd": Icon.SNOW,
    "Lett snø": Icon.SNOW,
    "Snø": Icon.SNOW,
    "Kraftig snø": Icon.SNOW,
    "Lette regnbyger": Icon.REGN,
    "Regnbyger": Icon.REGN,
    "Kraftige regnbyger": Icon.REGN,
    "Lette sluddbyger": Icon.SNOW,
    "Sluddbyger": Icon.SNOW,
    "Kraftige sluddbyger": Icon.SNOW,
    "Lette snøbyger": Icon.SNOW,
    "Snøbyger": Icon.SNOW,
    "Kraftige snøbyger": Icon.SNOW,
    "Lette regnbyger og torden": Icon.LYN,
    "Regnbyger med torden": Icon.LYN,
    "Kraftige regnbyger og torden": Icon.LYN,
    "Lette sluddbyger og torden": Icon.LYN,
    "Sluddbyger og torden": Icon.LYN,
    "Kraftige sluddbyger og torden": Icon.LYN,
    "Lette snøbyger og torden": Icon.LYN,
    "Snøbyger og torden": Icon.LYN,
    "Kraftige snøbyger og torden": Icon.SNOW,
    "Lett regn og torden": Icon.LYN,
    "Regn og torden": Icon.LYN,
    "Kraftig regn og torden": Icon.LYN,
    "Lett sludd og torden": Icon.LYN,
    "Sludd og torden": Icon.LYN,
    "Kraftig sludd og torden": Icon.LYN,
    "Lett snø og torden": Icon.LYN,
    "Snø og torden": Icon.SNOW,
    "Kraftig snø og torden": Icon.SNOW,
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getWeatherFn = (request, response) => {
    req = http.request({
        host: 'www.yr.no',
        path: '/sted/Norge/Oslo/Oslo/Oslo/varsel.xml',
        method: 'GET',
        port: 80,
        agent: agent,
    }, res => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => {
          const json = parser.toJson(rawData);
          const data = JSON.parse(json);
          const blindernStasjon = data.weatherdata.observations.weatherstation.find(s => s.name === 'Oslo (Blindern)');

          const result = {
            temp: blindernStasjon.temperature.value,
            type: blindernStasjon.symbol.name,
            wind: blindernStasjon.windSpeed.mps,
            icon: IconMapping[blindernStasjon.symbol.name] || 0,
            rIcon: getRandomInt(0, 6), // For easy testing
          };

          response.status(200).send(result);
        });
    });
    req.on('error', e => {
        response.status(500).send(`Error: ${e.message}`);
    });
    req.end();
};

exports.getWeatherFn = getWeatherFn;