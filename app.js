let { NNode, NLayer, NNetwork } = require("./lib/NerveNetwork.js");

let net = new NNetwork(4, 2);
net.calc([4, 5, 1, 0]);