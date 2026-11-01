const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { validateUrlForExtraction } = require('../utils/urlValidator');

/**
 * Service to fetch, sanitize, and extract article content safely.
 */
class ArticleService {
  /**
   * Extracts clean article content and metadata from a URL.
   */
  async extractFromUrl(urlString) {
    // 1. SSRF and Protocol Validation
    const validation = await validateUrlForExtraction(urlString);
    if (!validation.valid) {
      throw new Error(`Security validation failed: ${validation.reason}`);
    }

    const safeUrl = validation.url;

    // 2. Fetch webpage with safe timeouts and size boundaries
    let response;
    try {
      response = await axios.get(safeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AI-Editorial-Workspace/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000, // 10 second timeout
        maxContentLength: 8 * 1024 * 1024, // 8MB limit
        maxRedirects: 5
      });
    } catch (fetchErr) {
      if (fetchErr.code === 'ECONNABORTED') {
        throw new Error('Connection timed out while fetching article.');
      }
      throw new Error(`Failed to retrieve page: ${fetchErr.message}`);
    }

    const html = response.data;
    if (!html || typeof html !== 'string') {
      throw new Error('Fetched resource did not return HTML text.');
    }

    // 3. Extract content using Mozilla Readability via JSDOM
    let articleTitle = 'Untitled Article';
    let publisher = '';
    let extractedText = '';

    try {
      const dom = new JSDOM(html, { url: safeUrl });
      const reader = new Readability(dom.window.document, {
        charThreshold: 80
      });
      const parsed = reader.parse();

      if (parsed && parsed.textContent && parsed.textContent.trim().length > 150) {
        articleTitle = parsed.title || articleTitle;
        publisher = parsed.siteName || '';
        extractedText = parsed.textContent.trim();
      }
    } catch (readabilityErr) {
      console.warn('[ArticleService] Mozilla Readability failed, attempting Cheerio fallback:', readabilityErr.message);
    }

    // 4. Cheerio fallback if Readability extracted too little or failed
    if (!extractedText || extractedText.length < 150) {
      const $ = cheerio.load(html);

      // Clean unwanted elements
      $('script, style, noscript, nav, footer, header, aside, .advertisement, .ad, .social-share, .cookie-banner').remove();

      articleTitle = $('meta[property="og:title"]').attr('content') ||
                     $('title').text().trim() ||
                     articleTitle;

      publisher = $('meta[property="og:site_name"]').attr('content') || publisher;

      // Extract from main semantic tags or paragraphs
      const mainContainer = $('article, main, [role="main"], .post-content, .article-body, #content');
      let fallbackText = '';

      if (mainContainer.length > 0) {
        fallbackText = mainContainer.text();
      } else {
        $('p').each((_, el) => {
          const pText = $(el).text().trim();
          if (pText.length > 30) fallbackText += pText + '\n\n';
        });
      }

      fallbackText = fallbackText.replace(/\s+/g, ' ').trim();
      if (fallbackText.length > 100) {
        extractedText = fallbackText;
      }
    }

    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract readable article content. The website may require login or render via dynamic JavaScript. Please use the Paste Content option.');
    }

    // Derive publisher from URL domain if missing
    if (!publisher) {
      try {
        const u = new URL(safeUrl);
        publisher = u.hostname.replace(/^www\./, '');
      } catch (e) {
        publisher = 'Online Publication';
      }
    }

    const contentHash = crypto.createHash('sha256').update(extractedText).digest('hex');

    return {
      title: articleTitle.trim(),
      publisher: publisher.trim(),
      url: safeUrl,
      extractedContent: extractedText,
      contentHash
    };
  }
}

module.exports = new ArticleService();
