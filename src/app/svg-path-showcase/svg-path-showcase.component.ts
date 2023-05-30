import {Component, OnInit} from '@angular/core';
import {getPontDistance, SvgPath, SvgPathCurvedSegment, SvgPathCurveSegmentImpl, SvgPathLineSegmentImpl, SvgPathSegmentImpl, SvgPathTools} from '../tools/svg-path-tools';

const printNum = (num: number) => (Math.round(num * 100) / 100).toFixed(2);

@Component({
  selector: 'svg-path-showcase',
  templateUrl: './svg-path-showcase.component.html',
  styleUrls: ['./svg-path-showcase.component.scss'],
})
export class SvgPathShowcaseComponent implements OnInit {

  public sliderColor = '#559de3';

  public pointOnPathValue = 25;
  public pointOnPathCp = {x1: 10, y1: 10, x2: 60, y2: 15};
  public pointOnPathCp1String: string;
  public pointOnPathCp2String: string;
  public pointOnPathLen: string;
  public pointOnPathLines: string[];
  public pathOnPointSegment = SvgPathCurveSegmentImpl.from({
    from: [20, 180],
    cpFrom: [100, 50],
    cpTo: [200, 50],
    to: [380, 180],
  });
  public pointOnPathPathString: string;
  public pointOnPathPathMarker: [number, number];

  public splitPathValue = 40;
  public splitPathNormalLine1: string;
  public splitPathNormalLine2: string;
  public splitPathSegment = SvgPathCurveSegmentImpl.from({
    from: [20, 180],
    cpFrom: [100, 50],
    cpTo: [200, 50],
    to: [380, 180],
  });
  public splitPathString1: string;
  public splitPathString2: string;
  public splitPathLen1: string;
  public splitPathLen2: string;

  public roundCornerValue = 40;
  public roundCornerPath: SvgPath = {
    segments: [
      SvgPathSegmentImpl.from({from: [20, 180], to: [20, 100]}),
      SvgPathSegmentImpl.from({from: [20, 100], to: [100, 100]}),
      SvgPathSegmentImpl.from({from: [100, 100], to: [150, 75]}),
      SvgPathSegmentImpl.from({from: [150, 75], cpFrom: [170, 20], cpTo: [170, 20], to: [250, 40]}),
      SvgPathSegmentImpl.from({from: [250, 40], cpFrom: [250, 140], cpTo: [260, 180], to: [380, 180]}),
    ],
  };
  public roundCornerString: string;
  public roundCornerLines: string[];


  public ringPartValue = 80;
  public ringPartBorderValue = 50;
  public ringPartString: string;
  public ringPartStringAnchors: [number, number][];

  public testPaths: string[];

  constructor() {
  }

  public ngOnInit(): void {
    this.update();
  }

  public setSliderValue(field: string, value: number) {
    this[field] = value;
    this.update();
  }

  public setSliderSubValue(field: string, subField: string | number, value: number) {
    this[field][subField] = value;
    this.update();
  }

  public setSplitPathValue(value: number) {
    this.splitPathValue = value;
    this.update();
  }

  private update() {
    this.testPaths = [];

    // Point on Path

    this.pathOnPointSegment.cpFrom[0] = this.pointOnPathCp.x1 / 100 * 300 + 50;
    this.pathOnPointSegment.cpFrom[1] = this.pointOnPathCp.y1 / 100 * 100 + 50;
    this.pathOnPointSegment.cpTo[0] = this.pointOnPathCp.x2 / 100 * 300 + 50;
    this.pathOnPointSegment.cpTo[1] = this.pointOnPathCp.y2 / 100 * 100 + 50;
    this.pathOnPointSegment.clear();

    this.pointOnPathPathString = this.pathOnPointSegment.svgSinglePathSegment();
    this.pointOnPathPathMarker = this.pathOnPointSegment.getPointOnSegment(this.pointOnPathValue / 100);

    this.pointOnPathLines = [];
    this.pointOnPathLines.push(SvgPathLineSegmentImpl.from({from: this.pathOnPointSegment.from, to: this.pathOnPointSegment.cpFrom}).svgSinglePathSegment());
    this.pointOnPathLines.push(SvgPathLineSegmentImpl.from({from: this.pathOnPointSegment.to, to: this.pathOnPointSegment.cpTo}).svgSinglePathSegment());
    this.pointOnPathLines.push(SvgPathLineSegmentImpl.from({from: this.pathOnPointSegment.calculatedPoints.level2p1, to: this.pathOnPointSegment.calculatedPoints.level2p2}).svgSinglePathSegment());

    this.pointOnPathCp1String = `${printNum(this.pathOnPointSegment.cpFrom[0])}/${printNum(this.pathOnPointSegment.cpFrom[1])}`;
    this.pointOnPathCp2String = `${printNum(this.pathOnPointSegment.cpTo[0])}/${printNum(this.pathOnPointSegment.cpTo[1])}`;
    this.pointOnPathLen = printNum(this.pathOnPointSegment.getSegmentLen());

    // Split Path

    const curveSegments = this.splitPathSegment.splitIntoSegmentsAround(this.splitPathValue / 100, 20, 2, 1);
    const segmentBefore = curveSegments.findFromCenter((s, l) => l > 10, -1);
    const segmentAfter = curveSegments.findFromCenter((s, l) => l > 10, 1);

    const pathParts1 = this.splitPathSegment.splitPath(segmentBefore.positionFromOriginal[0]);
    const pathParts2 = this.splitPathSegment.splitPath(segmentAfter.positionFromOriginal[1]);
    const pathParts3 = this.splitPathSegment.splitPath(this.splitPathValue / 100);
    this.splitPathLen1 = printNum(pathParts3[0].getSegmentLen());
    this.splitPathLen2 = printNum(pathParts3[1].getSegmentLen());

    const splitPathNormal = SvgPathTools.getDirectionVector(this.splitPathSegment, (this.splitPathValue / 100) + 0.02);
    this.splitPathNormalLine1 = `M ${pathParts3[1].from} ${pathParts3[1].from} l ${splitPathNormal.normal1[0] * 10} ${splitPathNormal.normal1[1] * 10}`;
    this.splitPathNormalLine2 = `M ${pathParts3[1].from} ${pathParts3[1].from} l ${splitPathNormal.normal2[0] * 10} ${splitPathNormal.normal2[1] * 10}`;


    this.splitPathString1 = SvgPathCurveSegmentImpl.from(pathParts1[0]).svgSinglePathSegment();
    this.splitPathString2 = SvgPathCurveSegmentImpl.from(pathParts2[1]).svgSinglePathSegment();

    // Round Corner

    this.roundCornerLines = [];
    const roundCornerPathSegments = [...this.roundCornerPath.segments];
    [0, 2, 4, 6].forEach((idx) => {
      const line1 = roundCornerPathSegments[idx];
      const line2 = roundCornerPathSegments[idx + 1];
      const roundCornerResult = SvgPathTools.getRoundCorner(line1, line2, this.roundCornerValue / 2);
      SvgPathTools.applyRoundCorner(roundCornerPathSegments, line1, line2, roundCornerResult);
      this.roundCornerLines.push(SvgPathLineSegmentImpl.from({from: roundCornerResult.direction1.point, to: roundCornerResult.circleCenter}).svgSinglePathSegment());
      this.roundCornerLines.push(SvgPathLineSegmentImpl.from({from: roundCornerResult.direction2.point, to: roundCornerResult.circleCenter}).svgSinglePathSegment());
    });
    this.roundCornerString = SvgPathTools.svgPath({segments: roundCornerPathSegments});

    // RingPart


    const ringInfo = SvgPathTools.getRingPart((this.ringPartValue / 100 * 350 + 5) / 360 * Math.PI * 2, [200, 100], 80, 40, this.ringPartBorderValue / 5 );
    const ringPath: SvgPath = {
      segments: ringInfo.segments,
    };
    this.ringPartString = SvgPathTools.svgPath(ringPath);

    this.ringPartStringAnchors = ringInfo.anchorPoints;

  }

}
