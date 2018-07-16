const Nerve = require("./NerveNetwork.js");

describe(Nerve.NNode, () => {
    it("can contains a value", () => {
        let a = new Nerve.NNode("a");
        a.a = .3;
        expect(a.a).toBe(.3);
    })

    it("link and calc value", () => {
        let a = new Nerve.NNode("a");
        let b = new Nerve.NNode("b");
        b.a = 1;
        b.link(a, .5);
        a.calc();
        expect(a.a).toBe(.5);
    })
});

describe(Nerve.NLayer, () => {
    it("can contain nodes", () => {
        let nodes = [new Nerve.NNode(), new Nerve.NNode(), new Nerve.NNode()];
        nodes[0].a = .2;
        nodes[1].a = .4;
        nodes[2].a = .6;
        let layer1 = new Nerve.NLayer(nodes);
        let layer2 = new Nerve.NLayer([new Nerve.NNode(), new Nerve.NNode()]);
        layer1.link(layer2, [
            .5,   1,
            .25, -1,
            .5,   1
        ]);
        layer2.calc();
        expect(layer2.nodes[0].a).toBeCloseTo(.5);
        expect(layer2.nodes[1].a).toBeCloseTo(.4);
    });
});

describe(Nerve.NNetwork, () => {
    it('send inputs, get values', () => {
        let layer1 = new Nerve.NLayer(4);
        let layer2 = new Nerve.NLayer(2);
        layer1.link(layer2, [
            .5, 0,    0, .5,
            0, .5,    .5, 0
        ]);
        let net = new Nerve.NNetwork([layer1, layer2]);


        let backSlash = net.layerOutput.nodes[0];
        let slash = net.layerOutput.nodes[1];

        net.calc([
            0.5, 0.5,
            0.5, 0.5
        ]);
        expect(backSlash.a).toBeCloseTo(.5)
        expect(slash.a).toBeCloseTo(.5)

        net.calc([
            1, 0,
            0, 1
        ]);
        expect(backSlash.a).toBeCloseTo(1)
        expect(slash.a).toBeCloseTo(0)

        net.calc([
            1, 0,
            1, 0
        ]);
        expect(backSlash.a).toBeCloseTo(.5)
        expect(slash.a).toBeCloseTo(.5)
    });
});