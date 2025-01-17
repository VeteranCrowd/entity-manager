<!-- TYPEDOC_EXCLUDE -->

> [API Documentation](https://docs.karmanivero.us/entity-manager/) • [CHANGELOG](https://github.com/karmaniverous/entity-manager/tree/main/CHANGELOG.md)

<!-- /TYPEDOC_EXCLUDE -->

# entity-manager

**EntityManager implements rational indexing & cross-shard querying at scale in your NoSQL database so you can focus on your application logic.**

> The Typescript refactor is still in flux, but stabilizing! Still fleshing out the [demo](https://github.com/karmaniverous/entity-manager-demo) & [documentation](https://karmanivero.us/projects/entity-manager/intro/).

If you have any questions, please [start a discussion](https://github.com/karmaniverous/entity-manager/discussions). Otherwise stay tuned!

## Why?

Traditional relational database systems like MySQL or SQL Server implement indexing & scaling strategies at a platform level based on schemas defined at design time.

NoSQL platforms like DynamoDB offer far better performance at scale, but structured index & shard keys must be defined as data elements and exploited by application logic in data retrieval & cross-shard queries. **They shift the burden of complexity from the database platform to the developer!**

EntityManager encapsulates a provider-agnostic, highly opinionated approach to the [single-table design pattern](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/).

With EntityManager, you can:

- Define related data entities & structured keys wth a simple, declarative configuration format.

- Specify a partition sharding strategy that maximizes query performance while permitting planned, staged scaling over time.

- Add or remove structured index keys from entity data objects with a single method call.

- Perform paged, cross-shard, multi-index queries with a single method call.

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
