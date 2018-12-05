const PathMatcher = require("./PathMatcher.js");

const pm = PathMatcher`/users/${(params, userID) => {
  params.userID = userID;
  return params;
}}/name`;
console.time("PathMatcher");
for (let i = 0; i < 1e6; i++) {
  const { userID } = pm({ userID: "" }, "/users/foobar/name");
  if (userID != "foobar") {
    throw new Error(userID);
  }
}
console.timeEnd("PathMatcher");

const re = new RegExp("^/users/(?<userID>[^/]*)/name$");
console.time("RegExp");
for (let i = 0; i < 1e6; i++) {
  const { userID } = re.exec("/users/foobar/name").groups;
  if (userID != "foobar") {
    throw new Error(userID);
  }
}
console.timeEnd("RegExp");

const handRolled = (params, path) => {
  if (!path.startsWith("/users/") || !path.endsWith("/name")) {
    return null;
  }

  const userID = path.slice(7, path.length - 5);
  if (userID.indexOf("/") >= 0) {
    return null;
  }

  params.userID = userID;
  return params;
};
console.time("handRolled");
for (let i = 0; i < 1e6; i++) {
  const { userID } = handRolled({ userID: "" }, "/users/foobar/name");
  if (userID != "foobar") {
    throw new Error(userID);
  }
}
console.timeEnd("handRolled");
