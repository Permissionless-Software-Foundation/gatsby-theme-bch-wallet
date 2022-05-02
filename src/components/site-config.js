/*
  This file is intended to be overwritten. It provides a common place to store
  site configuration data.
*/

const config = {
  title: 'FullStack.cash',
  titleShort: 'PSF',
  balanceText: 'BCH Balance',
  balanceIcon: 'fab-bitcoin',

  // The BCH address used in a memo.cash account. Used for tracking the IPFS
  // hash of the mirror of this site.
  memoAddr: 'bitcoincash:qqwdv3hkmvd5vk0uhwqrqnef54542e5ctvy3ppt0nq',

  // Footer Information
  hostText: 'Permissionless Software Foundation',
  hostUrl: 'https://psfoundation.cash/',
  sourceCode:
    'https://github.com/Permissionless-Software-Foundation/gatsby-theme-bch-wallet',
  torUrl: '2egutot63q765ciwsenlcy5zdyxwxt7olzbldr5dx5i3ixsef2nvrzid.onion',
  clearWebUrl: 'https://gatsby-ipfs-web-wallet.fullstack.cash',

  // Interface used by minial-slp-wallet
  interface: 'consumer-api',
  restURL: 'https://free-bch.fullstack.cash',
  // restURL: 'http://localhost:5005'
  // interface: 'rest-api',
  // restURL: 'https://bchn.fullstack.cash/v5/'

  // Set to true if you want to manually override auto-detection of the DEX URL,
  // and use the setting below.
  manualDexUrl: false,
  // Default URL for bch-dex
  bchDexUrl: 'http://localhost:5700'
}

// Attempt to auto-detect the URL for the bch-dex.
if (typeof window !== 'undefined') {
  if (window && window.document && window.document.domain) {
    if (window.document.domain.includes('192.168') ||
      window.document.domain.includes('localhost')) {
      config.bchDexUrl = `http://${window.document.domain}:5700`
    }
  }
}

module.exports = config
