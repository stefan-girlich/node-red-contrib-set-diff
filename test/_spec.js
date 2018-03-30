const helper = require('node-red-node-test-helper')
const assert = require('assert')
const diffNode = require('../index')


const assertEquals = (actual, expected, done) => {
    try {
        assert.deepStrictEqual(actual, expected)
    } catch (e) {
        done(e)
        return
    }
    done()
}

describe('set-diff node', function () {

    afterEach(() => {
        helper.unload()
    })

    it('should be loaded', (done) => {
        const flow = [{ id: 'n1', type: 'set-diff', name: 'test name' }]
        helper.load(diffNode, flow, function () {
            var node = helper.getNode('n1')
            assert.equal(node.name, 'test name')
            node.should.have.property('name', 'test name')
            done()
        })
    })

    it('should detect all new values as additions when no previous payload stored', (done) => {
        const flow = [
            { id: 'n1', type: 'set-diff', name: 'test name', wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ]

        helper.load(diffNode, flow, function () {
            var n2 = helper.getNode('n2')
            var n1 = helper.getNode('n1')

            n2.on('input', (msg) => {
                const result = msg.diff
                const expected = {
                    add: [1, 2, 3],
                    del: [],
                }

                assertEquals(result, expected, done)
            })

            n1.receive({ payload: [1, 2, 3] })
        })
    })

    it('should detect all additions and deletions compared to a previous payload', (done) => {
        const flow = [
            { id: 'n1', type: 'set-diff', name: 'test name', wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ]

        helper.load(diffNode, flow, function () {
            var n2 = helper.getNode('n2')
            var n1 = helper.getNode('n1')

            n1.receive({ payload: [1, 2, 3] })

            n2.on('input', (msg) => {
                const result = msg.diff
                const expected = {
                    add: [4, 5],
                    del: [1],
                }

                assertEquals(result, expected, done)
            })

            n1.receive({ payload: [4, 2, 3, 5] })
        })
    })
})