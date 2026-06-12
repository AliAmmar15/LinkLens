import { isTyposquat, normalizeInput } from '../algorithms/levenshtein.js';
import { isSuspicious } from '../algorithms/homograph.js';

let passed = 0;
let total = 0;

/** Asserts a boolean condition and logs PASS/FAIL with a label. */
function assert(label: string, condition: boolean): void {
  total++;
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    console.log(`  FAIL  ${label}`);
  }
}

// --- Typosquat detection tests ---
console.log('\nTyposquat detection:');

const r1 = isTyposquat('g00gle.com', ['google']);
assert('isTyposquat("g00gle.com", ["google"]) → flagged: true', r1.flagged === true);

const r2 = isTyposquat('google.com', ['google']);
assert('isTyposquat("google.com", ["google"]) → flagged: false (exact match)', r2.flagged === false);

const r3 = isTyposquat('paypol.com', ['paypal']);
assert('isTyposquat("paypol.com", ["paypal"]) → flagged: true, matchedDomain: "paypal"', r3.flagged === true && r3.matchedDomain === 'paypal');

const r4 = isTyposquat('amazon.com', ['amazon']);
assert('isTyposquat("amazon.com", ["amazon"]) → flagged: false (exact match)', r4.flagged === false);

const r5 = isTyposquat('xkcd.com', ['google']);
assert('isTyposquat("xkcd.com", ["google"]) → flagged: false (distance too large)', r5.flagged === false);

// --- Homograph detection tests ---
console.log('\nHomograph detection:');

const h1 = isSuspicious('google');
assert('isSuspicious("google") → flagged: false (all Latin)', h1.flagged === false);

const h2 = isSuspicious('gоgоle');
assert('isSuspicious("g\\u043Eg\\u043Ele") → flagged: true (mixed Latin + Cyrillic)', h2.flagged === true);

const h3 = isSuspicious('paypal');
assert('isSuspicious("paypal") → flagged: false', h3.flagged === false);

// --- normalizeInput tests ---
console.log('\nnormalizeInput:');

assert('normalizeInput("www.Google.com") → "google"', normalizeInput('www.Google.com') === 'google');
assert('normalizeInput("PayPal.com") → "paypal"', normalizeInput('PayPal.com') === 'paypal');

// --- Summary ---
console.log(`\nLinkLens integration test: ${passed}/${total} passed`);

// --- Performance audit (P4-C4) ---

/** Simulates scanning 150 hostnames through both detectors concurrently. */
async function simulatePageScan(): Promise<void> {
  const cleanDomains = [
    'github.com', 'stackoverflow.com', 'wikipedia.org', 'npmjs.com', 'typescript-lang.org',
    'mozilla.org', 'developer.chrome.com', 'web.dev', 'css-tricks.com', 'smashingmagazine.com',
    'youtube.com', 'twitter.com', 'linkedin.com', 'reddit.com', 'hackernews.com',
    'medium.com', 'dev.to', 'hashnode.dev', 'netlify.com', 'vercel.app',
    'cloudflare.com', 'digitalocean.com', 'heroku.com', 'aws.amazon.com', 'azure.microsoft.com',
    'google.com', 'apple.com', 'microsoft.com', 'facebook.com', 'instagram.com',
    'dropbox.com', 'notion.so', 'figma.com', 'canva.com', 'airtable.com',
    'trello.com', 'asana.com', 'jira.atlassian.com', 'confluence.atlassian.com', 'slack.com',
    'zoom.us', 'teams.microsoft.com', 'discord.com', 'telegram.org', 'signal.org',
    'stripe.com', 'paypal.com', 'shopify.com', 'etsy.com', 'ebay.com',
    'amazon.com', 'walmart.com', 'target.com', 'bestbuy.com', 'newegg.com',
    'nytimes.com', 'theguardian.com', 'bbc.com', 'reuters.com', 'apnews.com',
    'arxiv.org', 'semanticscholar.org', 'pubmed.ncbi.nlm.nih.gov', 'scholar.google.com', 'jstor.org',
    'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'mit.edu',
    'stanford.edu', 'harvard.edu', 'berkeley.edu', 'ox.ac.uk', 'cam.ac.uk',
    'docker.com', 'kubernetes.io', 'terraform.io', 'ansible.com', 'jenkins.io',
    'postgresql.org', 'mysql.com', 'mongodb.com', 'redis.io', 'elasticsearch.co',
    'graphql.org', 'grpc.io', 'protobuf.dev', 'openapi.tools', 'swagger.io',
    'reactjs.org', 'vuejs.org', 'angular.io', 'svelte.dev', 'nextjs.org',
    'expressjs.com', 'fastapi.tiangolo.com', 'djangoproject.com', 'flask.palletsprojects.com', 'spring.io',
    'rust-lang.org', 'golang.org', 'kotlinlang.org', 'swift.org', 'ruby-lang.org',
    'python.org', 'nodejs.org', 'php.net', 'java.com', 'scala-lang.org',
    'gitlab.com', 'bitbucket.org', 'sourceforge.net', 'codeberg.org', 'sr.ht',
    'letsencrypt.org', 'namecheap.com', 'godaddy.com', 'cloudflare.com', 'fastly.com',
  ];

  const typosquatDomains = [
    'g00gle.com', 'paypol.com', 'amazom.com', 'faceb00k.com', 'gooogle.com',
    'micosoft.com', 'appl3.com', 'netfl1x.com', 'twittter.com', 'instagarm.com',
    'github.com', 'stackoverflw.com', 'wikipeda.org', 'youtubbe.com', 'redditt.com',
    'slakc.com', 'discrod.com', 'telgram.org', 'stripee.com', 'shopfy.com',
    'dropbx.com', 'notiom.so', 'figmma.com', 'canvva.com', 'trelo.com',
    'linkedln.com', 'mediumm.com', 'devto.io', 'netlfy.com', 'vercell.app',
  ];

  const homographDomains = [
    'gооgle.com', 'pаypаl.com', 'аmаzon.com', 'fаcebook.com',
    'micrоsоft.com', 'аpple.com', 'netflіx.com', 'twіtter.com',
    'іnstаgrаm.com', 'gіthуb.com', 'slаck.com', 'dіscоrd.com',
    'strіpe.com', 'shоpіfy.com', 'drоpbоx.com', 'nоtіоn.so',
    'fіgmа.com', 'cаnvа.com', 'trеllо.com', 'аѕаnа.com',
  ];

  const allHostnames = [...cleanDomains, ...typosquatDomains, ...homographDomains];
  const trustedDomains = ['google', 'paypal', 'amazon', 'facebook', 'microsoft', 'apple', 'netflix', 'twitter', 'instagram', 'github'];

  const start = performance.now();

  await Promise.all(
    allHostnames.map(hostname =>
      Promise.resolve().then(() => {
        isTyposquat(hostname, trustedDomains);
        isSuspicious(hostname);
      })
    )
  );

  const elapsed = performance.now() - start;
  console.log(`\nPerformance audit: ${allHostnames.length} domains scanned in ${elapsed.toFixed(2)}ms`);
  if (elapsed < 500) {
    console.log('  PASS  Performance under 500ms');
  } else {
    console.log(`  FAIL  Performance exceeded 500ms (actual: ${elapsed.toFixed(2)}ms)`);
  }
}

simulatePageScan().catch(console.error);
