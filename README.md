<h1 align="center">DBank</h1>

<h4 align='center'> A Decentralized Financial Service.</h4>

## File Structure

```
.
├── migrations/                -> Contains Migrations for Smart Contracts
├── public/
├── screenshots/
├── scripts/
├── src
|   ├── abis/
|   ├── components/            -> Contains Frontend React pages
|   ├── contracts/             -> Conatains Smart Contracts
|   ├── dbank. jpg
|   ├── index.js
|   ├── logo. jpg
|   └── serviceWorker.js
├── test/                      -> Contains Chai and Mocha tests for Smart Contracts
├── .env_example
├── package.json               -> Npm package.json file
└── truffle-config.js          -> Configuration file for truffle
```

## Technology Stack

- Solidity                (0.6.0+)
- Truffle                 (5.1.0+)
- Web3                    (1.2.0+)
- HTML5
- CSS3
- ReactJs                 (16.13+)
- ES6 JavaScript


## Features

- Deposit Tokens
	- User can deposit tokens (min 0.01 eth) and an appropriate interest would be given on that amount.
- Withdraw Tokens
  - User can withdraw a particular amount or whole amount  with the interest.
- Borrow Tokens
  - User will get 50% of collateral, in Tokens 
  - User cannot borrow until they have some deposited amount in DBank
  - borrow amount should be less than the deposited amount
- Payoff Tokens
  - Payoff the tokens that was borrowed 
- Keep track of the deposited amount using Show Deposits button 
- Keep track of the borrowed amount using Borrowed Amount button
- Dark Mode

## Screenshots

![1](/screenshots/1.jpg)

![2](/screenshots/2.jpg)

![3](/screenshots/3.jpg)

![4](/screenshots/4.jpg)

![5](/screenshots/5.jpg)

![6](/screenshots/6.jpg)

#
