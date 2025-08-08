const delay = ms => new Promise(res => setTimeout(res, ms));

async function getWeather() {
    try {
        const response = await fetch('/weather');
        if (response.status === 200) {
            const data = await response.json();
            console.log('Received latest weather report', { weather: data })
            return data;
        } else {
            console.error('Failed request with status', response.status);
            return null;
        }
    } catch(error) {
        console.error('Unknown error', error);
        return null;
    }
}

function replaceWeather(innerHtml) {
    const weatherDocument = document.getElementById('weather');
    weatherDocument.innerHTML = innerHtml;
}

async function fetchLatestWeather() {
    const weather = await getWeather();
    if (!weather){
        replaceWeather('<p class="notice">ERROR: failed to fetch latest weather report.</p>');
        throw new Error('API Failed');
    }
    
    let table = "<table>"
    table += "<thead><tr>"
    table += "<th>Date</th>";
    table += "<th>Summary</th>";
    table += "<th>Temperature</th>";
    table += "</tr></thead><tbody>";
    
    for (const report of weather) {
        table += "<tr>";
        table += `<td>${report.date}</td>`;
        table += `<td>${report.summary}</td>`;
        table += `<td>${report.temperatureC}<sup>º</sup> C</td>`;
        table += "</tr>";
    }
    
    table+="</tbody></table>";
    replaceWeather(table);
}

async function main() {
    while(true) {
        try {
            await fetchLatestWeather();
            await delay(2000);
        } catch(e) {
            break;
        }
    }
}

main().catch(e => console.error('Uncaught error', e));
