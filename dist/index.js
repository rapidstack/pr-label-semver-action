// src/hello.ts
var sayHello = () => console.log("Hello, world!");

// src/index.ts
var main = async () => {
  sayHello();
};
await main();
