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


export const getPontDistance = (from: [number, number], to: [number, number]): number => {
  const [fx, fy] = from;
  const [tx, ty] = to;
  const [dx, dy] = [tx - fx, ty - fy];
  return Math.sqrt((dx * dx) + (dy * dy));
};

const getNormed = (from: [number, number], to: [number, number]): [number, number] => {
  const [fx, fy] = from;
  const [tx, ty] = to;
  const d = getPontDistance(from, to);
  return [(tx - fx) / d, (ty - fy) / d];
};

const vectorAdd = (v1: [number, number], v2: [number, number]): [number, number] => {
  return [v1[0] + v2[0], v1[1] + v2[1]];
};
const scalarProd = (v1: [number, number], factor: number): [number, number] => {
  return [v1[0] * factor, v1[1] * factor];
};

const avg = (x1: number, x2: number) => (x1 + x2) / 2;
const round10 = (num: number) => Math.round(num * 10000000000) / 10000000000;

const getInnerAngle = (center: [number, number], start: [number, number], end: [number, number]) => {
  const radius = getPontDistance(center, start);
  const baseDirection = getNormed(center, start);
  const pointOnBase = intersectLines(center, baseDirection, end, [baseDirection[1], -baseDirection[0]]);
  const lenFromStartToPointOnBase = getPontDistance(start, pointOnBase);
  const angle = Math.acos((radius - lenFromStartToPointOnBase) / radius);
  return {angle, radius};
};

const intersectLines = (P: [number, number], r: [number, number], Q: [number, number], s: [number, number]): [number, number] => {
  const PQx = Q[0] - P[0];
  const PQy = Q[1] - P[1];
  const rx = r[0];
  const ry = r[1];
  const rxt = -ry;
  const ryt = rx;
  const qx = PQx * rx + PQy * ry;
  const qy = PQx * rxt + PQy * ryt;
  const sx = s[0] * rx + s[1] * ry;
  const sy = s[0] * rxt + s[1] * ryt;
  // if lines are identical or do not cross...
  if (sy === 0) {
    return null;
  }
  const a = qx - qy * sx / sy;
  return [P[0] + a * rx, P[1] + a * ry];
};


export class SvgPathTools {


  public static svgPath(path: SvgPath): string {
    const startSegment: SvgPathSegmentImpl<any> = path.segments[0];
    const [fx, fy] = (startSegment as any).from;
    let pathString = `M ${fx} ${fy}`;
    path.segments.forEach(segment => {
      pathString = `${pathString} ${SvgPathSegmentImpl.from(segment).svgContinuePathSegment()}`;
    });
    return pathString;
  }

  public static getPointOnLine(from: [number, number], to: [number, number], position: number): [number, number] {
    const vector = [to[0] - from[0], to[1] - from[1]];
    return [from[0] + vector[0] * position, from[1] + vector[1] * position];
  }


  public static getDirectionVector(segment: SvgPathCurvedSegment | SvgPathLineSegment, position: number): { point: [number, number], direction: [number, number], normal1: [number, number], normal2: [number, number] } {
    if ((segment as SvgPathCurvedSegment).cpFrom) {
      const curve = segment as SvgPathCurvedSegment;
      const level1p1 = SvgPathTools.getPointOnLine(curve.from, curve.cpFrom, position);
      const level1p2 = SvgPathTools.getPointOnLine(curve.cpFrom, curve.cpTo, position);
      const level1p3 = SvgPathTools.getPointOnLine(curve.cpTo, curve.to, position);

      const level2p1 = SvgPathTools.getPointOnLine(level1p1, level1p2, position);
      const level2p2 = SvgPathTools.getPointOnLine(level1p2, level1p3, position);

      const level3p1 = SvgPathTools.getPointOnLine(level2p1, level2p2, position);

      const direction = getNormed(level2p1, level2p2);
      return {
        point: level3p1,
        direction,
        normal1: [direction[1], -direction[0]],
        normal2: [-direction[1], direction[0]],
      };
    } else {
      const point = SvgPathTools.getPointOnLine(segment.from, segment.to, position);
      const direction = getNormed(segment.from, segment.to);
      return {
        point,
        direction,
        normal1: [direction[1], -direction[0]],
        normal2: [-direction[1], direction[0]],
      };
    }

  }


  public static applyRoundCorner(segments: SvgPathSegmentImpl<any>[], segment1: SvgPathSegmentImpl<any>, segment2: SvgPathSegmentImpl<any>,
                                 cornerModification: { round: SvgPathSegmentImpl<any>, cutPosition1: number, cutPosition2: number }) {

    const idx1 = segments.indexOf(segment1);
    const idx2 = segments.indexOf(segment2);
    const split1 = segment1.splitPath(cornerModification.cutPosition1);
    const split2 = segment2.splitPath(cornerModification.cutPosition2);
    segments[idx1] = split1[0];
    segments[idx2] = split2[1];
    segments.splice(idx2, 0, cornerModification.round);
  }

  public static getRoundCorner(segment1: SvgPathSegmentImpl<any>, segment2: SvgPathSegmentImpl<any>, desiredBorderRadius: number) {
    const borderRadius = Math.min(
      desiredBorderRadius,
      getPontDistance((segment1 as any as SvgPathLineSegment).from, (segment1 as any as SvgPathLineSegment).to) / 2,
      getPontDistance((segment2 as any as SvgPathLineSegment).from, (segment2 as any as SvgPathLineSegment).to) / 2,
    );


    const curveSegments1 = segment1.splitIntoSegmentsAround(1, borderRadius * 2, 2, 1);
    const segmentToCut1 = curveSegments1.findFromCenter((s, l) => l >= borderRadius, -1);
    const cutPosition1 = segmentToCut1.positionFromOriginal[0];
    const direction1 = SvgPathTools.getDirectionVector(segmentToCut1, cutPosition1);

    const curveSegments2 = segment2.splitIntoSegmentsAround(0, borderRadius * 2, 2, 1);
    const segmentToCut2 = curveSegments2.findFromCenter((s, l) => l >= borderRadius, 1);
    const cutPosition2 = segmentToCut2.positionFromOriginal[1];
    const direction2 = SvgPathTools.getDirectionVector(segmentToCut2, cutPosition2);

    const circleCenter = intersectLines(direction1.point, direction1.normal1, direction2.point, direction2.normal1);


    const {angle, radius} = getInnerAngle(circleCenter, direction1.point, direction2.point);
    const circleParts = Math.PI * 2 / angle;
    const circleControlPointDistance = 4 / 3 * Math.tan(Math.PI / (circleParts * 2)) * radius;

    const round = SvgPathSegmentImpl.from({
      from: direction1.point,
      cpFrom: vectorAdd(direction1.point, scalarProd(direction1.direction, circleControlPointDistance)),//  [direction1.point[0] + direction1.direction[0] * circleControlPointDistance, direction1.point[1] + direction1.direction[1] * circleControlPointDistance],
      cpTo: vectorAdd(direction2.point, scalarProd(direction2.direction, -circleControlPointDistance)),// [direction2.point[0] - direction2.direction[0] * circleControlPointDistance, direction2.point[1] - direction2.direction[1] * circleControlPointDistance],
      to: direction2.point,
    });

    return {direction1, direction2, circleCenter, round, cutPosition1, cutPosition2};
  }

  public static getRingPart(angle: number, center: [number, number], outerRadius: number, innerRadius: number, borderRadius: number): { segments: SvgPathSegmentImpl<any>[], anchorPoints: [number, number][] } {
    const segments: SvgPathSegmentImpl<any> [] = [];
    const anchorPoints: [number, number][] = [];

    const innerCircumference = Math.PI * 2 * innerRadius;
    const borderAngle = borderRadius / innerCircumference * Math.PI * 2;

    type Segment = { start: [number, number], end: [number, number], startTangent: [number, number], endTangent: [number, number], tangentLen: number };
    const outerSegments: Segment[] = [];

    const getPointPair = (ang: number, tangentDirection: number): [[number, number], [number, number]] => [[round10(Math.cos(ang)), round10(Math.sin(ang))], [round10(Math.cos(ang + tangentDirection * Math.PI / 2)), round10(Math.sin(ang + tangentDirection * Math.PI / 2))]];
    const getTangentLen = (ang) => {
      const segmentCount = Math.PI * 2 / ang;
      return 4 / 3 * Math.tan(Math.PI / (2 * segmentCount));
    };

    let actAngle = 0;
    while (actAngle < angle - Math.PI / 2) {
      let nextAngle = actAngle + Math.PI / 2;
      if (nextAngle + borderAngle > angle) {
        nextAngle -= Math.PI / 4;
      }
      const [start, startTangent] = getPointPair(actAngle, 1);
      const [end, endTangent] = getPointPair(nextAngle, -1);
      const tangentLen = getTangentLen(nextAngle - actAngle);
      outerSegments.push({start, end, startTangent, endTangent, tangentLen});
      actAngle = nextAngle;
    }
    if (actAngle < angle) {
      const [start, startTangent] = getPointPair(actAngle, 1);
      const [end, endTangent] = getPointPair(angle, -1);
      const tangentLen = getTangentLen(angle - actAngle);
      outerSegments.push({start, end, startTangent, endTangent, tangentLen});
    }

    segments.push(SvgPathSegmentImpl.from({
      from: vectorAdd(scalarProd(outerSegments[0].start, avg(outerRadius, innerRadius)), center),
      to: vectorAdd(scalarProd(outerSegments[0].start, outerRadius), center),
    }));
    for (let idx = 0; idx < outerSegments.length; idx++) {
      const segment = outerSegments[idx];
      segments.push(SvgPathSegmentImpl.from({
        from: vectorAdd(scalarProd(segment.start, outerRadius), center),
        cpFrom: vectorAdd(scalarProd(vectorAdd(segment.start, scalarProd(segment.startTangent, segment.tangentLen)), outerRadius), center),
        cpTo: vectorAdd(scalarProd(vectorAdd(segment.end, scalarProd(segment.endTangent, segment.tangentLen)), outerRadius), center),
        to: vectorAdd(scalarProd(segment.end, outerRadius), center),
      }));

      if (idx === 0) {
        anchorPoints.push(vectorAdd(scalarProd(segment.start, outerRadius), center));
      }
      anchorPoints.push(vectorAdd(scalarProd(segment.end, outerRadius), center));
    }
    segments.push(SvgPathSegmentImpl.from({
      from: vectorAdd(scalarProd(outerSegments[outerSegments.length - 1].end, outerRadius), center),
      to: vectorAdd(scalarProd(outerSegments[outerSegments.length - 1].end, innerRadius), center),
    }));
    for (let idx = outerSegments.length - 1; idx >= 0; idx--) {
      const segment = outerSegments[idx];
      segments.push(SvgPathSegmentImpl.from({
        from: vectorAdd(scalarProd(segment.end, innerRadius), center),
        cpFrom: vectorAdd(scalarProd(vectorAdd(segment.end, scalarProd(segment.endTangent, segment.tangentLen)), innerRadius), center),
        cpTo: vectorAdd(scalarProd(vectorAdd(segment.start, scalarProd(segment.startTangent, segment.tangentLen)), innerRadius), center),
        to: vectorAdd(scalarProd(segment.start, innerRadius), center),
      }));

      if (idx === 0) {
        anchorPoints.push(vectorAdd(scalarProd(segment.start, innerRadius), center));
      }
      anchorPoints.push(vectorAdd(scalarProd(segment.end, innerRadius), center));
    }
    segments.push(SvgPathSegmentImpl.from({
      from: vectorAdd(scalarProd(outerSegments[0].start, innerRadius), center),
      to: vectorAdd(scalarProd(outerSegments[0].start, avg(outerRadius, innerRadius)), center),
    }));

    [0, outerSegments.length + 1, outerSegments.length + 3, outerSegments.length * 2 + 4].forEach((idx) => {
      const roundCornerResult = SvgPathTools.getRoundCorner(segments[idx], segments[idx + 1], borderRadius);
      SvgPathTools.applyRoundCorner(segments, segments[idx], segments[idx + 1], roundCornerResult);
    });

    return {
      segments, anchorPoints,
    };
  }

}

export class SvgPathSegmentList<T extends SvgPathSegmentImpl<T>> {
  public segments: T[];

  constructor(public original: T, public center: number) {
    this.segments = [];
  }

  public findFromCenter(predicate: (s: T, l: number) => boolean, direction: 1 | -1) {
    const segments: (T & SvgPathLineSegment)[] = this.segments as any;
    let actualPart = segments.find(s => s.positionFromOriginal[0] < this.center && s.positionFromOriginal[0] > this.center);
    if (!actualPart) {
      if (direction === -1) {
        actualPart = segments.find(s => s.positionFromOriginal[1] === this.center);
      } else {
        actualPart = segments.find(s => s.positionFromOriginal[0] === this.center);
      }
    }
    let len = 0;
    let idx = this.segments.indexOf(actualPart);
    while (actualPart) {
      len += actualPart.length;
      if (predicate(actualPart, len)) {
        break;
      }
      idx += direction;
      actualPart = segments[idx];
    }
    return actualPart;
  }
}


export abstract class SvgPathSegmentImpl<T extends SvgPathSegmentImpl<T>> {

  public static from(definition): SvgPathSegmentImpl<any> {
    if (definition instanceof SvgPathLineSegmentImpl) {
      return definition;
    }
    if ((definition as SvgPathCurvedSegment).cpFrom) {
      return SvgPathCurveSegmentImpl.from(definition);
    } else {
      return SvgPathLineSegmentImpl.from(definition);
    }
  }


  public abstract svgContinuePathSegment(): string;

  public abstract svgSinglePathSegment(): string;

  public abstract getPointOnSegment(position: number);

  public abstract splitPath(position: number): [T, T];

  public abstract getSegmentLen(maxDistance?: number, maxDepth?: number);

  public abstract splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<T>;

}

export class SvgPathLineSegmentImpl extends SvgPathSegmentImpl<SvgPathLineSegmentImpl> implements SvgPathLineSegment {

  public from: [number, number];
  public to: [number, number];
  public length?: number;
  public positionFromOriginal?: [number, number];

  private constructor(definition: SvgPathLineSegment) {
    super();
    Object.assign(this, definition);
  }

  public static override from(definition: SvgPathLineSegment): SvgPathLineSegmentImpl {
    return definition instanceof SvgPathLineSegmentImpl ? definition : new SvgPathLineSegmentImpl(definition);
  }

  public override svgContinuePathSegment(): string {
    const [fx, fy] = this.from;
    const [tx, ty] = this.to;
    return `L ${tx} ${ty}`;
  }

  public override svgSinglePathSegment(): string {
    const [fx, fy] = this.from;
    return `M ${fx} ${fy} ${this.svgContinuePathSegment()}`;
  }

  public override getPointOnSegment(position: number) {
    return SvgPathTools.getPointOnLine(this.from, this.to, position);
  }

  public override splitPath(position: number): [SvgPathLineSegmentImpl, SvgPathLineSegmentImpl] {
    const splitPoint = SvgPathTools.getPointOnLine(this.from, this.to, position);
    const firstPath: SvgPathLineSegment = {
      from: [...this.from],
      to: [...splitPoint],
    };
    const secondPath: SvgPathLineSegment = {
      from: [...splitPoint],
      to: [...this.to],
    };
    return [SvgPathLineSegmentImpl.from(firstPath), SvgPathLineSegmentImpl.from(secondPath)];
  }

  public override getSegmentLen(maxDistance?: number, maxDepth?: number) {
    return getPontDistance(this.from, this.to);
  }

  public override splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<SvgPathLineSegmentImpl> {
    const result = new SvgPathSegmentList<SvgPathLineSegmentImpl>(this, splitCenter);
    const len = getPontDistance(this.from, this.to);
    const parts = Math.ceil(len / maxLen);
    const lenX = (this.to[0] - this.from[0]) / parts;
    const lenY = (this.to[1] - this.from[1]) / parts;
    for (let i = 0; i < parts; i++) {
      result.segments.push(SvgPathLineSegmentImpl.from({
        from: [this.from[0] + lenX * i, this.from[1] + lenY * i],
        to: [this.from[0] + lenX * (i + 1), this.from[1] + lenY * (i + 1)],
        positionFromOriginal: [i / parts, (i + 1) / parts],
        length: len / parts,
      }));
    }
    return result;
  }
}

export class SvgPathCurveSegmentImpl extends SvgPathSegmentImpl<SvgPathCurveSegmentImpl> implements SvgPathCurvedSegment {

  public from: [number, number];
  public to: [number, number];
  public length?: number;
  public positionFromOriginal?: [number, number];
  public cpFrom: [number, number];
  public cpTo: [number, number];

  public calculatedPoints: {
    position: number,
    level1p1: [number, number],
    level1p2: [number, number],
    level1p3: [number, number],
    level2p1: [number, number],
    level2p2: [number, number],
    level3p1: [number, number],
  };

  private constructor(definition: SvgPathCurvedSegment) {
    super();
    Object.assign(this, definition);
  }

  public clear() {
    this.calculatedPoints = null;
  }

  public static override from(definition: SvgPathCurvedSegment): SvgPathCurveSegmentImpl {
    return definition instanceof SvgPathCurveSegmentImpl ? definition : new SvgPathCurveSegmentImpl(definition);
  }

  public override svgContinuePathSegment(): string {
    const [fx, fy] = this.from;
    const [c1x, c1y] = this.cpFrom;
    const [c2x, c2y] = this.cpTo;
    const [tx, ty] = this.to;
    return `C ${c1x} ${c1y} ${c2x} ${c2y} ${tx} ${ty}`;
  }

  public override svgSinglePathSegment(): string {
    const [fx, fy] = this.from;
    return `M ${fx} ${fy} ${this.svgContinuePathSegment()}`;
  }

  private calculatePointsForPosition(position: number) {
    if (this.calculatedPoints?.position !== position) {
      this.calculatedPoints = {position} as any;
      this.calculatedPoints.level1p1 = SvgPathTools.getPointOnLine(this.from, this.cpFrom, position);
      this.calculatedPoints.level1p2 = SvgPathTools.getPointOnLine(this.cpFrom, this.cpTo, position);
      this.calculatedPoints.level1p3 = SvgPathTools.getPointOnLine(this.cpTo, this.to, position);

      this.calculatedPoints.level2p1 = SvgPathTools.getPointOnLine(this.calculatedPoints.level1p1, this.calculatedPoints.level1p2, position);
      this.calculatedPoints.level2p2 = SvgPathTools.getPointOnLine(this.calculatedPoints.level1p2, this.calculatedPoints.level1p3, position);

      this.calculatedPoints.level3p1 = SvgPathTools.getPointOnLine(this.calculatedPoints.level2p1, this.calculatedPoints.level2p2, position);
    }
  }

  public override getPointOnSegment(position: number) {
    this.calculatePointsForPosition(position);
    return this.calculatedPoints.level3p1;
  }

  public override splitPath(position: number): [SvgPathCurveSegmentImpl, SvgPathCurveSegmentImpl] {
    this.calculatePointsForPosition(position);
    const firstPath: SvgPathCurvedSegment = {
      from: [...this.from],
      cpFrom: [...this.calculatedPoints.level1p1],
      cpTo: [...this.calculatedPoints.level2p1],
      to: [...this.calculatedPoints.level3p1],
    };
    const secondPath: SvgPathCurvedSegment = {
      from: [...this.calculatedPoints.level3p1],
      cpFrom: [...this.calculatedPoints.level2p2],
      cpTo: [...this.calculatedPoints.level1p3],
      to: [...this.to],
    };
    return [SvgPathCurveSegmentImpl.from(firstPath), SvgPathCurveSegmentImpl.from(secondPath)];
  }

  public override getSegmentLen(maxDistance: number = 10, maxDepth: number = 100) {
    if (typeof this.length === 'number') {
      return this.length;
    }
    const d1 = getPontDistance(this.from, this.cpFrom);
    const d2 = getPontDistance(this.to, this.cpTo);
    const d3 = getPontDistance(this.from, this.to);
    if (Math.max(d1, d2, d3) <= maxDistance || maxDepth <= 0) {
      return getPontDistance(this.from, this.to);
    }
    const [subSegment1, subSegment2] = this.splitPath(0.5);
    return subSegment1.getSegmentLen(maxDistance, maxDepth - 1)
      + subSegment2.getSegmentLen(maxDistance, maxDepth - 1);
  }

  public override splitIntoSegmentsAround(splitCenter: number, splitCenterOffset: number, maxLen: number, lenResolution: number): SvgPathSegmentList<SvgPathCurveSegmentImpl> {
    const result = new SvgPathSegmentList<SvgPathCurveSegmentImpl>(this, splitCenter);
    result.segments.push(SvgPathCurveSegmentImpl.from({...this, positionFromOriginal: [0, 1]}));
    const splitCenterPoint = (splitCenter ?? null) === null ? null : this.getPointOnSegment(splitCenter);
    if (splitCenter && splitCenter < 1) {
      const [s1, s2] = this.splitPath(splitCenter);
      result.segments.splice(0, 1, SvgPathCurveSegmentImpl.from({...s1, positionFromOriginal: [0, splitCenter]}), SvgPathCurveSegmentImpl.from({...s2, positionFromOriginal: [splitCenter, 1]}));
    }

    const resultAroundSplitCenter = () => {
      if (splitCenterPoint) {
        return result.segments.filter(s => {
          return (s.positionFromOriginal[0] <= splitCenter && s.positionFromOriginal[1] >= splitCenter)
            || getPontDistance(s.from, splitCenterPoint) <= splitCenterOffset
            || getPontDistance(s.to, splitCenterPoint) <= splitCenterOffset;
        });
      } else {
        return result.segments;
      }
    };

    let segmentToBig: SvgPathCurveSegmentImpl = resultAroundSplitCenter().find(s => getPontDistance(s.from, s.to) > maxLen);
    while (segmentToBig) {
      const [s1, s2] = segmentToBig.splitPath(0.5);
      s1.positionFromOriginal = [segmentToBig.positionFromOriginal[0], avg(segmentToBig.positionFromOriginal[0], segmentToBig.positionFromOriginal[1])];
      s2.positionFromOriginal = [avg(segmentToBig.positionFromOriginal[0], segmentToBig.positionFromOriginal[1]), segmentToBig.positionFromOriginal[1]];
      result.segments.splice(result.segments.indexOf(segmentToBig), 1, s1, s2);
      segmentToBig = resultAroundSplitCenter().find(s => getPontDistance(s.from, s.to) > maxLen);
    }
    result.segments.forEach(s => s.length = SvgPathCurveSegmentImpl.from(s).getSegmentLen(lenResolution, 10));
    segmentToBig = resultAroundSplitCenter().find(s => s.length > maxLen);
    while (segmentToBig) {
      const [s1, s2] = segmentToBig.splitPath(0.5);
      s1.positionFromOriginal = [segmentToBig.positionFromOriginal[0], avg(segmentToBig.positionFromOriginal[0], segmentToBig.positionFromOriginal[1])];
      s2.positionFromOriginal = [avg(segmentToBig.positionFromOriginal[0], segmentToBig.positionFromOriginal[1]), segmentToBig.positionFromOriginal[1]];
      s1.length = SvgPathCurveSegmentImpl.from(s1).getSegmentLen(lenResolution, 10);
      s2.length = SvgPathCurveSegmentImpl.from(s2).getSegmentLen(lenResolution, 10);
      result.segments.splice(result.segments.indexOf(segmentToBig), 1, s1, s2);
      segmentToBig = resultAroundSplitCenter().find(s => getPontDistance(s.from, s.to) > maxLen);
    }
    return result;
  }
}

