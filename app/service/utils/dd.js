const crypto = require('crypto');
const url = require('url');

module.exports = {

    getAgentId(type) {

        let agentId;

        if (typeof agentIdConfig == 'string') {
            agentId = agentIdConfig;
        } else {
            agentId = agentIdConfig.default;
        }
        if (type) {
            agentId = agentIdConfig[type];
        }
        return agentId;
    },

    sign: function (params) {
        let origUrl = params.url;
        let origUrlObj = url.parse(origUrl);
        delete origUrlObj['hash'];

        let newUrl = url.format(origUrlObj);

        let plain = `jsapi_ticket=${params.ticket}&noncestr=${params.nonceStr}&timestamp=${params.timeStamp}&url=${newUrl}`;
        let sha1 = crypto.createHash('sha1');

        sha1.update(plain, 'utf8');
        let signature = sha1.digest('hex');
        return signature;
    },

    deleteRepeated: function (ddUsers) {

        let map = {};
        let deleted = [];
        let result;

        result = ddUsers.filter((ddUser) => {
            if (!map[ddUser.userid]) {
                map[ddUser.userid] = true;
                return true;
            } else {
                deleted.push(ddUser);
            }
        });

        // console.log(deleted); // 大约有26个人
        // console.log(deleted.length);
        // console.log(result.length);

        return result;
    }
}