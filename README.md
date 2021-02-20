# Composable-js

### Use cases

This package enables programmer to not care about the order of referencing and overriding decorators for constructors
and methods.

In following example the result of the `console.log` will be 1.

```typescript
let a: any;

function referencingDecorator(object: any, propertyName: string, descriptor: PropertyDescriptor) {
    a = descriptor.value;
}

function overridingDecorator(object: any, propertyName: string, descriptor: PropertyDescriptor) {
    descriptor.value = (...args: any[]) => 1;
}

class ExampleClassA {
    @referencingDecorator
    @overridingDecorator
    exampleMethod() {
        return 0;
    }
}

console.log(a());
```

On the other hand, if we swap the order of the decorators, we get 0.

```typescript
//...
@overridingDecorator
@referencingDecorator
exampleMethod()
{
    return 0;
}

//...
```

This happens because of a being a reference of the original function, not the overridden one. Same principle applies to
constructors.

Composable-js aims to solve this problem.

```typescript

let a: any;

function referencingDecorator(originalFunction: Function, composedFunction: Function) {
    a = composedFunction;
    return originalFunction
}

function overridingDecorator() {
    return (...args: any[]) => 1;
}

class ExampleClassA {
    @ComposableFunction.decorator(referencingDecorator)
    @ComposableFunction.decorator(overridingDecorator)
    exampleMethod() {
        return 0;
    }
}
console.log(a());

class ExampleClassB {
    @ComposableFunction.decorator(overridingDecorator)
    @ComposableFunction.decorator(referencingDecorator)
    exampleMethod() {
        return 0;
    }
}


console.log(a());
```

Using the composable function API the order of decorators is negated in terms for referencing. `a` will always call the final function, not the intermediary.

### Usage

Composable-js exposes to APIs - `ComposableClass` and `ComposableFunction`.

`static decorator<T>(transformation:(original:T,composed:T) => T)` method allows easy decorator creation by providing a transformation function, where `T` is either a constructor or a function.

You can also use the direct method of getting instance of `ComposableClass` or `ComposableFunction` assigned to particular constructor or function by calling `get<T>(value:T)`. The returned instance of the class has `composed` property which is the __current__ version of the overridden function and `chain<T>(transformation:(original:T,composed:T) => T)` which allows for manual chaining.


### Contribution

Feel free to create merge requests or issues, I'll look at them as fast as I can.