/**
 * @namespace qui.utils.crypto
 */

import * as ArrayUtils  from '$qui/utils/array.js'
import * as StringUtils from '$qui/utils/string.js'


const HEX_CHARS = '0123456789abcdef'.split('')


/**
 * Convert a hex representation of binary data into string representation.
 * @alias qui.utils.crypto.hex2str
 * @param {String} hex
 * @returns {String}
 */
export function hex2str(hex) {
    let s = ''
    for (let i = 0; i < hex.length / 2; i++) {
        s += String.fromCharCode(parseInt(hex.substring(2 * i, 2 * i + 2), 16))
    }

    return s
}

/**
 * Convert a string representation of binary data into hex representation.
 * @alias qui.utils.crypto.str2hex
 * @param {String} bin
 * @returns {String}
 */
export function str2hex(bin) {
    return bin.split('').map(function (c) {
        let n = c.charCodeAt(0)
        return HEX_CHARS[(n >> 4) & 0x0F] + HEX_CHARS[n & 0x0F]
    }).join('')
}

/**
 * Convert an array representation of binary data into string representation.
 * @alias qui.utils.crypto.arr2str
 * @param {Number[]} arr
 * @returns {String}
 */
export function arr2str(arr) {
    return arr.map(n => String.fromCharCode(n)).join('')
}

/**
 * Convert a string representation of binary data into array representation.
 * @alias qui.utils.crypto.str2arr
 * @param {String} str
 * @returns {Number[]}
 */
export function str2arr(str) {
    return str.split('').map(c => c.charCodeAt(0))
}

/**
 * Convert a base64 representation of binary data into string representation.
 * @alias qui.utils.crypto.b642str
 * @param {String} b64
 * @returns {String}
 */
export function b642str(b64) {
    b64 = (`${b64}===`).slice(0, b64.length + (b64.length % 4))
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/')

    return window.atob(b64)
}

/**
 * Convert a string representation of binary data into base64 representation.
 * @alias qui.utils.crypto.str2b64
 * @param {String} str
 * @returns {String}
 */
export function str2b64(str) {
    return window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}


/**
 * Generate a random token of a given length from a specified set of characters.
 * @param {String} chars allowed characters (e.g. `"a-zA-Z0-9"`).
 * @param {Number} length desired token length
 * @returns {String} the generated token
 */
export function makeToken(chars, length) {
    /* Preprocess chars */
    let c, i, j, bcc, ecc, range, token = ''
    for (i = 1; i < chars.length - 1; i++) {
        c = chars.charAt(i)
        if (c === '-') {
            bcc = chars.charCodeAt(i - 1)
            ecc = chars.charCodeAt(i + 1)

            /* Generate char range */
            range = ''
            for (j = bcc; j <= ecc; j++) {
                range += String.fromCharCode(j)
            }

            /* Update chars with range */
            chars = chars.substring(0, i - 1) + range + chars.substring(i + 2)

            i += range.length - 1
        }
    }

    /* Create next() function */
    let next
    if (window.crypto && window.crypto.getRandomValues) {
        next = function () {
            return window.crypto.getRandomValues(new Uint8Array(32))
        }
    }
    else { /* Crypto functions not available */
        next = function () {
            return ArrayUtils.range(0, 32).map(() => Math.floor(Math.random() * 255))
        }
    }

    while (token.length < length) {
        let nextBytes = next()
        for (i = 0; i < nextBytes.length; i++) {
            c = String.fromCharCode(nextBytes[i])
            if (!chars.includes(c)) {
                continue
            }

            token += c
            if (token.length >= length) {
                break
            }
        }
    }

    return token
}


/**
 * A SHA256 digest implementation.
 * @alias qui.utils.crypto.SHA256
 */
export class SHA256 {

    /**
     * @constructs
     * @param {String|Number[]} [data] the data to hash
     */
    constructor(data = null) {
        this._blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        this._h0 = 0x6a09e667
        this._h1 = 0xbb67ae85
        this._h2 = 0x3c6ef372
        this._h3 = 0xa54ff53a
        this._h4 = 0x510e527f
        this._h5 = 0x9b05688c
        this._h6 = 0x1f83d9ab
        this._h7 = 0x5be0cd19

        this._block = this.start = this.bytes = this.hBytes = 0
        this._finalized = false
        this._hashed = false
        this._first = true

        if (data != null) {
            this.update(data)
        }
    }

    /**
     * Feed more data.
     * @param {String|Number[]} data
     * @returns {qui.utils.crypto.SHA256} this object
     */
    update(data) {
        if (this._finalized) {
            return this
        }

        if (typeof data === 'string') {
            data = str2arr(StringUtils.toUTF8(data))
        }

        let index = 0, i, length = data.length, blocks = this._blocks

        while (index < length) {
            if (this._hashed) {
                this._hashed = false
                blocks[0] = this._block
                blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                             blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                             blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                             blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0
            }

            for (i = this.start; index < length && i < 64; ++index) {
                blocks[i >> 2] |= data[index] << SHA256._SHIFT[i++ & 3]
            }

            this.lastByteIndex = i
            this.bytes += i - this.start
            if (i >= 64) {
                this._block = blocks[16]
                this.start = i - 64
                this._hash()
                this._hashed = true
            }
            else {
                this.start = i
            }
        }

        if (this.bytes > 4294967295) {
            this.hBytes += this.bytes / 4294967296 << 0
            this.bytes = this.bytes % 4294967296
        }

        return this
    }

    /**
     * Return the array representation of the hash digest.
     * @returns {Number[]}
     */
    digest() {
        this._finalize()

        let h0 = this._h0, h1 = this._h1, h2 = this._h2, h3 = this._h3, h4 = this._h4, h5 = this._h5,
            h6 = this._h6, h7 = this._h7

        return [
            (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
            (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
            (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
            (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
            (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
            (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
            (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF,
            (h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF
        ]
    }

    /**
     * Return the hex representation of the hash digest.
     * @returns {String}
     */
    toString() {
        return str2hex(arr2str(this.digest()))
    }

    _hash() {
        let a = this._h0, b = this._h1, c = this._h2, d = this._h3, e = this._h4, f = this._h5, g = this._h6,
            h = this._h7, blocks = this._blocks, s0, s1, maj, t1, t2, ch, ab, da, cd, bc

        for (let j = 16; j < 64; ++j) {
            /* Rotate right */
            t1 = blocks[j - 15]
            s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3)
            t1 = blocks[j - 2]
            s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10)
            blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0
        }

        bc = b & c
        for (let j = 0; j < 64; j += 4) {
            if (this._first) {
                ab = 704751109
                t1 = blocks[0] - 210244248
                h = t1 - 1521486534 << 0
                d = t1 + 143694565 << 0
                this._first = false
            }
            else {
                s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
                s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
                ab = a & b
                maj = ab ^ (a & c) ^ bc
                ch = (e & f) ^ (~e & g)
                t1 = h + s1 + ch + SHA256._K[j] + blocks[j]
                t2 = s0 + maj
                h = d + t1 << 0
                d = t1 + t2 << 0
            }

            s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10))
            s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7))
            da = d & a
            maj = da ^ (d & b) ^ ab
            ch = (h & e) ^ (~h & f)
            t1 = g + s1 + ch + SHA256._K[j + 1] + blocks[j + 1]
            t2 = s0 + maj
            g = c + t1 << 0
            c = t1 + t2 << 0
            s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10))
            s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7))
            cd = c & d
            maj = cd ^ (c & a) ^ da
            ch = (g & h) ^ (~g & e)
            t1 = f + s1 + ch + SHA256._K[j + 2] + blocks[j + 2]
            t2 = s0 + maj
            f = b + t1 << 0
            b = t1 + t2 << 0
            s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10))
            s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7))
            bc = b & c
            maj = bc ^ (b & d) ^ cd
            ch = (f & g) ^ (~f & h)
            t1 = e + s1 + ch + SHA256._K[j + 3] + blocks[j + 3]
            t2 = s0 + maj
            e = a + t1 << 0
            a = t1 + t2 << 0
        }

        this._h0 = this._h0 + a << 0
        this._h1 = this._h1 + b << 0
        this._h2 = this._h2 + c << 0
        this._h3 = this._h3 + d << 0
        this._h4 = this._h4 + e << 0
        this._h5 = this._h5 + f << 0
        this._h6 = this._h6 + g << 0
        this._h7 = this._h7 + h << 0
    }

    _finalize() {
        if (this._finalized) {
            return
        }

        this._finalized = true
        let blocks = this._blocks, i = this.lastByteIndex

        blocks[16] = this._block
        blocks[i >> 2] |= SHA256._EXTRA[i & 3]
        this._block = blocks[16]
        if (i >= 56) {
            if (!this._hashed) {
                this._hash()
            }
            blocks[0] = this._block
            blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                         blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                         blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                         blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0
        }

        blocks[14] = this.hBytes << 3 | this.bytes >>> 29
        blocks[15] = this.bytes << 3

        this._hash()
    }

}

// TODO es7 class fields
SHA256._SHIFT = [24, 16, 8, 0]
SHA256._EXTRA = [-2147483648, 8388608, 32768, 128]
SHA256._K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]


/**
 * A SHA256 HMAC implementation.
 * @alias qui.utils.crypto.HMACSHA256
 */

export class HMACSHA256 {

    /**
     * @constructs
     * @param {String|Number[]} key the HMAC key
     * @param {String|Number[]} [data] the data to hash
     */
    constructor(key, data = null) {
        if (typeof key === 'string') {
            key = str2arr(StringUtils.toUTF8(key))
        }

        /* If key is larger than one block, we have to hash it first */
        if (key.length > 64) {
            key = new SHA256(key).digest()
        }

        let oKeyPad = [], iKeyPad = []
        for (let i = 0; i < 64; i++) {
            let b = key[i] || 0
            oKeyPad[i] = 0x5c ^ b
            iKeyPad[i] = 0x36 ^ b
        }

        this._innerHash = new SHA256(iKeyPad)
        if (data) {
            this._innerHash.update(data)
        }

        this._oKeyPad = oKeyPad
    }

    /**
     * Feed more data.
     * @param {String|Number[]} data
     * @returns {qui.utils.crypto.HMACSHA256} this object
     */
    update(data) {
        this._innerHash.update(data)

        return this
    }

    /**
     * Return the array representation of the hash digest.
     * @returns {Number[]}
     */
    digest() {
        return new SHA256(this._oKeyPad).update(this._innerHash.digest()).digest()
    }

    /**
     * Return the hex representation of the hash digest.
     * @returns {String}
     */
    toString() {
        return str2hex(arr2str(this.digest()))
    }

}
