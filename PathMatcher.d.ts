// Type definitions for pathmatcher
// Project: https://github.com/jussi-kalliokoski/pathmatcher.js
// Definitions by: Jussi Kalliokoski <jussi.kalliokoski@gmail.com>

export = PathMatcher;

/**
 * PathMatcher is a tagged template function that returns a function for
 * matching paths and extracting route parameters from them.
 *
 *    const newParams = () => ({ userID: "" });
 *    const setUserID = (params, userID) => ({ ...params, userID });
 *    const pathMatcher = PathMatcher`/users/${setUserID}`;
 *    const params = pathMatcher(newParams(), "/users/abcdef"); // { userID: "abcdef" }
 *
 * The created function returns null if the given path does not match the
 * template.
 *
 *    PathMatcher`/users/${setUserID}`(params, "/not_users/abcdef") // null
 *
 * Matched segments cannot contain a path separator (/). To match against
 * segments that contain path separators, use the rest operator:
 *
 *    PathMatcher`/users/${setUserID}/${PathMatcher.rest(setSubRoute)`
 *
 * Rest operators can only be used at the last filler position, followed by an
 * empty string:
 *
 *    PathMatcher`/abc/${PathMatcher.rest(xyz)}-${xcv}` // error
 *    PathMatcher`/users/${setUserID}/${PathMatcher.rest(setSubRoute)/foo` // error
 *
 * PathMatcher assumes ownership of the passed route parameter objects,
 * allowing fillers to modify the parameters in place if wanted. This makes the
 * design usable for both functional and imperative paradigms:
 *
 *    const newParams = () => ({ userID: "" });
 *    const setUserID = (params, userID) => { params.userID = userID; return params; };
 *    const pathMatcher = PathMatcher`/users/${setUserID}`;
 *    const params = pathMatcher(newParams(), "/users/abcdef"); // { userID: "abcdef" }
 *    const mutParams = newParams();
 *    pathMatcher(mutParams, "/users/abcdef"); // { userID: "abcdef" }
 *    mutParams; // { userID: "abcdef" }
 */
declare function PathMatcher<T>(
  parts: TemplateStringsArray,
  ...fillers: Array<(params: T, segment: string) => T | null>
): (params: T, path: string) => T | null;

declare namespace PathMatcher {
  /**
   * rest wraps a filler function, signaling to PathMatcher that the filler is a
   * rest option that consumes also path separators.
   */
  export function rest<T>(fn: (params: T, segment: string) => T | null): (params: T, segment: string) => T | null;
}
