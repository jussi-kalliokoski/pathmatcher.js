# PathMatcher

PathMatcher is a JS library for matching URL paths to routes and extracting their route parameters, similar to how most routers provide string templates for this purpose.

[![Build Status](https://travis-ci.org/jussi-kalliokoski/pathmatcher.js.svg?branch=master)](https://travis-ci.org/jussi-kalliokoski/pathmatcher.js)
[![Coverage Status](https://img.shields.io/coveralls/jussi-kalliokoski/pathmatcher.js.svg)](https://coveralls.io/r/jussi-kalliokoski/pathmatcher.js)

## Installation

```bash
npm install --save pathmatcher
```

## Usage

<details>
<summary>TypeScript</summary>

```typescript
// UserRoute.ts
import PathMatcher from "pathmatcher";
import UserService from "./UserService.ts";

interface IParams {
    userID: string;
}

function newParams(): IParams {
    return {
        userID: "",
    };
}

function setUserID(params, userID) {
    return { ...params, userID };
}

const pathMatcher = PathMatcher`/users/${setUserID}`;

export default async function UserRoute(req: Request): Response | null {
    const params = pathMatcher(newParams(), new URL(req.url).pathname);
    if (params === null) {
        return null;
    }
    const user = await UserService.getUserByID(params.userID);
    if (user === null) {
        return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify(user));
}
```
</details>

## Design Goals

### Type Safety

Most frameworks and tools that offer routing have poor type safety. It's easy to create bugs in routes just by making a typo:

```javascript
app.get("/users/:userID", (req, res) => {
    UserService.get(req.params.userId /*<- whoops! */);
});
```

With PathMatcher, the type system of your choice (both TypeScript and Flow are supported) will protect you from such mistakes.

### Performance

It is arguably a micro-optimization to optimize path matching as it is unlikely to ever become a bottleneck in the real world. However, performance gains (and especially regressions) tend to accumulate and each poorly performing component eats away at your performance budget, and with emerging markets and IoT, our performance budgets are ever shrinking as we need to do the most we can with minimal cost and environmental impact. Thus PathMatcher aims to be a small component that does one thing well **and** performantly.

You can run the benchmark on your own computer with the following command:

```sh
node ./benchmark.js
```

On my MacBook Pro (Early 2015) the results are as follows (1M iterations):

```
PathMatcher: 161.080ms
RegExp: 233.508ms
handRolled: 124.143ms
```

which means that PathMatcher is ~31% faster than using a RegExp for path matching, and hand-optimizing your path matching is only ~23% faster than using PathMatcher! The performance gains will likely be even bigger with the planned demuxing feature that can use shared information about the routes to avoid repeated calculations on similar routes.

Performance also means small footprint, allowing services to boot up fast and users to start interacting with applications faster. Hence PathMatcher has a small footprint and targets only the latest standards.

### Reusability

Usual routing solutions are tightly coupled to the framework / library that they come with. This leads to duplication of effort and reinventing the wheel with different syntax every time.

PathMatcher aims to be a solution that can be used by any framework / library that performs routing, allowing developers to use the same fast & secure path matching everywhere, be it service workers, node, cloudflare workers or client side navigation routing, or due to its small footprint, even as a standalone solution for highly optimized applications.

### Simplicity

While PathMatcher comes with a lot more boilerplate than for example express router, the goal is still to keep things as simple as possible. In fact, terseness does not necessarily mean simplicity and the philosophy followed by PathMatcher is that simplicity comes not from how much you have to type, it comes from how much you have to think. Having a single responsibility type-safe path matcher that doesn't become lost in a huge machinery of a megaobject frees you to think think about more important things and makes debugging production issues easier.

## License

PathMatcher is licensed under the ISC license. See LICENSE.md for more details.
