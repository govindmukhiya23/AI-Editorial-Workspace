const { URL } = require('url');
const dns = require('dns').promises;
const net = require('net');

/**
 * Checks whether an IP address is private, loopback, or reserved.
 */
function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (link local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // Broadcast
    if (ip === '255.255.255.255') return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    // Loopback ::1
    if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;
    // Unique local address fc00::/7
    if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
    // Link local fe80::/10
    if (/^fe[89ab][0-9a-f]:/i.test(ip)) return true;
    return false;
  }

  return false;
}

/**
 * Validates a target URL against SSRF vulnerabilities and protocol constraints.
 */
async function validateUrlForExtraction(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, reason: 'URL must be a non-empty string.' };
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch (err) {
    return { valid: false, reason: 'Malformed URL format.' };
  }

  // Only permit HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTP and HTTPS protocols are allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard private names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { valid: false, reason: 'Private or local hostnames are blocked.' };
  }

  // If hostname is already an IP, verify directly
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return { valid: false, reason: 'Private IP addresses are blocked.' };
    }
    return { valid: true, url: parsed.href };
  }

  // Resolve hostname via DNS to detect SSRF via DNS rebinding / private resolution
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return { valid: false, reason: `Hostname resolves to restricted address: ${addr.address}` };
      }
    }
  } catch (dnsErr) {
    // If DNS resolution fails, allow graceful rejection
    return { valid: false, reason: `DNS resolution failed: ${dnsErr.message}` };
  }

  return { valid: true, url: parsed.href };
}

module.exports = {
  validateUrlForExtraction,
  isPrivateIp
};
