let { NNode, NLayer, NNetwork, calCost, dσ } = require("./lib/NerveNetwork.js");
let getPixel = require("get-pixels");
let util = require('util');
let fs = require('fs');


main();

async function main() {
    let net = new NNetwork(400, 16, 16, 10);

    let allAssets = await util.promisify(fs.readdir)("./assets/");
    let backup = allAssets.slice();

    while(true){
        if(!allAssets.length){ allAssets = backup.slice(); }

        let batchFileNames = allAssets.splice(0, 10);

        let batchOpts = [];
        for(let fileName of batchFileNames){
            let expectNumber = fileName.match(/,(\d)\./)[1];

            let expectArr = new Array(10).fill(0);
            expectArr[expectNumber] = 1;

            let monoColorData = await readInput('./assets/' + fileName);
            batchOpts.push({
                input: monoColorData,
                expect: expectArr
            });
        }
        let gradient = singleBatch(net, batchOpts);
    }
}

let caseCount = 1;


let gsc = 0;
let gac = 0;
/**
 * @param {NNetwork} net
 * @param {{input: number[], expect: string[]}[10]}
 */
function singleBatch(net, opts){
    for(let {input, expect} of opts){
        net.calc(input);
        net.expect(expect);

        let expectNumber = expect.findIndex(x => x==1);
        let resultNumber = net.getResult();
        
        if(expectNumber == resultNumber){ gsc++; }
        gac++;
        console.log(caseCount++, Math.round(calCost(net, expect)*1000)/1000, "\t", expectNumber, "-", resultNumber , gsc + "/" + gac, Math.round(gsc/gac*10000)/100 + "%");
        for(let i = net.layers.length - 1; i > 0; i--){
            BP(net.layers[i - 1], net.layers[i]);
        }
        net.step(opts.length);
    }
}

/**
 * @param {string} src
 */
async function readInput(src){
    let pixels = await util.promisify(getPixel)(src)
    /** @type {Uint8Array} */
    var data = pixels.data;
    var monoColorData = Array.from(data.filter((v, i) => !(i % 4))).map(v => v / 255);
    return monoColorData;
}

/**
 * 反向传播
 * @param {NLayer} layer
 */
function BP(layer){
    for(let i = 0, l = layer.nodes.length; i < l; i++){
        let node = layer.nodes[i];

        if(layer.isOutput){
            // C = sum(i => (a_L[i] - e[i])**2)
            // dC/da = 2(a_L[i] - e[i])
            node.da = 2 * node.a - node.expect;
        }
        
        // a_L[i] = σ(z_L[i])
        // da_L[i]/dz_L[i] = σ'(z_L[i])
        // dC/dz_L[i] = dC/da_L[i] * da_L[i]/dz_L[i]
        node.dz = node.da * dσ(node.z);

        // z_L[i] = sum(j => a_L-1[j] * w_L[j][i]) + b_L[i]
        // dz_L[i]/db_L[i] = 1
        // dC/db_L[i] = dC/dz_L[i] * dz_L[i]/db_L[i]
        node.db = node.dz;

        //layer_(L-1).nodes.length == node.backLinks.length
        for(let j = 0, m = node.backLinks.length; j < m; j ++){
            let link = node.backLinks[j];
            let nodeI = link.from;

            // z_L[i] = sum(j => a_(L-1)[j] * w_L[i][j]) + b_L[i]
            // dz/dw[i][j] = a_(L-1)[j]
            // dC/dw_L[i][j] = dC/dz_L[i] * dz_L[i]/dw_L[i][j]
            link.dweight = node.dz * nodeI.a;

            // z_L[i] = sum(j => a_(L-1)[j] * w_L[i][j]) + b_L[i]
            // dz_L[i]/da_(L-1)[j] = w_L[i][j]
            // dC/da_(L-1)[j] = sum(i => dC/dz_L[i] * dz_L[i]/da_(L-1)[j])
            nodeI.da += node.dz * link.weight;
        }
    }
}