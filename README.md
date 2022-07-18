# graphite-kyc-demo

## Environment
> Node.js >= 14.17.1
> 
> Yarn >= 1.15.2

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Interaction with the UI

A mnemonic phrase or a Graphite private key is used to generate accounts (`src/graphite/core.js`).
The button `Clear` clears the form, the button `Reload` starts the hard reload account update.
Background update runs every 10 seconds (App.vue > this.intervalTime). 

### Activation
`src/graphite/index.js`

Account activation is started by clicking on the `Activate` button. The wallet balance must be at least 0.01 @G.

### KYC
`src/graphite/kyc.js`

Changing the KYC level is possible after account activation. After entering the level and clicking `Submit`, an activation request will appear in the `KYC Center` section.

### Filter
`src/graphite/filter.js`

Changing the filter is possible after account activation. After entering the filter and clicking `Submit`, a request will appear in the `KYC Center` section.
An account with a lower level (KYC 0) cannot send transactions to an account with a higher level (KYC 1+).

The addresses of nodes, KYC centers and other important things are stored in `src/graphite/config.js`.
Reputation counts in `src/graphite/reputation.js`.
