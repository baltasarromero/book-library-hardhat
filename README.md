# Sample Hardhat Project

Hardhat version of the book library project, created as part of the LimeAcademy training program

## Etherscan Verification
### Goerli
Link to verified code in Goerli EtherScan: https://goerli.etherscan.io/address/0x2e51EEecF14f3532c2F710896bfFeDa89DDA4b50#code

### Sepolia
Link to verified code in Sepolia EtherScan: https://sepolia.etherscan.io/address/0xe7B6C71D4f4C89c4eD150fEDC5E974Ab1151b0Dc#code

## Scripts to interact with the contract
## Local Hardhat node
In order to interact with a local version of BookLibrary run the following commands
- npx hardhat node
- npx hardhat deploy-with-pk-to-selected-network --network localhost --private-key {A_VALID_PK_FOR_LOCAL_HH_NETWORK}
- Generate .env file including the following values
    **HH_ACCOUNT_0_PK 
    **BOOK_LIBRARY_LOCAL_ADDRESS
- node interact-local.js

## Goerli network
In order to interact with a local version of BookLibrary run the following commands
- npx hardhat node
- Generate .env file including the following values
    **GOERLI_WALLET_1_PK
    **GOERLI_WALLET_2_PK
    **BOOK_LIBRARY_GOERLI_ADDRESS = {CONTRACT_ADDRESS_IN_GOERLI} //Should be previously deployed
    **INFURA_PROJECT_ID
- node interact-goerli.js

