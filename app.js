let { NNode, NLayer, NNetwork, cost } = require("./lib/NerveNetwork.js");
let getPixel = require("get-pixels");
let util = require('util');


main();

async function main() {
    let net = new NNetwork(400, 16, 16, 10);

    let pixels = await util.promisify(getPixel)('./asset/1,0.png')
    /** @type {Uint8Array} */
    var data = pixels.data;
    var monoColorData = Array.from(data.filter((v, i) => !(i % 4))).map(v => v / 255);
    net.calc(monoColorData);
    let loss = cost(net, 0);
}