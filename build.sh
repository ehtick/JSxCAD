#!/bin/bash

npm run bootstrap && npm run depcheck && npm run prettier && npm run lint && npm run test && npm run rollup && ./publish-es6.sh && ./publish-wasm.sh && npm run doc && echo 'DONE'
