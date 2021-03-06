var moment = require('moment');
var generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    };
}
var generateLocationMessage = (from,lat,lon) =>{
    return {
        from,
        url:`http://www.google.com/maps?q=${lat},${lon}`,
        createdAt:moment().valueOf()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
};
