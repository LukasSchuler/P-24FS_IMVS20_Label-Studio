// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../VideoRegion.js

import { getRoot, types } from "mobx-state-tree";

import { guidGenerator } from "../core/Helpers";
import { AreaMixin } from "../mixins/AreaMixin";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import { SpectrogramModel } from "../tags/object/Spectrogram/model";
import Registry from "../core/Registry";

export const onlyProps = (props, obj) => {
  return Object.fromEntries(props.map((prop) => [prop, obj[prop]]));
};

const Model = types
  .model("SpectrogramRegionModel", {
    id: types.optional(types.identifier, guidGenerator),
    pid: types.optional(types.string, guidGenerator),
    type: "spectrogramregion",
    object: types.late(() => types.reference(SpectrogramModel)),
    x: types.optional(types.number, 0),
    y: types.optional(types.number, 0),
    width: types.optional(types.number, 0),
    height: types.optional(types.number, 0),
    start: types.optional(types.number, 0),
    end: types.optional(types.number, 0),
    frequencyMin: types.optional(types.number, 0),
    frequencyMax: types.optional(types.number, 0)
  })
  .views((self) => ({
    get parent() {
      return self.object;
    },

    get annotation() {
      return getRoot(self)?.annotationStore?.selected;
    },

    getShape() {
      throw new Error("Method getShape be implemented on a shape level");
    },

    getVisibility() {
      return true;
    },
  }))
  .actions((self) => ({

    serialize() {
      console.log("SpectrogramRegionModel serialize");
        return {
          value: {
            start: self.start,
            end: self.end,
            frequencyMin: self.frequencyMin,
            frequencyMax: self.frequencyMax,
          }
        }
    },

  }));

const SpectrogramRegionModel = types.compose("SpectrogramRegionModel", RegionsMixin, AreaMixin, NormalizationMixin, Model);

Registry.addRegionType(SpectrogramRegionModel, "spectrogram");

export { SpectrogramRegionModel };
