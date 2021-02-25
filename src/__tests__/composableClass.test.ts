import {Constructor} from "../types";
import {ComposableClass} from "../composableClass";

describe('Composable class', () => {

    const overrideDecorator = (original: Constructor, composable: Constructor) => {
        return class Overridden extends original {
            b = 1
        }
    }

    describe('Direct override', () => {
        class Base {

        }

        it('Should return composable class', () => {
            const composable = ComposableClass.get(Base);
            expect(composable).toBeTruthy()
            expect(composable).toBeInstanceOf(ComposableClass)
        })

        it('Should return the same composable class twice', () => {
            const composable1 = ComposableClass.get(Base);
            const composable2 = ComposableClass.get(Base);
            expect(composable1).toEqual(composable2)
        })

        it('Should return the same composable class twice after chaining', () => {
            const composable1 = ComposableClass.get(Base);
            composable1.chain(overrideDecorator)
            const composable2 = ComposableClass.get(Base);
            expect(composable1).toEqual(composable2)
        })

        it('Should return the same composed class before chaining', () => {
            const composable1 = ComposableClass.get(Base);
            composable1.chain(overrideDecorator)
            const composable2 = ComposableClass.get(Base);
            expect(composable1.composed).toEqual(composable2.composed)
        })

        it('Should return the same composed class after chaining', () => {
            const composable1 = ComposableClass.get(Base);
            const composable2 = ComposableClass.get(Base);
            composable1.chain(overrideDecorator)

            expect(composable1.composed).toEqual(composable2.composed)
        })

        it('Should override constructor', () => {
            const composable = ComposableClass.get(Base);
            const composed = composable.chain(overrideDecorator).composed;
            const composedInstance = new composed() as Base & { b: number }
            expect(composedInstance).toBeInstanceOf(Base);
            expect(composedInstance).toHaveProperty('b')
            expect(composedInstance.b).toEqual(1)
        })
    })

    describe('Decorator override', () => {

        it('Should override constructor', () => {
            @ComposableClass.decorator(overrideDecorator)
            class Base {

            }

            interface Overridden {
                b: number
            }

            const composedInstance: Overridden = new Base() as any
            expect(composedInstance).toBeInstanceOf(Base);
            expect(composedInstance).toHaveProperty('b')
            expect((composedInstance as any).b).toEqual(1)
        })
    })

})