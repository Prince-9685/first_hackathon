const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if(msg.type() === 'error') console.log('ERR:', msg.text());
        });
        page.on('pageerror', err => console.log('PAGEERR:', err.message));
        
        await page.goto('http://localhost:5173');
        await new Promise(r => setTimeout(r, 2000));
        
        const btn = await page.$('button');
        if (btn) await btn.click();
        else console.log('Button not found');
        
        await new Promise(r => setTimeout(r, 3000));
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
