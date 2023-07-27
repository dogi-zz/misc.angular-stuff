export interface SvgPathCurvedSegment extends SvgPathLineSegment {
    cpFrom: [number, number];
    cpTo: [number, number];
}
export interface SvgPathLineSegment {
    from: [number, number];
    to: [number, number];
    length?: number;
    positionFromOriginal?: [number, number];
}
export interface SvgPath {
    segments: SvgPathSegmentImpl<any>[];
}
export declare const getPontDistance: (from: [number, number], to: [number, number]) => number;
export declare class SvgPathTools {
    static svgPath(path: SvgPath): string;
    static getPointOnLine(from: [number, number], to: [number, number], position: number): [number, number];
    static getDirectionVector(segment: SvgPathCurvedSegment | SvgPathLineSegment, position: number): {
        point: [number, number];
        direction: [number, number];
        normal1: [number, number];
        normal2: [number, number];
    };
    static applyRoundCorner(segments: SvgPathSegmentImpl<any>[], segment1: SvgPathSegmentImpl<any>, segment2: SvgPathSegmentImpl<any>, cornerModification: {
        round: SvgPathSegmentImpl<any>;
        cutPosition1: number;
        cutPosition2: number;
    }): void;
    static getRoundCorner(segment1: SvgPathSegmentImpl<any>, segment2: SvgPathSegmentImpl<any>, desiredBorderRadius: number): {
        direction1: {
            point: [number, number];
            direction: [number, number];
            normal1: [number, number];
            normal2: [number, number];
        };
        direction2: {
            point: [number, number];
            direction: [number, number];
            normal1: [number, number];
            normal2: [number, number];
        };
        circleCenter: [number, number];
        round: SvgPathSegmentImpl<any>;
        cutPosition1: any;
        cutPosition2: any;
    };
    static getRingPart(angle: number, center: [number, number], outerRadius: number, innerRadius: number, borderRadius: number): {
        segments: SvgPathSegmentImpl<any>[];
        anchorPoints: [number, number][];
    };
}
export declare class SvgPathSegmentList<T extends SvgPathSegmentImpl<T>> {
    original: T;
    center: number;
    segments: T[];
    constructor(original: T, center: number);
    findFromCenter(predicate: (s: T, l: number) => boolean, direction: 1 | -1): T & SvgPathLineSegment;
}
export declare abstract class SvgPathSegmentImpl<T extends SvgPathSegmentImpl<T>> {
    static from(definition: any): SvgPathSegmentImpl<any>;
    abstract svgContinuePathSegment(): string;
    abstract svgSinglePathSegment(): string;
    abstract getPointOnSegment(position: number): any;
    abstract splitPath(position: number): [T, T];
    abstract getSegmentLen(maxDistance?: number, maxDepth?: number): any;
    abstract splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<T>;
}
export declare class SvgPathLineSegmentImpl extends SvgPathSegmentImpl<SvgPathLineSegmentImpl> implements SvgPathLineSegment {
    from: [number, number];
    to: [number, number];
    length?: number;
    positionFromOriginal?: [number, number];
    private constructor();
    static from(definition: SvgPathLineSegment): SvgPathLineSegmentImpl;
    svgContinuePathSegment(): string;
    svgSinglePathSegment(): string;
    getPointOnSegment(position: number): [number, number];
    splitPath(position: number): [SvgPathLineSegmentImpl, SvgPathLineSegmentImpl];
    getSegmentLen(maxDistance?: number, maxDepth?: number): number;
    splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<SvgPathLineSegmentImpl>;
}
export declare class SvgPathCurveSegmentImpl extends SvgPathSegmentImpl<SvgPathCurveSegmentImpl> implements SvgPathCurvedSegment {
    from: [number, number];
    to: [number, number];
    length?: number;
    positionFromOriginal?: [number, number];
    cpFrom: [number, number];
    cpTo: [number, number];
    calculatedPoints: {
        position: number;
        level1p1: [number, number];
        level1p2: [number, number];
        level1p3: [number, number];
        level2p1: [number, number];
        level2p2: [number, number];
        level3p1: [number, number];
    };
    private constructor();
    clear(): void;
    static from(definition: SvgPathCurvedSegment): SvgPathCurveSegmentImpl;
    svgContinuePathSegment(): string;
    svgSinglePathSegment(): string;
    private calculatePointsForPosition;
    getPointOnSegment(position: number): [number, number];
    splitPath(position: number): [SvgPathCurveSegmentImpl, SvgPathCurveSegmentImpl];
    getSegmentLen(maxDistance?: number, maxDepth?: number): any;
    splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<SvgPathCurveSegmentImpl>;
}
