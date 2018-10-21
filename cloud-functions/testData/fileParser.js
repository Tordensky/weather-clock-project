
const res = require('fs').readFileSync('yr-locations.txt').toString().split('\n')
    .filter(function (line, idx, res) {
        return !(idx < 1 || idx === res.length - 1);

    })
    .map(function (line, idx, res) {

        const [
            Kommunenummer,
            navn,
            Prioritet,
            StadtypeNynorsk,
            type,
            StadtypeEngelsk,
            Kommune,
            Fylke,
            Lat,
            Lon,
            moa,
            Nynorsk,
            url,
            Engelsk,
            ...r
        ] = line.split('\t');
        return {
            Prioritet,
            navn,
            type,
            Kommune,
            Fylke,
            Lat,
            Lon,
            moa,
            url,
        };
    });

//console.log(JSON.stringify(res));
console.log(res[res.length -1]);

var stream = require('fs').createWriteStream("yrUrl.js");
stream.once('open', function(fd) {
    stream.write("const locations = [\n");
    res.forEach(row => stream.write('    ' + JSON.stringify(row) + ',\n'));
    stream.write("]\n");
    stream.end();
});