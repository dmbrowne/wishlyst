if (typeof Object.entries === "function") {
} else {
  Object.entries = (obj: { [key: string]: any }) => Object.keys(obj).map(k => [k, obj[k]]) as ReturnType<ObjectConstructor["entries"]>;
}
