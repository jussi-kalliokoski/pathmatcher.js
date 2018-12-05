// NOTE: this file exists to verify the type definitions are correct with typescript.

import PathMatcher from "./PathMatcher.js";

interface TObj {
  x: string;
}

// @ts-ignore
PathMatcher("foo", "bar");
// @ts-ignore
PathMatcher("foo", (params, segment) => params + segment);
// @ts-ignore
PathMatcher`foo${(params, segment) => params + segment}bar`("", 1);
(() => {
  let route: TObj = { x: "" };
  // @ts-ignore
  route = PathMatcher`foo${(params: TObj, segment) => {
    params.x = segment;
    return route;
  }}bar`(route, "");
})();

// Valid cases:
let route: TObj | null = { x: "" };
if (route !== null) {
  route = PathMatcher`foo${(params: TObj, segment) => {
      params.x = segment;
      return route;
  }}bar`(route, "")
}
PathMatcher`foo${(params, segment) => params + segment}bar`("", "");
PathMatcher`foo${(params, segment) => null}bar`("", "");
PathMatcher`foo${PathMatcher.rest<string>((params, segment) => params + segment)}`("", "");
PathMatcher`foo${PathMatcher.rest<string>((params, segment) => null)}`("", "");