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

const CLASSES_OF_TRUTH = ['class1', 'class2'];

let DiffHandler;

/* eslint-disable global-require */

describe('diffHandler', () => {
    before(() => {
        DiffHandler = require('../../nodejs/diffHandler');
    });

    it('should report diffs and deletes for classes of truth', () => {
        return new Promise((resolve, reject) => {
            const toDeclaration = {
                Common: {
                    class1: {
                        myString: 'foo',
                        myObj: {
                            foo: 'bar'
                        },
                        myArray: [1, 2, 3]
                    },
                    class2: {
                        foo: 'bar'
                    }
                }
            };
            const fromDeclaration = {
                Common: {
                    class1: {
                        myString: 'bar',
                        myArray: [4]
                    },
                    class2: {
                        hello: 'world'
                    }
                }
            };

            const diffHandler = new DiffHandler(CLASSES_OF_TRUTH);
            diffHandler.process(toDeclaration, fromDeclaration)
                .then((diff) => {
                    assert.deepEqual(diff.toUpdate.Common.class1, toDeclaration.Common.class1);
                    assert.deepEqual(diff.toDelete.Common.class2, { hello: {} });
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    });

    it('should leave non-classes of truth alone', () => {
        return new Promise((resolve, reject) => {
            const toDeclaration = {
                Common: {
                    class3: {
                        myString: 'foo',
                        myObj: {
                            foo: 'bar'
                        },
                        myArray: [1, 2, 3]
                    }
                }
            };
            const fromDeclaration = {
                Common: {
                    class3: {
                        myOtherString: 'world',
                        myOtherObj: {
                            hello: 'world'
                        },
                        myOtherArray: [4]
                    }
                }
            };

            const diffHandler = new DiffHandler(CLASSES_OF_TRUTH);
            diffHandler.process(toDeclaration, fromDeclaration)
                .then((diff) => {
                    assert.deepEqual(diff.toUpdate.Common.class3, toDeclaration.Common.class3);
                    assert.deepEqual(diff.toDelete.Common.class3, undefined);
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    });
});
