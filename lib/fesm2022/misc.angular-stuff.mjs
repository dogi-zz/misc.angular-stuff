import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { Component, Input, ViewChild, NgModule, EventEmitter, Output } from '@angular/core';

const getPontDistance = (from, to) => {
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
class SvgPathTools {
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
class SvgPathSegmentList {
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
class SvgPathSegmentImpl {
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
class SvgPathLineSegmentImpl extends SvgPathSegmentImpl {
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
class SvgPathCurveSegmentImpl extends SvgPathSegmentImpl {
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

class InfoPanelComponent {
    container;
    panel;
    margin = 0;
    animate = 0;
    anchor;
    direction;
    sticky;
    stickyVisible;
    style;
    fullSize;
    fullMargin;
    actualPosition;
    isInitialised = false;
    animationState = null;
    animationTimeout = null;
    constructor() {
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        this.isInitialised = true;
        this.initContainer();
    }
    ngOnChanges(changes) {
        if (changes.container) {
            this.initContainer();
        }
        if (changes.stickyVisible && this.isInitialised) {
            if (this.sticky) {
                this.initAnimation(false);
            }
        }
    }
    ngOnDestroy() {
        this.stopAnimation();
    }
    initContainer() {
        if (this.container && this.panel?.nativeElement) {
            this.container.style.position = 'relative';
            this.container.style.overflow = 'hidden';
            this.panel.nativeElement.style.position = 'absolute';
            this.panel.nativeElement.style.display = 'inline-block';
            this.panel.nativeElement.style.top = '';
            this.panel.nativeElement.style.bottom = '';
            this.panel.nativeElement.style.left = '';
            this.panel.nativeElement.style.right = '';
            if (!this.actualPosition) {
                if (this.direction === 'horizontal') {
                    if (this.anchor === 'right') {
                        this.actualPosition = 'right';
                    }
                    else {
                        this.actualPosition = 'left';
                    }
                }
                else {
                    if (this.anchor === 'top') {
                        this.actualPosition = 'top';
                    }
                    else {
                        this.actualPosition = 'bottom';
                    }
                }
            }
            this.drawUpdate();
            if (!this.sticky) {
                this.container.addEventListener('mousemove', (event) => {
                    const gapPointTop = this.container.getBoundingClientRect().top + this.panel.nativeElement.getBoundingClientRect().height + this.margin * 2;
                    const gapPointBottom = this.container.getBoundingClientRect().bottom - this.panel.nativeElement.getBoundingClientRect().height - this.margin * 2;
                    const gapPointLeft = this.container.getBoundingClientRect().left + this.panel.nativeElement.getBoundingClientRect().width + this.margin * 2;
                    const gapPointRight = this.container.getBoundingClientRect().right - this.panel.nativeElement.getBoundingClientRect().width - this.margin * 2;
                    if (this.direction === 'horizontal') {
                        if (this.anchor === 'left') {
                            if (event.clientX < gapPointLeft) {
                                this.placeTo('right');
                            }
                            else {
                                this.placeTo('left');
                            }
                        }
                        else if (this.anchor === 'right') {
                            if (event.clientX > gapPointRight) {
                                this.placeTo('left');
                            }
                            else {
                                this.placeTo('right');
                            }
                        }
                        else {
                            if (this.actualPosition === 'left' && event.clientX < gapPointLeft) {
                                this.placeTo('right');
                            }
                            else if (this.actualPosition === 'right' && event.clientX > gapPointRight) {
                                this.placeTo('left');
                            }
                        }
                    }
                    else {
                        if (this.anchor === 'top') {
                            if (event.clientY < gapPointTop) {
                                this.placeTo('bottom');
                            }
                            else {
                                this.placeTo('top');
                            }
                        }
                        else if (this.anchor === 'bottom') {
                            if (event.clientY > gapPointBottom) {
                                this.placeTo('top');
                            }
                            else {
                                this.placeTo('bottom');
                            }
                        }
                        else {
                            if (this.actualPosition === 'top' && event.clientY < gapPointTop) {
                                this.placeTo('bottom');
                            }
                            else if (this.actualPosition === 'bottom' && event.clientY > gapPointBottom) {
                                this.placeTo('top');
                            }
                        }
                    }
                });
                this.container.addEventListener('mouseleave', (event) => {
                    if (this.anchor) {
                        this.placeTo(this.anchor);
                    }
                });
            }
            const resize = new ResizeObserver(() => {
                this.checkPanelSize();
            });
            resize.observe(this.container);
            resize.observe(this.panel.nativeElement);
            this.checkPanelSize();
        }
    }
    checkPanelSize() {
        if (this.direction === 'horizontal') {
            const containerHeight = this.container.getBoundingClientRect().height;
            const height = this.panel.nativeElement.getBoundingClientRect().height;
            if (this.fullSize) {
                this.panel.nativeElement.style.top = `${this.fullMargin || 0}px`;
                this.panel.nativeElement.style.bottom = `${this.fullMargin || 0}px`;
            }
            else {
                this.panel.nativeElement.style.top = `${(containerHeight - height) / 2}px`;
            }
        }
        else {
            const containerWidth = this.container.getBoundingClientRect().width;
            const width = this.panel.nativeElement.getBoundingClientRect().width;
            if (this.fullSize) {
                this.panel.nativeElement.style.left = `${this.fullMargin || 0}px`;
                this.panel.nativeElement.style.right = `${this.fullMargin || 0}px`;
            }
            else {
                this.panel.nativeElement.style.left = `${(containerWidth - width) / 2}px`;
            }
        }
        this.drawUpdate();
    }
    placeTo(position) {
        if (this.actualPosition === position) {
            return;
        }
        if (this.animate) {
            this.initAnimation(!this.sticky);
        }
        this.actualPosition = position;
        this.drawUpdate();
    }
    initAnimation(withClone) {
        clearTimeout(this.animationTimeout);
        if (this.animationState) {
            this.animationState.targetTime = new Date().getTime() + (this.animate * this.animationState.animationState);
            this.drawUpdate();
            this.continueAnimation();
        }
        else {
            this.animationState = {
                cloneElement: withClone ? this.panel.nativeElement.cloneNode(true) : null,
                animationState: 0,
                targetTime: new Date().getTime() + this.animate,
            };
            if (this.animationState.cloneElement) {
                this.panel.nativeElement.parentElement.appendChild(this.animationState.cloneElement);
            }
            this.continueAnimation();
        }
    }
    continueAnimation() {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(() => {
            this.drawUpdate();
            if (this.animationState.animationState >= 1) {
                this.stopAnimation();
            }
            else {
                this.continueAnimation();
            }
        }, 20);
    }
    stopAnimation() {
        clearTimeout(this.animationTimeout);
        if (this.animationState?.cloneElement) {
            this.animationState.cloneElement.remove();
        }
        this.animationState = null;
        this.drawUpdate();
    }
    drawUpdate() {
        if (this.animationState) {
            this.animationState.animationState = 1 - (this.animationState.targetTime - new Date().getTime()) / this.animate;
        }
        const animationStateSize = this.direction === 'horizontal' ? this.panel.nativeElement.getBoundingClientRect().width : this.panel.nativeElement.getBoundingClientRect().height;
        const animationStateDistance = animationStateSize + this.margin;
        const animationStateOffsetForClone = this.animationState ? this.animationState.animationState * animationStateDistance : animationStateDistance;
        const animationStateOffsetForPanel = this.animationState ? (1 - this.animationState.animationState) * animationStateDistance : 0;
        const draw = (selfKey, otherKey) => {
            if (this.animationState?.cloneElement) {
                this.animationState.cloneElement.style[selfKey] = '';
                this.animationState.cloneElement.style[otherKey] = `${this.margin - animationStateOffsetForClone}px`;
            }
            if (this.sticky) {
                if (this.stickyVisible) {
                    this.panel.nativeElement.style[otherKey] = '';
                    this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForPanel}px`;
                }
                else {
                    this.panel.nativeElement.style[otherKey] = '';
                    this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForClone}px`;
                }
            }
            else {
                this.panel.nativeElement.style[otherKey] = '';
                this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForPanel}px`;
            }
        };
        if (this.actualPosition === 'top') {
            draw('top', 'bottom');
        }
        if (this.actualPosition === 'bottom') {
            draw('bottom', 'top');
        }
        if (this.actualPosition === 'left') {
            draw('left', 'right');
        }
        if (this.actualPosition === 'right') {
            draw('right', 'left');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: InfoPanelComponent, selector: "info-panel", inputs: { container: "container", margin: "margin", animate: "animate", anchor: "anchor", direction: "direction", sticky: "sticky", stickyVisible: "stickyVisible", style: "style", fullSize: "fullSize", fullMargin: "fullMargin" }, viewQueries: [{ propertyName: "panel", first: true, predicate: ["panel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="info-panel" #panel [ngStyle]="style">
      <ng-content></ng-content>
    </div>`, isInline: true, styles: [".info-panel{box-shadow:#00000026 1.95px 1.95px 2.6px}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'info-panel', template: `
    <div class="info-panel" #panel [ngStyle]="style">
      <ng-content></ng-content>
    </div>`, styles: [".info-panel{box-shadow:#00000026 1.95px 1.95px 2.6px}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { container: [{
                type: Input
            }], panel: [{
                type: ViewChild,
                args: ['panel']
            }], margin: [{
                type: Input
            }], animate: [{
                type: Input
            }], anchor: [{
                type: Input
            }], direction: [{
                type: Input
            }], sticky: [{
                type: Input
            }], stickyVisible: [{
                type: Input
            }], style: [{
                type: Input
            }], fullSize: [{
                type: Input
            }], fullMargin: [{
                type: Input
            }] } });

class InfoPanelModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelModule, declarations: [InfoPanelComponent], imports: [CommonModule], exports: [InfoPanelComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelModule, imports: [CommonModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                    ],
                    declarations: [InfoPanelComponent],
                    exports: [InfoPanelComponent],
                }]
        }] });

const barWidth = 6;
class SplitBarComponent {
    container;
    bar;
    positionLeft;
    positionRight;
    outsideIntervalTime = 200;
    stickVisibility = false;
    newPosition = new EventEmitter();
    outsideRight = new EventEmitter();
    outsideLeft = new EventEmitter();
    exitRight = new EventEmitter();
    exitLeft = new EventEmitter();
    moveEnd = new EventEmitter();
    constructor() {
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        this.initContainer();
        this.initBarDrag();
    }
    ngOnChanges(changes) {
        if (changes.container) {
            this.initContainer();
        }
        if (changes.positionLeft || changes.positionRight) {
            this.checkPosition();
        }
    }
    initContainer() {
        if (this.container && this.bar?.nativeElement) {
            if (!['relative', 'absolute', 'fixed'].includes(this.container.style.position)) {
                this.container.style.position = 'relative';
            }
            this.bar.nativeElement.style.position = 'absolute';
            this.bar.nativeElement.style.pointerEvents = 'initial';
            this.bar.nativeElement.style.top = '0';
            this.bar.nativeElement.style.bottom = '0';
            this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '0';
            this.checkPosition();
        }
    }
    checkPosition() {
        if (this.container && this.bar?.nativeElement) {
            this.bar.nativeElement.style.left = '';
            this.bar.nativeElement.style.right = '';
            this.bar.nativeElement.style.display = 'none';
            if (typeof this.positionLeft === 'number') {
                this.bar.nativeElement.style.left = (this.positionLeft - barWidth / 3) + 'px';
                this.bar.nativeElement.style.display = '';
            }
            if (typeof this.positionRight === 'number') {
                this.bar.nativeElement.style.right = (this.positionRight - barWidth / 3) + 'px';
                this.bar.nativeElement.style.display = '';
            }
        }
    }
    mouseEnter() {
        this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '1';
    }
    mouseLeave() {
        this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '0';
    }
    initBarDrag() {
        const bar = this.bar.nativeElement;
        const container = this.container;
        let startPosition;
        let position;
        let outsideRightInterval;
        let outsideLeftInterval;
        bar.draggable = true;
        bar.ondragstart = (event) => {
            startPosition = [event.clientX, event.clientY];
            if (typeof this.positionLeft === 'number') {
                position = this.positionLeft;
            }
            if (typeof this.positionRight === 'number') {
                position = container.getBoundingClientRect().width - this.positionRight;
            }
            const crt = bar.cloneNode(false);
            crt.style.display = 'none';
            event.dataTransfer.setDragImage(crt, 0, 0);
        };
        bar.ondrag = (event) => {
            if (typeof position !== 'number') {
                return;
            }
            const actualPosition = [event.clientX, event.clientY];
            if (event.clientX && event.clientY) {
                const dragOffset = actualPosition[0] - startPosition[0];
                const containerWidth = container.getBoundingClientRect().width;
                const right = (containerWidth - position) - dragOffset;
                const left = position + dragOffset;
                if (right >= 0 && left >= 0) {
                    this.newPosition.emit({ left, right });
                }
                if (left > 0) {
                    if (!outsideRightInterval) {
                        this.exitRight.emit();
                        outsideRightInterval = setInterval(() => this.outsideRight.emit(), this.outsideIntervalTime);
                    }
                }
                else {
                    clearInterval(outsideRightInterval);
                    outsideRightInterval = null;
                }
                if (left < 0) {
                    if (!outsideLeftInterval) {
                        this.exitLeft.emit();
                        outsideLeftInterval = setInterval(() => this.outsideLeft.emit(), this.outsideIntervalTime);
                    }
                }
                else {
                    clearInterval(outsideLeftInterval);
                    outsideLeftInterval = null;
                }
            }
        };
        bar.ondragend = (event) => {
            clearInterval(outsideRightInterval);
            clearInterval(outsideLeftInterval);
            event.preventDefault();
            event.stopImmediatePropagation();
            this.checkPosition();
            this.moveEnd.emit();
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: SplitBarComponent, selector: "split-bar", inputs: { container: "container", positionLeft: "positionLeft", positionRight: "positionRight", outsideIntervalTime: "outsideIntervalTime", stickVisibility: "stickVisibility" }, outputs: { newPosition: "newPosition", outsideRight: "outsideRight", outsideLeft: "outsideLeft", exitRight: "exitRight", exitLeft: "exitLeft", moveEnd: "moveEnd" }, viewQueries: [{ propertyName: "bar", first: true, predicate: ["bar"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="split-bar" #bar
         (mouseenter)="mouseEnter()"
         (mouseleave)="mouseLeave()"
    ></div>`, isInline: true, styles: [".split-bar{width:6px;background:linear-gradient(90deg,rgb(200,200,200) 0%,rgb(255,255,255) 35%,rgb(200,200,200) 100%);cursor:col-resize}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'split-bar', template: `
    <div class="split-bar" #bar
         (mouseenter)="mouseEnter()"
         (mouseleave)="mouseLeave()"
    ></div>`, styles: [".split-bar{width:6px;background:linear-gradient(90deg,rgb(200,200,200) 0%,rgb(255,255,255) 35%,rgb(200,200,200) 100%);cursor:col-resize}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { container: [{
                type: Input
            }], bar: [{
                type: ViewChild,
                args: ['bar']
            }], positionLeft: [{
                type: Input
            }], positionRight: [{
                type: Input
            }], outsideIntervalTime: [{
                type: Input
            }], stickVisibility: [{
                type: Input
            }], newPosition: [{
                type: Output
            }], outsideRight: [{
                type: Output
            }], outsideLeft: [{
                type: Output
            }], exitRight: [{
                type: Output
            }], exitLeft: [{
                type: Output
            }], moveEnd: [{
                type: Output
            }] } });

class SplitBarModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.7", ngImport: i0, type: SplitBarModule, declarations: [SplitBarComponent], imports: [CommonModule], exports: [SplitBarComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarModule, imports: [CommonModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                    ],
                    declarations: [SplitBarComponent],
                    exports: [SplitBarComponent],
                }]
        }] });

class BarAndPanelShowcaseComponent {
    width = 120;
    left = 20;
    textOutside;
    stickyPanelVisible = true;
    constructor() {
    }
    ngOnInit() {
    }
    onDragRight(newPosition) {
        const newWidth = newPosition.left - this.left;
        if (newWidth > 10 && (newWidth + this.left) < 490) {
            this.width = newWidth;
        }
        this.textOutside = null;
    }
    onDragLeft(newPosition) {
        const newLeft = newPosition.left;
        if (newLeft > 10 && (newLeft + this.width) < 490) {
            this.left = newLeft;
        }
        this.textOutside = null;
    }
    onOutsideRight() {
        if (this.left < 480) {
            this.left += 10;
            this.width -= 10;
        }
    }
    onOutsideLeft() {
        if (this.width > 20) {
            this.width -= 10;
        }
    }
    onExitRight() {
        this.textOutside = '(outside right)';
    }
    onExitLeft() {
        this.textOutside = '(outside left)';
    }
    onMoveEnd() {
        this.textOutside = null;
    }
    hideSticky($event) {
        $event.stopImmediatePropagation();
        this.stickyPanelVisible = false;
    }
    showSticky($event) {
        this.stickyPanelVisible = true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: BarAndPanelShowcaseComponent, selector: "bar-and-panel-showcase", ngImport: i0, template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n", dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: SplitBarComponent, selector: "split-bar", inputs: ["container", "positionLeft", "positionRight", "outsideIntervalTime", "stickVisibility"], outputs: ["newPosition", "outsideRight", "outsideLeft", "exitRight", "exitLeft", "moveEnd"] }, { kind: "component", type: InfoPanelComponent, selector: "info-panel", inputs: ["container", "margin", "animate", "anchor", "direction", "sticky", "stickyVisible", "style", "fullSize", "fullMargin"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bar-and-panel-showcase', template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n" }]
        }], ctorParameters: function () { return []; } });

class BarAndPanelShowcaseModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, declarations: [BarAndPanelShowcaseComponent], imports: [CommonModule,
            SplitBarModule,
            InfoPanelModule], exports: [BarAndPanelShowcaseComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, imports: [CommonModule,
            SplitBarModule,
            InfoPanelModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        SplitBarModule,
                        InfoPanelModule,
                    ],
                    declarations: [BarAndPanelShowcaseComponent],
                    exports: [BarAndPanelShowcaseComponent],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { BarAndPanelShowcaseComponent, BarAndPanelShowcaseModule, InfoPanelComponent, InfoPanelModule, SplitBarComponent, SplitBarModule, SvgPathCurveSegmentImpl, SvgPathLineSegmentImpl, SvgPathSegmentImpl, SvgPathSegmentList, SvgPathTools, getPontDistance };
//# sourceMappingURL=misc.angular-stuff.mjs.map
