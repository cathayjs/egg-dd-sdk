'use strict';

const Aes = require('nodejs-dd-aes');
const assert = require('assert');

module.exports = {
    createDdEncrypt() {
        let DD_CONFIG = this.app.config.DD_CONFIG;

        assert(DD_CONFIG, 'DD_CONFIG required!')
        assert(DD_CONFIG.aesKey, 'DD_CONFIG.aesKey required!');
        assert(DD_CONFIG.corpId, 'DD_CONFIG.corpId required!');
        assert(DD_CONFIG.token, 'DD_CONFIG.token required!');

        let aes = new Aes(DD_CONFIG.aesKey, DD_CONFIG.corpId, DD_CONFIG.token);

        return aes;
    }
}
