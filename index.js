const express = require("express");
const fetch = require("node-fetch");
const Papa = require("papaparse");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());

function papaParsePromise(blob) {
    return new Promise(function (resolve) {
        Papa.parse(blob, {
            header: true,
            columns: true,
            skip_empty_lines: true,
            delimiter: ";",
            complete: function (result) {
                records = result.data;
                resolve(records);
            },
        });
    });
}

app.get("/", async (req, res) => {
    let result;
    const TAM_DATA_ENDPOINT =
        "http://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_TpsReel.csv";

    const fetchAndFilter = async (filters) => {
        const tamCSV = await (await fetch(TAM_DATA_ENDPOINT)).text();
        let records = await papaParsePromise(tamCSV);

        records = records.filter(
            (record) =>
                record["route_short_name"] == filters["route_short_name"]
            // && record["trip_headsign"].toUpperCase() ==
            //     filters["trip_headsign"].toUpperCase()
        );

        return records;
    };

    try {
        result = await fetchAndFilter(req.query);
        return res.json(result);
    } catch (error) {
        res.json({
            success: false,
            error: error,
        });
    }
});

app.get("/lines", async (req, res) => {
    let result;

    const TAM_DATA_ENDPOINT =
        "http://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_TpsReel.csv";

    const fetchAndFilter = async () => {
        const tamCSV = await (await fetch(TAM_DATA_ENDPOINT)).text();
        let records = await papaParsePromise(tamCSV);

        records = records.reduce((acc, curr) => {
            let groupKey = curr["route_short_name"];

            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(curr);

            return acc;
        }, {});

        return Object.keys(records);
    };

    try {
        result = await fetchAndFilter();
        return res.json(result);
    } catch (error) {
        res.json({
            success: false,
            error: error,
        });
    }
});

app.listen(port, () => {
    console.log(`App started on ${port}`);
});
