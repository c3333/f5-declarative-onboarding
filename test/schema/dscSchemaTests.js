/**
 * Copyright 2018 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const Ajv = require('ajv');

const ajv = new Ajv(
    {
        allErrors: false,
        useDefaults: true,
        coerceTypes: true,
        extendRefs: 'fail'
    }
);
const dscSchema = require('../../src/schema/latest/dsc.schema.json');
const customFormats = require('../../src/schema/latest/formats.js');

Object.keys(customFormats).forEach((customFormat) => {
    ajv.addFormat(customFormat, customFormats[customFormat]);
});

const validate = ajv.compile(dscSchema);

/* eslint-disable quotes, quote-props */

describe('dsc.schema.json', () => {
    describe('ConfigSync', () => {
        describe('valid', () => {
            it('should validate config sync data with IP configsyncIp', () => {
                const data = {
                    "class": "ConfigSync",
                    "configsyncIp": "1.2.3.4"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate config sync data with "none" configsyncIp', () => {
                const data = {
                    "class": "ConfigSync",
                    "configsyncIp": "none"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate config sync data with json-pointer configsyncIp', () => {
                const data = {
                    "class": "ConfigSync",
                    "configsyncIp": "/foo/bar"
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should invalidate missing configsyncIp', () => {
                const data = {
                    "class": "ConfigSync"
                };
                assert.strictEqual(validate(data), false, 'missing configsyncIp should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "configsyncIp"'), -1);
            });

            it('should invalidate bad configsyncIp', () => {
                const data = {
                    "class": "ConfigSync",
                    "configsyncIp": "foo"
                };
                assert.strictEqual(validate(data), false, 'bad configsyncIp should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('should match format'), -1);
            });

            it('should invalidate additional properties', () => {
                const data = {
                    "class": "ConfigSync",
                    "configsyncIp": "1.2.3.4",
                    "foo": "bar"
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('should NOT have additional properties'), -1);
            });
        });
    });

    describe('FailoverUnicast', () => {
        describe('valid', () => {
            it('should validate minimal unicast address with ip', () => {
                const data = {
                    "class": "FailoverUnicast",
                    "address": "1.2.3.4"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate minimal unicast address with json-pointer', () => {
                const data = {
                    "class": "FailoverUnicast",
                    "address": "/foo/bar"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate full unicast address', () => {
                const data = {
                    "class": "FailoverUnicast",
                    "address": "1.2.3.4",
                    "port": 8888
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should invalidate bad address', () => {
                const data = {
                    "class": "FailoverUnicast",
                    "address": "foo"
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf("should match format"), -1);
            });

            it('should invalidate missing address', () => {
                const data = {
                    "class": "FailoverUnicast"
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(
                    getErrorString().indexOf("should have required property 'address'"),
                    -1
                );
            });

            it('should invalidate bad port', () => {
                const data = {
                    "class": "FailoverUnicast",
                    "address": "1.2.3.4",
                    "port": 65536
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf("should be <= 65535"), -1);
            });
        });
    });

    describe('DeviceGroup', () => {
        describe('valid', () => {
            it('should validate minimal device group data with json-pointer', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-only",
                    "owner": "/foo/bar/0"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate full device group data', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-only",
                    "owner": "bigip1.me.com",
                    "members": ["bigip1.me.com", "bigip2.me.com"],
                    "autoSync": true,
                    "saveOnAutoSync": false,
                    "networkFailover": true,
                    "fullLoadOnSync": false,
                    "asmSync": true
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate sync-failover with autoSync true, fullLoadOnSync false', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-failover",
                    "owner": "bigip1.me.com",
                    "members": ["bigip1.me.com", "bigip2.me.com"],
                    "autoSync": true,
                    "fullLoadOnSync": false
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should invalidate without owner property', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-only"
                };
                assert.strictEqual(validate(data), false, 'owner property is required');
            });

            it('should invalidate bad sync type', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "foo",
                    "owner": "/foo/bar/0"
                };
                assert.strictEqual(validate(data), false, 'bad type should not be valid');
            });

            it('should invalidate additional properties', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-only",
                    "owner": "/foo/bar/0",
                    "foo": "bar"
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('should NOT have additional properties'), -1);
            });

            it('should invalidate sync-failover with autoSync true, fullLoadOnSync true', () => {
                const data = {
                    "class": "DeviceGroup",
                    "type": "sync-failover",
                    "owner": "bigip1.me.com",
                    "members": ["bigip1.me.com", "bigip2.me.com"],
                    "autoSync": true,
                    "fullLoadOnSync": true
                };
                assert.strictEqual(
                    validate(data),
                    false,
                    'sync-failover with autosync and fullLoadOnSync should not be valid'
                );
            });
        });
    });

    describe('DeviceTrust', () => {
        describe('valid', () => {
            it('should validate device trust data', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "localPassword": "myPassword",
                    "remoteHost": "1.2.3.4",
                    "remoteUsername": "yourUser",
                    "remotePassword": "yourPassword"
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate device trust data with json-pointer', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "localPassword": "myPassword",
                    "remoteHost": "/foo/bar/0",
                    "remoteUsername": "yourUser",
                    "remotePassword": "yourPassword"
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should invalidate missing localUsername', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localPassword": "myPassword",
                    "remoteHost": "1.2.3.4",
                    "remoteUsername": "yourUser",
                    "remotePassword": "yourPassword"
                };
                assert.strictEqual(validate(data), false, 'missing localUsername should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "localUsername"'), -1);
            });

            it('should invalidate missing localPassword', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "remoteHost": "1.2.3.4",
                    "remoteUsername": "yourUser",
                    "remotePassword": "yourPassword"
                };
                assert.strictEqual(validate(data), false, 'missing localPassword should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "localPassword"'), -1);
            });

            it('should invalidate missing remoteHost', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "localPassword": "myPassword",
                    "remoteUsername": "yourUser",
                    "remotePassword": "yourPassword"
                };
                assert.strictEqual(validate(data), false, 'missing remoteHost should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "remoteHost"'), -1);
            });

            it('should invalidate missing remoteUsername', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "localPassword": "myPassword",
                    "remoteHost": "1.2.3.4",
                    "remotePassword": "yourPassword"
                };
                assert.strictEqual(validate(data), false, 'missing remoteUsername should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "remoteUsername"'), -1);
            });

            it('should invalidate missing remotePassword', () => {
                const data = {
                    "class": "DeviceTrust",
                    "localUsername": "myUser",
                    "localPassword": "myPassword",
                    "remoteHost": "1.2.3.4",
                    "remoteUsername": "yourUser"
                };
                assert.strictEqual(validate(data), false, 'missing remotePassword should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"missingProperty": "remotePassword"'), -1);
            });
        });
    });

    describe('TrafficGroup', () => {
        describe('valid', () => {
            it('should work fine with minimal amounts', () => {
                const data = {
                    class: 'TrafficGroup'
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should pass if failoverMethod is "ha-score", and monitor is provided', () => {
                const data = {
                    class: 'TrafficGroup',
                    failoverMethod: 'ha-score',
                    autoFailbackEnabled: false,
                    monitor: 'testMonitor'
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should pass when failoverMethod is "ha-order"', () => {
                const data = {
                    class: 'TrafficGroup',
                    failoverMethod: 'ha-order'
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should fail if failoverMethod is "ha-score", but no monitor is provided', () => {
                const data = {
                    class: 'TrafficGroup',
                    failoverMethod: 'ha-score'
                };
                assert.strictEqual(validate(data), false, 'monitor is required if failoverMethod is ha-score');
                assert.notStrictEqual(getErrorString().indexOf('"message": "should have required property \'.monitor\'"'), -1);
            });

            it('should fail if failoverMethod is "ha-score", but autoFailbackEnabled is true', () => {
                const data = {
                    class: 'TrafficGroup',
                    failoverMethod: 'ha-score',
                    autoFailbackEnabled: true,
                    monitor: 'testMonitor'
                };
                assert.strictEqual(validate(data), false, 'failoverMethod of "ha-score" is incompatible with autoFailbackEnabled of false');
                assert.notStrictEqual(getErrorString().indexOf('"dataPath": ".autoFailbackEnabled"'), -1);
                assert.notStrictEqual(getErrorString().indexOf('"allowedValue": false'), -1);
                assert.notStrictEqual(getErrorString().indexOf('"message": "should be equal to constant"'), -1);
            });
        });
    });

    describe('MAC_Masquerade', () => {
        describe('valid', () => {
            it('should validate minimal data', () => {
                const data = {
                    class: 'MAC_Masquerade'
                };
                assert.ok(validate(data), getErrorString(validate));
            });

            it('should validate masquerade data', () => {
                const data = {
                    class: 'MAC_Masquerade',
                    source: {
                        interface: '1.1'
                    },
                    trafficGroup: 'traffic-group-1'
                };
                assert.ok(validate(data), getErrorString(validate));
            });
        });

        describe('invalid', () => {
            it('should invalidate additional properties', () => {
                const data = {
                    class: 'MAC_Masquerade',
                    rogueProperty: true
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"additionalProperty": "rogueProperty"'), -1);
            });

            it('should invalidate additional source properties', () => {
                const data = {
                    class: 'MAC_Masquerade',
                    source: {
                        interface: '1.1',
                        rogueProperty: true
                    }
                };
                assert.strictEqual(validate(data), false, 'additional properties should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('"additionalProperty": "rogueProperty"'), -1);
            });

            it('should invalidate unexpected traffic group', () => {
                const data = {
                    class: 'MAC_Masquerade',
                    trafficGroup: 'traffic-jam'
                };
                assert.strictEqual(validate(data), false, 'non-enum traffic group should not be valid');
                assert.notStrictEqual(getErrorString().indexOf('should be equal to one of the allowed values'), -1);
            });
        });
    });
});

function getErrorString() {
    return JSON.stringify(validate.errors, null, 4);
}
