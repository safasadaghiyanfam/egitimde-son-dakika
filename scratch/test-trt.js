const https = require('https');
https.get('https://www.trthaber.com/haber/egitim/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /href=["'](\/haber\/egitim\/[^"']+\.html)["']/g;
    let match;
    const seen = new Set();
    while ((match = regex.exec(data)) !== null) {
      seen.add('https://www.trthaber.com' + match[1]);
    }
    console.log('Benzersiz TRT Eğitim Haber URL sayısı:', seen.size);
    console.log(Array.from(seen).slice(0, 10));
  });
});
