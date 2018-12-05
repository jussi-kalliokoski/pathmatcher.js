// @flow

const rests /*: any */ = new WeakMap();

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
module.exports = function PathMatcher /*::<T>*/(
  parts /*: Array<string> */,
  ...fillers /*: Array<(params: T, segment: string) => T | null> */
) /*: (params: T, path: string) => T | null */ {
  let isRest = false;
  for (let i = 0; i < fillers.length; i++) {
    if (rests.has(fillers[i])) {
      if (i < fillers.length - 1) {
        throw new Error(
          "Rest parameters can only be placed in the last position",
        );
      }
      if (parts[i + 1] !== "") {
        throw new Error(
          "Rest parameters cannot be followed by a non-empty string",
        );
      }
      isRest = true;
      fillers[i] = rests.get(fillers[i]);
    }
  }

  for (let i = 1; i < parts.length - 1; i++) {
    if (parts[i] === "") {
      throw new Error("Cannot have an empty string between two fillers");
    }
  }

  return (params, path) => {
    let remaining = path;
    if (!remaining.startsWith(parts[0])) {
      return null;
    }

    remaining = remaining.slice(parts[0].length);

    for (let i = 0; i < fillers.length; i++) {
      const nextStart =
        parts[i + 1] === ""
          ? remaining.length
          : remaining.indexOf(parts[i + 1]);
      if (nextStart < 0) {
        return null;
      }
      const segment = remaining.slice(0, nextStart);
      if (!(isRest && i === fillers.length - 1) && segment.indexOf("/") >= 0) {
        return null;
      }
      const filler = fillers[i];
      const newParams = filler(params, segment);
      if (newParams === null) {
        return newParams;
      }
      params = newParams;
      remaining = remaining.slice(nextStart + segment.length);
    }

    if (remaining.length > 0) {
      return null;
    }

    return params;
  };
};

/**
 * rest wraps a filler function, signaling to PathMatcher that the filler is a
 * rest option that consumes also path separators.
 */
module.exports.rest = /*::<T>*/ (
  fn /*: (params: T, segment: string) => T | null */,
) /*: (params: T, segment: string) => T | null */ => {
  const wrapped = (params, path) => fn(params, path);
  rests.set(wrapped, fn);
  return wrapped;
};
