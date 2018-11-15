const Buffer = require('buffer/').Buffer;
const BigInteger = require('jsbn').BigInteger;

let THREE = new BigInteger('3', 10);

function Point(curve, x, y, z) {
  // assert.notStrictEqual(z, undefined, 'Missing Z coordinate')

  this.curve = curve
  this.x = x
  this.y = y
  this.z = z
  this._zInv = null

  this.compressed = true
}

Object.defineProperty(Point.prototype, 'zInv', {
  get: function () {
    if (this._zInv === null) {
      this._zInv = this.z.modInverse(this.curve.p)
    }

    return this._zInv
  }
})

Object.defineProperty(Point.prototype, 'affineX', {
  get: function () {
    return this.x.multiply(this.zInv).mod(this.curve.p)
  }
})

Object.defineProperty(Point.prototype, 'affineY', {
  get: function () {
    return this.y.multiply(this.zInv).mod(this.curve.p)
  }
})

Point.fromAffine = function (curve, x, y) {
  return new Point(curve, x, y, BigInteger.ONE)
}

Point.prototype.equals = function (other) {
  if (other === this) return true
  if (this.curve.isInfinity(this)) return this.curve.isInfinity(other)
  if (this.curve.isInfinity(other)) return this.curve.isInfinity(this)

  // u = Y2 * Z1 - Y1 * Z2
  let u = other.y.multiply(this.z).subtract(this.y.multiply(other.z)).mod(this.curve.p)

  if (u.signum() !== 0) return false

  // v = X2 * Z1 - X1 * Z2
  let v = other.x.multiply(this.z).subtract(this.x.multiply(other.z)).mod(this.curve.p)

  return v.signum() === 0
}

Point.prototype.negate = function () {
  let y = this.curve.p.subtract(this.y)

  return new Point(this.curve, this.x, y, this.z)
}

Point.prototype.add = function (b) {
  if (this.curve.isInfinity(this)) return b
  if (this.curve.isInfinity(b)) return this

  let x1 = this.x
  let y1 = this.y
  let x2 = b.x
  let y2 = b.y

  // u = Y2 * Z1 - Y1 * Z2
  let u = y2.multiply(this.z).subtract(y1.multiply(b.z)).mod(this.curve.p)
  // v = X2 * Z1 - X1 * Z2
  let v = x2.multiply(this.z).subtract(x1.multiply(b.z)).mod(this.curve.p)

  if (v.signum() === 0) {
    if (u.signum() === 0) {
      return this.twice() // this == b, so double
    }

    return this.curve.infinity // this = -b, so infinity
  }

  let v2 = v.square()
  let v3 = v2.multiply(v)
  let x1v2 = x1.multiply(v2)
  let zu2 = u.square().multiply(this.z)

  // x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
  let x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.p)
  // y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
  let y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(v3)).mod(this.curve.p)
  // z3 = v^3 * z1 * z2
  let z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.p)

  return new Point(this.curve, x3, y3, z3)
}

Point.prototype.twice = function () {
  if (this.curve.isInfinity(this)) return this
  if (this.y.signum() === 0) return this.curve.infinity

  let x1 = this.x
  let y1 = this.y

  let y1z1 = y1.multiply(this.z).mod(this.curve.p)
  let y1sqz1 = y1z1.multiply(y1).mod(this.curve.p)
  let a = this.curve.a

  // w = 3 * x1^2 + a * z1^2
  let w = x1.square().multiply(THREE)

  if (a.signum() !== 0) {
    w = w.add(this.z.square().multiply(a))
  }

  w = w.mod(this.curve.p)
  // x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
  let x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.p)
  // y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
  let y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.pow(3)).mod(this.curve.p)
  // z3 = 8 * (y1 * z1)^3
  let z3 = y1z1.pow(3).shiftLeft(3).mod(this.curve.p)

  return new Point(this.curve, x3, y3, z3)
}

// Simple NAF (Non-Adjacent Form) multiplication algorithm
// TODO: modularize the multiplication algorithm
Point.prototype.multiply = function (k) {
  if (this.curve.isInfinity(this)) return this
  if (k.signum() === 0) return this.curve.infinity

  let e = k
  let h = e.multiply(THREE)

  let neg = this.negate()
  let R = this

  for (let i = h.bitLength() - 2; i > 0; --i) {
    let hBit = h.testBit(i)
    let eBit = e.testBit(i)

    R = R.twice()

    if (hBit !== eBit) {
      R = R.add(hBit ? this : neg)
    }
  }
  return R
}

// Compute this*j + x*k (simultaneous multiplication)
Point.prototype.multiplyTwo = function (j, x, k) {
  let i = Math.max(j.bitLength(), k.bitLength()) - 1
  let R = this.curve.infinity
  let both = this.add(x)

  while (i >= 0) {
    let jBit = j.testBit(i)
    let kBit = k.testBit(i)

    R = R.twice()

    if (jBit) {
      if (kBit) {
        R = R.add(both)
      } else {
        R = R.add(this)
      }
    } else if (kBit) {
      R = R.add(x)
    }
    --i
  }

  return R
}

Point.prototype.getEncoded = function (compressed) {
  if (compressed == null) compressed = this.compressed
  if (this.curve.isInfinity(this)) return Buffer.alloc(1, 0) // Infinity point encoded is simply '00'

  let x = this.affineX
  let y = this.affineY

  let byteLength = this.curve.pLength
  let buffer

  // 0x02/0x03 | X
  if (compressed) {
    buffer = Buffer.allocUnsafe(1 + byteLength)
    buffer.writeUInt8(y.isEven() ? 0x02 : 0x03, 0)

    // 0x04 | X | Y
  } else {
    buffer = Buffer.allocUnsafe(1 + byteLength + byteLength)
    buffer.writeUInt8(0x04, 0)
    y.toBuffer(byteLength).copy(buffer, 1 + byteLength)
  }
  // return Buffer.from(x.toString(16), "hex")
  return x.toString(16)
}

Point.decodeFrom = function (curve, buffer) {
  let type = buffer.readUInt8(0)
  let compressed = (type !== 4)

  let byteLength = Math.floor((curve.p.bitLength() + 7) / 8)
  let x = BigInteger.fromBuffer(buffer.slice(1, 1 + byteLength))

  let Q
  if (compressed) {
    // assert.equal(buffer.length, byteLength + 1, 'Invalid sequence length')
    // assert(type === 0x02 || type === 0x03, 'Invalid sequence tag')

    let isOdd = (type === 0x03)
    Q = curve.pointFromX(isOdd, x)
  } else {
    // assert.equal(buffer.length, 1 + byteLength + byteLength, 'Invalid sequence length')

    let y = BigInteger.fromBuffer(buffer.slice(1 + byteLength))
    Q = Point.fromAffine(curve, x, y)
  }

  Q.compressed = compressed
  return Q
}

Point.prototype.toString = function () {
  if (this.curve.isInfinity(this)) return '(INFINITY)'

  return '(' + this.affineX.toString() + ',' + this.affineY.toString() + ')'
}

module.exports = Point
