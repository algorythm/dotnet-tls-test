async function loadWeather() {
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

async function main() {
    const weather = await loadWeather();
    if (!weather){
        replaceWeather('<p class="notice">ERROR: failed to fetch latest weather report.</p>');
        return;
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

main().catch(e => console.error('Uncaught error', e));
