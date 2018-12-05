// @flow

// NOTE: this file exists to verify the type definitions are correct with flow.

const PathMatcher = require("./PathMatcher.js");

// $FlowFixMe: this is an error.
PathMatcher("foo", "bar");
// $FlowFixMe: this is an error.
PathMatcher("foo", (params, segment) => params + segment)("", "");
// $FlowFixMe: this is an error.
PathMatcher(["foo", "bar"], (params, segment) => params + segment)("", 1);

// Valid cases:
/*::
type TObj = {
  x: string;
};
*/
let route /*: TObj | null */ = { x: "" };
if (route !== null) {
  route = PathMatcher`foo${(params /*: TObj */, segment) =>
    Object.assign(params, { x: segment })}bar`(route, "");
}
PathMatcher`foo${(params, segment) => params + segment}bar`("", "");
PathMatcher`foo${(params, segment) => null}bar`("", "");
PathMatcher`foo${PathMatcher.rest((params, segment) => params + segment)}`(
  "",
  "",
);
PathMatcher`foo${PathMatcher.rest((params, segment) => null)}`("", "");
