// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../AudioNext/index.js

import Registry from '../../../core/Registry';
import * as AudioModel from './model';
import {HtxSpectrogram} from './view';
import {AudioRegionModel} from '../../../regions/AudioRegion';
import {types} from "mobx-state-tree";

const ModelAttrs = types.model({
  canvas: types.optional(types.boolean, false),
});

// Fallback to the previos version
let _tagView = HtxSpectrogram;
let _model = types.compose(
  ModelAttrs,
  AudioModel.SpectrogramModel
);


Registry.addTag('spectrogram', _model, _tagView);
Registry.addObjectType(_model);

export {AudioRegionModel, _model as SpectrogramModel, HtxSpectrogram};
