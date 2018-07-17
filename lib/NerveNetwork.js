class NNode{
    /** @param {string} [name] */
    constructor(name) {
        this.name = name;
        /** @type {{from:NNode, to:NNode, weight:number, dweight:number}[]} */
        this.links = [];
        /** @type {{from:NNode, to:NNode, weight:number, dweight:number}[]} */
        this.backLinks = [];
        /** activation */
        this.a = null;
        /** bias */
        this.b = Math.random() - .5;
        this.z = null;

        this.da = null;
        this.dz = null;
        this.db = null;

        /** 最后一层网络才有期望 */
        this.expect = null;
    }
    /**
     * @param {NNode} node
     * @param {number} weight
     */
    link(node, weight) {
        let link = {
            from: this,
            to: node,
            weight,
            dweight: null
        };
        this.links.push(link);
        node.backLinks.push(link);
    }
    calc() {
        let sum = this.backLinks.reduce((sum, {from: node, weight}) => {
            sum += node.a * weight;
            return sum;
        }, 0);
        this.z = sum + this.b;
        this.a = σ(this.z);
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
        this.isOutput = false;
        this.isInput = false;
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

        this.layerOutput.isOutput = true;
        this.layerInput.isInput = true;
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
    expect(expects){
        for(let i = 0, l = this.layerOutput.nodes.length; i < l; i++){
            this.layerOutput.nodes[i].expect = expects[i];
        }
    }
    // calcGradient(inputs, expects){
    //     this.calc(inputs);
    //     this.expect(expects);
    //     //计算梯度
    // }
    step(){
        let stepScale = 1;
        for(let i = this.layers.length - 1; i >= 0; i--){
            let layer = this.layers[i];
            for(let j = layer.nodes.length - 1; j>=0;j--){
                let node = layer.nodes[j];
                node.b -= node.db * stepScale;
                node.db = null;
                node.da = null;
                node.dz = null;
                for (let k = node.backLinks.length - 1; k >= 0; k--){
                    let link = node.backLinks[k];
                    link.weight -= link.dweight * stepScale;
                    link.dweight = null;
                }
            }
        }
    }

    getResult(){
        let max = -Infinity;
        let maxIndex = null;
        for(let i = this.layerOutput.nodes.length - 1; i>=0; i--){
            let node = this.layerOutput.nodes[i];
            if(node.a > max){
                max = node.a;
                maxIndex = i;
            }
        }
        return maxIndex;
    }
}

/**
 * @param {NNetwork} network
 * @param {number[]} expect
 */
function calCost(network, expect) {
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

/**
 * sigmod 的导数
 * @param {number} x 
 */
function dσ(x) {
    return Math.exp(-x) / (1 + Math.exp(-x)) ** 2;
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
    calCost,
    dσ
}