export interface Vector {
    x: number;
    y: number;
}
export declare const origin: Vector;
export declare const sub: (a: Vector, b: Vector) => {
    x: number;
    y: number;
};
export declare const div: (a: Vector, b: number) => {
    x: number;
    y: number;
};
export declare const mult: (a: Vector, b: number) => {
    x: number;
    y: number;
};
export declare const add: (a: Vector, b: Vector) => {
    x: number;
    y: number;
};
export declare const direction: (a: Vector, b: Vector) => {
    x: number;
    y: number;
};
export declare const perpendicular: (a: Vector) => {
    x: number;
    y: number;
};
export declare const magnitude: (a: Vector) => number;
export declare const unit: (a: Vector) => {
    x: number;
    y: number;
};
export declare const setMagnitude: (a: Vector, amount: number) => {
    x: number;
    y: number;
};
export declare const randomNumberRange: (min: number, max: number) => number;
export declare const randomVectorOnLine: (a: Vector, b: Vector) => Vector;
export declare const generateBezierAnchors: (a: Vector, b: Vector, spread: number) => [Vector, Vector];
export declare const overshoot: (coordinate: Vector, radius: number) => Vector;
export declare const bezierCurve: (start: Vector, finish: Vector, overrideSpread?: number | undefined) => any;
