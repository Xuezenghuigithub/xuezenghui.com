function foo() {
  var name = 'Zander';

  function bar() {
    return name;
  }
  return bar;
}

// console.log(name);

var hello = foo();
console.log(hello());