declare module "he" {
  export function decode(text: string): string;
  export function encode(text: string): string;
  const _default: {
    decode: typeof decode;
    encode: typeof encode;
  };
  export default _default;
} 