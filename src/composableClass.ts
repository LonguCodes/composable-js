import 'reflect-metadata';
import {v4} from "uuid";
import {ComposableTransformation, Constructor, staticImplements} from "./types";
import {Composable, ComposableStatic} from "./composable";


type ComposableInternalClass = Constructor & { _construct: Constructor }

@staticImplements<ComposableStatic<Constructor>>()
export class ComposableClass extends Composable<Constructor> {

    private constructor(constructor: Constructor) {
        super(
            class Composable {
                static _construct: Constructor = constructor

                constructor() {
                    return new (this.constructor as ComposableInternalClass)._construct();
                }
            }
        )
    }

    static get(constructor: Constructor) {
        if (Reflect.hasMetadata(this.composeMetadataKey, constructor.prototype, 'constructor')) {
            const key = Reflect.getMetadata(this.composeMetadataKey, constructor.prototype, 'constructor') as string
            return this._registry[key];
        }
        const composableClass = new ComposableClass(constructor)
        const key = v4();
        this._registry[key] = composableClass;
        Reflect.defineMetadata(this.composeMetadataKey, key, constructor.prototype, 'constructor')
        return composableClass;
    }

    chain(fn: ComposableTransformation<Constructor>): ComposableClass {
        (this._composable as ComposableInternalClass)._construct = fn(this.composed, this._composable);
        return this;
    }

    get composed(): Constructor {
        return (this._composable as ComposableInternalClass)._construct;
    }

    static decorator(fn: ComposableTransformation<Constructor>) {
        return (cls: Constructor) => this.get(cls).chain(fn).composed
    }

}


