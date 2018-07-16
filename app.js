let { NNode, NLayer, NNetwork, calCost, dσ } = require("./lib/NerveNetwork.js");
let getPixel = require("get-pixels");
let util = require('util');
let fs = require('fs');


main();

async function main() {
    let net = new NNetwork(400, 16, 16, 10);

    let allAssets = await util.promisify(fs.readdir)("./asset/");

    while(allAssets.length){
        let batchFileNames = allAssets.splice(0, 10);

        let batchOpts = [];
        for(let fileName of batchFileNames){
            let expectNumber = fileName.match(',(\d)\.')[1];

            let expectArr = new Array(10).fill(0);
            expectArr[expectNumber] = 1;

            let monoColorData = await readInput('./asset/' + fileName);
            batchOpts.push({
                input: monoColorData,
                expect: expectArr
            });
        }
        let gradient = singleBatch(net, batchOpts);
    }
}

/**
 * @param {NNetwork} net
 * @param {{input: number[], expect: string[]}[10]}
 */
function singleBatch(net, opts){
    for(let {input, expect} of opts){
        net.calc(input);
        net.expect(expect);
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

/** 反向传播 */
/**
 * @param {NLayer} layerI
 * @param {NLayer} layerO
 */
function BP(layerI, layerO){
    for(let nodeO of layerO.nodes){
        let cost = (nodeO.a - layerO.expect) ** 2;
        let E = layerO.expect;
        let aO = nodeO.a;
        let zO = nodeO.b;
        for(let [nodeI, weight] of nodeO.backLinks){
            zO += nodeI.a * weight;
        }
        nodeO.db = 2(aO - E) * dσ(zO) * 1;

        nodeO.dw = [];
        for(let i = 0, l = nodeO.backLinks.length; i < l; i ++){
            let nodeI = nodeO.backLinks[i][0];
            nodeO.dw[i] = 2(aO - E) * dσ(zO) * nodeI.a;
        }


    }
}