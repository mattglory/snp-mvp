import { expect } from 'vitest';
import { Cl, ClarityType } from '@stacks/transactions';

// Extend Vitest's expect with Clarinet SDK matchers
interface CustomMatchers<R = unknown> {
  toBeOk(expected?: any): R;
  toBeErr(expected?: any): R;
  toBeBool(expected: boolean): R;
  toBeUint(expected: bigint | number): R;
  toBeInt(expected: bigint | number): R;
  toBeAscii(expected: string): R;
  toBeUtf8(expected: string): R;
  toBePrincipal(expected: string): R;
  toBeNone(): R;
  toBeSome(expected?: any): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Helper to get CV value for comparison
function getCVValue(cv: any): any {
  if (!cv) return undefined;
  
  switch (cv.type) {
    case ClarityType.BoolTrue:
      return true;
    case ClarityType.BoolFalse:
      return false;
    case ClarityType.Int:
    case ClarityType.UInt:
      return cv.value;
    case ClarityType.Buffer:
      return cv.buffer;
    case ClarityType.StringASCII:
    case ClarityType.StringUTF8:
      return cv.data;
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return cv.address;
    case ClarityType.ResponseOk:
      return getCVValue(cv.value);
    case ClarityType.ResponseErr:
      return getCVValue(cv.value);
    case ClarityType.OptionalNone:
      return null;
    case ClarityType.OptionalSome:
      return getCVValue(cv.value);
    default:
      return cv;
  }
}

// Add custom matchers
expect.extend({
  toBeOk(received: any, expected?: any) {
    const isOk = received?.type === ClarityType.ResponseOk;
    
    if (!isOk) {
      return {
        message: () => `Expected (ok ...), got ${received?.type === ClarityType.ResponseErr ? '(err ...)' : 'non-response'}`,
        pass: false
      };
    }
    
    if (expected !== undefined) {
      const receivedValue = getCVValue(received.value);
      const expectedValue = getCVValue(expected);
      const matches = JSON.stringify(receivedValue) === JSON.stringify(expectedValue);
      
      return {
        message: () => `Expected (ok ${JSON.stringify(expectedValue)}), got (ok ${JSON.stringify(receivedValue)})`,
        pass: matches
      };
    }
    
    return { message: () => '', pass: true };
  },

  toBeErr(received: any, expected?: any) {
    const isErr = received?.type === ClarityType.ResponseErr;
    
    if (!isErr) {
      return {
        message: () => `Expected (err ...), got ${received?.type === ClarityType.ResponseOk ? '(ok ...)' : 'non-response'}`,
        pass: false
      };
    }
    
    if (expected !== undefined) {
      const receivedValue = getCVValue(received.value);
      const expectedValue = getCVValue(expected);
      const matches = JSON.stringify(receivedValue) === JSON.stringify(expectedValue);
      
      return {
        message: () => `Expected (err ${JSON.stringify(expectedValue)}), got (err ${JSON.stringify(receivedValue)})`,
        pass: matches
      };
    }
    
    return { message: () => '', pass: true };
  },

  toBeBool(received: any, expected: boolean) {
    const isBool = received?.type === ClarityType.BoolTrue || received?.type === ClarityType.BoolFalse;
    
    if (!isBool) {
      return {
        message: () => `Expected boolean, got ${received?.type}`,
        pass: false
      };
    }
    
    const value = received.type === ClarityType.BoolTrue;
    const matches = value === expected;
    
    return {
      message: () => `Expected ${expected}, got ${value}`,
      pass: matches
    };
  },

  toBeUint(received: any, expected: bigint | number) {
    const isUint = received?.type === ClarityType.UInt;
    
    if (!isUint) {
      return {
        message: () => `Expected uint, got ${received?.type}`,
        pass: false
      };
    }
    
    const expectedBigInt = typeof expected === 'number' ? BigInt(expected) : expected;
    const matches = received.value === expectedBigInt;
    
    return {
      message: () => `Expected u${expectedBigInt}, got u${received.value}`,
      pass: matches
    };
  },

  toBeInt(received: any, expected: bigint | number) {
    const isInt = received?.type === ClarityType.Int;
    
    if (!isInt) {
      return {
        message: () => `Expected int, got ${received?.type}`,
        pass: false
      };
    }
    
    const expectedBigInt = typeof expected === 'number' ? BigInt(expected) : expected;
    const matches = received.value === expectedBigInt;
    
    return {
      message: () => `Expected ${expectedBigInt}, got ${received.value}`,
      pass: matches
    };
  },

  toBeAscii(received: any, expected: string) {
    const isAscii = received?.type === ClarityType.StringASCII;
    
    if (!isAscii) {
      return {
        message: () => `Expected ASCII string, got ${received?.type}`,
        pass: false
      };
    }
    
    const matches = received.data === expected;
    
    return {
      message: () => `Expected "${expected}", got "${received.data}"`,
      pass: matches
    };
  },

  toBeUtf8(received: any, expected: string) {
    const isUtf8 = received?.type === ClarityType.StringUTF8;
    
    if (!isUtf8) {
      return {
        message: () => `Expected UTF-8 string, got ${received?.type}`,
        pass: false
      };
    }
    
    const matches = received.data === expected;
    
    return {
      message: () => `Expected "${expected}", got "${received.data}"`,
      pass: matches
    };
  },

  toBePrincipal(received: any, expected: string) {
    const isPrincipal = received?.type === ClarityType.PrincipalStandard || 
                       received?.type === ClarityType.PrincipalContract;
    
    if (!isPrincipal) {
      return {
        message: () => `Expected principal, got ${received?.type}`,
        pass: false
      };
    }
    
    const matches = received.address === expected;
    
    return {
      message: () => `Expected ${expected}, got ${received.address}`,
      pass: matches
    };
  },

  toBeNone(received: any) {
    const isNone = received?.type === ClarityType.OptionalNone;
    
    return {
      message: () => `Expected none, got ${received?.type}`,
      pass: isNone
    };
  },

  toBeSome(received: any, expected?: any) {
    const isSome = received?.type === ClarityType.OptionalSome;
    
    if (!isSome) {
      return {
        message: () => `Expected (some ...), got ${received?.type === ClarityType.OptionalNone ? 'none' : 'non-optional'}`,
        pass: false
      };
    }
    
    if (expected !== undefined) {
      const receivedValue = getCVValue(received.value);
      const expectedValue = getCVValue(expected);
      const matches = JSON.stringify(receivedValue) === JSON.stringify(expectedValue);
      
      return {
        message: () => `Expected (some ${JSON.stringify(expectedValue)}), got (some ${JSON.stringify(receivedValue)})`,
        pass: matches
      };
    }
    
    return { message: () => '', pass: true };
  },
});
