# near-tx-parser

A library to parse the response out of near-api-js. A case study of near-cli wrapper is being used here. 

Note that work is in progress and these should be non breaking changes for near-api-js or near-cli even if you decide not to install the near-tx-parser.

- This is still very much work in progress
- requires - ```near-api-js```  branch ```parse-tx-readable-string```
- requires - ```near-cli``` branch ```with-tx-parser```

## ENV
NEAR_USE_TX_PARSER=RAW | STACK_TRACE (default) | FRIENDLY | NONE

```bash
export NEAR_USE_TX_PARSER=FRIENDLY
```

##### FRIENDLY, should always return one or more single liner readable responses.
##### RAW, should return raw JSON, mostly returned by block chain, error or success.
##### NONE, will return nothing
##### STACK_TRACE, will return error stack in case of error, but JSON payload when error not thrown by near-api-js or near-cli.

## Installation

```bash
npm install near-tx-parser
```

## Usage

### For near-cli
```
npm install near-tx-parser
```

### Your own project
```
npm install near-tx-parser
```

Then use any NEAR value Transaction JSON payload like below 
```javascript
let txParser = new TXParser();
await txParser.parse(any_json_response_from_api);    
```
### TODO
- configure parser either to return string or console.log
- implement it for many other scenario in the cli
