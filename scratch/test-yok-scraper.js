const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeTrtYok() {
  const html = await fetchUrl('https://www.trthaber.com/etiket/yok/');
  
  // Find all article links with title and img
  const itemRegex = /<a[^>]+href=["'](https:\/\/www\.trthaber\.com\/haber\/[^"']+\.html)["'][^>]*title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const articles = [];
  const seen = new Set();

  while ((match = itemRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    const content = match[3];

    if (!seen.has(url) && title.length > 5) {
      seen.add(url);
      let imgUrl = null;
      const imgMatch = content.match(/data-src=["']([^"']+)["']/i) || content.match(/src=["'](https:\/\/trthaberstatic[^"']+)["']/i);
      if (imgMatch) imgUrl = imgMatch[1];

      articles.push({ title, url, imgUrl });
    }
  }

  console.log(`TRT YÖK Sayfasından ${articles.length} adet haber çekildi:`);
  console.log(articles);
}

scrapeTrtYok().catch(console.error);
