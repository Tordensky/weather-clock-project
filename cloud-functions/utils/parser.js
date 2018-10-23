
const Icon = {
    SOL: 1,
    SOL_BAK_SKY: 2,
    OVERSKYET: 3,
    REGN: 4,
    LYN: 5,
    SNOW: 6,
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
    "Lett snø og torden": Icon.SNOW,
    "Snø og torden": Icon.SNOW,
    "Kraftig snø og torden": Icon.SNOW,
};

const parseEntry = time => {
    return {
        from: time.from,
        to: time.to,
        temp: time.temperature.value,
        pressure: time.pressure.value,
        windSpeed: time.windSpeed.mps,
        windDirection: time.windDirection.deg,
        text: time.symbol.name,
        icon: IconMapping[time.symbol.name] || -1
    }
};

function parseYrForecast(data) {
    const { name, type, country } = data.weatherdata.location;
    const location = `${name}, ${type} i ${country}`;
    const forecast = data.weatherdata.forecast.tabular.time
        .map(parseEntry)
        .map(e => Object.assign(e, { location }));

    return { forecast }
}

exports.parseYrForecat = parseYrForecast;