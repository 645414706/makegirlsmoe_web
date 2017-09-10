import Config from '../Config';
import Utils from '../utils/Utils';

class GAN {

    constructor() {
        this.runner = null;
        this.currentNoise = null;
        this.input = null;
    }

    static async getWeightFilePrefix() {
        var country = await Utils.getCountry();

        var servers = Config.gan.modelServers.filter(server => server.country === country);
        if (servers.length === 0) {
            servers = Config.gan.modelServers.filter(server => !server.country);
        }

        var index = Math.floor(Math.random() * servers.length);
        return 'http://' + (servers[index].host || servers[index]) + Config.gan.model;
    }

    async init(onInitProgress, backend) {
        this.runner = await window.WebDNN.load(Config.gan.model, {progressCallback: onInitProgress, weightDirectory: await GAN.getWeightFilePrefix(), backendOrder: backend});
    }

    async run(label, noise, input) {
        this.currentNoise = noise || Array.apply(null, {length: Config.gan.noiseLength}).map(() => Utils.randomNormal());
        let tmp = this.currentNoise.concat(label);
        this.currentInput = input || tmp;
        this.runner.getInputViews()[0].set(this.currentInput);
        await this.runner.run();
        let output = this.runner.getOutputViews()[0].toActual();
        return output;
    }

    getCurrentNoise() {
        return this.currentNoise;
    }

    getCurrentInput() {
        return this.currentInput;
    }
}

export default GAN;