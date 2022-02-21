# The Graph subgraphs of Matters 

## Getting Started

Install the Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

Install dependencies

```bash
npm install
```

## Deploy

```bash
# Codegen
npm run codegen -- -o logbook/generated/ logbook/subgraph.yaml 

# Build
npm run build -- -o logbook/build/ logbook/subgraph.yaml

# Deploy
npm run deploy -- -o logbook/build/ thematters/logbook logbook/subgraph.yaml
```