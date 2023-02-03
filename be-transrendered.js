import { define } from 'be-decorated/DE.js';
import { register } from "be-hive/register.js";
export class BeTransrendered extends EventTarget {
    async instantiate(pp, mold) {
        //TODO lots of common code with be-free-ranged.  maybe move some to be-transformed package.
        const { transformIslets, self, template } = pp;
        const { DTR } = await import('trans-render/lib/DTR.js');
        const { getDestructArgs } = await import('trans-render/lib/getDestructArgs.js');
        let clone;
        if (self.innerHTML.trim() === '') {
            clone = template.content.cloneNode(true);
        }
        const { IsletTransformer } = await import('./IsletTransformer.js');
        for (const transformIslet of transformIslets) {
            const { transform, islet, hydratingTransform } = transformIslet;
            let { isletDependencies, scopesUp } = transformIslet;
            if (isletDependencies === undefined && islet !== undefined) {
                isletDependencies = transformIslet.isletDependencies = getDestructArgs(islet);
            }
            let host = undefined;
            if (scopesUp === undefined)
                scopesUp = 0;
            if (scopesUp === -1) {
                host = self.getRootNode().host; //TODO await customElements.whenDefined;
            }
            else {
                let count = 0;
                let el = self;
                while (count <= scopesUp) {
                    el = el.closest('[itemscope]');
                    if (el === null) {
                        host = self.getRootNode().host; //TODO await customElements.whenDefined;
                        break;
                    }
                    else {
                        host = el.beDecorated?.scoped?.scope;
                    }
                    count++;
                }
            }
            if (hydratingTransform !== undefined) {
                const hydratingCtx = {
                    host,
                    match: hydratingTransform
                };
                const dtr = new DTR(hydratingCtx);
                const fragment = clone || self;
                dtr.transform(fragment);
            }
            const ctx = {
                host,
                match: transform,
            };
            const transformer = new DTR(ctx);
            transformIslet.transformer = transformer;
            let { transformDependencies } = transformIslet;
            if (transformDependencies === undefined) {
                transformDependencies = transformIslet.transformDependencies = await transformer.getDep();
            }
            if (islet !== undefined) {
                const { ScopeNavigator } = await import('trans-render/lib/ScopeNavigator.js');
                const sn = new ScopeNavigator(self);
                Object.assign(host, islet(host, sn));
            }
            if (clone !== undefined) {
                await transformer.transform(clone);
            }
            for (const transformIslet of transformIslets) {
                new IsletTransformer(self, transformIslet, host);
            }
        }
        if (clone !== undefined) {
            self.appendChild(clone);
        }
        return mold;
    }
}
const tagName = 'be-transrendered';
const ifWantsToBe = 'transrendered';
const upgrade = '*';
define({
    config: {
        tagName,
        propDefaults: {
            ifWantsToBe,
            upgrade,
            virtualProps: ['transformIslets', 'template']
        },
        actions: {
            instantiate: {
                ifAllOf: ['transformIslets', 'template'],
                returnObjMold: {
                    resolved: true,
                }
            }
        }
    },
    complexPropDefaults: {
        controller: BeTransrendered
    }
});
register(ifWantsToBe, upgrade, tagName);
