const svgCaptcha = require("svg-captcha");
const fs = require("fs");
const svg2png = require("svg2png");
const util = require("util");

const COUNT = 10;

let genId = 1;
let opt = {
    size: 1,
    fontSize: 30,
    width: 20,
    height: 20,
    // noise: .,
    ignoreChars: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
};

main();

async function main(){
    if(!(await util.promisify(fs.exists)("./assets")))
        await util.promisify(fs.mkdir)("./assets");
    for (let index = 0; index < COUNT; index++)
        await gen(genId++);
}

async function gen(genId) {
    let captcha = svgCaptcha.create(opt);
    let svgFileName = `./assets/${genId},${captcha.text}.svg`;
    await util.promisify(fs.writeFile)(svgFileName, captcha.data, "utf8");
    let f = await util.promisify(fs.readFile)(svgFileName);
    let pngBuffer = await svg2png(f);
    fs.unlink(svgFileName, () => { });
    return await util.promisify(fs.writeFile)(svgFileName.replace("svg", "png"), pngBuffer);
}
