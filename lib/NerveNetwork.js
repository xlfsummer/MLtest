class NNode{
    /** @param {string} [name] */
    constructor(name) {
        this.name = name;
        /** @type {[NNode, number][]} */
        this.links = [];
        /** @type {[NNode, number][]} */
        this.backLinks = [];
        /** activation */
        this.a = null;
        /** bias */
        this.b = Math.random();
    }
    /**
     * @param {NNode} node
     * @param {number} weight
     */
    link(node, weight) {
        this.links.push([node, weight]);
        node.backLinks.push([this, weight]);
    }
    calc() {
        let sum = this.backLinks.reduce((sum, [node, weight]) => {
            sum += node.a * weight;
            return sum;
        }, 0);
        this.a = σ(sum + this.b);
    }
}

class NLayer {
    /** @param {NNode[] | number} nodes */
    constructor(nodes) {
        if (typeof nodes == "number") {
            this.nodes = new Array(nodes).fill(0).map(_ => new NNode());
        }
        else {
            this.nodes = nodes;
        }
    }
    /**
     * @param {NLayer} layer
     * @param {number[]} weights 权重
    */
    link(layer, weights) {
        let wi = 0;
        this.nodes.forEach(n1 => layer.nodes.forEach(n2 => {
            n1.link(n2, weights[wi++]);
        }));
    }
    calc() {
        this.nodes.forEach(n => n.calc());
    }
}

class NNetwork {
    /** @param {NLayer[]} layers*/
    constructor(...sizes) {
        let layers = sizes.map(size => {
            return new NLayer(new Array(size).fill(0).map(_ => new NNode()));
        })
        layers.reduce((l1, l2) => {
            let weights = randomArr(l1.nodes.length * l2.nodes.length);
            l1.link(l2, weights);
            return l2;
        })
        this.layers = layers;
        this.layerInput = layers[0];
        this.layerOutput = layers[layers.length - 1];
    }
    /** @param {number[]} inputs */
    calc(inputs) {
        this.layerInput.nodes.forEach((n, i) => {
            n.a = inputs[i];
        })
        this.layers.forEach((l, i) => {
            i != 0 && l.calc()
        });
    }
}

/**
 * @param {NNetwork} network
 * @param {number[]} expect
 */
function cost(network, expectNumber) {
    let expect = new Array(10).fill(0);
    expect[expectNumber] = 1;

    return network.layerOutput.nodes.reduce((loss, node, i) => {
        loss += (node.a - expect[i]) ** 2;
        return loss;
    }, 0);
}

/**
 * 压缩函数 sigmod
 * @param {number} x
 */
function σ(x) {
    return 1 / (1 + Math.exp(-x));
}

function randomArr(length) {
    let result = [];
    for (let i = 0; i < length; i++){
        result.push(Math.random() - .5);
    }
    return result;
}

module.exports = {
    NNode,
    NLayer,
    NNetwork,
    cost
}