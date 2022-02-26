# The Graph subgraphs of Matters

We use [The Graph](https://thegraph.com/) to index [contract](https://github.com/thematters/contracts) data, for better query performance. And it's a [GraphQL](https://graphql.org/) API, more flexible than RESTful API.

## Subgraphs

| Name    | Network        | Playground URL                                                  | API Endpoint                                               |
| ------- | -------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Logbook | Polygon Mumbai | https://thegraph.com/hosted-service/subgraph/thematters/logbook | https://api.thegraph.com/subgraphs/name/thematters/logbook |

### GraphQL Schema

You can open the "Playground URL" and view the schema in the right sidebar, or [schema.graphql](./logbook/schema.graphql) in this repository.

### Usages

```ts
// choose any GraphQL client library you like
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";

// initialize the client
const API_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/thematters/logbook";
const client = new ApolloClient({
  uri: API_ENDPOINT,
  cache: new InMemoryCache()
});

// fetch data inside a React component
const LATEST_LOGGED_LOGBOOKS = gql`
  query LatestLogbooks {
    publications(first: 5, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      log {
        id
        content
      }
      logbook {
        id
        title
      }
    }
  }
`;

function Feed() {
  const { loading, error, data } = useQuery(LATEST_LOGGED_LOGBOOKS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.publications.map(({ id, logbook }) => (
    <div key={id}>
      <p>{logbook.title}</p>
    </div>
  ));
}
```

More query usages, see [GraphQL API](https://thegraph.com/docs/en/developer/graphql-api).

To interact with the contract, please checkout [thematters/contracts](https://github.com/thematters/contracts).

## Development

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
