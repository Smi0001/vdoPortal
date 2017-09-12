var configs = {};
configs.applicationPort = '5000';
configs.dbName = 'videos-assignment';
configs.dbHost = 'localhost';
var userName = 'smi_vdoPortal';
var passWord = 'smi1234';
var dbDomain = 'ds133814.mlab.com:33814';
var mongodbName = 'videos-assignment';
configs.url = 'mongodb://' + userName + ':' + passWord + '@' + dbDomain + '/' + mongodbName;

module.exports = configs;