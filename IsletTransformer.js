export class IsletTransformer {
    target;
    transformIslet;
    #transformNeeded = false;
    constructor(target, transformIslet, host) {
        this.target = target;
        this.transformIslet = transformIslet;
        const { islet, transform, isletDependencies, transformDependencies } = transformIslet;
        const self = this;
        host.addEventListener('prop-changed', async (e) => {
            const changeInfo = e.detail;
            const { prop, newVal, oldValue } = changeInfo;
            if (newVal === oldValue)
                return;
            if (isletDependencies.includes(prop)) {
                const { ScopeNavigator } = await import('trans-render/lib/ScopeNavigator.js');
                const sn = new ScopeNavigator(this.target);
                Object.assign(host, islet(host, sn));
            }
            if (transformDependencies.has(prop)) {
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
