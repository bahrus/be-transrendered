export class BeTransrendered extends EventTarget {
    async instantiate(pp, mold) {
        //TODO lots of common code with be-free-ranged.  maybe move some to be-transformed package.
        const { host, transformIslets, self, template } = pp;
        const { DTR } = await import('trans-render/lib/DTR.js');
        const { getDestructArgs } = await import('trans-render/lib/getDestructArgs.js');
        const clone = template.content.cloneNode(true);
        const { IsletTransformer } = await import('./IsletTransformer.js');
        for (const transformIslet of transformIslets) {
            const { transform, islet } = transformIslet;
            let { isletDependencies } = transformIslet;
            if (isletDependencies === undefined) {
                isletDependencies = transformIslet.isletDependencies = getDestructArgs(islet);
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
                Object.assign(host, islet(host));
            }
            await transformer.transform(clone);
            self.innerHTML = '';
            self.appendChild(clone);
            for (const transformIslet of transformIslets) {
                new IsletTransformer(self, transformIslet, host);
            }
        }
        return mold;
    }
}
