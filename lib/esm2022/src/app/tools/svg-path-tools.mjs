export const getPontDistance = (from, to) => {
    const [fx, fy] = from;
    const [tx, ty] = to;
    const [dx, dy] = [tx - fx, ty - fy];
    return Math.sqrt((dx * dx) + (dy * dy));
};
const getNormed = (from, to) => {
    const [fx, fy] = from;
    const [tx, ty] = to;
    const d = getPontDistance(from, to);
    return [(tx - fx) / d, (ty - fy) / d];
};
const vectorAdd = (v1, v2) => {
    return [v1[0] + v2[0], v1[1] + v2[1]];
};
const scalarProd = (v1, factor) => {
    return [v1[0] * factor, v1[1] * factor];
};
const avg = (x1, x2) => (x1 + x2) / 2;
const round10 = (num) => Math.round(num * 10000000000) / 10000000000;
const getInnerAngle = (center, start, end) => {
    const radius = getPontDistance(center, start);
    const baseDirection = getNormed(center, start);
    const pointOnBase = intersectLines(center, baseDirection, end, [baseDirection[1], -baseDirection[0]]);
    const lenFromStartToPointOnBase = getPontDistance(start, pointOnBase);
    const angle = Math.acos((radius - lenFromStartToPointOnBase) / radius);
    return { angle, radius };
};
const intersectLines = (P, r, Q, s) => {
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
    static svgPath(path) {
        const startSegment = path.segments[0];
        const [fx, fy] = startSegment.from;
        let pathString = `M ${fx} ${fy}`;
        path.segments.forEach(segment => {
            pathString = `${pathString} ${SvgPathSegmentImpl.from(segment).svgContinuePathSegment()}`;
        });
        return pathString;
    }
    static getPointOnLine(from, to, position) {
        const vector = [to[0] - from[0], to[1] - from[1]];
        return [from[0] + vector[0] * position, from[1] + vector[1] * position];
    }
    static getDirectionVector(segment, position) {
        if (segment.cpFrom) {
            const curve = segment;
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
        }
        else {
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
    static applyRoundCorner(segments, segment1, segment2, cornerModification) {
        const idx1 = segments.indexOf(segment1);
        const idx2 = segments.indexOf(segment2);
        const split1 = segment1.splitPath(cornerModification.cutPosition1);
        const split2 = segment2.splitPath(cornerModification.cutPosition2);
        segments[idx1] = split1[0];
        segments[idx2] = split2[1];
        segments.splice(idx2, 0, cornerModification.round);
    }
    static getRoundCorner(segment1, segment2, desiredBorderRadius) {
        const borderRadius = Math.min(desiredBorderRadius, getPontDistance(segment1.from, segment1.to) / 2, getPontDistance(segment2.from, segment2.to) / 2);
        const curveSegments1 = segment1.splitIntoSegmentsAround(1, borderRadius * 2, 2, 1);
        const segmentToCut1 = curveSegments1.findFromCenter((s, l) => l >= borderRadius, -1);
        const cutPosition1 = segmentToCut1.positionFromOriginal[0];
        const direction1 = SvgPathTools.getDirectionVector(segmentToCut1, cutPosition1);
        const curveSegments2 = segment2.splitIntoSegmentsAround(0, borderRadius * 2, 2, 1);
        const segmentToCut2 = curveSegments2.findFromCenter((s, l) => l >= borderRadius, 1);
        const cutPosition2 = segmentToCut2.positionFromOriginal[1];
        const direction2 = SvgPathTools.getDirectionVector(segmentToCut2, cutPosition2);
        const circleCenter = intersectLines(direction1.point, direction1.normal1, direction2.point, direction2.normal1);
        const { angle, radius } = getInnerAngle(circleCenter, direction1.point, direction2.point);
        const circleParts = Math.PI * 2 / angle;
        const circleControlPointDistance = 4 / 3 * Math.tan(Math.PI / (circleParts * 2)) * radius;
        const round = SvgPathSegmentImpl.from({
            from: direction1.point,
            cpFrom: vectorAdd(direction1.point, scalarProd(direction1.direction, circleControlPointDistance)),
            cpTo: vectorAdd(direction2.point, scalarProd(direction2.direction, -circleControlPointDistance)),
            to: direction2.point,
        });
        return { direction1, direction2, circleCenter, round, cutPosition1, cutPosition2 };
    }
    static getRingPart(angle, center, outerRadius, innerRadius, borderRadius) {
        const segments = [];
        const anchorPoints = [];
        const innerCircumference = Math.PI * 2 * innerRadius;
        const borderAngle = borderRadius / innerCircumference * Math.PI * 2;
        const outerSegments = [];
        const getPointPair = (ang, tangentDirection) => [[round10(Math.cos(ang)), round10(Math.sin(ang))], [round10(Math.cos(ang + tangentDirection * Math.PI / 2)), round10(Math.sin(ang + tangentDirection * Math.PI / 2))]];
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
            outerSegments.push({ start, end, startTangent, endTangent, tangentLen });
            actAngle = nextAngle;
        }
        if (actAngle < angle) {
            const [start, startTangent] = getPointPair(actAngle, 1);
            const [end, endTangent] = getPointPair(angle, -1);
            const tangentLen = getTangentLen(angle - actAngle);
            outerSegments.push({ start, end, startTangent, endTangent, tangentLen });
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
export class SvgPathSegmentList {
    original;
    center;
    segments;
    constructor(original, center) {
        this.original = original;
        this.center = center;
        this.segments = [];
    }
    findFromCenter(predicate, direction) {
        const segments = this.segments;
        let actualPart = segments.find(s => s.positionFromOriginal[0] < this.center && s.positionFromOriginal[0] > this.center);
        if (!actualPart) {
            if (direction === -1) {
                actualPart = segments.find(s => s.positionFromOriginal[1] === this.center);
            }
            else {
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
export class SvgPathSegmentImpl {
    static from(definition) {
        if (definition instanceof SvgPathLineSegmentImpl) {
            return definition;
        }
        if (definition.cpFrom) {
            return SvgPathCurveSegmentImpl.from(definition);
        }
        else {
            return SvgPathLineSegmentImpl.from(definition);
        }
    }
}
export class SvgPathLineSegmentImpl extends SvgPathSegmentImpl {
    from;
    to;
    length;
    positionFromOriginal;
    constructor(definition) {
        super();
        Object.assign(this, definition);
    }
    static from(definition) {
        return definition instanceof SvgPathLineSegmentImpl ? definition : new SvgPathLineSegmentImpl(definition);
    }
    svgContinuePathSegment() {
        const [fx, fy] = this.from;
        const [tx, ty] = this.to;
        return `L ${tx} ${ty}`;
    }
    svgSinglePathSegment() {
        const [fx, fy] = this.from;
        return `M ${fx} ${fy} ${this.svgContinuePathSegment()}`;
    }
    getPointOnSegment(position) {
        return SvgPathTools.getPointOnLine(this.from, this.to, position);
    }
    splitPath(position) {
        const splitPoint = SvgPathTools.getPointOnLine(this.from, this.to, position);
        const firstPath = {
            from: [...this.from],
            to: [...splitPoint],
        };
        const secondPath = {
            from: [...splitPoint],
            to: [...this.to],
        };
        return [SvgPathLineSegmentImpl.from(firstPath), SvgPathLineSegmentImpl.from(secondPath)];
    }
    getSegmentLen(maxDistance, maxDepth) {
        return getPontDistance(this.from, this.to);
    }
    splitIntoSegmentsAround(splitCenter, splitCenterOffset, maxLen, lenResolution) {
        const result = new SvgPathSegmentList(this, splitCenter);
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
export class SvgPathCurveSegmentImpl extends SvgPathSegmentImpl {
    from;
    to;
    length;
    positionFromOriginal;
    cpFrom;
    cpTo;
    calculatedPoints;
    constructor(definition) {
        super();
        Object.assign(this, definition);
    }
    clear() {
        this.calculatedPoints = null;
    }
    static from(definition) {
        return definition instanceof SvgPathCurveSegmentImpl ? definition : new SvgPathCurveSegmentImpl(definition);
    }
    svgContinuePathSegment() {
        const [fx, fy] = this.from;
        const [c1x, c1y] = this.cpFrom;
        const [c2x, c2y] = this.cpTo;
        const [tx, ty] = this.to;
        return `C ${c1x} ${c1y} ${c2x} ${c2y} ${tx} ${ty}`;
    }
    svgSinglePathSegment() {
        const [fx, fy] = this.from;
        return `M ${fx} ${fy} ${this.svgContinuePathSegment()}`;
    }
    calculatePointsForPosition(position) {
        if (this.calculatedPoints?.position !== position) {
            this.calculatedPoints = { position };
            this.calculatedPoints.level1p1 = SvgPathTools.getPointOnLine(this.from, this.cpFrom, position);
            this.calculatedPoints.level1p2 = SvgPathTools.getPointOnLine(this.cpFrom, this.cpTo, position);
            this.calculatedPoints.level1p3 = SvgPathTools.getPointOnLine(this.cpTo, this.to, position);
            this.calculatedPoints.level2p1 = SvgPathTools.getPointOnLine(this.calculatedPoints.level1p1, this.calculatedPoints.level1p2, position);
            this.calculatedPoints.level2p2 = SvgPathTools.getPointOnLine(this.calculatedPoints.level1p2, this.calculatedPoints.level1p3, position);
            this.calculatedPoints.level3p1 = SvgPathTools.getPointOnLine(this.calculatedPoints.level2p1, this.calculatedPoints.level2p2, position);
        }
    }
    getPointOnSegment(position) {
        this.calculatePointsForPosition(position);
        return this.calculatedPoints.level3p1;
    }
    splitPath(position) {
        this.calculatePointsForPosition(position);
        const firstPath = {
            from: [...this.from],
            cpFrom: [...this.calculatedPoints.level1p1],
            cpTo: [...this.calculatedPoints.level2p1],
            to: [...this.calculatedPoints.level3p1],
        };
        const secondPath = {
            from: [...this.calculatedPoints.level3p1],
            cpFrom: [...this.calculatedPoints.level2p2],
            cpTo: [...this.calculatedPoints.level1p3],
            to: [...this.to],
        };
        return [SvgPathCurveSegmentImpl.from(firstPath), SvgPathCurveSegmentImpl.from(secondPath)];
    }
    getSegmentLen(maxDistance = 10, maxDepth = 100) {
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
    splitIntoSegmentsAround(splitCenter, splitCenterOffset, maxLen, lenResolution) {
        const result = new SvgPathSegmentList(this, splitCenter);
        result.segments.push(SvgPathCurveSegmentImpl.from({ ...this, positionFromOriginal: [0, 1] }));
        const splitCenterPoint = (splitCenter ?? null) === null ? null : this.getPointOnSegment(splitCenter);
        if (splitCenter && splitCenter < 1) {
            const [s1, s2] = this.splitPath(splitCenter);
            result.segments.splice(0, 1, SvgPathCurveSegmentImpl.from({ ...s1, positionFromOriginal: [0, splitCenter] }), SvgPathCurveSegmentImpl.from({ ...s2, positionFromOriginal: [splitCenter, 1] }));
        }
        const resultAroundSplitCenter = () => {
            if (splitCenterPoint) {
                return result.segments.filter(s => {
                    return (s.positionFromOriginal[0] <= splitCenter && s.positionFromOriginal[1] >= splitCenter)
                        || getPontDistance(s.from, splitCenterPoint) <= splitCenterOffset
                        || getPontDistance(s.to, splitCenterPoint) <= splitCenterOffset;
                });
            }
            else {
                return result.segments;
            }
        };
        let segmentToBig = resultAroundSplitCenter().find(s => getPontDistance(s.from, s.to) > maxLen);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ZnLXBhdGgtdG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBwL3Rvb2xzL3N2Zy1wYXRoLXRvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFzQixFQUFFLEVBQW9CLEVBQVUsRUFBRTtJQUN0RixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN0QixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNwQixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFzQixFQUFFLEVBQW9CLEVBQW9CLEVBQUU7SUFDbkYsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdEIsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEIsTUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNwQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsRUFBb0IsRUFBRSxFQUFvQixFQUFvQixFQUFFO0lBQ2pGLE9BQU8s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QztZQUM3QyxFQUFFLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xKLEVBQUUsQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEosRUFBRSxDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RSxFQUFFLENBQUMsTUFBTSxHQUFHLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsWUFBWSxHQUFHLHVCQUF1QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1NBQzVGO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBTdmdQYXRoQ3VydmVkU2VnbWVudCBleHRlbmRzIFN2Z1BhdGhMaW5lU2VnbWVudCB7XG4gIGNwRnJvbTogW251bWJlciwgbnVtYmVyXTtcbiAgY3BUbzogW251bWJlciwgbnVtYmVyXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdmdQYXRoTGluZVNlZ21lbnQge1xuICBmcm9tOiBbbnVtYmVyLCBudW1iZXJdO1xuICB0bzogW251bWJlciwgbnVtYmVyXTtcbiAgbGVuZ3RoPzogbnVtYmVyO1xuICBwb3NpdGlvbkZyb21PcmlnaW5hbD86IFtudW1iZXIsIG51bWJlcl07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ZnUGF0aCB7XG4gIHNlZ21lbnRzOiBTdmdQYXRoU2VnbWVudEltcGw8YW55PltdO1xufVxuXG5cbmV4cG9ydCBjb25zdCBnZXRQb250RGlzdGFuY2UgPSAoZnJvbTogW251bWJlciwgbnVtYmVyXSwgdG86IFtudW1iZXIsIG51bWJlcl0pOiBudW1iZXIgPT4ge1xuICBjb25zdCBbZngsIGZ5XSA9IGZyb207XG4gIGNvbnN0IFt0eCwgdHldID0gdG87XG4gIGNvbnN0IFtkeCwgZHldID0gW3R4IC0gZngsIHR5IC0gZnldO1xuICByZXR1cm4gTWF0aC5zcXJ0KChkeCAqIGR4KSArIChkeSAqIGR5KSk7XG59O1xuXG5jb25zdCBnZXROb3JtZWQgPSAoZnJvbTogW251bWJlciwgbnVtYmVyXSwgdG86IFtudW1iZXIsIG51bWJlcl0pOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3QgW2Z4LCBmeV0gPSBmcm9tO1xuICBjb25zdCBbdHgsIHR5XSA9IHRvO1xuICBjb25zdCBkID0gZ2V0UG9udERpc3RhbmNlKGZyb20sIHRvKTtcbiAgcmV0dXJuIFsodHggLSBmeCkgLyBkLCAodHkgLSBmeSkgLyBkXTtcbn07XG5cbmNvbnN0IHZlY3RvckFkZCA9ICh2MTogW251bWJlciwgbnVtYmVyXSwgdjI6IFtudW1iZXIsIG51bWJlcl0pOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgcmV0dXJuIFt2MVswXSArIHYyWzBdLCB2MVsxXSArIHYyWzFdXTtcbn07XG5jb25zdCBzY2FsYXJQcm9kID0gKHYxOiBbbnVtYmVyLCBudW1iZXJdLCBmYWN0b3I6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICByZXR1cm4gW3YxWzBdICogZmFjdG9yLCB2MVsxXSAqIGZhY3Rvcl07XG59O1xuXG5jb25zdCBhdmcgPSAoeDE6IG51bWJlciwgeDI6IG51bWJlcikgPT4gKHgxICsgeDIpIC8gMjtcbmNvbnN0IHJvdW5kMTAgPSAobnVtOiBudW1iZXIpID0+IE1hdGgucm91bmQobnVtICogMTAwMDAwMDAwMDApIC8gMTAwMDAwMDAwMDA7XG5cbmNvbnN0IGdldElubmVyQW5nbGUgPSAoY2VudGVyOiBbbnVtYmVyLCBudW1iZXJdLCBzdGFydDogW251bWJlciwgbnVtYmVyXSwgZW5kOiBbbnVtYmVyLCBudW1iZXJdKSA9PiB7XG4gIGNvbnN0IHJhZGl1cyA9IGdldFBvbnREaXN0YW5jZShjZW50ZXIsIHN0YXJ0KTtcbiAgY29uc3QgYmFzZURpcmVjdGlvbiA9IGdldE5vcm1lZChjZW50ZXIsIHN0YXJ0KTtcbiAgY29uc3QgcG9pbnRPbkJhc2UgPSBpbnRlcnNlY3RMaW5lcyhjZW50ZXIsIGJhc2VEaXJlY3Rpb24sIGVuZCwgW2Jhc2VEaXJlY3Rpb25bMV0sIC1iYXNlRGlyZWN0aW9uWzBdXSk7XG4gIGNvbnN0IGxlbkZyb21TdGFydFRvUG9pbnRPbkJhc2UgPSBnZXRQb250RGlzdGFuY2Uoc3RhcnQsIHBvaW50T25CYXNlKTtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmFjb3MoKHJhZGl1cyAtIGxlbkZyb21TdGFydFRvUG9pbnRPbkJhc2UpIC8gcmFkaXVzKTtcbiAgcmV0dXJuIHthbmdsZSwgcmFkaXVzfTtcbn07XG5cbmNvbnN0IGludGVyc2VjdExpbmVzID0gKFA6IFtudW1iZXIsIG51bWJlcl0sIHI6IFtudW1iZXIsIG51bWJlcl0sIFE6IFtudW1iZXIsIG51bWJlcl0sIHM6IFtudW1iZXIsIG51bWJlcl0pOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3QgUFF4ID0gUVswXSAtIFBbMF07XG4gIGNvbnN0IFBReSA9IFFbMV0gLSBQWzFdO1xuICBjb25zdCByeCA9IHJbMF07XG4gIGNvbnN0IHJ5ID0gclsxXTtcbiAgY29uc3Qgcnh0ID0gLXJ5O1xuICBjb25zdCByeXQgPSByeDtcbiAgY29uc3QgcXggPSBQUXggKiByeCArIFBReSAqIHJ5O1xuICBjb25zdCBxeSA9IFBReCAqIHJ4dCArIFBReSAqIHJ5dDtcbiAgY29uc3Qgc3ggPSBzWzBdICogcnggKyBzWzFdICogcnk7XG4gIGNvbnN0IHN5ID0gc1swXSAqIHJ4dCArIHNbMV0gKiByeXQ7XG4gIC8vIGlmIGxpbmVzIGFyZSBpZGVudGljYWwgb3IgZG8gbm90IGNyb3NzLi4uXG4gIGlmIChzeSA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGEgPSBxeCAtIHF5ICogc3ggLyBzeTtcbiAgcmV0dXJuIFtQWzBdICsgYSAqIHJ4LCBQWzFdICsgYSAqIHJ5XTtcbn07XG5cblxuZXhwb3J0IGNsYXNzIFN2Z1BhdGhUb29scyB7XG5cblxuICBwdWJsaWMgc3RhdGljIHN2Z1BhdGgocGF0aDogU3ZnUGF0aCk6IHN0cmluZyB7XG4gICAgY29uc3Qgc3RhcnRTZWdtZW50OiBTdmdQYXRoU2VnbWVudEltcGw8YW55PiA9IHBhdGguc2VnbWVudHNbMF07XG4gICAgY29uc3QgW2Z4LCBmeV0gPSAoc3RhcnRTZWdtZW50IGFzIGFueSkuZnJvbTtcbiAgICBsZXQgcGF0aFN0cmluZyA9IGBNICR7Znh9ICR7Znl9YDtcbiAgICBwYXRoLnNlZ21lbnRzLmZvckVhY2goc2VnbWVudCA9PiB7XG4gICAgICBwYXRoU3RyaW5nID0gYCR7cGF0aFN0cmluZ30gJHtTdmdQYXRoU2VnbWVudEltcGwuZnJvbShzZWdtZW50KS5zdmdDb250aW51ZVBhdGhTZWdtZW50KCl9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gcGF0aFN0cmluZztcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0UG9pbnRPbkxpbmUoZnJvbTogW251bWJlciwgbnVtYmVyXSwgdG86IFtudW1iZXIsIG51bWJlcl0sIHBvc2l0aW9uOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBjb25zdCB2ZWN0b3IgPSBbdG9bMF0gLSBmcm9tWzBdLCB0b1sxXSAtIGZyb21bMV1dO1xuICAgIHJldHVybiBbZnJvbVswXSArIHZlY3RvclswXSAqIHBvc2l0aW9uLCBmcm9tWzFdICsgdmVjdG9yWzFdICogcG9zaXRpb25dO1xuICB9XG5cblxuICBwdWJsaWMgc3RhdGljIGdldERpcmVjdGlvblZlY3RvcihzZWdtZW50OiBTdmdQYXRoQ3VydmVkU2VnbWVudCB8IFN2Z1BhdGhMaW5lU2VnbWVudCwgcG9zaXRpb246IG51bWJlcik6IHsgcG9pbnQ6IFtudW1iZXIsIG51bWJlcl0sIGRpcmVjdGlvbjogW251bWJlciwgbnVtYmVyXSwgbm9ybWFsMTogW251bWJlciwgbnVtYmVyXSwgbm9ybWFsMjogW251bWJlciwgbnVtYmVyXSB9IHtcbiAgICBpZiAoKHNlZ21lbnQgYXMgU3ZnUGF0aEN1cnZlZFNlZ21lbnQpLmNwRnJvbSkge1xuICAgICAgY29uc3QgY3VydmUgPSBzZWdtZW50IGFzIFN2Z1BhdGhDdXJ2ZWRTZWdtZW50O1xuICAgICAgY29uc3QgbGV2ZWwxcDEgPSBTdmdQYXRoVG9vbHMuZ2V0UG9pbnRPbkxpbmUoY3VydmUuZnJvbSwgY3VydmUuY3BGcm9tLCBwb3NpdGlvbik7XG4gICAgICBjb25zdCBsZXZlbDFwMiA9IFN2Z1BhdGhUb29scy5nZXRQb2ludE9uTGluZShjdXJ2ZS5jcEZyb20sIGN1cnZlLmNwVG8sIHBvc2l0aW9uKTtcbiAgICAgIGNvbnN0IGxldmVsMXAzID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKGN1cnZlLmNwVG8sIGN1cnZlLnRvLCBwb3NpdGlvbik7XG5cbiAgICAgIGNvbnN0IGxldmVsMnAxID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKGxldmVsMXAxLCBsZXZlbDFwMiwgcG9zaXRpb24pO1xuICAgICAgY29uc3QgbGV2ZWwycDIgPSBTdmdQYXRoVG9vbHMuZ2V0UG9pbnRPbkxpbmUobGV2ZWwxcDIsIGxldmVsMXAzLCBwb3NpdGlvbik7XG5cbiAgICAgIGNvbnN0IGxldmVsM3AxID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKGxldmVsMnAxLCBsZXZlbDJwMiwgcG9zaXRpb24pO1xuXG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBnZXROb3JtZWQobGV2ZWwycDEsIGxldmVsMnAyKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvaW50OiBsZXZlbDNwMSxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICBub3JtYWwxOiBbZGlyZWN0aW9uWzFdLCAtZGlyZWN0aW9uWzBdXSxcbiAgICAgICAgbm9ybWFsMjogWy1kaXJlY3Rpb25bMV0sIGRpcmVjdGlvblswXV0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb2ludCA9IFN2Z1BhdGhUb29scy5nZXRQb2ludE9uTGluZShzZWdtZW50LmZyb20sIHNlZ21lbnQudG8sIHBvc2l0aW9uKTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGdldE5vcm1lZChzZWdtZW50LmZyb20sIHNlZ21lbnQudG8pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcG9pbnQsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgbm9ybWFsMTogW2RpcmVjdGlvblsxXSwgLWRpcmVjdGlvblswXV0sXG4gICAgICAgIG5vcm1hbDI6IFstZGlyZWN0aW9uWzFdLCBkaXJlY3Rpb25bMF1dLFxuICAgICAgfTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyBhcHBseVJvdW5kQ29ybmVyKHNlZ21lbnRzOiBTdmdQYXRoU2VnbWVudEltcGw8YW55PltdLCBzZWdtZW50MTogU3ZnUGF0aFNlZ21lbnRJbXBsPGFueT4sIHNlZ21lbnQyOiBTdmdQYXRoU2VnbWVudEltcGw8YW55PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcm5lck1vZGlmaWNhdGlvbjogeyByb3VuZDogU3ZnUGF0aFNlZ21lbnRJbXBsPGFueT4sIGN1dFBvc2l0aW9uMTogbnVtYmVyLCBjdXRQb3NpdGlvbjI6IG51bWJlciB9KSB7XG5cbiAgICBjb25zdCBpZHgxID0gc2VnbWVudHMuaW5kZXhPZihzZWdtZW50MSk7XG4gICAgY29uc3QgaWR4MiA9IHNlZ21lbnRzLmluZGV4T2Yoc2VnbWVudDIpO1xuICAgIGNvbnN0IHNwbGl0MSA9IHNlZ21lbnQxLnNwbGl0UGF0aChjb3JuZXJNb2RpZmljYXRpb24uY3V0UG9zaXRpb24xKTtcbiAgICBjb25zdCBzcGxpdDIgPSBzZWdtZW50Mi5zcGxpdFBhdGgoY29ybmVyTW9kaWZpY2F0aW9uLmN1dFBvc2l0aW9uMik7XG4gICAgc2VnbWVudHNbaWR4MV0gPSBzcGxpdDFbMF07XG4gICAgc2VnbWVudHNbaWR4Ml0gPSBzcGxpdDJbMV07XG4gICAgc2VnbWVudHMuc3BsaWNlKGlkeDIsIDAsIGNvcm5lck1vZGlmaWNhdGlvbi5yb3VuZCk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldFJvdW5kQ29ybmVyKHNlZ21lbnQxOiBTdmdQYXRoU2VnbWVudEltcGw8YW55Piwgc2VnbWVudDI6IFN2Z1BhdGhTZWdtZW50SW1wbDxhbnk+LCBkZXNpcmVkQm9yZGVyUmFkaXVzOiBudW1iZXIpIHtcbiAgICBjb25zdCBib3JkZXJSYWRpdXMgPSBNYXRoLm1pbihcbiAgICAgIGRlc2lyZWRCb3JkZXJSYWRpdXMsXG4gICAgICBnZXRQb250RGlzdGFuY2UoKHNlZ21lbnQxIGFzIGFueSBhcyBTdmdQYXRoTGluZVNlZ21lbnQpLmZyb20sIChzZWdtZW50MSBhcyBhbnkgYXMgU3ZnUGF0aExpbmVTZWdtZW50KS50bykgLyAyLFxuICAgICAgZ2V0UG9udERpc3RhbmNlKChzZWdtZW50MiBhcyBhbnkgYXMgU3ZnUGF0aExpbmVTZWdtZW50KS5mcm9tLCAoc2VnbWVudDIgYXMgYW55IGFzIFN2Z1BhdGhMaW5lU2VnbWVudCkudG8pIC8gMixcbiAgICApO1xuXG5cbiAgICBjb25zdCBjdXJ2ZVNlZ21lbnRzMSA9IHNlZ21lbnQxLnNwbGl0SW50b1NlZ21lbnRzQXJvdW5kKDEsIGJvcmRlclJhZGl1cyAqIDIsIDIsIDEpO1xuICAgIGNvbnN0IHNlZ21lbnRUb0N1dDEgPSBjdXJ2ZVNlZ21lbnRzMS5maW5kRnJvbUNlbnRlcigocywgbCkgPT4gbCA+PSBib3JkZXJSYWRpdXMsIC0xKTtcbiAgICBjb25zdCBjdXRQb3NpdGlvbjEgPSBzZWdtZW50VG9DdXQxLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzBdO1xuICAgIGNvbnN0IGRpcmVjdGlvbjEgPSBTdmdQYXRoVG9vbHMuZ2V0RGlyZWN0aW9uVmVjdG9yKHNlZ21lbnRUb0N1dDEsIGN1dFBvc2l0aW9uMSk7XG5cbiAgICBjb25zdCBjdXJ2ZVNlZ21lbnRzMiA9IHNlZ21lbnQyLnNwbGl0SW50b1NlZ21lbnRzQXJvdW5kKDAsIGJvcmRlclJhZGl1cyAqIDIsIDIsIDEpO1xuICAgIGNvbnN0IHNlZ21lbnRUb0N1dDIgPSBjdXJ2ZVNlZ21lbnRzMi5maW5kRnJvbUNlbnRlcigocywgbCkgPT4gbCA+PSBib3JkZXJSYWRpdXMsIDEpO1xuICAgIGNvbnN0IGN1dFBvc2l0aW9uMiA9IHNlZ21lbnRUb0N1dDIucG9zaXRpb25Gcm9tT3JpZ2luYWxbMV07XG4gICAgY29uc3QgZGlyZWN0aW9uMiA9IFN2Z1BhdGhUb29scy5nZXREaXJlY3Rpb25WZWN0b3Ioc2VnbWVudFRvQ3V0MiwgY3V0UG9zaXRpb24yKTtcblxuICAgIGNvbnN0IGNpcmNsZUNlbnRlciA9IGludGVyc2VjdExpbmVzKGRpcmVjdGlvbjEucG9pbnQsIGRpcmVjdGlvbjEubm9ybWFsMSwgZGlyZWN0aW9uMi5wb2ludCwgZGlyZWN0aW9uMi5ub3JtYWwxKTtcblxuXG4gICAgY29uc3Qge2FuZ2xlLCByYWRpdXN9ID0gZ2V0SW5uZXJBbmdsZShjaXJjbGVDZW50ZXIsIGRpcmVjdGlvbjEucG9pbnQsIGRpcmVjdGlvbjIucG9pbnQpO1xuICAgIGNvbnN0IGNpcmNsZVBhcnRzID0gTWF0aC5QSSAqIDIgLyBhbmdsZTtcbiAgICBjb25zdCBjaXJjbGVDb250cm9sUG9pbnREaXN0YW5jZSA9IDQgLyAzICogTWF0aC50YW4oTWF0aC5QSSAvIChjaXJjbGVQYXJ0cyAqIDIpKSAqIHJhZGl1cztcblxuICAgIGNvbnN0IHJvdW5kID0gU3ZnUGF0aFNlZ21lbnRJbXBsLmZyb20oe1xuICAgICAgZnJvbTogZGlyZWN0aW9uMS5wb2ludCxcbiAgICAgIGNwRnJvbTogdmVjdG9yQWRkKGRpcmVjdGlvbjEucG9pbnQsIHNjYWxhclByb2QoZGlyZWN0aW9uMS5kaXJlY3Rpb24sIGNpcmNsZUNvbnRyb2xQb2ludERpc3RhbmNlKSksLy8gIFtkaXJlY3Rpb24xLnBvaW50WzBdICsgZGlyZWN0aW9uMS5kaXJlY3Rpb25bMF0gKiBjaXJjbGVDb250cm9sUG9pbnREaXN0YW5jZSwgZGlyZWN0aW9uMS5wb2ludFsxXSArIGRpcmVjdGlvbjEuZGlyZWN0aW9uWzFdICogY2lyY2xlQ29udHJvbFBvaW50RGlzdGFuY2VdLFxuICAgICAgY3BUbzogdmVjdG9yQWRkKGRpcmVjdGlvbjIucG9pbnQsIHNjYWxhclByb2QoZGlyZWN0aW9uMi5kaXJlY3Rpb24sIC1jaXJjbGVDb250cm9sUG9pbnREaXN0YW5jZSkpLC8vIFtkaXJlY3Rpb24yLnBvaW50WzBdIC0gZGlyZWN0aW9uMi5kaXJlY3Rpb25bMF0gKiBjaXJjbGVDb250cm9sUG9pbnREaXN0YW5jZSwgZGlyZWN0aW9uMi5wb2ludFsxXSAtIGRpcmVjdGlvbjIuZGlyZWN0aW9uWzFdICogY2lyY2xlQ29udHJvbFBvaW50RGlzdGFuY2VdLFxuICAgICAgdG86IGRpcmVjdGlvbjIucG9pbnQsXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge2RpcmVjdGlvbjEsIGRpcmVjdGlvbjIsIGNpcmNsZUNlbnRlciwgcm91bmQsIGN1dFBvc2l0aW9uMSwgY3V0UG9zaXRpb24yfTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0UmluZ1BhcnQoYW5nbGU6IG51bWJlciwgY2VudGVyOiBbbnVtYmVyLCBudW1iZXJdLCBvdXRlclJhZGl1czogbnVtYmVyLCBpbm5lclJhZGl1czogbnVtYmVyLCBib3JkZXJSYWRpdXM6IG51bWJlcik6IHsgc2VnbWVudHM6IFN2Z1BhdGhTZWdtZW50SW1wbDxhbnk+W10sIGFuY2hvclBvaW50czogW251bWJlciwgbnVtYmVyXVtdIH0ge1xuICAgIGNvbnN0IHNlZ21lbnRzOiBTdmdQYXRoU2VnbWVudEltcGw8YW55PiBbXSA9IFtdO1xuICAgIGNvbnN0IGFuY2hvclBvaW50czogW251bWJlciwgbnVtYmVyXVtdID0gW107XG5cbiAgICBjb25zdCBpbm5lckNpcmN1bWZlcmVuY2UgPSBNYXRoLlBJICogMiAqIGlubmVyUmFkaXVzO1xuICAgIGNvbnN0IGJvcmRlckFuZ2xlID0gYm9yZGVyUmFkaXVzIC8gaW5uZXJDaXJjdW1mZXJlbmNlICogTWF0aC5QSSAqIDI7XG5cbiAgICB0eXBlIFNlZ21lbnQgPSB7IHN0YXJ0OiBbbnVtYmVyLCBudW1iZXJdLCBlbmQ6IFtudW1iZXIsIG51bWJlcl0sIHN0YXJ0VGFuZ2VudDogW251bWJlciwgbnVtYmVyXSwgZW5kVGFuZ2VudDogW251bWJlciwgbnVtYmVyXSwgdGFuZ2VudExlbjogbnVtYmVyIH07XG4gICAgY29uc3Qgb3V0ZXJTZWdtZW50czogU2VnbWVudFtdID0gW107XG5cbiAgICBjb25zdCBnZXRQb2ludFBhaXIgPSAoYW5nOiBudW1iZXIsIHRhbmdlbnREaXJlY3Rpb246IG51bWJlcik6IFtbbnVtYmVyLCBudW1iZXJdLCBbbnVtYmVyLCBudW1iZXJdXSA9PiBbW3JvdW5kMTAoTWF0aC5jb3MoYW5nKSksIHJvdW5kMTAoTWF0aC5zaW4oYW5nKSldLCBbcm91bmQxMChNYXRoLmNvcyhhbmcgKyB0YW5nZW50RGlyZWN0aW9uICogTWF0aC5QSSAvIDIpKSwgcm91bmQxMChNYXRoLnNpbihhbmcgKyB0YW5nZW50RGlyZWN0aW9uICogTWF0aC5QSSAvIDIpKV1dO1xuICAgIGNvbnN0IGdldFRhbmdlbnRMZW4gPSAoYW5nKSA9PiB7XG4gICAgICBjb25zdCBzZWdtZW50Q291bnQgPSBNYXRoLlBJICogMiAvIGFuZztcbiAgICAgIHJldHVybiA0IC8gMyAqIE1hdGgudGFuKE1hdGguUEkgLyAoMiAqIHNlZ21lbnRDb3VudCkpO1xuICAgIH07XG5cbiAgICBsZXQgYWN0QW5nbGUgPSAwO1xuICAgIHdoaWxlIChhY3RBbmdsZSA8IGFuZ2xlIC0gTWF0aC5QSSAvIDIpIHtcbiAgICAgIGxldCBuZXh0QW5nbGUgPSBhY3RBbmdsZSArIE1hdGguUEkgLyAyO1xuICAgICAgaWYgKG5leHRBbmdsZSArIGJvcmRlckFuZ2xlID4gYW5nbGUpIHtcbiAgICAgICAgbmV4dEFuZ2xlIC09IE1hdGguUEkgLyA0O1xuICAgICAgfVxuICAgICAgY29uc3QgW3N0YXJ0LCBzdGFydFRhbmdlbnRdID0gZ2V0UG9pbnRQYWlyKGFjdEFuZ2xlLCAxKTtcbiAgICAgIGNvbnN0IFtlbmQsIGVuZFRhbmdlbnRdID0gZ2V0UG9pbnRQYWlyKG5leHRBbmdsZSwgLTEpO1xuICAgICAgY29uc3QgdGFuZ2VudExlbiA9IGdldFRhbmdlbnRMZW4obmV4dEFuZ2xlIC0gYWN0QW5nbGUpO1xuICAgICAgb3V0ZXJTZWdtZW50cy5wdXNoKHtzdGFydCwgZW5kLCBzdGFydFRhbmdlbnQsIGVuZFRhbmdlbnQsIHRhbmdlbnRMZW59KTtcbiAgICAgIGFjdEFuZ2xlID0gbmV4dEFuZ2xlO1xuICAgIH1cbiAgICBpZiAoYWN0QW5nbGUgPCBhbmdsZSkge1xuICAgICAgY29uc3QgW3N0YXJ0LCBzdGFydFRhbmdlbnRdID0gZ2V0UG9pbnRQYWlyKGFjdEFuZ2xlLCAxKTtcbiAgICAgIGNvbnN0IFtlbmQsIGVuZFRhbmdlbnRdID0gZ2V0UG9pbnRQYWlyKGFuZ2xlLCAtMSk7XG4gICAgICBjb25zdCB0YW5nZW50TGVuID0gZ2V0VGFuZ2VudExlbihhbmdsZSAtIGFjdEFuZ2xlKTtcbiAgICAgIG91dGVyU2VnbWVudHMucHVzaCh7c3RhcnQsIGVuZCwgc3RhcnRUYW5nZW50LCBlbmRUYW5nZW50LCB0YW5nZW50TGVufSk7XG4gICAgfVxuXG4gICAgc2VnbWVudHMucHVzaChTdmdQYXRoU2VnbWVudEltcGwuZnJvbSh7XG4gICAgICBmcm9tOiB2ZWN0b3JBZGQoc2NhbGFyUHJvZChvdXRlclNlZ21lbnRzWzBdLnN0YXJ0LCBhdmcob3V0ZXJSYWRpdXMsIGlubmVyUmFkaXVzKSksIGNlbnRlciksXG4gICAgICB0bzogdmVjdG9yQWRkKHNjYWxhclByb2Qob3V0ZXJTZWdtZW50c1swXS5zdGFydCwgb3V0ZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgIH0pKTtcbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBvdXRlclNlZ21lbnRzLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSBvdXRlclNlZ21lbnRzW2lkeF07XG4gICAgICBzZWdtZW50cy5wdXNoKFN2Z1BhdGhTZWdtZW50SW1wbC5mcm9tKHtcbiAgICAgICAgZnJvbTogdmVjdG9yQWRkKHNjYWxhclByb2Qoc2VnbWVudC5zdGFydCwgb3V0ZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgICBjcEZyb206IHZlY3RvckFkZChzY2FsYXJQcm9kKHZlY3RvckFkZChzZWdtZW50LnN0YXJ0LCBzY2FsYXJQcm9kKHNlZ21lbnQuc3RhcnRUYW5nZW50LCBzZWdtZW50LnRhbmdlbnRMZW4pKSwgb3V0ZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgICBjcFRvOiB2ZWN0b3JBZGQoc2NhbGFyUHJvZCh2ZWN0b3JBZGQoc2VnbWVudC5lbmQsIHNjYWxhclByb2Qoc2VnbWVudC5lbmRUYW5nZW50LCBzZWdtZW50LnRhbmdlbnRMZW4pKSwgb3V0ZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgICB0bzogdmVjdG9yQWRkKHNjYWxhclByb2Qoc2VnbWVudC5lbmQsIG91dGVyUmFkaXVzKSwgY2VudGVyKSxcbiAgICAgIH0pKTtcblxuICAgICAgaWYgKGlkeCA9PT0gMCkge1xuICAgICAgICBhbmNob3JQb2ludHMucHVzaCh2ZWN0b3JBZGQoc2NhbGFyUHJvZChzZWdtZW50LnN0YXJ0LCBvdXRlclJhZGl1cyksIGNlbnRlcikpO1xuICAgICAgfVxuICAgICAgYW5jaG9yUG9pbnRzLnB1c2godmVjdG9yQWRkKHNjYWxhclByb2Qoc2VnbWVudC5lbmQsIG91dGVyUmFkaXVzKSwgY2VudGVyKSk7XG4gICAgfVxuICAgIHNlZ21lbnRzLnB1c2goU3ZnUGF0aFNlZ21lbnRJbXBsLmZyb20oe1xuICAgICAgZnJvbTogdmVjdG9yQWRkKHNjYWxhclByb2Qob3V0ZXJTZWdtZW50c1tvdXRlclNlZ21lbnRzLmxlbmd0aCAtIDFdLmVuZCwgb3V0ZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgdG86IHZlY3RvckFkZChzY2FsYXJQcm9kKG91dGVyU2VnbWVudHNbb3V0ZXJTZWdtZW50cy5sZW5ndGggLSAxXS5lbmQsIGlubmVyUmFkaXVzKSwgY2VudGVyKSxcbiAgICB9KSk7XG4gICAgZm9yIChsZXQgaWR4ID0gb3V0ZXJTZWdtZW50cy5sZW5ndGggLSAxOyBpZHggPj0gMDsgaWR4LS0pIHtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSBvdXRlclNlZ21lbnRzW2lkeF07XG4gICAgICBzZWdtZW50cy5wdXNoKFN2Z1BhdGhTZWdtZW50SW1wbC5mcm9tKHtcbiAgICAgICAgZnJvbTogdmVjdG9yQWRkKHNjYWxhclByb2Qoc2VnbWVudC5lbmQsIGlubmVyUmFkaXVzKSwgY2VudGVyKSxcbiAgICAgICAgY3BGcm9tOiB2ZWN0b3JBZGQoc2NhbGFyUHJvZCh2ZWN0b3JBZGQoc2VnbWVudC5lbmQsIHNjYWxhclByb2Qoc2VnbWVudC5lbmRUYW5nZW50LCBzZWdtZW50LnRhbmdlbnRMZW4pKSwgaW5uZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgICBjcFRvOiB2ZWN0b3JBZGQoc2NhbGFyUHJvZCh2ZWN0b3JBZGQoc2VnbWVudC5zdGFydCwgc2NhbGFyUHJvZChzZWdtZW50LnN0YXJ0VGFuZ2VudCwgc2VnbWVudC50YW5nZW50TGVuKSksIGlubmVyUmFkaXVzKSwgY2VudGVyKSxcbiAgICAgICAgdG86IHZlY3RvckFkZChzY2FsYXJQcm9kKHNlZ21lbnQuc3RhcnQsIGlubmVyUmFkaXVzKSwgY2VudGVyKSxcbiAgICAgIH0pKTtcblxuICAgICAgaWYgKGlkeCA9PT0gMCkge1xuICAgICAgICBhbmNob3JQb2ludHMucHVzaCh2ZWN0b3JBZGQoc2NhbGFyUHJvZChzZWdtZW50LnN0YXJ0LCBpbm5lclJhZGl1cyksIGNlbnRlcikpO1xuICAgICAgfVxuICAgICAgYW5jaG9yUG9pbnRzLnB1c2godmVjdG9yQWRkKHNjYWxhclByb2Qoc2VnbWVudC5lbmQsIGlubmVyUmFkaXVzKSwgY2VudGVyKSk7XG4gICAgfVxuICAgIHNlZ21lbnRzLnB1c2goU3ZnUGF0aFNlZ21lbnRJbXBsLmZyb20oe1xuICAgICAgZnJvbTogdmVjdG9yQWRkKHNjYWxhclByb2Qob3V0ZXJTZWdtZW50c1swXS5zdGFydCwgaW5uZXJSYWRpdXMpLCBjZW50ZXIpLFxuICAgICAgdG86IHZlY3RvckFkZChzY2FsYXJQcm9kKG91dGVyU2VnbWVudHNbMF0uc3RhcnQsIGF2ZyhvdXRlclJhZGl1cywgaW5uZXJSYWRpdXMpKSwgY2VudGVyKSxcbiAgICB9KSk7XG5cbiAgICBbMCwgb3V0ZXJTZWdtZW50cy5sZW5ndGggKyAxLCBvdXRlclNlZ21lbnRzLmxlbmd0aCArIDMsIG91dGVyU2VnbWVudHMubGVuZ3RoICogMiArIDRdLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgY29uc3Qgcm91bmRDb3JuZXJSZXN1bHQgPSBTdmdQYXRoVG9vbHMuZ2V0Um91bmRDb3JuZXIoc2VnbWVudHNbaWR4XSwgc2VnbWVudHNbaWR4ICsgMV0sIGJvcmRlclJhZGl1cyk7XG4gICAgICBTdmdQYXRoVG9vbHMuYXBwbHlSb3VuZENvcm5lcihzZWdtZW50cywgc2VnbWVudHNbaWR4XSwgc2VnbWVudHNbaWR4ICsgMV0sIHJvdW5kQ29ybmVyUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzZWdtZW50cywgYW5jaG9yUG9pbnRzLFxuICAgIH07XG4gIH1cblxufVxuXG5leHBvcnQgY2xhc3MgU3ZnUGF0aFNlZ21lbnRMaXN0PFQgZXh0ZW5kcyBTdmdQYXRoU2VnbWVudEltcGw8VD4+IHtcbiAgcHVibGljIHNlZ21lbnRzOiBUW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIG9yaWdpbmFsOiBULCBwdWJsaWMgY2VudGVyOiBudW1iZXIpIHtcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XG4gIH1cblxuICBwdWJsaWMgZmluZEZyb21DZW50ZXIocHJlZGljYXRlOiAoczogVCwgbDogbnVtYmVyKSA9PiBib29sZWFuLCBkaXJlY3Rpb246IDEgfCAtMSkge1xuICAgIGNvbnN0IHNlZ21lbnRzOiAoVCAmIFN2Z1BhdGhMaW5lU2VnbWVudClbXSA9IHRoaXMuc2VnbWVudHMgYXMgYW55O1xuICAgIGxldCBhY3R1YWxQYXJ0ID0gc2VnbWVudHMuZmluZChzID0+IHMucG9zaXRpb25Gcm9tT3JpZ2luYWxbMF0gPCB0aGlzLmNlbnRlciAmJiBzLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzBdID4gdGhpcy5jZW50ZXIpO1xuICAgIGlmICghYWN0dWFsUGFydCkge1xuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgYWN0dWFsUGFydCA9IHNlZ21lbnRzLmZpbmQocyA9PiBzLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzFdID09PSB0aGlzLmNlbnRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3R1YWxQYXJ0ID0gc2VnbWVudHMuZmluZChzID0+IHMucG9zaXRpb25Gcm9tT3JpZ2luYWxbMF0gPT09IHRoaXMuY2VudGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGxlbiA9IDA7XG4gICAgbGV0IGlkeCA9IHRoaXMuc2VnbWVudHMuaW5kZXhPZihhY3R1YWxQYXJ0KTtcbiAgICB3aGlsZSAoYWN0dWFsUGFydCkge1xuICAgICAgbGVuICs9IGFjdHVhbFBhcnQubGVuZ3RoO1xuICAgICAgaWYgKHByZWRpY2F0ZShhY3R1YWxQYXJ0LCBsZW4pKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWR4ICs9IGRpcmVjdGlvbjtcbiAgICAgIGFjdHVhbFBhcnQgPSBzZWdtZW50c1tpZHhdO1xuICAgIH1cbiAgICByZXR1cm4gYWN0dWFsUGFydDtcbiAgfVxufVxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdmdQYXRoU2VnbWVudEltcGw8VCBleHRlbmRzIFN2Z1BhdGhTZWdtZW50SW1wbDxUPj4ge1xuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbShkZWZpbml0aW9uKTogU3ZnUGF0aFNlZ21lbnRJbXBsPGFueT4ge1xuICAgIGlmIChkZWZpbml0aW9uIGluc3RhbmNlb2YgU3ZnUGF0aExpbmVTZWdtZW50SW1wbCkge1xuICAgICAgcmV0dXJuIGRlZmluaXRpb247XG4gICAgfVxuICAgIGlmICgoZGVmaW5pdGlvbiBhcyBTdmdQYXRoQ3VydmVkU2VnbWVudCkuY3BGcm9tKSB7XG4gICAgICByZXR1cm4gU3ZnUGF0aEN1cnZlU2VnbWVudEltcGwuZnJvbShkZWZpbml0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFN2Z1BhdGhMaW5lU2VnbWVudEltcGwuZnJvbShkZWZpbml0aW9uKTtcbiAgICB9XG4gIH1cblxuXG4gIHB1YmxpYyBhYnN0cmFjdCBzdmdDb250aW51ZVBhdGhTZWdtZW50KCk6IHN0cmluZztcblxuICBwdWJsaWMgYWJzdHJhY3Qgc3ZnU2luZ2xlUGF0aFNlZ21lbnQoKTogc3RyaW5nO1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRQb2ludE9uU2VnbWVudChwb3NpdGlvbjogbnVtYmVyKTtcblxuICBwdWJsaWMgYWJzdHJhY3Qgc3BsaXRQYXRoKHBvc2l0aW9uOiBudW1iZXIpOiBbVCwgVF07XG5cbiAgcHVibGljIGFic3RyYWN0IGdldFNlZ21lbnRMZW4obWF4RGlzdGFuY2U/OiBudW1iZXIsIG1heERlcHRoPzogbnVtYmVyKTtcblxuICBwdWJsaWMgYWJzdHJhY3Qgc3BsaXRJbnRvU2VnbWVudHNBcm91bmQoc3BsaXRDZW50ZXI6IG51bWJlciwgc3BsaXRDZW50ZXJPZmZzZXQ6IG51bWJlciwgbWF4TGVuOiBudW1iZXIsIGxlblJlc29sdXRpb246IG51bWJlcik6IFN2Z1BhdGhTZWdtZW50TGlzdDxUPjtcblxufVxuXG5leHBvcnQgY2xhc3MgU3ZnUGF0aExpbmVTZWdtZW50SW1wbCBleHRlbmRzIFN2Z1BhdGhTZWdtZW50SW1wbDxTdmdQYXRoTGluZVNlZ21lbnRJbXBsPiBpbXBsZW1lbnRzIFN2Z1BhdGhMaW5lU2VnbWVudCB7XG5cbiAgcHVibGljIGZyb206IFtudW1iZXIsIG51bWJlcl07XG4gIHB1YmxpYyB0bzogW251bWJlciwgbnVtYmVyXTtcbiAgcHVibGljIGxlbmd0aD86IG51bWJlcjtcbiAgcHVibGljIHBvc2l0aW9uRnJvbU9yaWdpbmFsPzogW251bWJlciwgbnVtYmVyXTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKGRlZmluaXRpb246IFN2Z1BhdGhMaW5lU2VnbWVudCkge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBkZWZpbml0aW9uKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgZnJvbShkZWZpbml0aW9uOiBTdmdQYXRoTGluZVNlZ21lbnQpOiBTdmdQYXRoTGluZVNlZ21lbnRJbXBsIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbiBpbnN0YW5jZW9mIFN2Z1BhdGhMaW5lU2VnbWVudEltcGwgPyBkZWZpbml0aW9uIDogbmV3IFN2Z1BhdGhMaW5lU2VnbWVudEltcGwoZGVmaW5pdGlvbik7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgc3ZnQ29udGludWVQYXRoU2VnbWVudCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IFtmeCwgZnldID0gdGhpcy5mcm9tO1xuICAgIGNvbnN0IFt0eCwgdHldID0gdGhpcy50bztcbiAgICByZXR1cm4gYEwgJHt0eH0gJHt0eX1gO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHN2Z1NpbmdsZVBhdGhTZWdtZW50KCk6IHN0cmluZyB7XG4gICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmZyb207XG4gICAgcmV0dXJuIGBNICR7Znh9ICR7Znl9ICR7dGhpcy5zdmdDb250aW51ZVBhdGhTZWdtZW50KCl9YDtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRQb2ludE9uU2VnbWVudChwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgcmV0dXJuIFN2Z1BhdGhUb29scy5nZXRQb2ludE9uTGluZSh0aGlzLmZyb20sIHRoaXMudG8sIHBvc2l0aW9uKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzcGxpdFBhdGgocG9zaXRpb246IG51bWJlcik6IFtTdmdQYXRoTGluZVNlZ21lbnRJbXBsLCBTdmdQYXRoTGluZVNlZ21lbnRJbXBsXSB7XG4gICAgY29uc3Qgc3BsaXRQb2ludCA9IFN2Z1BhdGhUb29scy5nZXRQb2ludE9uTGluZSh0aGlzLmZyb20sIHRoaXMudG8sIHBvc2l0aW9uKTtcbiAgICBjb25zdCBmaXJzdFBhdGg6IFN2Z1BhdGhMaW5lU2VnbWVudCA9IHtcbiAgICAgIGZyb206IFsuLi50aGlzLmZyb21dLFxuICAgICAgdG86IFsuLi5zcGxpdFBvaW50XSxcbiAgICB9O1xuICAgIGNvbnN0IHNlY29uZFBhdGg6IFN2Z1BhdGhMaW5lU2VnbWVudCA9IHtcbiAgICAgIGZyb206IFsuLi5zcGxpdFBvaW50XSxcbiAgICAgIHRvOiBbLi4udGhpcy50b10sXG4gICAgfTtcbiAgICByZXR1cm4gW1N2Z1BhdGhMaW5lU2VnbWVudEltcGwuZnJvbShmaXJzdFBhdGgpLCBTdmdQYXRoTGluZVNlZ21lbnRJbXBsLmZyb20oc2Vjb25kUGF0aCldO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGdldFNlZ21lbnRMZW4obWF4RGlzdGFuY2U/OiBudW1iZXIsIG1heERlcHRoPzogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGdldFBvbnREaXN0YW5jZSh0aGlzLmZyb20sIHRoaXMudG8pO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNwbGl0SW50b1NlZ21lbnRzQXJvdW5kKHNwbGl0Q2VudGVyOiBudW1iZXIsIHNwbGl0Q2VudGVyT2Zmc2V0OiBudW1iZXIsIG1heExlbjogbnVtYmVyLCBsZW5SZXNvbHV0aW9uOiBudW1iZXIpOiBTdmdQYXRoU2VnbWVudExpc3Q8U3ZnUGF0aExpbmVTZWdtZW50SW1wbD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTdmdQYXRoU2VnbWVudExpc3Q8U3ZnUGF0aExpbmVTZWdtZW50SW1wbD4odGhpcywgc3BsaXRDZW50ZXIpO1xuICAgIGNvbnN0IGxlbiA9IGdldFBvbnREaXN0YW5jZSh0aGlzLmZyb20sIHRoaXMudG8pO1xuICAgIGNvbnN0IHBhcnRzID0gTWF0aC5jZWlsKGxlbiAvIG1heExlbik7XG4gICAgY29uc3QgbGVuWCA9ICh0aGlzLnRvWzBdIC0gdGhpcy5mcm9tWzBdKSAvIHBhcnRzO1xuICAgIGNvbnN0IGxlblkgPSAodGhpcy50b1sxXSAtIHRoaXMuZnJvbVsxXSkgLyBwYXJ0cztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzOyBpKyspIHtcbiAgICAgIHJlc3VsdC5zZWdtZW50cy5wdXNoKFN2Z1BhdGhMaW5lU2VnbWVudEltcGwuZnJvbSh7XG4gICAgICAgIGZyb206IFt0aGlzLmZyb21bMF0gKyBsZW5YICogaSwgdGhpcy5mcm9tWzFdICsgbGVuWSAqIGldLFxuICAgICAgICB0bzogW3RoaXMuZnJvbVswXSArIGxlblggKiAoaSArIDEpLCB0aGlzLmZyb21bMV0gKyBsZW5ZICogKGkgKyAxKV0sXG4gICAgICAgIHBvc2l0aW9uRnJvbU9yaWdpbmFsOiBbaSAvIHBhcnRzLCAoaSArIDEpIC8gcGFydHNdLFxuICAgICAgICBsZW5ndGg6IGxlbiAvIHBhcnRzLFxuICAgICAgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdmdQYXRoQ3VydmVTZWdtZW50SW1wbCBleHRlbmRzIFN2Z1BhdGhTZWdtZW50SW1wbDxTdmdQYXRoQ3VydmVTZWdtZW50SW1wbD4gaW1wbGVtZW50cyBTdmdQYXRoQ3VydmVkU2VnbWVudCB7XG5cbiAgcHVibGljIGZyb206IFtudW1iZXIsIG51bWJlcl07XG4gIHB1YmxpYyB0bzogW251bWJlciwgbnVtYmVyXTtcbiAgcHVibGljIGxlbmd0aD86IG51bWJlcjtcbiAgcHVibGljIHBvc2l0aW9uRnJvbU9yaWdpbmFsPzogW251bWJlciwgbnVtYmVyXTtcbiAgcHVibGljIGNwRnJvbTogW251bWJlciwgbnVtYmVyXTtcbiAgcHVibGljIGNwVG86IFtudW1iZXIsIG51bWJlcl07XG5cbiAgcHVibGljIGNhbGN1bGF0ZWRQb2ludHM6IHtcbiAgICBwb3NpdGlvbjogbnVtYmVyLFxuICAgIGxldmVsMXAxOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIGxldmVsMXAyOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIGxldmVsMXAzOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIGxldmVsMnAxOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIGxldmVsMnAyOiBbbnVtYmVyLCBudW1iZXJdLFxuICAgIGxldmVsM3AxOiBbbnVtYmVyLCBudW1iZXJdLFxuICB9O1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoZGVmaW5pdGlvbjogU3ZnUGF0aEN1cnZlZFNlZ21lbnQpIHtcbiAgICBzdXBlcigpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgZGVmaW5pdGlvbik7XG4gIH1cblxuICBwdWJsaWMgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkUG9pbnRzID0gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgZnJvbShkZWZpbml0aW9uOiBTdmdQYXRoQ3VydmVkU2VnbWVudCk6IFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbiBpbnN0YW5jZW9mIFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsID8gZGVmaW5pdGlvbiA6IG5ldyBTdmdQYXRoQ3VydmVTZWdtZW50SW1wbChkZWZpbml0aW9uKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzdmdDb250aW51ZVBhdGhTZWdtZW50KCk6IHN0cmluZyB7XG4gICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmZyb207XG4gICAgY29uc3QgW2MxeCwgYzF5XSA9IHRoaXMuY3BGcm9tO1xuICAgIGNvbnN0IFtjMngsIGMyeV0gPSB0aGlzLmNwVG87XG4gICAgY29uc3QgW3R4LCB0eV0gPSB0aGlzLnRvO1xuICAgIHJldHVybiBgQyAke2MxeH0gJHtjMXl9ICR7YzJ4fSAke2MyeX0gJHt0eH0gJHt0eX1gO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHN2Z1NpbmdsZVBhdGhTZWdtZW50KCk6IHN0cmluZyB7XG4gICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmZyb207XG4gICAgcmV0dXJuIGBNICR7Znh9ICR7Znl9ICR7dGhpcy5zdmdDb250aW51ZVBhdGhTZWdtZW50KCl9YDtcbiAgfVxuXG4gIHByaXZhdGUgY2FsY3VsYXRlUG9pbnRzRm9yUG9zaXRpb24ocG9zaXRpb246IG51bWJlcikge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWRQb2ludHM/LnBvc2l0aW9uICE9PSBwb3NpdGlvbikge1xuICAgICAgdGhpcy5jYWxjdWxhdGVkUG9pbnRzID0ge3Bvc2l0aW9ufSBhcyBhbnk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWRQb2ludHMubGV2ZWwxcDEgPSBTdmdQYXRoVG9vbHMuZ2V0UG9pbnRPbkxpbmUodGhpcy5mcm9tLCB0aGlzLmNwRnJvbSwgcG9zaXRpb24pO1xuICAgICAgdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMXAyID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKHRoaXMuY3BGcm9tLCB0aGlzLmNwVG8sIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDFwMyA9IFN2Z1BhdGhUb29scy5nZXRQb2ludE9uTGluZSh0aGlzLmNwVG8sIHRoaXMudG8sIHBvc2l0aW9uKTtcblxuICAgICAgdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMnAxID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKHRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDFwMSwgdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMXAyLCBwb3NpdGlvbik7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWRQb2ludHMubGV2ZWwycDIgPSBTdmdQYXRoVG9vbHMuZ2V0UG9pbnRPbkxpbmUodGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMXAyLCB0aGlzLmNhbGN1bGF0ZWRQb2ludHMubGV2ZWwxcDMsIHBvc2l0aW9uKTtcblxuICAgICAgdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsM3AxID0gU3ZnUGF0aFRvb2xzLmdldFBvaW50T25MaW5lKHRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDJwMSwgdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMnAyLCBwb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGdldFBvaW50T25TZWdtZW50KHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZVBvaW50c0ZvclBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsM3AxO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNwbGl0UGF0aChwb3NpdGlvbjogbnVtYmVyKTogW1N2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsLCBTdmdQYXRoQ3VydmVTZWdtZW50SW1wbF0ge1xuICAgIHRoaXMuY2FsY3VsYXRlUG9pbnRzRm9yUG9zaXRpb24ocG9zaXRpb24pO1xuICAgIGNvbnN0IGZpcnN0UGF0aDogU3ZnUGF0aEN1cnZlZFNlZ21lbnQgPSB7XG4gICAgICBmcm9tOiBbLi4udGhpcy5mcm9tXSxcbiAgICAgIGNwRnJvbTogWy4uLnRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDFwMV0sXG4gICAgICBjcFRvOiBbLi4udGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsMnAxXSxcbiAgICAgIHRvOiBbLi4udGhpcy5jYWxjdWxhdGVkUG9pbnRzLmxldmVsM3AxXSxcbiAgICB9O1xuICAgIGNvbnN0IHNlY29uZFBhdGg6IFN2Z1BhdGhDdXJ2ZWRTZWdtZW50ID0ge1xuICAgICAgZnJvbTogWy4uLnRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDNwMV0sXG4gICAgICBjcEZyb206IFsuLi50aGlzLmNhbGN1bGF0ZWRQb2ludHMubGV2ZWwycDJdLFxuICAgICAgY3BUbzogWy4uLnRoaXMuY2FsY3VsYXRlZFBvaW50cy5sZXZlbDFwM10sXG4gICAgICB0bzogWy4uLnRoaXMudG9dLFxuICAgIH07XG4gICAgcmV0dXJuIFtTdmdQYXRoQ3VydmVTZWdtZW50SW1wbC5mcm9tKGZpcnN0UGF0aCksIFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsLmZyb20oc2Vjb25kUGF0aCldO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGdldFNlZ21lbnRMZW4obWF4RGlzdGFuY2U6IG51bWJlciA9IDEwLCBtYXhEZXB0aDogbnVtYmVyID0gMTAwKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgZDEgPSBnZXRQb250RGlzdGFuY2UodGhpcy5mcm9tLCB0aGlzLmNwRnJvbSk7XG4gICAgY29uc3QgZDIgPSBnZXRQb250RGlzdGFuY2UodGhpcy50bywgdGhpcy5jcFRvKTtcbiAgICBjb25zdCBkMyA9IGdldFBvbnREaXN0YW5jZSh0aGlzLmZyb20sIHRoaXMudG8pO1xuICAgIGlmIChNYXRoLm1heChkMSwgZDIsIGQzKSA8PSBtYXhEaXN0YW5jZSB8fCBtYXhEZXB0aCA8PSAwKSB7XG4gICAgICByZXR1cm4gZ2V0UG9udERpc3RhbmNlKHRoaXMuZnJvbSwgdGhpcy50byk7XG4gICAgfVxuICAgIGNvbnN0IFtzdWJTZWdtZW50MSwgc3ViU2VnbWVudDJdID0gdGhpcy5zcGxpdFBhdGgoMC41KTtcbiAgICByZXR1cm4gc3ViU2VnbWVudDEuZ2V0U2VnbWVudExlbihtYXhEaXN0YW5jZSwgbWF4RGVwdGggLSAxKVxuICAgICAgKyBzdWJTZWdtZW50Mi5nZXRTZWdtZW50TGVuKG1heERpc3RhbmNlLCBtYXhEZXB0aCAtIDEpO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNwbGl0SW50b1NlZ21lbnRzQXJvdW5kKHNwbGl0Q2VudGVyOiBudW1iZXIsIHNwbGl0Q2VudGVyT2Zmc2V0OiBudW1iZXIsIG1heExlbjogbnVtYmVyLCBsZW5SZXNvbHV0aW9uOiBudW1iZXIpOiBTdmdQYXRoU2VnbWVudExpc3Q8U3ZnUGF0aEN1cnZlU2VnbWVudEltcGw+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgU3ZnUGF0aFNlZ21lbnRMaXN0PFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsPih0aGlzLCBzcGxpdENlbnRlcik7XG4gICAgcmVzdWx0LnNlZ21lbnRzLnB1c2goU3ZnUGF0aEN1cnZlU2VnbWVudEltcGwuZnJvbSh7Li4udGhpcywgcG9zaXRpb25Gcm9tT3JpZ2luYWw6IFswLCAxXX0pKTtcbiAgICBjb25zdCBzcGxpdENlbnRlclBvaW50ID0gKHNwbGl0Q2VudGVyID8/IG51bGwpID09PSBudWxsID8gbnVsbCA6IHRoaXMuZ2V0UG9pbnRPblNlZ21lbnQoc3BsaXRDZW50ZXIpO1xuICAgIGlmIChzcGxpdENlbnRlciAmJiBzcGxpdENlbnRlciA8IDEpIHtcbiAgICAgIGNvbnN0IFtzMSwgczJdID0gdGhpcy5zcGxpdFBhdGgoc3BsaXRDZW50ZXIpO1xuICAgICAgcmVzdWx0LnNlZ21lbnRzLnNwbGljZSgwLCAxLCBTdmdQYXRoQ3VydmVTZWdtZW50SW1wbC5mcm9tKHsuLi5zMSwgcG9zaXRpb25Gcm9tT3JpZ2luYWw6IFswLCBzcGxpdENlbnRlcl19KSwgU3ZnUGF0aEN1cnZlU2VnbWVudEltcGwuZnJvbSh7Li4uczIsIHBvc2l0aW9uRnJvbU9yaWdpbmFsOiBbc3BsaXRDZW50ZXIsIDFdfSkpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdEFyb3VuZFNwbGl0Q2VudGVyID0gKCkgPT4ge1xuICAgICAgaWYgKHNwbGl0Q2VudGVyUG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5zZWdtZW50cy5maWx0ZXIocyA9PiB7XG4gICAgICAgICAgcmV0dXJuIChzLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzBdIDw9IHNwbGl0Q2VudGVyICYmIHMucG9zaXRpb25Gcm9tT3JpZ2luYWxbMV0gPj0gc3BsaXRDZW50ZXIpXG4gICAgICAgICAgICB8fCBnZXRQb250RGlzdGFuY2Uocy5mcm9tLCBzcGxpdENlbnRlclBvaW50KSA8PSBzcGxpdENlbnRlck9mZnNldFxuICAgICAgICAgICAgfHwgZ2V0UG9udERpc3RhbmNlKHMudG8sIHNwbGl0Q2VudGVyUG9pbnQpIDw9IHNwbGl0Q2VudGVyT2Zmc2V0O1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuc2VnbWVudHM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBzZWdtZW50VG9CaWc6IFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsID0gcmVzdWx0QXJvdW5kU3BsaXRDZW50ZXIoKS5maW5kKHMgPT4gZ2V0UG9udERpc3RhbmNlKHMuZnJvbSwgcy50bykgPiBtYXhMZW4pO1xuICAgIHdoaWxlIChzZWdtZW50VG9CaWcpIHtcbiAgICAgIGNvbnN0IFtzMSwgczJdID0gc2VnbWVudFRvQmlnLnNwbGl0UGF0aCgwLjUpO1xuICAgICAgczEucG9zaXRpb25Gcm9tT3JpZ2luYWwgPSBbc2VnbWVudFRvQmlnLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzBdLCBhdmcoc2VnbWVudFRvQmlnLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzBdLCBzZWdtZW50VG9CaWcucG9zaXRpb25Gcm9tT3JpZ2luYWxbMV0pXTtcbiAgICAgIHMyLnBvc2l0aW9uRnJvbU9yaWdpbmFsID0gW2F2ZyhzZWdtZW50VG9CaWcucG9zaXRpb25Gcm9tT3JpZ2luYWxbMF0sIHNlZ21lbnRUb0JpZy5wb3NpdGlvbkZyb21PcmlnaW5hbFsxXSksIHNlZ21lbnRUb0JpZy5wb3NpdGlvbkZyb21PcmlnaW5hbFsxXV07XG4gICAgICByZXN1bHQuc2VnbWVudHMuc3BsaWNlKHJlc3VsdC5zZWdtZW50cy5pbmRleE9mKHNlZ21lbnRUb0JpZyksIDEsIHMxLCBzMik7XG4gICAgICBzZWdtZW50VG9CaWcgPSByZXN1bHRBcm91bmRTcGxpdENlbnRlcigpLmZpbmQocyA9PiBnZXRQb250RGlzdGFuY2Uocy5mcm9tLCBzLnRvKSA+IG1heExlbik7XG4gICAgfVxuICAgIHJlc3VsdC5zZWdtZW50cy5mb3JFYWNoKHMgPT4gcy5sZW5ndGggPSBTdmdQYXRoQ3VydmVTZWdtZW50SW1wbC5mcm9tKHMpLmdldFNlZ21lbnRMZW4obGVuUmVzb2x1dGlvbiwgMTApKTtcbiAgICBzZWdtZW50VG9CaWcgPSByZXN1bHRBcm91bmRTcGxpdENlbnRlcigpLmZpbmQocyA9PiBzLmxlbmd0aCA+IG1heExlbik7XG4gICAgd2hpbGUgKHNlZ21lbnRUb0JpZykge1xuICAgICAgY29uc3QgW3MxLCBzMl0gPSBzZWdtZW50VG9CaWcuc3BsaXRQYXRoKDAuNSk7XG4gICAgICBzMS5wb3NpdGlvbkZyb21PcmlnaW5hbCA9IFtzZWdtZW50VG9CaWcucG9zaXRpb25Gcm9tT3JpZ2luYWxbMF0sIGF2ZyhzZWdtZW50VG9CaWcucG9zaXRpb25Gcm9tT3JpZ2luYWxbMF0sIHNlZ21lbnRUb0JpZy5wb3NpdGlvbkZyb21PcmlnaW5hbFsxXSldO1xuICAgICAgczIucG9zaXRpb25Gcm9tT3JpZ2luYWwgPSBbYXZnKHNlZ21lbnRUb0JpZy5wb3NpdGlvbkZyb21PcmlnaW5hbFswXSwgc2VnbWVudFRvQmlnLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzFdKSwgc2VnbWVudFRvQmlnLnBvc2l0aW9uRnJvbU9yaWdpbmFsWzFdXTtcbiAgICAgIHMxLmxlbmd0aCA9IFN2Z1BhdGhDdXJ2ZVNlZ21lbnRJbXBsLmZyb20oczEpLmdldFNlZ21lbnRMZW4obGVuUmVzb2x1dGlvbiwgMTApO1xuICAgICAgczIubGVuZ3RoID0gU3ZnUGF0aEN1cnZlU2VnbWVudEltcGwuZnJvbShzMikuZ2V0U2VnbWVudExlbihsZW5SZXNvbHV0aW9uLCAxMCk7XG4gICAgICByZXN1bHQuc2VnbWVudHMuc3BsaWNlKHJlc3VsdC5zZWdtZW50cy5pbmRleE9mKHNlZ21lbnRUb0JpZyksIDEsIHMxLCBzMik7XG4gICAgICBzZWdtZW50VG9CaWcgPSByZXN1bHRBcm91bmRTcGxpdENlbnRlcigpLmZpbmQocyA9PiBnZXRQb250RGlzdGFuY2Uocy5mcm9tLCBzLnRvKSA+IG1heExlbik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuIl19