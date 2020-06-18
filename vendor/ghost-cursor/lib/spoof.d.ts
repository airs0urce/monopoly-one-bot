import { Page } from "puppeteer";
import { Vector } from "./math";
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function path(point: Vector, target: Vector, spreadOverride?: number): any;
export declare function path(point: Vector, target: Box, spreadOverride?: number): any;
export declare const createCursor: (page: Page, start?: Vector) => {
    click(selector?: string | undefined): Promise<void>;
    move(selector: string): Promise<void>;
};
