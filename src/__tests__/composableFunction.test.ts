import {ComposableFunction} from "../composableFunction";

describe('Composable function', () => {

    const overrideDecorator = (original: Function, composable: Function) => {
        return (...args: any[]) => original(...[...args, 1])
    }

    describe('Direct override', () => {
        class Base {
            foo = jest.fn()
        }

        let instance: Base;

        beforeEach(() => {

            instance = new Base();
        })

        it('Should return composable method', () => {

            const composable = ComposableFunction.get(instance.foo);
            expect(composable).toBeTruthy()
            expect(composable).toBeInstanceOf(ComposableFunction)
        })

        it('Should return composed method', () => {
            const composed = ComposableFunction.get(instance.foo).composed;
            expect(composed).toBeTruthy()
            expect(typeof composed).toEqual('function')
        })

        it('Should return composed method unchanged', () => {
            const composed = ComposableFunction.get(instance.foo).composed;
            composed(1, 2, 3)
            expect(composed).toBeCalledTimes(1)
            expect(composed).toBeCalledWith(1, 2, 3)
        })

        it('Should return the same composable class twice', () => {
            const composable1 = ComposableFunction.get(instance.foo);
            const composable2 = ComposableFunction.get(instance.foo);
            expect(composable1).toEqual(composable2)
        })

        it('Should return the same composable class twice after chaining', () => {
            const composable1 = ComposableFunction.get(instance.foo);
            composable1.chain(overrideDecorator)
            const composable2 = ComposableFunction.get(instance.foo);
            expect(composable1).toEqual(composable2)
        })

        it('Should return the same composed class before chaining', () => {
            const composable1 = ComposableFunction.get(instance.foo);
            composable1.chain(overrideDecorator)
            const composable2 = ComposableFunction.get(instance.foo);
            expect(composable1.composed).toEqual(composable2.composed)
        })

        it('Should return the same composed class after chaining', () => {
            const composable1 = ComposableFunction.get(instance.foo);
            const composable2 = ComposableFunction.get(instance.foo);
            composable1.chain(overrideDecorator)

            expect(composable1.composed).toEqual(composable2.composed)
        })

        it('Should override constructor', () => {
            const composable = ComposableFunction.get(instance.foo);
            const composed = composable.chain(overrideDecorator).composed;
            composed(1, 2, 3)
            expect(instance.foo).toBeCalledTimes(1);
            expect(instance.foo).toBeCalledWith(1, 2, 3, 1)
        })

        it('Should persist call context', () => {
            class Example {
                foo(){

                    return this;
                }
            }
            const instance = new Example();
            const result = instance.foo()
            const composable = ComposableFunction.get(instance.foo).setDefaultContext(instance);
            const composed = composable.chain(overrideDecorator).setDefaultContext(instance).composed
            const composedResult = composed()
            expect(composedResult).toEqual(result)
        })

    })

    describe('Decorator override', () => {

        it('Should override constructor', () => {
            const fn = jest.fn();

            class Base {
                @ComposableFunction.decorator(overrideDecorator)
                foo(...args: any[]) {
                    fn(...args)
                }
            }

            const instance = new Base()

            instance.foo(1, 2, 3)
            expect(fn).toBeCalledTimes(1);
            expect(fn).toBeCalledWith(1, 2, 3, 1)
        })
    })
})