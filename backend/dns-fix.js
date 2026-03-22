const dns = require('dns');
const origLookup = dns.lookup;

// Force all DNS lookups to use Cloudflare DNS
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // For MongoDB domains, try Cloudflare DNS first
  if (hostname.includes('mongodb.net')) {
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1', '1.0.0.1']);
    
    resolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        callback(null, addresses[0], 4);
      } else {
        // Fallback to original lookup
        origLookup(hostname, options, callback);
      }
    });
  } else {
    origLookup(hostname, options, callback);
  }
};

console.log('🔧 DNS override active - using 1.1.1.1 for MongoDB');
