module.exports = {
    init() {
        Object.defineProperty(Array.prototype, "sum", {
            value() { return this.reduce((sum, x) => sum += x ,0 ) }
        });
    }
};