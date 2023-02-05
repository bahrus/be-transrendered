export class IsletTransformer {
    target;
    transformIslet;
    #transformNeeded = false;
    constructor(target, transformIslet, host) {
        this.target = target;
        this.transformIslet = transformIslet;
        this.init(host);
    }
    async init(host) {
        const { islet, transform, isletDependencies, transformDependencies, debug } = this.transformIslet;
        if (debug)
            debugger;
        const self = this;
        const { getPropagator } = await import('trans-render/lib/getPropagator.js');
        const eventTarget = await getPropagator(host);
        eventTarget.addEventListener('prop-changed', async (e) => {
            const changeInfo = e.detail;
            const { prop, newVal, oldVal } = changeInfo;
            if (debug)
                debugger;
            if (newVal === oldVal)
                return;
            if (isletDependencies?.includes(prop)) {
                const { ScopeNavigator } = await import('trans-render/lib/ScopeNavigator.js');
                const sn = new ScopeNavigator(this.target);
                Object.assign(host, islet(eventTarget, sn));
            }
            if (transformDependencies?.has(prop)) {
                self.#transformNeeded = true;
                (async () => {
                    await self.doTransform();
                })();
            }
        });
    }
    async doTransform() {
        if (!this.#transformNeeded)
            return;
        this.#transformNeeded = false;
        const { transformer } = this.transformIslet;
        transformer.transform(this.target);
    }
}
