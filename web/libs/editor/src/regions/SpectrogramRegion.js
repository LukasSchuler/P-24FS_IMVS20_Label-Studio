import {types} from "mobx-state-tree";

import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import {AreaMixin} from "../mixins/AreaMixin";
import {EditableRegion} from "./EditableRegion";
import Registry from "../core/Registry";
import {AudioRegionModel} from "./AudioRegion/AudioRegionModel";

// this type is used in auto-generated documentation
/**
 * @example
 * {
 *   "original_length": 18,
 *   "value": {
 *     "start": 3.1,
 *     "end": 8.2,
 *     "channel": 0,
 *     "labels": ["Voice"]
 *   }
 * }
 * @typedef {Object} AudioRegionResult
 * @property {number} original_length length of the original audio (seconds)
 * @property {Object} value
 * @property {number} value.start start time of the fragment (seconds)
 * @property {number} value.end end time of the fragment (seconds)
 * @property {number} value.channel channel identifier which was targeted
 */

const AnnotationAttrs = types.model().volatile(() => ({
  x: types.optional(types.number, 0),
  y: types.optional(types.number, 0),
  width: types.optional(types.number, 0),
  height: types.optional(types.number, 0),
  start: types.optional(types.number, 0),
  end: types.optional(types.number, 0),
  frequencyMin: types.optional(types.number, 0),
  frequencyMax: types.optional(types.number, 0),
}));

const SpectrogramRegionModel = types.compose(
  "SpectrogramRegionModel",
  RegionsMixin,
  AreaMixin,
  NormalizationMixin,
  EditableRegion,
  AnnotationAttrs,
  AudioRegionModel
);

Registry.addRegionType(SpectrogramRegionModel, "spectrogram");

export {SpectrogramRegionModel};
