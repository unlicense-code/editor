import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { LengthObj } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length';
export declare function rangeContainsPosition(range: Range, position: Position): boolean;
export declare function lengthOfRange(range: Range): LengthObj;
export declare function lengthBetweenPositions(position1: Position, position2: Position): LengthObj;
export declare function addLength(position: Position, length: LengthObj): Position;
export declare function rangeIsBeforeOrTouching(range: Range, other: Range): boolean;
