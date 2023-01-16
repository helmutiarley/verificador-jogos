const pup = require('puppeteer');

const url = 'https://recsportspix.bet/apostar';
const google = 'https://www.google.com.br/';

(async () => {
    const browser = await pup.launch({headless: true})
    const page = await browser.newPage()
    console.log('Iniciei!')

    await page.goto(url)
    console.log('Fui para a URL!') 

    await page.waitForSelector('.col-4_5')

    const conteudoObj = await page.$$eval('.col-4_5 > .text-truncate > .team_list', el => el.map(div => div.innerText));

    const horarios = await page.$$eval('small', el => el.map(small => small.innerText));

    let i = 0;

    let toSearch = [];

    while (i < conteudoObj.length) {
        toSearch.push(addJogos(conteudoObj[i], conteudoObj[i+1], horarios[i]));
        i+=2;
    }

    // console.log(toSearch);

    console.log('Iniciando busca no Google...');

    let horarioGoogle = null;

    for (let c in toSearch) {
        await page.goto(google);

        await page.waitForSelector('input.gLFyf');
    
        await page.type('input.gLFyf', `${toSearch[c].time1} x ${toSearch[c].time2}`)
    
        await Promise.all([
            page.waitForNavigation(),
            page.keyboard.press('Enter')
        ])
    
        horarioGoogle = await page.$$eval('span.imso_mh__lr-dt-ds', elHorario => elHorario.map(span => span.innerText))

        if (JSON.stringify(horarioGoogle).slice(-7, -2) === toSearch[c].horario.slice(-5)) {
            console.log('Correto...')
        } else {
            console.log(`${toSearch[c].time1} x ${toSearch[c].time2} - VERIFICAR`)
        }

    }    

    await browser.close();

    // return conteudoObj;
})();

function addJogos (time1, time2, horario) {
    this.time1 = time1 
    this.time2 = time2
    this.horario = horario.slice(-5)
    return {
        time1,
        time2,
        horario
    }
}